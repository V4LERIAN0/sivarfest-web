"use client";

import Image from "next/image";
import { AtSign } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Link, usePathname } from "@/i18n/navigation";

import { AthleteAccountMenu } from "@/components/layout/AthleteAccountMenu";

type PublicNavbarProps = {
  showLocaleSwitcher?: boolean;
  athleteAccount?: boolean;
};

const INSTAGRAM_URL = "https://www.instagram.com/sivarfest5.0/";

const desktopNavItems = [
  { href: "/athletes", label: "athletes" },
  { href: "/events", label: "events" },
  { href: "/heats", label: "heats" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/login", label: "login" },
] as const;

const mobileNavItems = [
  { href: "/athletes", label: "athletes" },
  { href: "/events", label: "events" },
  { href: "/heats", label: "heats" },
  { href: "/login", label: "login" },
] as const;

export function PublicNavbar({
  showLocaleSwitcher = true,
  athleteAccount = false,
}: PublicNavbarProps) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/92 text-white backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Link
            href="/"
            aria-label={t("home")}
            className="group flex shrink-0 items-center"
          >
            <Image
              src="/brand/sivarfest-logo.png"
              alt="SIVARFEST"
              width={1080}
              height={1080}
              priority
              className="h-12 w-16 object-contain transition group-hover:opacity-80 md:h-14 md:w-20"
            />
          </Link>

          <nav
            aria-label={t("primary")}
            className="hidden items-center gap-5 lg:flex"
          >
            {desktopNavItems
              .filter((item) => !athleteAccount || item.href !== "/login")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`border-b-2 py-3 text-xs font-black uppercase tracking-[0.11em] transition hover:text-[#ffd400] ${isActive(item.href) ? "border-[#ffd400] text-[#ffd400]" : "border-transparent text-white/65"}`}
                >
                  {t(item.label)}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            {!athleteAccount && (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("instagram")}
                className="hidden h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-white/70 transition hover:border-[#ffd400]/50 hover:text-[#ffd400] sm:inline-flex"
              >
                <AtSign className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {showLocaleSwitcher && <LocaleSwitcher />}
            {athleteAccount && <AthleteAccountMenu />}
          </div>
        </div>

        {!athleteAccount && (
          <nav
            aria-label={t("mobilePrimary")}
            className="grid grid-cols-4 border-t border-white/8 lg:hidden"
          >
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`border-b-2 px-1 py-3 text-center text-xs font-black uppercase tracking-[0.04em] transition hover:text-[#ffd400] ${isActive(item.href) ? "border-[#ffd400] text-[#ffd400]" : "border-transparent text-white/60"}`}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
