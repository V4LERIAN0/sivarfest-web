import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getPublicAthletes } from "@/features/athletes/athletes.api";
import { getPublicCategories } from "@/features/categories/categories.api";
import { getPublicCompetition } from "@/features/competitions/competitions.api";
import { getPublicEvents } from "@/features/events/events.api";
import Link from "next/link";

export default async function HomePage() {
  const [competition, categories, athletes, events] = await Promise.all([
    getPublicCompetition(),
    getPublicCategories(),
    getPublicAthletes(),
    getPublicEvents(),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-orange-400">
            CrossFit Competition
          </p>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            {competition.name}
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            {competition.shortDescription ??
              "Official competition portal for athletes, heats, workouts, and results."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/athletes"
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black hover:bg-orange-400"
            >
              View Athletes
            </Link>

            <Link
              href="/events"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-white hover:bg-slate-900"
            >
              View Events
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Date</p>
            <p className="mt-2 text-xl font-bold">
              {competition.eventDate ?? "TBA"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Location</p>
            <p className="mt-2 text-xl font-bold">
              {competition.locationName ?? "TBA"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Categories</p>
            <p className="mt-2 text-xl font-bold">{categories.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Athletes</p>
            <p className="mt-2 text-xl font-bold">{athletes.length}</p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-black">Official Events</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <p className="text-sm font-bold text-orange-400">
                  Event {event.eventCode}
                </p>
                <h3 className="mt-2 text-xl font-black">{event.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {event.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}