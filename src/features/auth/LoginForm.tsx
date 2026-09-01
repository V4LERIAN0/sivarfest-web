"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { login } from "@/features/auth/auth.api";

type LoginFormProps = {
  judgeDestination?: string;
};

export function LoginForm({
  judgeDestination = "/judge",
}: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations("Auth");

  const [email, setEmail] = useState("admin@sivarfest.fit");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const user = await login({
        email,
        password,
      });

      if (user.role === "ADMIN") {
        router.push("/admin");
        router.refresh();
        return;
      }

      if (user.role === "ATHLETE") {
        router.push("/athlete");
        router.refresh();
        return;
      }

      if (user.role === "JUDGE") {
        router.push(judgeDestination);
        router.refresh();
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-bold text-slate-200">
          {t("email")}
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          placeholder="admin@sivarfest.fit"
          required
        />
      </div>

      <div>
        <label className="text-sm font-bold text-slate-200">
          {t("password")}
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          placeholder={t("passwordPlaceholder")}
          required
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}