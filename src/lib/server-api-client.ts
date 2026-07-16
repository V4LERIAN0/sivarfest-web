import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api";

async function getCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function handleResponse<T>(response: Response, path: string): Promise<T> {
  if (!response.ok) {
    let message = `Server API request to ${path} failed with status ${response.status}`;

    try {
      const errorBody = await response.json();

      if (errorBody?.message) {
        message = errorBody.message;
      }
    } catch {
      // Keep default message if response is not JSON
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function serverApiGet<T>(path: string): Promise<T> {
  const cookieHeader = await getCookieHeader();

  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  return handleResponse<T>(response, path);
}

export async function serverApiPost<TResponse, TBody>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const cookieHeader = await getCookieHeader();

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return handleResponse<TResponse>(response, path);
}

export async function serverApiPut<TResponse, TBody>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const cookieHeader = await getCookieHeader();

  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return handleResponse<TResponse>(response, path);
}

export async function serverApiDelete(path: string): Promise<void> {
  const cookieHeader = await getCookieHeader();

  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  await handleResponse<void>(response, path);
}