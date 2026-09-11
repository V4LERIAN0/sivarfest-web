import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { serverApiGetOrNull } from "@/lib/server-api-client";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { AthletePortrait } from "@/components/public/AthletePortrait";
import { AthleteResults } from "@/features/athletes/AthleteResults";
import type { AthletePublicProfile } from "@/features/athletes/experience.types";
import { Link } from "@/i18n/navigation";
export const dynamic = "force-dynamic";
export default async function AthleteProfilePage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const { athleteId } = await params;
  if (!/^\d+$/.test(athleteId)) notFound();
  const slug = process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";
  const [data, t] = await Promise.all([
    serverApiGetOrNull<AthletePublicProfile>(
      `/public/competitions/${slug}/athletes/${athleteId}`,
    ),
    getTranslations("AthleteArea"),
  ]);
  if (!data) notFound();
  const a = data.athlete;
  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-[#f2f0eb]">
      <PublicNavbar />
      <header className="relative border-b border-white/10 px-4 py-12 sm:px-6 sm:py-16">
        <div className="sivar-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl">
          <Link
            className="text-xs font-black uppercase tracking-wider text-[#ffd400]"
            href="/athletes"
          >
            ← {t("back")}
          </Link>
          <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-center">
            <AthletePortrait name={a.fullName} url={a.profilePhotoUrl} large />
            <div className="min-w-0 flex-1">
              <p className="sivar-kicker">{a.categoryName}</p>
              <h1 className="sivar-display mt-3 break-words text-5xl sm:text-6xl lg:text-7xl">
                {a.fullName}
              </h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/60">
                {[a.gymName, a.country, a.bibNumber ? `#${a.bibNumber}` : null]
                  .filter(Boolean)
                  .map((s, i) => (
                    <span key={i} className="border border-white/15 px-3 py-2">
                      {s}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <p className="max-w-2xl whitespace-pre-line text-base leading-8 text-white/70">
            {a.publicBio || t("emptyProfile")}
          </p>
          <dl className="grid grid-cols-2 gap-4 border border-white/15 bg-white/[0.025] p-5">
            <div>
              <dt className="text-xs text-white/50">{t("rank")}</dt>
              <dd className="sivar-display mt-2 text-4xl">
                {data.standing?.scoredEvents
                  ? `#${data.standing.rank ?? "—"}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-white/50">{t("points")}</dt>
              <dd className="sivar-display mt-2 text-4xl">
                {data.standing?.scoredEvents ? data.standing.totalPoints : "—"}
              </dd>
            </div>
            {a.height !== null && (
              <div>
                <dt className="text-xs text-white/50">{t("height")}</dt>
                <dd className="mt-1 font-bold">{a.height}</dd>
              </div>
            )}
            {a.weight !== null && (
              <div>
                <dt className="text-xs text-white/50">{t("weight")}</dt>
                <dd className="mt-1 font-bold">{a.weight}</dd>
              </div>
            )}
          </dl>
        </div>
        <AthleteResults results={data.standing?.eventResults ?? []} />
      </div>
      <PublicPageFooter />
    </main>
  );
}
