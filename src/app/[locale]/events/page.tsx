import {
  ArrowRight,
  CalendarClock,
  Dumbbell,
  Trophy,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { EventVariationPanel } from "@/components/public/EventVariationPanel";
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
                        </div>

                        <h2 className="sivar-display mt-5 text-4xl leading-none text-[#f2f0eb] sm:text-5xl">
                          {event.name}
                        </h2>

                        <EventVariationPanel event={event} />

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
