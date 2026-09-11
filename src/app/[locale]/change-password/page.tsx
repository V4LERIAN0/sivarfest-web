import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUserServer } from "@/features/auth/auth.server";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
export default async function ChangePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUserServer();
  if (!user) redirect(`/${locale}/login`);
  const t = await getTranslations("PasswordChange");
  const auth = await getTranslations("Auth");
  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-[#f2f0eb]">
      <PublicNavbar />
      <section className="mx-auto max-w-xl px-4 py-12 sm:py-20">
        <p className="sivar-kicker">{t("eyebrow")}</p>
        <h1 className="sivar-display mt-4 text-5xl">{t("title")}</h1>
        {user.mustChangePassword && (
          <p className="mt-5 text-[#ffd400]">{t("required")}</p>
        )}
        <p className="my-6 text-sm leading-6 text-white/65">
          {t("description")}
        </p>
        <ChangePasswordForm />
        <div className="mt-6">
          <LogoutButton
            label={auth("signOut")}
            loadingLabel={auth("signingOut")}
            redirectTo={`/${locale}/login`}
          />
        </div>
      </section>
    </main>
  );
}
