import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import { hideEventAction } from "@/features/events/event.actions";
import { getAdminEvents } from "@/features/events/events.api";
import Link from "next/link";

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  const id = Number(competitionId);
  const [competition, events] = await Promise.all([
    getAdminCompetitionById(id),
    getAdminEvents(id),
  ]);
  return (
    <div>
      <Link
        href="/admin/competitions"
        className="text-sm font-bold text-slate-400 hover:text-white"
      >
        ← Back to competitions
      </Link>
      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            {competition.name}
          </p>
          <h1 className="mt-3 text-4xl font-black">Events</h1>
          <p className="mt-2 text-slate-400">
            Configure workouts, scoring rules, visibility, tiebreakers, and
            heats.
          </p>
        </div>
        <Link
          href={`/admin/competitions/${id}/events/new`}
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400"
        >
          New Event
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-4xl text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Scoring</th>
              <th className="px-4 py-3">Tiebreak</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{event.displayOrder}</td>
                <td className="px-4 py-3">
                  <p className="font-bold">{event.name}</p>
                  <p className="text-xs text-slate-400">{event.eventCode}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{event.scoreType}</td>
                <td className="px-4 py-3 text-slate-300">
                  {event.tiebreakType}
                </td>
                <td className="px-4 py-3">{event.status}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/competitions/${id}/events/${event.id}/heats`}
                      className="rounded-lg border border-orange-500/50 px-3 py-2 text-xs font-bold text-orange-200 hover:bg-orange-500/10"
                    >
                      Heats
                    </Link>
                    <Link
                      href={`/admin/competitions/${id}/events/${event.id}/edit`}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900"
                    >
                      Edit
                    </Link>
                    {event.publicVisible && (
                      <form
                        action={async () => {
                          "use server";
                          await hideEventAction(id, event.id);
                        }}
                      >
                        <button className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/10">
                          Hide
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No events yet. Create the first workout for this competition.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
