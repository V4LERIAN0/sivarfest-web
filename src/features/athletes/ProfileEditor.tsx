"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { AthletePortrait } from "@/components/public/AthletePortrait";
import type { AthleteSelf } from "./experience.types";
const input =
  "mt-2 min-h-12 w-full border border-white/20 bg-black px-4 py-3 text-base text-white focus:outline-2 focus:outline-[#ffd400]";
export function ProfileEditor({ profile }: { profile: AthleteSelf }) {
  const t = useTranslations("AthleteArea");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(profile.profilePhotoUrl);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await apiClient.put("/athlete/me/profile", {
        country: f.get("country"),
        gymName: f.get("gymName"),
        height: f.get("height") ? Number(f.get("height")) : null,
        weight: f.get("weight") ? Number(f.get("weight")) : null,
        publicBio: f.get("publicBio"),
        showBodyMetrics: f.get("showBodyMetrics") === "on",
      });
      setMessage(t("saved"));
      router.refresh();
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const form = e.currentTarget;
    try {
      const { data } = await apiClient.post<{ url: string }>(
        "/athlete/me/photo",
        new FormData(form),
        { headers: { "Content-Type": undefined } },
      );
      setPhoto(data.url);
      form.reset();
      router.refresh();
      setMessage(t("saved"));
    } catch {
      setError(t("photoHint"));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await apiClient.delete("/athlete/me/photo");
      setPhoto(null);
      router.refresh();
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-8">
      <section className="border border-white/15 bg-white/[0.02] p-5 sm:p-7">
        <div className="flex flex-wrap gap-6">
          <AthletePortrait name={profile.fullName} url={photo} large />
          <div className="min-w-0 flex-1">
            <h2 className="sivar-display text-3xl">{t("photo")}</h2>
            <p className="mt-2 text-sm text-white/55">{t("photoHint")}</p>
            <form onSubmit={upload} className="mt-4 space-y-4">
              <label className="block">
                <span className="sr-only">{t("photo")}</span>
                <input
                  className="block w-full min-w-0 text-sm file:mr-3 file:border file:border-white/20 file:bg-white/5 file:px-3 file:py-3 file:text-white"
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png"
                  required
                  disabled={busy}
                />
              </label>
              <button
                disabled={busy}
                className="min-h-11 border border-[#ffd400]/40 px-4 py-2 font-bold text-[#ffd400] disabled:opacity-50"
              >
                {t("upload")}
              </button>
            </form>
            {photo && (
              <button
                type="button"
                disabled={busy}
                onClick={remove}
                className="mt-3 min-h-11 text-sm text-white/60 underline"
              >
                {t("removePhoto")}
              </button>
            )}
          </div>
        </div>
      </section>
      <form
        onSubmit={save}
        className="space-y-6 border border-white/15 bg-white/[0.02] p-5 sm:p-7"
      >
        <p className="text-sm leading-6 text-white/60">{t("publicHint")}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {(["country", "gymName"] as const).map((name) => (
            <label key={name} className="text-sm font-bold">
              {t(name === "gymName" ? "gym" : "country")}
              <input
                name={name}
                defaultValue={profile[name] ?? ""}
                maxLength={name === "country" ? 80 : 150}
                className={input}
              />
            </label>
          ))}
          {(["height", "weight"] as const).map((name) => (
            <label key={name} className="text-sm font-bold">
              {t(name)}
              <input
                name={name}
                type="number"
                inputMode="decimal"
                step="0.01"
                min={name === "height" ? 50 : 20}
                max={name === "height" ? 300 : 500}
                defaultValue={profile[name] ?? ""}
                className={input}
              />
            </label>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm leading-6">
          <input
            name="showBodyMetrics"
            type="checkbox"
            defaultChecked={profile.showBodyMetrics}
            className="h-5 w-5 shrink-0 accent-[#ffd400]"
          />
          {t("showMetrics")}
        </label>
        <label className="block text-sm font-bold">
          {t("bio")}
          <textarea
            name="publicBio"
            defaultValue={profile.publicBio ?? ""}
            maxLength={1500}
            rows={5}
            className={input}
          />
        </label>
        <p className="text-xs leading-5 text-white/45">{t("contact")}</p>
        <button
          disabled={busy}
          className="sivar-primary-button min-h-12 px-6 py-3 font-black disabled:opacity-50"
        >
          {t(busy ? "saving" : "save")}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-[#ffd400]">
          {message}
        </p>
      )}
    </div>
  );
}
