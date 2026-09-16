// Isolated authentication fixture. Never use real accounts or production data.
import { createServer } from "node:http";

const users = {
  judge: { id: 1, role: "JUDGE" },
  athlete: { id: 2, role: "ATHLETE" },
  admin: { id: 3, role: "ADMIN" },
  change: { id: 4, role: "JUDGE", mustChangePassword: true },
  blocked: { id: 5, role: "JUDGE" },
  unavailable: { id: 6, role: "JUDGE" },
  mismatch: { id: 7, role: "JUDGE" },
};
const session = (name) => users[name] && {
  email: `${name}@example.test`, username: name, mustChangePassword: false,
  ...users[name],
};

createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "http://127.0.0.1:3199");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
  const path = new URL(req.url, "http://localhost").pathname;
  const reply = (status, body) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  const cookie = (value, age = 3600) => res.setHeader("Set-Cookie",
    `sivarfest_token=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}`);
  // Match Spring's first matching cookie behavior, including duplicate names.
  const token = req.headers.cookie?.split(";").map((c) => c.trim())
    .find((c) => c.startsWith("sivarfest_token="))?.slice("sivarfest_token=".length);
  const user = session(token);

  if (path === "/health") return reply(200, {});
  if (path === "/api/auth/login" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const { email, password } = JSON.parse(body);
    if (email === "http500") return reply(503, { message: "Fixture unavailable" });
    const next = session(email);
    if (!next || password !== "test-password-123") return reply(401, { message: "Bad credentials" });
    if (email !== "blocked") cookie(email);
    return reply(200, next);
  }
  if (path === "/api/auth/logout") { cookie("", 0); res.writeHead(204).end(); return; }
  if (path === "/api/auth/me") {
    if (token === "unavailable") return reply(503, { message: "Fixture unavailable" });
    if (token === "mismatch") return reply(200, session("athlete"));
    return reply(user ? 200 : 403, user ?? { message: "Forbidden" });
  }
  if (path === "/api/auth/change-password") {
    if (!user) return reply(403, {});
    cookie("judge");
    return reply(200, session("judge"));
  }
  if (path === "/api/athlete/me") {
    if (!user) return reply(403, {});
    return reply(200, {
      profile: { id: 2, fullName: "Test Athlete", username: "athlete", categoryName: "RX", profilePhotoUrl: null },
      heats: [], standings: null, competitionSlug: "sivarfest-2026",
      competitionName: "Test competition", timezone: "America/El_Salvador",
    });
  }
  if (path.startsWith("/api/public/competitions/") && !path.endsWith("/events") && !path.endsWith("/athletes") && !path.endsWith("/categories")) {
    return reply(200, { id: 1, name: "Test competition", slug: "sivarfest-2026", status: "PUBLISHED" });
  }
  if (path.startsWith("/api/")) return reply(200, []);
  return reply(404, {});
}).listen(3198, "0.0.0.0", () => console.log("Auth fixture listening on 3198"));
