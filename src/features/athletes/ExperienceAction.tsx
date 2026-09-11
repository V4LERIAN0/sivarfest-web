"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api-client";
export function ExperienceAction({
  path,
  label,
}: {
  path?: string;
  label: string;
}) {
  const router = useRouter();
  const t = useTranslations("AthleteArea");
  const [pending, setPending] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function run() {
    setPending(true);
    setError("");
    try {
      if (path) await apiClient.post(path);
      if (path) setSuccess(true);
      startTransition(() => router.refresh());
    } catch {
      setError(t("error"));
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={pending || refreshing || success}
        className="min-h-11 border border-[#ffd400]/40 bg-[#ffd400]/10 px-4 py-3 text-sm font-black text-[#ffd400] disabled:opacity-60"
      >
        {pending || refreshing
          ? t("saving")
          : success
            ? t("checkInSaved")
            : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
