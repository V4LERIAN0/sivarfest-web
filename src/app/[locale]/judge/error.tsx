"use client";
import { useTranslations } from "next-intl";
export default function AccountError({ reset }: { reset: () => void }) {
  const t = useTranslations("AthleteArea");
  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <p role="alert" className="text-base leading-7 text-white/70">
        {t("loadError")}
      </p>
      <button
        onClick={reset}
        className="mt-5 min-h-12 border border-[#ffd400]/40 px-5 py-3 font-bold text-[#ffd400]"
      >
        {t("retry")}
      </button>
    </section>
  );
}
