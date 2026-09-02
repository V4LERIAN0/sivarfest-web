import { Users } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { AthleteDirectory } from "@/components/public/AthleteDirectory";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { getPublicAthletes } from "@/features/athletes/athletes.api";
import { getPublicCategories } from "@/features/categories/categories.api";

export const dynamic = "force-dynamic";

export default async function AthletesPage() {
  const [athletes, categories, t, format] = await Promise.all([
    getPublicAthletes(),
    getPublicCategories(),
    getTranslations("Athletes"),
    getFormatter(),
  ]);

  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-white">
      <PublicNavbar />

      <PublicPageHeader
        eyebrow={t("publicList.eyebrow")}
        title={t("publicList.title")}
        description={t("publicList.description")}
        aside={
          <div className="flex min-w-56 items-center gap-4 border border-white/12 bg-black/45 px-5 py-4">
            <Users className="h-6 w-6 text-[#ffd400]" aria-hidden="true" />
            <div>
              <p className="sivar-display text-3xl text-white">
                {format.number(athletes.length)}
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/45">
                {t("publicList.total", { count: athletes.length })}
              </p>
            </div>
          </div>
        }
      />

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {athletes.length === 0 ? (
            <div className="border border-dashed border-white/20 bg-white/[0.025] p-10 text-center sm:p-14">
              <h2 className="sivar-display text-3xl">
                {t("publicList.emptyTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/50">
                {t("publicList.emptyDescription")}
              </p>
            </div>
          ) : (
            <AthleteDirectory athletes={athletes} categories={categories} />
          )}
        </div>
      </section>

      <PublicPageFooter />
    </main>
  );
}
