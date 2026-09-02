import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Medal,
  Trophy,
  Users,
} from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import type { GenderClassification } from "@/features/categories/categories.types";
import type {
  RankingDirection,
  ScoreType,
} from "@/features/events/events.types";
import {
  getPublicEventLeaderboard,
  getPublicOverallLeaderboard,
} from "@/features/leaderboards/leaderboards.api";
import type {
  EventLeaderboardRow,
  LeaderboardStatus,
} from "@/features/leaderboards/leaderboards.types";
import type { ScoreStatus } from "@/features/scores/scores.types";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type PublicEventLeaderboardPageProps = {
  params: Promise<{
    locale: string;
    eventId: string;
  }>;
};

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

const scoreTypeMessageKeys = {
  FOR_TIME: "scoreType.FOR_TIME",
  AMRAP_REPS: "scoreType.AMRAP_REPS",
  MAX_WEIGHT: "scoreType.MAX_WEIGHT",
  EMOM_REPS: "scoreType.EMOM_REPS",
  ROUNDS_COMPLETED: "scoreType.ROUNDS_COMPLETED",
  POINTS: "scoreType.POINTS",
  CUSTOM: "scoreType.CUSTOM",
} as const satisfies Record<ScoreType, string>;

const rankingDirectionMessageKeys = {
  LOWER_IS_BETTER: "rankingDirection.LOWER_IS_BETTER",
  HIGHER_IS_BETTER: "rankingDirection.HIGHER_IS_BETTER",
} as const satisfies Record<RankingDirection, string>;

const scoreStatusMessageKeys = {
  DRAFT: "status.DRAFT",
  SUBMITTED: "status.SUBMITTED",
  VALIDATED: "status.VALIDATED",
  REJECTED: "status.REJECTED",
  PUBLISHED: "status.PUBLISHED",
  LOCKED: "status.LOCKED",
} as const satisfies Record<ScoreStatus, string>;

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

function athleteDetails(row: EventLeaderboardRow) {
  return [
    row.bibNumber ? `#${row.bibNumber}` : null,
    row.country,
    row.gymName,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function PublicEventLeaderboardPage({
  params,
}: PublicEventLeaderboardPageProps) {
  const { eventId } = await params;
  const numericEventId = Number(eventId);

  if (!Number.isInteger(numericEventId) || numericEventId <= 0) {
    notFound();
  }

  const [leaderboard, overallLeaderboard, t, eventT, scoringT, format] =
    await Promise.all([
      getPublicEventLeaderboard(numericEventId),
      getPublicOverallLeaderboard(),
      getTranslations("Leaderboard"),
      getTranslations("Events"),
      getTranslations("Scoring"),
      getFormatter(),
    ]);

  if (!leaderboard) {
    notFound();
  }

  const orderedEvents = [...overallLeaderboard.events].sort(
    (first, second) => first.displayOrder - second.displayOrder
  );
  const rankedAthletes = leaderboard.categories.reduce(
    (total, category) =>
      total + category.rows.filter((row) => row.rank !== null).length,
    0
  );
  const updatedLabel = leaderboard.lastUpdatedAt
    ? t("event.updated", {
        date: format.dateTime(new Date(leaderboard.lastUpdatedAt), {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: true,
        }),
      })
    : t("event.notYetUpdated");

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
          <div className="flex flex-wrap gap-3">
            <Link
              href="/leaderboard"
              className="inline-flex min-h-10 items-center gap-2 border border-white/15 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/65 transition hover:border-[#ffd400]/50 hover:text-[#ffd400]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("event.backToOverall")}
            </Link>
            <Link
              href={`/events#event-${leaderboard.eventId}`}
              className="inline-flex min-h-10 items-center gap-2 border border-white/15 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/65 transition hover:border-[#ffd400]/50 hover:text-[#ffd400]"
            >
              <Dumbbell className="h-4 w-4" aria-hidden="true" />
              {t("event.viewWorkout")}
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="sivar-kicker flex items-center gap-2">
                <Activity className="h-4 w-4" aria-hidden="true" />
                {t("event.eyebrow", {
                  eventCode: leaderboard.eventCode,
                })}
              </p>
              <h1 className="sivar-display sivar-section-title mt-4 max-w-4xl text-5xl text-[#f2f0eb] sm:text-6xl lg:text-7xl">
                {leaderboard.eventName}
              </h1>
              <p className="mt-5 text-sm font-bold text-white/55 sm:text-base">
                {eventT(scoreTypeMessageKeys[leaderboard.scoreType])}
                <span className="mx-2 text-[#ffd400]">·</span>
                {eventT(
                  rankingDirectionMessageKeys[leaderboard.rankingDirection]
                )}
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-white/35">
                {updatedLabel}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-end">
              <span
                className={`inline-flex min-h-11 items-center justify-center border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] ${statusClassName(
                  leaderboard.status
                )}`}
              >
                {t(statusMessageKeys[leaderboard.status])}
              </span>
              <span className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/12 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/60">
                <Users className="h-4 w-4 text-[#ffd400]" aria-hidden="true" />
                {t("event.rankedCount", { count: rankedAthletes })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {orderedEvents.length > 0 && (
        <section className="border-b border-white/10 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#ffd400]" aria-hidden="true" />
              <h2 className="text-xs font-black uppercase tracking-[0.13em] text-white/60">
                {t("event.otherEvents")}
              </h2>
            </div>
            <nav
              aria-label={t("event.otherEvents")}
              className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              {orderedEvents.map((event) => {
                const isCurrent = event.eventId === leaderboard.eventId;

                return (
                  <Link
                    key={event.eventId}
                    href={`/leaderboard/events/${event.eventId}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`group flex min-h-14 items-center justify-between gap-4 border px-4 py-3 transition ${
                      isCurrent
                        ? "border-[#ffd400]/60 bg-[#ffd400]/10 text-[#ffe45c]"
                        : "border-white/12 bg-[#0b0b0b] text-white/65 hover:border-[#ffd400]/45 hover:text-white"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#ff7a2f]">
                        {t("overall.event", { eventCode: event.eventCode })}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-black">
                        {event.eventName}
                      </span>
                    </span>
                    {isCurrent ? (
                      <span className="text-[0.68rem] font-black uppercase tracking-[0.08em]">
                        {t("event.currentEvent")}
                      </span>
                    ) : (
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-[#ffd400] transition group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </section>
      )}

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-white/12 pb-5">
            <p className="sivar-kicker">{t("event.resultsEyebrow")}</p>
            <h2 className="sivar-display mt-3 text-4xl text-[#f2f0eb] sm:text-5xl">
              {t("event.resultsTitle")}
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
                        <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3">
                          <span
                            className={`flex h-11 w-11 items-center justify-center border text-base font-black ${rankClassName(
                              row.rank
                            )}`}
                          >
                            {row.rank === null ? (
                              "—"
                            ) : (
                              <>
                                {row.tied && t("event.tiedAbbreviation")}
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
                        </div>

                        <dl className="mt-4 grid grid-cols-2 border border-white/10 bg-black/30">
                          <div className="border-b border-r border-white/10 p-3">
                            <dt className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-white/35">
                              {t("event.score")}
                            </dt>
                            <dd className="mt-1 font-mono text-base font-bold text-white">
                              {row.scoreDisplay ?? t("event.noScore")}
                            </dd>
                          </div>
                          <div className="border-b border-white/10 p-3">
                            <dt className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-white/35">
                              {t("event.points")}
                            </dt>
                            <dd className="mt-1 text-base font-black text-[#ffd400]">
                              {row.placementPoints === null
                                ? "—"
                                : format.number(row.placementPoints)}
                            </dd>
                          </div>
                          <div className="col-span-2 p-3">
                            <dt className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-white/35">
                              {t("event.tiebreak")}
                            </dt>
                            <dd className="mt-1 font-mono text-sm text-white/65">
                              {row.tiebreakDisplay ?? "—"}
                            </dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })}

                  {category.rows.length === 0 && (
                    <p className="px-5 py-10 text-center text-sm text-white/40">
                      {t("event.noAthletes")}
                    </p>
                  )}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[48rem] text-left">
                    <thead className="bg-black/45 text-xs font-black uppercase tracking-[0.09em] text-white/40">
                      <tr>
                        <th className="px-5 py-4">{t("event.rank")}</th>
                        <th className="px-5 py-4">{t("event.athlete")}</th>
                        <th className="px-5 py-4">{t("event.score")}</th>
                        <th className="px-5 py-4">{t("event.tiebreak")}</th>
                        <th className="px-5 py-4 text-right">
                          {t("event.points")}
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
                                      t("event.tiedAbbreviation")}
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
                            <td className="px-5 py-4">
                              <p className="font-mono text-base font-bold text-white/90">
                                {row.scoreDisplay ?? t("event.noScore")}
                              </p>
                              {row.scoreStatus && (
                                <p className="mt-1 text-xs text-white/35">
                                  {scoringT(
                                    scoreStatusMessageKeys[row.scoreStatus]
                                  )}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4 font-mono text-sm text-white/55">
                              {row.tiebreakDisplay ?? "—"}
                            </td>
                            <td className="px-5 py-4 text-right text-lg font-black text-[#ffd400]">
                              {row.placementPoints === null
                                ? "—"
                                : format.number(row.placementPoints)}
                            </td>
                          </tr>
                        );
                      })}

                      {category.rows.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-sm text-white/40"
                          >
                            {t("event.noAthletes")}
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
                {t("event.noDivisions")}
              </div>
            )}
          </div>
        </div>
      </section>

      <PublicPageFooter />
    </main>
  );
}
