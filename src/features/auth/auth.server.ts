import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerApiUrl } from "@/lib/api-url";
import type { MeResponse } from "./auth.types";

const API_URL = getServerApiUrl();

type ServerSession =
  | { status: "authenticated"; user: MeResponse }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function readCurrentSessionServer(): Promise<ServerSession> {
  // Next's parsed cookies collapse duplicate names; forward the original header.
  const cookieHeader = (await headers()).get("cookie") ?? "";

  if (!cookieHeader) {
    return { status: "unauthenticated" };
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated" };
    }
    if (!response.ok) {
      return { status: "unavailable" };
    }

    const user = (await response.json()) as MeResponse;
    if (
      !user ||
      typeof user.id !== "number" ||
      !["ADMIN", "JUDGE", "ATHLETE"].includes(user.role) ||
      typeof user.mustChangePassword !== "boolean"
    ) {
      return { status: "unavailable" };
    }
    return { status: "authenticated", user };
  } catch {
    return { status: "unavailable" };
  }
}

export async function getCurrentUserServer(): Promise<MeResponse | null> {
  const session = await readCurrentSessionServer();
  return session.status === "authenticated" ? session.user : null;
}

export async function requireAdminServer() {
  const user = await getCurrentUserServer();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  if (user.mustChangePassword) redirect("/es/change-password");
  return user;
}

export async function requireJudgeServer(loginPath = "/login") {
  const user = await getCurrentUserServer();

  if (!user || user.role !== "JUDGE") {
    redirect(loginPath);
  }

  if (user.mustChangePassword)
    redirect(
      loginPath === "/login"
        ? "/es/change-password"
        : loginPath.replace(/login$/, "change-password"),
    );
  return user;
}
export async function requireAthleteServer(locale: string) {
  const user = await getCurrentUserServer();
  if (!user || user.role !== "ATHLETE") redirect(`/${locale}/login`);
  if (user.mustChangePassword) redirect(`/${locale}/change-password`);
  return user;
}
