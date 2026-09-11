"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { LoginResponse } from "./auth.types";
export function ChangePasswordForm() {
  const t = useTranslations("PasswordChange");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("newPassword") !== form.get("confirmation")) {
      setError(t("mismatch"));
      return;
    }
    setPending(true);
    setError("");
    try {
      const { data } = await apiClient.post<LoginResponse>(
        "/auth/change-password",
        {
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
        },
      );
      router.replace(
        data.role === "ADMIN"
          ? "/admin"
          : `/${locale}/${data.role === "JUDGE" ? "judge" : "athlete"}`,
      );
      router.refresh();
    } catch {
      setError(t("error"));
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {(
        [
          ["currentPassword", "current", "current-password"],
          ["newPassword", "new", "new-password"],
          ["confirmation", "confirm", "new-password"],
        ] as const
      ).map(([name, label, complete]) => (
        <label key={name} className="block text-sm font-bold text-white/75">
          {t(label)}
          <input
            name={name}
            type="password"
            autoComplete={complete}
            required
            minLength={name === "currentPassword" ? 1 : 12}
            maxLength={72}
            className="mt-2 min-h-12 w-full border border-white/20 bg-black px-4 py-3 text-base text-white focus:outline-2 focus:outline-[#ffd400]"
          />
        </label>
      ))}
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="sivar-primary-button min-h-12 w-full p-3 text-sm font-black disabled:opacity-50"
      >
        {t(pending ? "saving" : "save")}
      </button>
    </form>
  );
}
