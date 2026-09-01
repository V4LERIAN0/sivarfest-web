import { getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { LoginForm } from "@/features/auth/LoginForm";

type LoginPageContentProps = {
  showLocaleSwitcher: boolean;
  judgeDestination: string;
};

export async function LoginPageContent({
  showLocaleSwitcher,
  judgeDestination,
}: LoginPageContentProps) {
  const t = await getTranslations("Auth");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar showLocaleSwitcher={showLocaleSwitcher} />

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            {t("portalAccess")}
          </p>

          <h1 className="mt-3 text-3xl font-black">
            {t("signIn")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {t("description")}
          </p>

          <div className="mt-8">
            <LoginForm judgeDestination={judgeDestination} />
          </div>
        </div>
      </section>
    </main>
  );
}