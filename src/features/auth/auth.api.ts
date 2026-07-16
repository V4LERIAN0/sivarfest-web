import { apiClient } from "@/lib/api-client";
import { LoginRequest, LoginResponse, MeResponse } from "./auth.types";

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