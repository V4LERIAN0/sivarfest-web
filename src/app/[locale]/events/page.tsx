import { AnnouncementList } from "@/features/announcements/AnnouncementList";
import { ArrowRight, CalendarClock, Dumbbell, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { CollapsibleSection } from "@/components/public/CollapsibleSection";
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
    (first, second) => first.displayOrder - second.displayOrder,
  );

  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-white">
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <AnnouncementList
          path={`/public/competitions/${process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026"}/announcements`}
        />
      </div>

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
                  <CollapsibleSection
                    key={event.id}
                    id={`event-${event.id}`}
                    title={
                      <div className="flex items-center gap-4 sm:gap-6">
                        <span
                          aria-hidden="true"
                          className="sivar-display text-4xl text-white/20 sm:text-5xl"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="sivar-kicker">
                            {t("publicList.event", {
                              eventCode: event.eventCode,
                            })}
                          </p>
                          <h2 className="sivar-display mt-2 text-3xl leading-[1.1] text-[#f2f0eb] sm:text-4xl">
                            {event.name}
                          </h2>
                          <p className="mt-2 text-sm font-bold text-white/55">
                            {t(scoreTypeMessageKeys[event.scoreType])}
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <div className="px-5 pb-6 sm:px-7">
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
                            <ArrowRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </CollapsibleSection>
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
