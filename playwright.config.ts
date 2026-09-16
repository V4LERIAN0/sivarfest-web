import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/auth",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://127.0.0.1:3199",
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] }
      : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    { command: "node tests/auth/mock-api.mjs", url: "http://127.0.0.1:3198/health", reuseExistingServer: false },
    {
      command: "npm run build && npm run start -- --hostname 0.0.0.0 --port 3199",
      url: "http://127.0.0.1:3199/es/login",
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        // Deliberately a DIFFERENT host from the browser; reproduces www/apex.
        NEXT_PUBLIC_API_URL: "http://localhost:3198/api",
        API_INTERNAL_URL: "http://127.0.0.1:3198/api",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
});
