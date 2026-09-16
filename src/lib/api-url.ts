const DEFAULT_API_URL = "http://localhost:8081/api";

/** Resolve the backend URL on the server; browsers always use same-origin /api. */
export function getServerApiUrl(): string {
  const internalUrl = process.env.API_INTERNAL_URL?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const configuredUrl =
    internalUrl ||
    (publicUrl && /^https?:\/\//i.test(publicUrl)
      ? publicUrl
      : DEFAULT_API_URL);
  const url = new URL(configuredUrl);

  if (!(["http:", "https:"] as string[]).includes(url.protocol)) {
    throw new Error("The server API URL must use HTTP or HTTPS.");
  }
  if (url.search || url.hash || url.username || url.password) {
    throw new Error("The server API URL must not contain credentials, a query or a fragment.");
  }

  return url.toString().replace(/\/+$/, "");
}
