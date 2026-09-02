import { CalendarClock, Clock3, Dumbbell, Users } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { getPublicHeats } from "@/features/heats/heats.api";
import type { HeatStatus } from "@/features/heats/heats.types";
import { Link } from "@/i18n/navigation";

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

function competitionDateTime(value: string) {
  const includesTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return new Date(includesTimeZone ? value : `${value}-06:00`);
}

function statusClassName(status: HeatStatus) {
  if (status === "COMPLETED") {
    return "border-emerald-400/35 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "IN_PROGRESS" || status === "ON_FLOOR") {
    return "border-[#ffd400]/50 bg-[#ffd400]/12 text-[#ffe45c]";
  }

  if (status === "DELAYED" || status === "CANCELLED") {
    return "border-red-400/35 bg-red-400/10 text-red-200";
  }

  return "border-white/15 bg-white/[0.04] text-white/55";
}

export default async function PublicHeatsPage() {
  const [heats, t, format] = await Promise.all([
    getPublicHeats(),
    getTranslations("Heats"),
    getFormatter(),
  ]);
  const orderedHeats = [...heats].sort((first, second) => {
    if (first.scheduledTime && second.scheduledTime) {
      return (
        competitionDateTime(first.scheduledTime).getTime() -
        competitionDateTime(second.scheduledTime).getTime()
      );
    }

    if (first.scheduledTime) return -1;
    if (second.scheduledTime) return 1;
    return first.displayOrder - second.displayOrder;
  });
  const eventGroups = orderedHeats.reduce((groups, heat) => {
    const group = groups.get(heat.eventId) ?? [];
    group.push(heat);
    groups.set(heat.eventId, group);
    return groups;
  }, new Map<number, typeof heats>());

  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-white">
      <PublicNavbar />

      <PublicPageHeader
        eyebrow={t("publicSchedule.eyebrow")}
        title={t("publicSchedule.title")}
        description={t("publicSchedule.description")}
        aside={
          <Link
            href="/events"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#ffd400]/45 bg-[#ffd400]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#ffe45c] transition hover:border-[#ffd400] hover:bg-[#ffd400]/15"
          >
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
            {t("publicSchedule.viewEvents")}
          </Link>
        }
      />

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {heats.length === 0 ? (
            <div className="border border-dashed border-white/20 bg-white/[0.025] p-10 text-center sm:p-14">
              <CalendarClock
                className="mx-auto h-8 w-8 text-[#ffd400]"
                aria-hidden="true"
              />
              <h2 className="sivar-display mt-5 text-3xl">
                {t("publicSchedule.emptyTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/50">
                {t("publicSchedule.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {[...eventGroups.values()].map((eventHeats) => {
                const event = eventHeats[0];

                return (
                  <section key={event.eventId}>
                    <header className="flex flex-col gap-4 border-b border-white/12 pb-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="sivar-kicker">
                          {t("publicSchedule.event", {
                            eventCode: event.eventCode,
                          })}
                        </p>
                        <h2 className="sivar-display mt-3 text-4xl text-[#f2f0eb] sm:text-5xl">
                          {event.eventName}
                        </h2>
                      </div>

                      <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-white/45">
                        <CalendarClock
                          className="h-4 w-4 text-[#ffd400]"
                          aria-hidden="true"
                        />
                        {t("publicSchedule.heatCount", {
                          count: eventHeats.length,
                        })}
                      </p>
                    </header>

                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      {eventHeats.map((heat) => {
                        const scheduledTime = heat.scheduledTime
                          ? format.dateTime(
                              competitionDateTime(heat.scheduledTime),
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                                hour12: true,
                                timeZone: "America/El_Salvador",
                              }
                            )
                          : t("publicSchedule.timeTba");

                        return (
                          <article
                            key={heat.id}
                            className="overflow-hidden border border-white/12 bg-[#0b0b0b]"
                          >
                            <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="sivar-display text-3xl text-white">
                                  {heat.name}
                                </h3>
                                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/60">
                                  <Clock3
                                    className="h-4 w-4 text-[#ffd400]"
                                    aria-hidden="true"
                                  />
                                  {scheduledTime}
                                </p>
                              </div>

                              <span
                                className={`self-start border px-3 py-1 text-xs font-black uppercase tracking-[0.08em] ${statusClassName(heat.status)}`}
                              >
                                {t(statusMessageKeys[heat.status])}
                              </span>
                            </div>

                            <div className="p-4 sm:p-5">
                              {heat.assignments.length === 0 ? (
                                <p className="border border-dashed border-white/12 px-4 py-7 text-center text-sm text-white/40">
                                  {t("publicSchedule.assignmentsPending")}
                                </p>
                              ) : (
                                <ul className="divide-y divide-white/8 border border-white/10">
                                  {heat.assignments.map((assignment) => (
                                    <li
                                      key={assignment.id}
                                      className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 px-3 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:px-4"
                                    >
                                      <p className="text-xs font-black uppercase tracking-[0.06em] text-[#ffd400] sm:text-sm">
                                        {t("publicSchedule.laneStation", {
                                          position: assignment.positionNumber,
                                        })}
                                      </p>
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-white sm:text-base">
                                          {assignment.bibNumber
                                            ? `#${assignment.bibNumber} · `
                                            : ""}
                                          {assignment.athleteName}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-white/40">
                                          {assignment.categoryName}
                                        </p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <p className="mt-4 flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-[0.08em] text-white/35">
                                <Users className="h-4 w-4" aria-hidden="true" />
                                {heat.assignedCount}/{heat.capacity}
                              </p>
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
        </div>
      </section>

      <PublicPageFooter />
    </main>
  );
}
