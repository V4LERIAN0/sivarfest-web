export type UserRole = "ADMIN" | "ATHLETE" | "JUDGE";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  role: UserRole;
}

export interface MeResponse {
  id: number;
  email: string;
  role: UserRole;
}