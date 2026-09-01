import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import type { GenderClassification } from "@/features/categories/categories.types";
import type {
  RankingDirection,
  ScoreType,
} from "@/features/events/events.types";
import { getPublicEventLeaderboard } from "@/features/leaderboards/leaderboards.api";
import type { LeaderboardStatus } from "@/features/leaderboards/leaderboards.types";
import type { ScoreStatus } from "@/features/scores/scores.types";
import { Link } from "@/i18n/navigation";

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

function getStatusClasses(status: LeaderboardStatus) {
  switch (status) {
    case "FINAL":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    case "PUBLISHED":
      return "border-blue-400/30 bg-blue-400/10 text-blue-300";
    case "UNDER_REVIEW":
      return "border-amber-400/30 bg-amber-400/10 text-amber-300";
    default:
      return "border-slate-600 bg-slate-800 text-slate-300";
  }
}

export default async function PublicEventLeaderboardPage({
  params,
}: PublicEventLeaderboardPageProps) {
  const { eventId } = await params;
  const numericEventId = Number(eventId);

  if (!Number.isInteger(numericEventId) || numericEventId <= 0) {
    notFound();
  }

  const [leaderboard, t, eventT, scoringT, format] = await Promise.all([
    getPublicEventLeaderboard(numericEventId),
    getTranslations("Leaderboard"),
    getTranslations("Events"),
    getTranslations("Scoring"),
    getFormatter(),
  ]);

  if (!leaderboard) {
    notFound();
  }

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
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        <Link
          href="/events"
          className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
        >
          {t("event.backToEvents")}
        </Link>

        <div className="mt-6 flex flex-col gap-5 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">
              {t("event.eyebrow", {
                eventCode: leaderboard.eventCode,
              })}
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {leaderboard.eventName}
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              {eventT(scoreTypeMessageKeys[leaderboard.scoreType])}
              {" · "}
              {eventT(
                rankingDirectionMessageKeys[leaderboard.rankingDirection]
              )}
              {" · "}
              {updatedLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusClasses(
                leaderboard.status
              )}`}
            >
              {t(statusMessageKeys[leaderboard.status])}
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
              {t("event.rankedCount", {
                count: rankedAthletes,
              })}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {leaderboard.categories.map((category) => (
            <section
              key={category.categoryId}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
            >
              <div className="border-b border-slate-800 px-6 py-5">
                <h2 className="text-xl font-bold">
                  {category.categoryName}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {[
                    t(genderMessageKeys[category.genderClassification]),
                    category.divisionLabel,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] text-left">
                  <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-6 py-4">{t("event.rank")}</th>
                      <th className="px-6 py-4">{t("event.athlete")}</th>
                      <th className="px-6 py-4">{t("event.score")}</th>
                      <th className="px-6 py-4">{t("event.tiebreak")}</th>
                      <th className="px-6 py-4 text-right">
                        {t("event.points")}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {category.rows.map((row) => {
                      const athleteDetails = [
                        row.bibNumber ? `#${row.bibNumber}` : null,
                        row.country,
                        row.gymName,
                      ]
                        .filter(Boolean)
                        .join(" · ");

                      return (
                        <tr
                          key={row.athleteId}
                          className="transition hover:bg-slate-800/40"
                        >
                          <td className="px-6 py-5">
                            {row.rank === null ? (
                              <span className="text-slate-600">—</span>
                            ) : (
                              <span className="text-lg font-black text-orange-400">
                                {row.tied && t("event.tiedAbbreviation")}
                                {format.number(row.rank)}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-semibold">
                              {row.athleteName}
                            </p>

                            {athleteDetails && (
                              <p className="mt-1 text-xs text-slate-500">
                                {athleteDetails}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-mono text-base font-bold">
                              {row.scoreDisplay ?? t("event.noScore")}
                            </p>

                            {row.scoreStatus && (
                              <p className="mt-1 text-xs text-slate-500">
                                {scoringT(
                                  scoreStatusMessageKeys[row.scoreStatus]
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5 font-mono text-sm text-slate-300">
                            {row.tiebreakDisplay ?? "—"}
                          </td>

                          <td className="px-6 py-5 text-right font-bold">
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
                          className="px-6 py-10 text-center text-sm text-slate-500"
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
            <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
              {t("event.noDivisions")}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}