import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getPublicHeats } from "@/features/heats/heats.api";
import type { HeatStatus } from "@/features/heats/heats.types";

export const dynamic = "force-dynamic";

const statusMessageKeys = {
  SCHEDULED: "status.SCHEDULED",
  CHECK_IN_OPEN: "status.CHECK_IN_OPEN",
  ON_FLOOR: "status.ON_FLOOR",
  IN_PROGRESS: "status.IN_PROGRESS",
  COMPLETED: "status.COMPLETED",
  DELAYED: "status.DELAYED",
  CANCELLED: "status.CANCELLED",
} as const satisfies Record<HeatStatus, string>;

export default async function PublicHeatsPage() {
  const [heats, t, format] = await Promise.all([
    getPublicHeats(),
    getTranslations("Heats"),
    getFormatter(),
  ]);

  const eventGroups = heats.reduce(
    (groups, heat) => {
      (groups[heat.eventId] ??= []).push(heat);
      return groups;
    },
    {} as Record<number, typeof heats>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
          {t("publicSchedule.eyebrow")}
        </p>

        <h1 className="mt-3 text-4xl font-black">
          {t("publicSchedule.title")}
        </h1>

        <p className="mt-3 text-slate-400">
          {t("publicSchedule.description")}
        </p>

        {heats.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-12 text-center">
            <h2 className="text-xl font-bold">
              {t("publicSchedule.emptyTitle")}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {t("publicSchedule.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {Object.values(eventGroups).map((eventHeats) => {
              const event = eventHeats[0];

              return (
                <section key={event.eventId}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                        {t("publicSchedule.event", {
                          eventCode: event.eventCode,
                        })}
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        {event.eventName}
                      </h2>
                    </div>

                    <p className="text-sm text-slate-400">
                      {t("publicSchedule.heatCount", {
                        count: eventHeats.length,
                      })}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {eventHeats.map((heat) => {
                      const scheduledTime = heat.scheduledTime
                        ? format.dateTime(new Date(heat.scheduledTime), {
                            dateStyle: "medium",
                            timeStyle: "short",
                            hour12: true,
                          })
                        : t("publicSchedule.timeTba");

                      return (
                        <article
                          key={heat.id}
                          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-black">
                                {heat.name}
                              </h3>

                              <p className="mt-1 text-sm text-slate-400">
                                {scheduledTime}
                              </p>
                            </div>

                            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                              {t(statusMessageKeys[heat.status])}
                            </span>
                          </div>

                          <div className="mt-5 space-y-2">
                            {heat.assignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="grid grid-cols-[8rem_1fr] items-center rounded-xl bg-black/25 px-3 py-2"
                              >
                                <p className="text-sm font-black text-orange-400">
                                  {t("publicSchedule.laneStation", {
                                    position: assignment.positionNumber,
                                  })}
                                </p>

                                <div>
                                  <p className="font-bold">
                                    {assignment.bibNumber
                                      ? `#${assignment.bibNumber} · `
                                      : ""}
                                    {assignment.athleteName}
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    {assignment.categoryName}
                                  </p>
                                </div>
                              </div>
                            ))}

                            {heat.assignments.length === 0 && (
                              <p className="py-4 text-center text-sm text-slate-500">
                                {t(
                                  "publicSchedule.assignmentsPending"
                                )}
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}