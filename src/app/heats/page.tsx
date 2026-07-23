import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getPublicHeats } from "@/features/heats/heats.api";

export default async function PublicHeatsPage() {
  const heats = await getPublicHeats();
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
          Competition day
        </p>
        <h1 className="mt-3 text-4xl font-black">Heat schedule</h1>
        <p className="mt-3 text-slate-400">
          Find your event, heat time, and assigned lane or station.
        </p>
        <div className="mt-8 space-y-10">
          {Object.values(eventGroups).map((eventHeats) => {
            const event = eventHeats[0];
            return (
              <section key={event.eventId}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Event {event.eventCode}
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      {event.eventName}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400">
                    {eventHeats.length} heat
                    {eventHeats.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {eventHeats.map((heat) => (
                    <article
                      key={heat.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-black">{heat.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {formatDateTime(heat.scheduledTime)}
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                          {heat.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div className="mt-5 space-y-2">
                        {heat.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="grid grid-cols-[4rem_1fr] items-center rounded-xl bg-black/25 px-3 py-2"
                          >
                            <p className="font-black text-orange-400">
                              Lane / station {assignment.positionNumber}
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
                            Athlete assignments pending.
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
          {heats.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-700 py-14 text-center text-slate-400">
              The public heat schedule has not been published yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Time TBA";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
