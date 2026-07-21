import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getPublicEvents } from "@/features/events/events.api";

function formatScoreType(scoreType: string) {
  return scoreType.replaceAll("_", " ");
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds} sec`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
          Workouts
        </p>

        <h1 className="mt-3 text-4xl font-black">Events</h1>

        <div className="mt-8 space-y-5">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                  Event {event.eventCode}
                </span>

                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                  {formatScoreType(event.scoreType)}
                </span>

                {event.timeCapSeconds && (
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                    Cap: {formatDuration(event.timeCapSeconds)}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-2xl font-black">{event.name}</h2>

              {event.description && (
                <p className="mt-3 text-slate-300">{event.description}</p>
              )}

              {event.workoutInstructions && (
                <div className="mt-5 rounded-xl bg-black/30 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                    Workout
                  </h3>
                  <p className="mt-2 whitespace-pre-line leading-7 text-slate-200">
                    {event.workoutInstructions}
                  </p>
                </div>
              )}

              {event.movementStandards && (
                <div className="mt-4 rounded-xl bg-black/30 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                    Standards
                  </h3>
                  <p className="mt-2 whitespace-pre-line leading-7 text-slate-200">
                    {event.movementStandards}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
