import {
  getFormatter,
  getTranslations,
} from "next-intl/server";

import { getMyJudgeAssignments } from "@/features/judges/judges.api";
import { getJudgeAssignmentScore } from "@/features/scores/scores.api";
import { JudgeScoreEntryForm } from "@/features/scores/JudgeScoreEntryForm";

export const dynamic = "force-dynamic";

export default async function JudgeDashboardPage() {
  const [assignments, t, format] = await Promise.all([
    getMyJudgeAssignments(),
    getTranslations("Judging"),
    getFormatter(),
  ]);

  const scores = await Promise.all(
    assignments.map((assignment) =>
      getJudgeAssignmentScore(assignment.id)
    )
  );

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
        {t("dashboard.eyebrow")}
      </p>

      <h1 className="mt-3 text-4xl font-black">
        {t("dashboard.title")}
      </h1>

      <p className="mt-2 text-slate-400">
        {t("dashboard.description")}
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {assignments.map((assignment, index) => {
          const scheduledTime = assignment.scheduledTime
            ? format.dateTime(
                new Date(assignment.scheduledTime),
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: true,
                }
              )
            : t("dashboard.timeNotScheduled");

          return (
            <article
              key={assignment.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    {t("dashboard.event", {
                      eventCode: assignment.eventCode,
                    })}
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {assignment.eventName}
                  </h2>
                </div>

                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                  {t("dashboard.position", {
                    position: assignment.positionNumber,
                  })}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-5">
                <p className="font-black">
                  {assignment.heatName}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {scheduledTime}
                </p>

                <p className="mt-4 text-lg font-bold">
                  {assignment.bibNumber
                    ? `#${assignment.bibNumber} · `
                    : ""}
                  {assignment.athleteName}
                </p>

                <p className="text-sm text-slate-400">
                  {assignment.categoryName}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-5">
                <JudgeScoreEntryForm
                  assignment={assignment}
                  score={scores[index]}
                />
              </div>
            </article>
          );
        })}

        {assignments.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-slate-400 md:col-span-2">
            {t("dashboard.empty")}
          </p>
        )}
      </div>
    </div>
  );
}