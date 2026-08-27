import Link from "next/link";
import { getAdminEvent } from "@/features/events/events.api";
import { getAdminHeats } from "@/features/heats/heats.api";
import { getAdminEventLeaderboardPreview } from "@/features/leaderboards/leaderboards.api";
import { getAdminEventScores } from "@/features/scores/scores.api";
import { ScoreEntryForm } from "@/features/scores/ScoreEntryForm";

interface HeatPosition {
  heatName: string;
  heatNumber: number;
  positionNumber: number;
}

export default async function AdminEventScoresPage({
  params,
}: {
  params: Promise<{
    competitionId: string;
    eventId: string;
  }>;
}) {
  const { competitionId, eventId } = await params;
  const competitionIdNumber = Number(competitionId);
  const eventIdNumber = Number(eventId);

  const [event, leaderboard, scores, heats] = await Promise.all([
    getAdminEvent(eventIdNumber),
    getAdminEventLeaderboardPreview(
      competitionIdNumber,
      eventIdNumber
    ),
    getAdminEventScores(eventIdNumber),
    getAdminHeats(eventIdNumber),
  ]);

  const scoreByAthleteId = new Map(
    scores.map((score) => [score.athleteId, score])
  );

  const positionByAthleteId = new Map<number, HeatPosition>();

  for (const heat of heats) {
    for (const assignment of heat.assignments) {
      positionByAthleteId.set(assignment.athleteId, {
        heatName: heat.name,
        heatNumber: heat.heatNumber,
        positionNumber: assignment.positionNumber,
      });
    }
  }

  const athleteCount = leaderboard.categories.reduce(
    (total, category) => total + category.rows.length,
    0
  );

  const publishedCount = scores.filter(
    (score) =>
      score.status === "PUBLISHED" || score.status === "LOCKED"
  ).length;

  const reviewCount = scores.filter(
    (score) =>
      score.status === "SUBMITTED" ||
      score.status === "VALIDATED"
  ).length;

  return (
    <div>
      <Link
        href={`/admin/competitions/${competitionIdNumber}/events`}
        className="text-sm font-bold text-slate-400 hover:text-white"
      >
        ← Back to events
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            Event {event.eventCode}
          </p>

          <h1 className="mt-3 text-4xl font-black">
            {event.name} scoring
          </h1>

          <p className="mt-2 text-slate-400">
            {event.scoreType} · {event.rankingDirection}
            {event.weightUnit ? ` · ${event.weightUnit}` : ""}
          </p>

          {event.tiebreakType !== "NONE" && (
            <p className="mt-1 text-sm text-slate-500">
              Tiebreak: {event.tiebreakLabel ?? event.tiebreakType}
            </p>
          )}
        </div>

        <Link
          href={`/admin/competitions/${competitionIdNumber}/events/${eventIdNumber}/heats`}
          className="rounded-xl border border-orange-500/50 px-4 py-2 text-sm font-bold text-orange-200 hover:bg-orange-500/10"
        >
          Manage heats
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Athletes" value={athleteCount} />
        <SummaryCard label="Scores entered" value={scores.length} />
        <SummaryCard label="Under review" value={reviewCount} />
        <SummaryCard label="Published or locked" value={publishedCount} />
      </div>

      <div className="mt-10 space-y-8">
        {leaderboard.categories.map((category) => (
          <section
            key={category.categoryId}
            className="overflow-hidden rounded-2xl border border-slate-800"
          >
            <div className="flex items-center justify-between bg-slate-900 px-5 py-4">
              <div>
                <h2 className="text-xl font-black">
                  {category.categoryName}
                </h2>

                <p className="text-sm text-slate-400">
                  {category.divisionLabel ??
                    category.genderClassification}
                </p>
              </div>

              {!category.active && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200">
                  Inactive
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[64rem] text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Athlete</th>
                    <th className="px-4 py-3">Heat / position</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Tiebreak</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3 text-center">Points</th>
                  </tr>
                </thead>

                <tbody>
                  {category.rows.map((row) => {
                    const score = scoreByAthleteId.get(row.athleteId);
                    const position = positionByAthleteId.get(
                      row.athleteId
                    );
                    const status = score?.status ?? row.scoreStatus;

                    return (
                      <tr
                        key={row.athleteId}
                        className="border-t border-slate-800"
                      >
                        <td className="px-4 py-4">
                          <p className="font-bold">{row.athleteName}</p>
                          <p className="text-xs text-slate-500">
                            {row.bibNumber
                              ? `#${row.bibNumber}`
                              : "No bib number"}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {position ? (
                            <>
                              <p>{position.heatName}</p>
                              <p className="text-xs text-slate-500">
  Position {position.positionNumber}
</p>
                            </>
                          ) : (
                            <span className="text-slate-500">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 align-top">
  <ScoreEntryForm
    competitionId={competitionIdNumber}
    athleteId={row.athleteId}
    event={event}
    score={score}
    scoreDisplay={row.scoreDisplay}
  />

  {score?.rejectionReason && (
    <p className="mt-2 max-w-xs text-xs text-red-300">
      {score.rejectionReason}
    </p>
  )}
</td>

                        <td className="px-4 py-4 text-slate-300">
                          {row.tiebreakDisplay ?? "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                              status
                            )}`}
                          >
                            {status ?? "NOT ENTERED"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center font-black">
                          {row.rank === null
                            ? "—"
                            : row.tied
                              ? `T${row.rank}`
                              : row.rank}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {row.placementPoints ?? "—"}
                        </td>
                      </tr>
                    );
                  })}

                  {category.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No eligible athletes in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-500">
        Leaderboard status: {leaderboard.status}
        {leaderboard.lastUpdatedAt
          ? ` · Updated ${formatDateTime(
              leaderboard.lastUpdatedAt
            )}`
          : ""}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function statusClass(status: string | null) {
  switch (status) {
    case "LOCKED":
    case "PUBLISHED":
      return "bg-emerald-500/20 text-emerald-200";
    case "VALIDATED":
      return "bg-sky-500/20 text-sky-200";
    case "SUBMITTED":
      return "bg-amber-500/20 text-amber-200";
    case "REJECTED":
      return "bg-red-500/20 text-red-200";
    case "DRAFT":
      return "bg-slate-700 text-slate-200";
    default:
      return "bg-slate-800 text-slate-400";
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}