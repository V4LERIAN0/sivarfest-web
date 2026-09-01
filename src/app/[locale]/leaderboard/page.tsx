import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import type { GenderClassification } from "@/features/categories/categories.types";
import { getPublicOverallLeaderboard } from "@/features/leaderboards/leaderboards.api";
import type { LeaderboardStatus } from "@/features/leaderboards/leaderboards.types";
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

export default async function OverallLeaderboardPage() {
  const [leaderboard, t, format] = await Promise.all([
    getPublicOverallLeaderboard(),
    getTranslations("Leaderboard"),
    getFormatter(),
  ]);

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
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-5 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">
              {t("overall.eyebrow")}
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {t("overall.title", {
                competitionName: leaderboard.competitionName,
              })}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              {t("overall.description")}
            </p>

            <p className="mt-2 text-xs text-slate-500">{updatedLabel}</p>
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
              {t("overall.eventCount", {
                count: leaderboard.events.length,
              })}
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
              {t("overall.rankedCount", {
                count: rankedAthletes,
              })}
            </span>
          </div>
        </div>

        {leaderboard.events.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-12 text-center">
            <h2 className="text-xl font-bold">{t("overall.emptyTitle")}</h2>

            <p className="mt-2 text-sm text-slate-400">
              {t("overall.emptyDescription")}
            </p>
          </div>
        ) : (
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
                  <table className="w-full min-w-max text-left">
                    <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-5 py-4">{t("overall.rank")}</th>
                        <th className="min-w-56 px-5 py-4">
                          {t("overall.athlete")}
                        </th>

                        {leaderboard.events.map((event) => (
                          <th
                            key={event.eventId}
                            className="min-w-40 px-5 py-4 text-center"
                          >
                            <Link
                              href={`/leaderboard/events/${event.eventId}`}
                              className="transition hover:text-orange-400"
                            >
                              {t("overall.event", {
                                eventCode: event.eventCode,
                              })}
                            </Link>

                            <p className="mt-1 text-[10px] font-normal normal-case text-slate-500">
                              {event.eventName}
                            </p>
                          </th>
                        ))}

                        <th className="px-5 py-4 text-right">
                          {t("overall.total")}
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
                            <td className="px-5 py-5">
                              {row.rank === null ? (
                                <span className="text-slate-600">—</span>
                              ) : (
                                <span className="text-lg font-black text-orange-400">
                                  {row.tied &&
                                    t("overall.tiedAbbreviation")}
                                  {format.number(row.rank)}
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-semibold">
                                {row.athleteName}
                              </p>

                              {athleteDetails && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {athleteDetails}
                                </p>
                              )}
                            </td>

                            {leaderboard.events.map((event, eventIndex) => {
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
                                  className="px-5 py-5 text-center"
                                >
                                  <p className="font-mono font-bold">
                                    {result?.scoreDisplay ??
                                      t("overall.noScore")}
                                  </p>

                                  {hasPlacement ? (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {result.tied &&
                                        t("overall.tiedAbbreviation")}
                                      {t("overall.placementPoints", {
                                        rank: resultRank,
                                        points: placementPoints,
                                      })}
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-xs text-slate-600">
                                      {t("overall.unscored")}
                                    </p>
                                  )}
                                </td>
                              );
                            })}

                            <td className="px-5 py-5 text-right">
                              <p className="text-lg font-black">
                                {row.totalPoints === null
                                  ? "—"
                                  : format.number(row.totalPoints)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
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
                            colSpan={leaderboard.events.length + 3}
                            className="px-6 py-10 text-center text-sm text-slate-500"
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
              <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
                {t("overall.noDivisions")}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}