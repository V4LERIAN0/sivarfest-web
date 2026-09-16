import { apiClient } from "@/lib/api-client";
import type { LoginRequest, LoginResponse, MeResponse } from "./auth.types";

export class SessionEstablishmentError extends Error {
  constructor() {
    super("The accepted login did not establish the expected browser session.");
    this.name = "SessionEstablishmentError";
  }
}

export class SessionUnavailableError extends Error {
  constructor() {
    super("The session could not be checked right now.");
    this.name = "SessionUnavailableError";
  }
}

/** Check the same cookie and backend path used by protected server-rendered pages. */
export async function confirmSession(expected: LoginResponse): Promise<MeResponse> {
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    response = await fetch("/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    throw new SessionUnavailableError();
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401) throw new SessionEstablishmentError();
  if (!response.ok) throw new SessionUnavailableError();

  let user: MeResponse;
  try {
    user = (await response.json()) as MeResponse;
  } catch {
    throw new SessionUnavailableError();
  }
  if (
    !user ||
    user.id !== expected.id ||
    user.role !== expected.role ||
    user.mustChangePassword !== expected.mustChangePassword
  ) {
    throw new SessionEstablishmentError();
  }
  return user;
}

export async function login(request: LoginRequest) {
  const response = await apiClient.post<LoginResponse>("/auth/login", request);
  return response.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser() {
  const response = await apiClient.get<MeResponse>("/auth/me");
  return response.data;
}
