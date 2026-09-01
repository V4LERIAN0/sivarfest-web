import NextLink from "next/link";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

type PublicNavbarProps = {
  showLocaleSwitcher?: boolean;
};

export function PublicNavbar({
  showLocaleSwitcher = true,
}: PublicNavbarProps) {
  const t = useTranslations("Navigation");

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-black tracking-wide text-white">
          SIVARFEST
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-neutral-300">
          <Link href="/athletes" className="hover:text-white">
            {t("athletes")}
          </Link>

          <Link href="/events" className="hover:text-white">
            {t("events")}
          </Link>

          <Link href="/leaderboard" className="hover:text-white">
            {t("leaderboard")}
          </Link>

          <Link href="/heats" className="hover:text-white">
            {t("heats")}
          </Link>

          <NextLink href="/admin" className="hover:text-white">
            {t("admin")}
          </NextLink>

          {showLocaleSwitcher && <LocaleSwitcher />}
        </nav>
      </div>
    </header>
  );
}