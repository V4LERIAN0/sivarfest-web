import {
  ArrowRight,
  CalendarClock,
  Clock3,
  Dumbbell,
  ListChecks,
  Trophy,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
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
  const orderedEvents = [...events].sort(
    (first, second) => first.displayOrder - second.displayOrder
  );

  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-white">
      <PublicNavbar />

      <PublicPageHeader
        eyebrow={t("publicList.eyebrow")}
        title={t("publicList.title")}
        description={t("publicList.description")}
        aside={
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/heats"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/18 bg-white/[0.035] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white/75 transition hover:border-[#ffd400]/55 hover:text-[#ffe45c]"
            >
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {t("publicList.viewSchedule")}
            </Link>
            <Link
              href="/leaderboard"
              className="sivar-primary-button inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-[0.08em]"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              {t("publicList.liveLeaderboard")}
            </Link>
          </div>
        }
      />

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {orderedEvents.length === 0 ? (
            <div className="border border-dashed border-white/20 bg-white/[0.025] p-10 text-center sm:p-14">
              <Dumbbell
                className="mx-auto h-8 w-8 text-[#ffd400]"
                aria-hidden="true"
              />
              <h2 className="sivar-display mt-5 text-3xl">
                {t("publicList.emptyTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/50">
                {t("publicList.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orderedEvents.map((event, index) => {
                let timeCap: string | null = null;

                if (event.timeCapSeconds) {
                  const minutes = Math.floor(event.timeCapSeconds / 60);
                  const seconds = event.timeCapSeconds % 60;

                  if (minutes === 0) {
                    timeCap = t("publicList.seconds", { seconds });
                  } else if (seconds === 0) {
                    timeCap = t("publicList.minutes", { minutes });
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
                    className="scroll-mt-28 overflow-hidden border border-white/12 bg-[#0b0b0b]"
                  >
                    <div className="grid lg:grid-cols-[11rem_minmax(0,1fr)]">
                      <div className="relative overflow-hidden border-b border-white/10 bg-white/[0.025] p-6 lg:border-b-0 lg:border-r">
                        <span className="sivar-display text-7xl text-white/10">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-[#ff7a2f] lg:mt-20">
                          {t("publicList.event", {
                            eventCode: event.eventCode,
                          })}
                        </p>
                      </div>

                      <div className="p-5 sm:p-7 lg:p-9">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="border border-[#ffd400]/30 bg-[#ffd400]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#ffe45c]">
                            {t(scoreTypeMessageKeys[event.scoreType])}
                          </span>
                          {timeCap && (
                            <span className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1 text-xs font-bold text-white/55">
                              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                              {t("publicList.timeCap", {
                                duration: timeCap,
                              })}
                            </span>
                          )}
                        </div>

                        <h2 className="sivar-display mt-5 text-4xl leading-none text-[#f2f0eb] sm:text-5xl">
                          {event.name}
                        </h2>

                        {event.description && (
                          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">
                            {event.description}
                          </p>
                        )}

                        {(event.workoutInstructions || event.movementStandards) && (
                          <div className="mt-8 grid gap-4 xl:grid-cols-2">
                            {event.workoutInstructions && (
                              <section className="border border-white/10 bg-black/35 p-5">
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffd400]">
                                  <Dumbbell className="h-4 w-4" aria-hidden="true" />
                                  {t("publicList.workout")}
                                </h3>
                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70 sm:text-base">
                                  {event.workoutInstructions}
                                </p>
                              </section>
                            )}

                            {event.movementStandards && (
                              <section className="border border-white/10 bg-black/35 p-5">
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffd400]">
                                  <ListChecks className="h-4 w-4" aria-hidden="true" />
                                  {t("publicList.standards")}
                                </h3>
                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70 sm:text-base">
                                  {event.movementStandards}
                                </p>
                              </section>
                            )}
                          </div>
                        )}

                        <div className="mt-8 flex justify-end border-t border-white/10 pt-5">
                          {event.scoreVisible && event.status !== "DRAFT" ? (
                            <Link
                              href={`/leaderboard/events/${event.id}`}
                              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#ffd400] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:bg-[#ffe45c]"
                            >
                              <Trophy className="h-4 w-4" aria-hidden="true" />
                              {t("publicList.viewResults")}
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-white/35">
                              {t("publicList.resultsNotReleased")}
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <PublicPageFooter />
    </main>
  );
}
