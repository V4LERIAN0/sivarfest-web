"use client";

import { hasLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  internalDefaultLocale,
  routing,
  type AppLocale,
} from "@/i18n/routing";

function resolveLocale(pathname: string): AppLocale {
  const localeSegment = pathname.split("/")[1];

  return hasLocale(routing.locales, localeSegment)
    ? localeSegment
    : internalDefaultLocale;
}

export function DocumentLanguage() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = resolveLocale(pathname);
  }, [pathname]);

  return null;
}