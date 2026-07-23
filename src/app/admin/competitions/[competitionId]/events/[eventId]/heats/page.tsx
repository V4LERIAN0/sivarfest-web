import { getAdminAthletes } from "@/features/athletes/athletes.api";
import { getAdminCategories } from "@/features/categories/categories.api";
import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import { getAdminEvent } from "@/features/events/events.api";
import {
  cancelHeatAction,
  removeAssignmentAction,
} from "@/features/heats/heat.actions";
import {
  AssignAthleteForm,
  AssignmentPositionForm,
  CreateHeatForm,
  GenerateHeatsForm,
} from "@/features/heats/HeatManagerForms";
import { getAdminHeats } from "@/features/heats/heats.api";
import Link from "next/link";

export default async function AdminHeatsPage({
  params,
}: {
  params: Promise<{ competitionId: string; eventId: string }>;
}) {
  const route = await params;
  const competitionId = Number(route.competitionId);
  const eventId = Number(route.eventId);
  const [competition, event, heats, athletes, categories] = await Promise.all([
    getAdminCompetitionById(competitionId),
    getAdminEvent(eventId),
    getAdminHeats(eventId),
    getAdminAthletes(competitionId),
    getAdminCategories(competitionId),
  ]);
  const activeHeats = heats.filter((heat) => heat.status !== "CANCELLED");
  const maxNumber = Math.max(0, ...activeHeats.map((heat) => heat.heatNumber));
  const eligibleAthletes = athletes.filter(
    (athlete) =>
      athlete.status !== "WITHDRAWN" && athlete.status !== "DISQUALIFIED"
  );

  return (
    <div>
      <Link
        href={`/admin/competitions/${competitionId}/events`}
        className="text-sm font-bold text-slate-400 hover:text-white"
      >
        ← Back to events
      </Link>
      <div className="mt-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
          {competition.name} · Event {event.eventCode}
        </p>
        <h1 className="mt-3 text-4xl font-black">Heat management</h1>
        <p className="mt-2 text-slate-400">
          {event.name} · Schedule heats and place athletes by lane or station.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Create one heat">
          <CreateHeatForm
            competitionId={competitionId}
            eventId={eventId}
            nextHeatNumber={maxNumber + 1}
          />
        </Panel>
        <Panel title="Random generation">
          <GenerateHeatsForm
            competitionId={competitionId}
            eventId={eventId}
            categories={categories}
            nextHeatNumber={maxNumber + 1}
          />
        </Panel>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Heats</h2>
          <p className="mt-1 text-sm text-slate-400">
            {activeHeats.length} total
          </p>
        </div>
        <Link
          href="/heats"
          className="text-sm font-bold text-orange-400 hover:text-orange-300"
        >
          View public schedule →
        </Link>
      </div>

      <div className="mt-5 space-y-6">
        {activeHeats.map((heat) => {
          const usedPositions = new Set(
            heat.assignments.map((assignment) => assignment.positionNumber)
          );
          let nextPosition = 1;
          while (usedPositions.has(nextPosition)) nextPosition += 1;
          return (
            <article
              key={heat.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black">{heat.name}</h3>
                    <Tag>{heat.status.replaceAll("_", " ")}</Tag>
                    <Tag>
                      {heat.assignedCount}/{heat.capacity} athletes
                    </Tag>
                    {!heat.publicVisible && <Tag>Private</Tag>}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {formatDateTime(heat.scheduledTime)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/competitions/${competitionId}/events/${eventId}/heats/${heat.id}/edit`}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold hover:bg-slate-800"
                  >
                    Edit
                  </Link>
                  <form
                    action={cancelHeatAction.bind(
                      null,
                      competitionId,
                      eventId,
                      heat.id
                    )}
                  >
                    <button className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/10">
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-3xl text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-3">Athlete</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Position</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heat.assignments.map((assignment) => (
                      <tr
                        key={assignment.id}
                        className="border-t border-slate-800"
                      >
                        <td className="py-3 font-bold">
                          {assignment.bibNumber
                            ? `#${assignment.bibNumber} · `
                            : ""}
                          {assignment.athleteName}
                        </td>
                        <td className="py-3 text-slate-300">
                          {assignment.categoryName}
                        </td>
                        <td className="py-3">
                          <AssignmentPositionForm
                            competitionId={competitionId}
                            eventId={eventId}
                            assignment={assignment}
                          />
                        </td>
                        <td className="py-3 text-right">
                          <form
                            action={removeAssignmentAction.bind(
                              null,
                              competitionId,
                              eventId,
                              assignment.id
                            )}
                          >
                            <button className="text-xs font-bold text-red-300 hover:text-red-200">
                              Remove
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                    {heat.assignments.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="border-t border-slate-800 py-5 text-center text-slate-500"
                        >
                          No athletes assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 border-t border-slate-800 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Add athlete · lane or station number
                </p>
                <AssignAthleteForm
                  competitionId={competitionId}
                  eventId={eventId}
                  heatId={heat.id}
                  athletes={eligibleAthletes}
                  nextPosition={nextPosition}
                />
              </div>
            </article>
          );
        })}
        {activeHeats.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-700 py-12 text-center text-slate-400">
            No heats. Create one manually or generate them randomly.
          </p>
        )}
      </div>

    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-5 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-300">
      {children}
    </span>
  );
}
function formatDateTime(value: string | null) {
  if (!value) return "Time not scheduled";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
