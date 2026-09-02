"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { login } from "@/features/auth/auth.api";

type LoginFormProps = {
  judgeDestination?: string;
  athleteDestination?: string;
};

export function LoginForm({
  judgeDestination = "/judge",
  athleteDestination = "/",
}: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations("Auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.push(athleteDestination);
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
        <label className="text-xs font-black uppercase tracking-[0.12em] text-white/65">
          {t("email")}
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 min-h-12 w-full border border-white/15 bg-black/55 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#ffd400]/70 focus:ring-2 focus:ring-[#ffd400]/20"
          placeholder={t("emailPlaceholder")}
          required
        />
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.12em] text-white/65">
          {t("password")}
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 min-h-12 w-full border border-white/15 bg-black/55 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#ffd400]/70 focus:ring-2 focus:ring-[#ffd400]/20"
          placeholder={t("passwordPlaceholder")}
          required
        />
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="sivar-primary-button min-h-12 w-full px-5 py-3 text-sm font-black uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
