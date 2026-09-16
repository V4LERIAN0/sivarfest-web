import { readCurrentSessionServer } from "@/features/auth/auth.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readCurrentSessionServer();
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };

  if (session.status === "authenticated") {
    return Response.json(session.user, { headers });
  }

  return Response.json(
    {
      code:
        session.status === "unauthenticated"
          ? "SESSION_NOT_ESTABLISHED"
          : "SESSION_UNAVAILABLE",
    },
    { status: session.status === "unauthenticated" ? 401 : 503, headers },
  );
}
