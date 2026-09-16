import { expect, test, type Page } from "@playwright/test";

async function submit(page: Page, username: string, password = "test-password-123") {
  await page.locator("#login-username").fill(username);
  await page.locator("#login-password").fill(password);
  await page.locator('button[type="submit"]').click();
}

for (const [username, destination] of [
  ["judge", "/es/judge"], ["athlete", "/es/athlete"], ["admin", "/admin"],
] as const) {
  test(`${username}: login from another host reaches the protected portal`, async ({ page, context }) => {
    await page.goto("/es/login");
    const loginResponse = page.waitForResponse((r) => r.url().endsWith("/api/auth/login"));
    await submit(page, username);
    expect((await loginResponse).status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator("#login-username")).toHaveCount(0);
    const cookie = (await context.cookies()).find((c) => c.name === "sivarfest_token");
    expect(cookie?.domain).toBe("127.0.0.1");
    expect(cookie?.httpOnly).toBe(true);
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
  });
}

test("login also works on the alternate frontend host", async ({ page }) => {
  await page.goto("http://localhost:3199/es/login");
  await submit(page, "judge");
  await expect(page).toHaveURL("http://localhost:3199/es/judge");
});

test("wrong credentials retain the specific password error", async ({ page }) => {
  await page.goto("/es/login");
  await submit(page, "judge", "wrong-password");
  await expect(page.getByText("Correo electrónico o contraseña incorrectos.", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/es\/login$/);
});

for (const username of ["blocked", "mismatch", "unavailable", "http500"]) {
  test(`${username}: session or server failure does not silently redirect or blame password`, async ({ page }) => {
    await page.goto("/es/login");
    await submit(page, username);
    await expect(page.locator("form").getByRole("alert")).toBeVisible();
    await expect(page.getByText("Correo electrónico o contraseña incorrectos.", { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(/\/es\/login$/);
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
}

test("stale cookie is replaced and an already visited protected route can open", async ({ page, context }) => {
  await context.addCookies([{ name: "sivarfest_token", value: "stale", url: "http://127.0.0.1:3199", httpOnly: true }]);
  await page.goto("/es/judge");
  await expect(page).toHaveURL(/\/es\/login$/);
  await submit(page, "judge");
  await expect(page).toHaveURL(/\/es\/judge$/);
});

test("forced password change verifies its new session and reaches the portal", async ({ page }) => {
  await page.goto("/es/login");
  await submit(page, "change");
  await expect(page).toHaveURL(/\/es\/change-password$/);
  await page.locator('[name="currentPassword"]').fill("test-password-123");
  await page.locator('[name="newPassword"]').fill("new-password-123");
  await page.locator('[name="confirmation"]').fill("new-password-123");
  await page.locator("form button").click();
  await expect(page).toHaveURL(/\/es\/judge$/);
});

test("logout removes access to the protected portal", async ({ page }) => {
  await page.goto("/es/login");
  await submit(page, "judge");
  await expect(page).toHaveURL(/\/es\/judge$/);
  await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/login$/);
  await page.goto("/es/judge");
  await expect(page).toHaveURL(/\/es\/login$/);
});

test("server verification preserves duplicate cookie order used by the backend", async ({ request }) => {
  const freshFirst = await request.get("/auth/session", {
    headers: { Cookie: "sivarfest_token=judge; sivarfest_token=stale" },
  });
  expect(freshFirst.status()).toBe(200);
  expect((await freshFirst.json()).id).toBe(1);
  expect(freshFirst.headers()["cache-control"]).toContain("no-store");
  const staleFirst = await request.get("/auth/session", {
    headers: { Cookie: "sivarfest_token=stale; sivarfest_token=judge" },
  });
  expect(staleFirst.status()).toBe(401);
});

test("slow JavaScript loading cannot submit the uninitialized login form", async ({ page }) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => { releaseScripts = resolve; });
  await page.route("**/_next/static/**/*.js", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/es/login", { waitUntil: "commit" });
    await expect(page.locator("#login-username")).toBeDisabled();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  } finally {
    releaseScripts();
  }
  await submit(page, "judge");
  await expect(page).toHaveURL(/\/es\/judge$/);
});

test("English login keeps localized errors and destination", async ({ page }) => {
  await page.goto("/en/login");
  await submit(page, "judge", "wrong-password");
  await expect(page.getByText("Invalid email or password.", { exact: true })).toBeVisible();
  await submit(page, "judge");
  await expect(page).toHaveURL(/\/en\/judge$/);
});
