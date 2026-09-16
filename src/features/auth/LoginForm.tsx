"use client";

import { useTranslations, useLocale } from "next-intl";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";

import {
  confirmSession,
  login,
  SessionEstablishmentError,
  SessionUnavailableError,
} from "@/features/auth/auth.api";

type LoginFormProps = {
  judgeDestination?: string;
  athleteDestination?: string;
};

export function LoginForm({
  judgeDestination = "/judge",
  athleteDestination = "/es/athlete",
}: LoginFormProps) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const hydrated = useHydrated();

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
      await confirmSession(user);

      const destination = user.mustChangePassword
        ? `/${locale}/change-password`
        : user.role === "ADMIN"
          ? "/admin"
          : user.role === "ATHLETE"
            ? athleteDestination
            : judgeDestination;
      // Start a new document so stale unauthenticated router state cannot win.
      window.location.replace(destination);
    } catch (error) {
      setError(
        t(
          error instanceof SessionEstablishmentError
            ? "sessionNotEstablished"
            : error instanceof SessionUnavailableError
              ? "sessionUnavailable"
              : isAxiosError(error) && error.response?.status === 401
                ? "invalidCredentials"
                : "serviceUnavailable",
        ),
      );
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="login-username"
          className="text-xs font-black uppercase tracking-[0.12em] text-white/65"
        >
          {t("email")}
        </label>

        <input
          id="login-username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          disabled={!hydrated}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 min-h-12 w-full border border-white/15 bg-black/55 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#ffd400]/70 focus:ring-2 focus:ring-[#ffd400]/20"
          placeholder={t("emailPlaceholder")}
          required
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="text-xs font-black uppercase tracking-[0.12em] text-white/65"
        >
          {t("password")}
        </label>

        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          disabled={!hydrated}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 min-h-12 w-full border border-white/15 bg-black/55 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#ffd400]/70 focus:ring-2 focus:ring-[#ffd400]/20"
          placeholder={t("passwordPlaceholder")}
          required
        />
      </div>

      {error && (
        <div role="alert" className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!hydrated || isLoading}
        className="sivar-primary-button min-h-12 w-full px-5 py-3 text-sm font-black uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
