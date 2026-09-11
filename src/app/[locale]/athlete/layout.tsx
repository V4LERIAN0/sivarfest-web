import { requireAthleteServer } from "@/features/auth/auth.server";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
export default async function AthleteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAthleteServer(locale);
  const t = await getTranslations("AthleteArea");
  const auth = await getTranslations("Auth");
  const password = await getTranslations("PasswordChange");
  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-[#f2f0eb]">
      <PublicNavbar />
      <nav aria-label={t("dashboard")} className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm font-bold">
          <Link className="py-2 text-[#ffd400]" href="/athlete">
            {t("dashboard")}
          </Link>
          <Link className="py-2" href="/athlete/profile">
            {t("profile")}
          </Link>
          <Link className="py-2 text-white/55" href="/change-password">
            {password("link")}
          </Link>
          <div className="sm:ml-auto">
            <LogoutButton
              label={auth("signOut")}
              loadingLabel={auth("signingOut")}
              redirectTo={`/${locale}/login`}
            />
          </div>
        </div>
      </nav>
      {children}
      <PublicPageFooter />
    </main>
  );
}
