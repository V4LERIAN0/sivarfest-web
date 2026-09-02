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
      className="flex h-10 items-center border border-white/15 bg-white/5 p-0.5"
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
            className={`flex h-8 min-w-9 items-center justify-center px-2 text-xs font-black uppercase transition disabled:cursor-wait disabled:opacity-60 ${
              isActive
                ? "bg-[#ffd400] text-black"
                : "text-white/45 hover:text-white"
            }`}
          >
            {availableLocale}
          </button>
        );
      })}
    </div>
  );
}
