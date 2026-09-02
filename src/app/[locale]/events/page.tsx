import { getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getPublicEvents } from "@/features/events/events.api";
import type { ScoreType } from "@/features/events/events.types";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const scoreTypeMessageKeys = {
  FOR_TIME: "scoreType.FOR_TIME",
  AMRAP_REPS: "scoreType.AMRAP_REPS",
  MAX_WEIGHT: "scoreType.MAX_WEIGHT",
  EMOM_REPS: "scoreType.EMOM_REPS",
  ROUNDS_COMPLETED: "scoreType.ROUNDS_COMPLETED",
  POINTS: "scoreType.POINTS",
  CUSTOM: "scoreType.CUSTOM",
} as const satisfies Record<ScoreType, string>;

export default async function EventsPage() {
  const [events, t] = await Promise.all([
    getPublicEvents(),
    getTranslations("Events"),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
          {t("publicList.eyebrow")}
        </p>

        <h1 className="mt-3 text-4xl font-black">
          {t("publicList.title")}
        </h1>

        {events.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-12 text-center">
            <h2 className="text-xl font-bold">
              {t("publicList.emptyTitle")}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {t("publicList.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {events.map((event) => {
              let timeCap: string | null = null;

              if (event.timeCapSeconds) {
                const minutes = Math.floor(event.timeCapSeconds / 60);
                const seconds = event.timeCapSeconds % 60;

                if (minutes === 0) {
                  timeCap = t("publicList.seconds", {
                    seconds,
                  });
                } else if (seconds === 0) {
                  timeCap = t("publicList.minutes", {
                    minutes,
                  });
                } else {
                  timeCap = t("publicList.minutesAndSeconds", {
                    minutes,
                    seconds,
                  });
                }
              }

              return (
                <article
                  key={event.id}
                  id={`event-${event.id}`}
                  className="scroll-mt-28 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                      {t("publicList.event", {
                        eventCode: event.eventCode,
                      })}
                    </span>

                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                      {t(scoreTypeMessageKeys[event.scoreType])}
                    </span>

                    {timeCap && (
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                        {t("publicList.timeCap", {
                          duration: timeCap,
                        })}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-2xl font-black">{event.name}</h2>

                  {event.description && (
                    <p className="mt-3 text-slate-300">
                      {event.description}
                    </p>
                  )}

                  {event.workoutInstructions && (
                    <div className="mt-5 rounded-xl bg-black/30 p-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                        {t("publicList.workout")}
                      </h3>

                      <p className="mt-2 whitespace-pre-line leading-7 text-slate-200">
                        {event.workoutInstructions}
                      </p>
                    </div>
                  )}

                  {event.movementStandards && (
                    <div className="mt-4 rounded-xl bg-black/30 p-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                        {t("publicList.standards")}
                      </h3>

                      <p className="mt-2 whitespace-pre-line leading-7 text-slate-200">
                        {event.movementStandards}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 border-t border-slate-800 pt-4">
                    {event.scoreVisible && event.status !== "DRAFT" ? (
                      <Link
                        href={`/leaderboard/events/${event.id}`}
                        className="inline-flex items-center font-semibold text-orange-400 transition hover:text-orange-300"
                      >
                        {t("publicList.viewResults")}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-slate-500">
                        {t("publicList.resultsNotReleased")}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
