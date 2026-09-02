import { Activity, ArrowRight, Medal, Trophy, Users } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import type { GenderClassification } from "@/features/categories/categories.types";
import { getPublicOverallLeaderboard } from "@/features/leaderboards/leaderboards.api";
import type {
  LeaderboardStatus,
  OverallLeaderboardRow,
} from "@/features/leaderboards/leaderboards.types";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const statusMessageKeys = {
  UNOFFICIAL: "status.UNOFFICIAL",
  UNDER_REVIEW: "status.UNDER_REVIEW",
  PUBLISHED: "status.PUBLISHED",
  FINAL: "status.FINAL",
} as const satisfies Record<LeaderboardStatus, string>;

const genderMessageKeys = {
  MALE: "gender.MALE",
  FEMALE: "gender.FEMALE",
  MIXED: "gender.MIXED",
  OPEN: "gender.OPEN",
  OTHER: "gender.OTHER",
} as const satisfies Record<GenderClassification, string>;

function statusClassName(status: LeaderboardStatus) {
  if (status === "FINAL") {
    return "border-emerald-400/35 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "PUBLISHED") {
    return "border-[#ffd400]/45 bg-[#ffd400]/10 text-[#ffe45c]";
  }

  if (status === "UNDER_REVIEW") {
    return "border-[#ff7a2f]/45 bg-[#ff5a00]/10 text-[#ff9a5f]";
  }

  return "border-white/15 bg-white/[0.04] text-white/55";
}

function rankClassName(rank: number | null) {
  if (rank === 1) {
    return "border-[#ffd400] bg-[#ffd400] text-black";
  }

  if (rank === 2) {
    return "border-white/45 bg-white/10 text-white";
  }

  if (rank === 3) {
    return "border-[#ff7a2f]/70 bg-[#ff5a00]/12 text-[#ff9a5f]";
  }

  return "border-white/12 bg-black/30 text-white/55";
}

function athleteDetails(row: OverallLeaderboardRow) {
  return [
    row.bibNumber ? `#${row.bibNumber}` : null,
    row.country,
    row.gymName,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function OverallLeaderboardPage() {
  const [leaderboard, t, format] = await Promise.all([
    getPublicOverallLeaderboard(),
    getTranslations("Leaderboard"),
    getFormatter(),
  ]);
  const orderedEvents = [...leaderboard.events].sort(
    (first, second) => first.displayOrder - second.displayOrder
  );
  const rankedAthletes = leaderboard.categories.reduce(
    (total, category) =>
      total + category.rows.filter((row) => row.rank !== null).length,
    0
  );
  const updatedLabel = leaderboard.lastUpdatedAt
    ? t("overall.updated", {
        date: format.dateTime(new Date(leaderboard.lastUpdatedAt), {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: true,
        }),
      })
    : t("overall.notYetUpdated");

  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-white">
      <PublicNavbar />

      <header className="relative overflow-hidden border-b border-white/10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="sivar-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div
          className="absolute -right-20 -top-32 h-80 w-80 bg-[#ff5a00]/12 blur-[110px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="sivar-kicker flex items-center gap-2">
                <Activity className="h-4 w-4" aria-hidden="true" />
                {t("overall.eyebrow")}
              </p>
              <h1 className="sivar-display sivar-section-title mt-4 max-w-4xl text-5xl text-[#f2f0eb] sm:text-6xl lg:text-7xl">
                {t("overall.title", {
                  competitionName: leaderboard.competitionName,
                })}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
                {t("overall.description")}
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-white/35">
                {updatedLabel}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:max-w-md lg:justify-end">
              <span
                className={`col-span-2 inline-flex min-h-11 items-center justify-center border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] sm:col-span-1 ${statusClassName(
                  leaderboard.status
                )}`}
              >
                {t(statusMessageKeys[leaderboard.status])}
              </span>
              <span className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/12 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/60">
                <Trophy className="h-4 w-4 text-[#ffd400]" aria-hidden="true" />
                {t("overall.eventCount", { count: orderedEvents.length })}
              </span>
              <span className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/12 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/60">
                <Users className="h-4 w-4 text-[#ffd400]" aria-hidden="true" />
                {t("overall.rankedCount", { count: rankedAthletes })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {orderedEvents.length === 0 ? (
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl border border-dashed border-white/20 bg-white/[0.025] p-10 text-center sm:p-14">
            <Trophy
              className="mx-auto h-8 w-8 text-[#ffd400]"
              aria-hidden="true"
            />
            <h2 className="sivar-display mt-5 text-3xl text-[#f2f0eb]">
              {t("overall.emptyTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/50">
              {t("overall.emptyDescription")}
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="border-b border-white/10 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="sivar-kicker">{t("overall.eventsEyebrow")}</p>
                  <h2 className="sivar-display mt-3 text-3xl text-[#f2f0eb] sm:text-4xl">
                    {t("overall.eventsTitle")}
                  </h2>
                </div>
                <p className="max-w-lg text-sm leading-6 text-white/45">
                  {t("overall.eventsDescription")}
                </p>
              </div>

              <nav
                aria-label={t("overall.eventsTitle")}
                className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {orderedEvents.map((event, index) => (
                  <Link
                    key={event.eventId}
                    href={`/leaderboard/events/${event.eventId}`}
                    className="group grid min-h-28 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 border border-white/12 bg-[#0b0b0b] p-4 transition hover:border-[#ffd400]/55 hover:bg-white/[0.035]"
                  >
                    <span className="sivar-display text-4xl text-white/12 transition group-hover:text-[#ffd400]/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#ff7a2f]">
                        {t("overall.event", {
                          eventCode: event.eventCode,
                        })}
                      </span>
                      <span className="mt-1 block truncate text-base font-black text-white">
                        {event.eventName}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-5 w-5 text-[#ffd400] transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            </div>
          </section>

          <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="border-b border-white/12 pb-5">
                <p className="sivar-kicker">{t("overall.standingsEyebrow")}</p>
                <h2 className="sivar-display mt-3 text-4xl text-[#f2f0eb] sm:text-5xl">
                  {t("overall.standingsTitle")}
                </h2>
              </div>

              <div className="mt-7 space-y-10">
                {leaderboard.categories.map((category) => (
                  <section
                    key={category.categoryId}
                    className="overflow-hidden border border-white/12 bg-[#0b0b0b]"
                  >
                    <header className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
                      <div>
                        <h3 className="sivar-display text-3xl text-[#f2f0eb] sm:text-4xl">
                          {category.categoryName}
                        </h3>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-white/40">
                          {[
                            t(genderMessageKeys[category.genderClassification]),
                            category.divisionLabel,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <Medal
                        className="h-5 w-5 text-[#ffd400]"
                        aria-hidden="true"
                      />
                    </header>

                    <div className="divide-y divide-white/8 md:hidden">
                      {category.rows.map((row) => {
                        const details = athleteDetails(row);

                        return (
                          <article key={row.athleteId} className="p-4">
                            <div className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3">
                              <span
                                className={`flex h-11 w-11 items-center justify-center border text-base font-black ${rankClassName(
                                  row.rank
                                )}`}
                              >
                                {row.rank === null ? (
                                  "—"
                                ) : (
                                  <>
                                    {row.tied && t("overall.tiedAbbreviation")}
                                    {format.number(row.rank)}
                                  </>
                                )}
                              </span>
                              <div className="min-w-0">
                                <h4 className="truncate text-base font-black text-white">
                                  {row.athleteName}
                                </h4>
                                {details && (
                                  <p className="mt-1 truncate text-xs text-white/40">
                                    {details}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-[#ffd400]">
                                  {row.totalPoints === null
                                    ? "—"
                                    : format.number(row.totalPoints)}
                                </p>
                                <p className="text-[0.7rem] font-black uppercase tracking-[0.08em] text-white/35">
                                  {t("overall.total")}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              {orderedEvents.map((event, eventIndex) => {
                                const result = row.eventResults[eventIndex];

                                return (
                                  <Link
                                    key={event.eventId}
                                    href={`/leaderboard/events/${event.eventId}`}
                                    className="border border-white/10 bg-black/30 px-3 py-2 transition hover:border-[#ffd400]/45"
                                  >
                                    <span className="block text-[0.68rem] font-black uppercase tracking-[0.08em] text-white/35">
                                      {t("overall.event", {
                                        eventCode: event.eventCode,
                                      })}
                                    </span>
                                    <span className="mt-1 block font-mono text-sm font-bold text-white/80">
                                      {result?.scoreDisplay ??
                                        t("overall.noScore")}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </article>
                        );
                      })}

                      {category.rows.length === 0 && (
                        <p className="px-5 py-10 text-center text-sm text-white/40">
                          {t("overall.noAthletes")}
                        </p>
                      )}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-max text-left">
                        <thead className="bg-black/45 text-xs font-black uppercase tracking-[0.09em] text-white/40">
                          <tr>
                            <th className="px-5 py-4">{t("overall.rank")}</th>
                            <th className="min-w-56 px-5 py-4">
                              {t("overall.athlete")}
                            </th>
                            {orderedEvents.map((event) => (
                              <th
                                key={event.eventId}
                                className="min-w-40 px-5 py-4 text-center"
                              >
                                <Link
                                  href={`/leaderboard/events/${event.eventId}`}
                                  className="group inline-flex flex-col transition hover:text-[#ffd400]"
                                >
                                  <span>
                                    {t("overall.event", {
                                      eventCode: event.eventCode,
                                    })}
                                  </span>
                                  <span className="mt-1 max-w-40 truncate text-[0.68rem] font-normal normal-case text-white/30 group-hover:text-white/50">
                                    {event.eventName}
                                  </span>
                                </Link>
                              </th>
                            ))}
                            <th className="px-5 py-4 text-right">
                              {t("overall.total")}
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/8">
                          {category.rows.map((row) => {
                            const details = athleteDetails(row);

                            return (
                              <tr
                                key={row.athleteId}
                                className="transition hover:bg-white/[0.035]"
                              >
                                <td className="px-5 py-4">
                                  <span
                                    className={`flex h-10 min-w-10 items-center justify-center border px-2 text-sm font-black ${rankClassName(
                                      row.rank
                                    )}`}
                                  >
                                    {row.rank === null ? (
                                      "—"
                                    ) : (
                                      <>
                                        {row.tied &&
                                          t("overall.tiedAbbreviation")}
                                        {format.number(row.rank)}
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <p className="font-black text-white">
                                    {row.athleteName}
                                  </p>
                                  {details && (
                                    <p className="mt-1 text-xs text-white/35">
                                      {details}
                                    </p>
                                  )}
                                </td>
                                {orderedEvents.map((event, eventIndex) => {
                                  const result = row.eventResults[eventIndex];
                                  const resultRank = result?.rank;
                                  const placementPoints =
                                    result?.placementPoints;
                                  const hasPlacement =
                                    resultRank !== null &&
                                    resultRank !== undefined &&
                                    placementPoints !== null &&
                                    placementPoints !== undefined;

                                  return (
                                    <td
                                      key={event.eventId}
                                      className="px-5 py-4 text-center"
                                    >
                                      <p className="font-mono font-bold text-white/85">
                                        {result?.scoreDisplay ??
                                          t("overall.noScore")}
                                      </p>
                                      {hasPlacement ? (
                                        <p className="mt-1 text-xs text-white/35">
                                          {result.tied &&
                                            t("overall.tiedAbbreviation")}
                                          {t("overall.placementPoints", {
                                            rank: resultRank,
                                            points: placementPoints,
                                          })}
                                        </p>
                                      ) : (
                                        <p className="mt-1 text-xs text-white/25">
                                          {t("overall.unscored")}
                                        </p>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="px-5 py-4 text-right">
                                  <p className="text-xl font-black text-[#ffd400]">
                                    {row.totalPoints === null
                                      ? "—"
                                      : format.number(row.totalPoints)}
                                  </p>
                                  <p className="mt-1 text-xs text-white/35">
                                    {t("overall.scoredEvents", {
                                      scored: row.scoredEvents,
                                      total: row.totalEvents,
                                    })}
                                  </p>
                                </td>
                              </tr>
                            );
                          })}

                          {category.rows.length === 0 && (
                            <tr>
                              <td
                                colSpan={orderedEvents.length + 3}
                                className="px-6 py-10 text-center text-sm text-white/40"
                              >
                                {t("overall.noAthletes")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}

                {leaderboard.categories.length === 0 && (
                  <div className="border border-dashed border-white/20 p-10 text-center text-sm text-white/45">
                    {t("overall.noDivisions")}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <PublicPageFooter />
    </main>
  );
}
