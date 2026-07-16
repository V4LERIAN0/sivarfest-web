import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MeResponse } from "./auth.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api";

export async function getCurrentUserServer() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as MeResponse;
    return user;
  } catch {
    return null;
  }
}

export async function requireAdminServer() {
  const user = await getCurrentUserServer();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return user;
}