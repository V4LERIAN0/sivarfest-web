"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const locales = ["es", "en"] as const satisfies readonly AppLocale[];

const languageKeys: Record<AppLocale, "english" | "spanish"> = {
  en: "english",
  es: "spanish",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navigation.language");
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale,
      });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex items-center rounded-full border border-neutral-700 bg-neutral-900 p-0.5"
    >
      {locales.map((availableLocale) => {
        const isActive = availableLocale === locale;
        const languageName = t(languageKeys[availableLocale]);

        return (
          <button
            key={availableLocale}
            type="button"
            disabled={isPending}
            aria-pressed={isActive}
            title={t("switchTo", {
              language: languageName,
            })}
            onClick={() => switchLocale(availableLocale)}
            className={`rounded-full px-2.5 py-1 text-xs font-black uppercase transition disabled:cursor-wait disabled:opacity-60 ${
              isActive
                ? "bg-orange-500 text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {availableLocale}
          </button>
        );
      })}
    </div>
  );
}