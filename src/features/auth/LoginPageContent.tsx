import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { LoginForm } from "@/features/auth/LoginForm";

type LoginPageContentProps = {
  showLocaleSwitcher: boolean;
  judgeDestination: string;
  athleteDestination: string;
};

export async function LoginPageContent({
  showLocaleSwitcher,
  judgeDestination,
  athleteDestination,
}: LoginPageContentProps) {
  const t = await getTranslations("Auth");

  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-white">
      <PublicNavbar showLocaleSwitcher={showLocaleSwitcher} />

      <section className="relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <Image
          src="/brand/sivarfest-floor-render.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(5,5,5,0.98),rgba(5,5,5,0.82)_54%,rgba(5,5,5,0.92))]" />
        <div className="sivar-grid absolute inset-0 -z-10 opacity-25" />

        <div className="mx-auto grid min-h-[calc(100svh-15rem)] max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center">
          <div className="max-w-3xl">
            <p className="sivar-kicker">{t("portalAccess")}</p>
            <h1 className="sivar-display sivar-section-title mt-4 text-5xl text-[#f2f0eb] sm:text-6xl lg:text-7xl">
              {t("welcomeTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              {t("welcomeDescription")}
            </p>
          </div>

          <div className="border border-white/15 bg-black/80 p-6 shadow-2xl backdrop-blur sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center border border-[#ffd400]/40 bg-[#ffd400]/10 text-[#ffd400]">
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ffd400]">
                  {t("portalAccess")}
                </p>
                <h2 className="sivar-display mt-1 text-3xl text-white">
                  {t("signIn")}
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-white/50">
              {t("description")}
            </p>

            <div className="mt-7">
              <LoginForm
                judgeDestination={judgeDestination}
                athleteDestination={athleteDestination}
              />
            </div>
          </div>
        </div>
      </section>

      <PublicPageFooter />
    </main>
  );
}
