"use client";

import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LogoutButton } from "@/features/auth/LogoutButton";

export function AthleteAccountMenu() {
  const t = useTranslations("AthleteArea");
  const nav = useTranslations("Navigation");
  const password = useTranslations("PasswordChange");
  const auth = useTranslations("Auth");
  const locale = useLocale();
  const pathname = usePathname();
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const links = [
    { href: "/athlete", label: t("dashboard") },
    { href: "/athlete/profile", label: t("profile") },
    { href: "/change-password", label: password("link") },
    { href: "/athletes", label: nav("athletes") },
    { href: "/events", label: nav("events") },
    { href: "/heats", label: nav("heats") },
    { href: "/leaderboard", label: nav("leaderboard") },
  ];
  return (
    <details
      ref={ref}
      className="sivar-account-menu relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && ref.current) {
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 border border-[#ffd400]/35 px-3 text-sm font-bold text-[#ffd400] focus-visible:outline-2 focus-visible:outline-[#ffd400]">
        <Menu className="h-4 w-4" aria-hidden="true" />
        {t("accountMenu")}
      </summary>
      <nav
        aria-label={t("accountMenu")}
        className="absolute right-0 top-full z-50 mt-3 max-h-[calc(100dvh-5rem)] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto border border-white/20 bg-[#0b0b0b] p-2 shadow-2xl"
      >
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`block px-3 py-3 text-sm font-bold transition hover:bg-white/5 ${pathname === item.href ? "bg-[#ffd400]/10 text-[#ffd400]" : "text-white/70"}`}
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-2 border-t border-white/10 pt-2">
          <LogoutButton
            label={auth("signOut")}
            loadingLabel={auth("signingOut")}
            redirectTo={`/${locale}/login`}
          />
        </div>
      </nav>
    </details>
  );
}
