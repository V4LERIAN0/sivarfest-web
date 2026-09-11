export function athletePhotoUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/api/public/athlete-photos/")) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api";
    if (base.startsWith("http")) return new URL(url, base).toString();
    return url;
  }
  return /^https?:\/\//.test(url) || url.startsWith("/") ? url : undefined;
}
