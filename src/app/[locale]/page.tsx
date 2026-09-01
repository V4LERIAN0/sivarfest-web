import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getPublicAthletes } from "@/features/athletes/athletes.api";
import { getPublicCategories } from "@/features/categories/categories.api";
import { getPublicCompetition } from "@/features/competitions/competitions.api";
import { getPublicEvents } from "@/features/events/events.api";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [competition, categories, athletes, events, t, format] =
    await Promise.all([
      getPublicCompetition(),
      getPublicCategories(),
      getPublicAthletes(),
      getPublicEvents(),
      getTranslations("Competitions"),
      getFormatter(),
    ]);

  const eventDate = competition.eventDate
    ? format.dateTime(
        new Date(`${competition.eventDate}T00:00:00Z`),
        {
          dateStyle: "long",
          timeZone: "UTC",
        }
      )
    : t("publicHome.tba");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-orange-400">
            {t("publicHome.eyebrow")}
          </p>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            {competition.name}
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            {competition.shortDescription ??
              t("publicHome.fallbackDescription")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/athletes"
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black hover:bg-orange-400"
            >
              {t("publicHome.viewAthletes")}
            </Link>

            <Link
              href="/events"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-white hover:bg-slate-900"
            >
              {t("publicHome.viewEvents")}
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              {t("publicHome.date")}
            </p>

            <p className="mt-2 text-xl font-bold">{eventDate}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              {t("publicHome.location")}
            </p>

            <p className="mt-2 text-xl font-bold">
              {competition.locationName ?? t("publicHome.tba")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              {t("publicHome.categories")}
            </p>

            <p className="mt-2 text-xl font-bold">
              {format.number(categories.length)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              {t("publicHome.athletes")}
            </p>

            <p className="mt-2 text-xl font-bold">
              {format.number(athletes.length)}
            </p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-black">
            {t("publicHome.officialEvents")}
          </h2>

          {events.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-12 text-center">
              <h3 className="text-xl font-bold">
                {t("publicHome.emptyEventsTitle")}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {t("publicHome.emptyEventsDescription")}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                >
                  <p className="text-sm font-bold text-orange-400">
                    {t("publicHome.event", {
                      eventCode: event.eventCode,
                    })}
                  </p>

                  <h3 className="mt-2 text-xl font-black">
                    {event.name}
                  </h3>

                  {event.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {event.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}