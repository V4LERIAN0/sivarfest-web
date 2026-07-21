import { createEventAction } from "@/features/events/event.actions";
import { EventForm } from "@/features/events/EventForm";
import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import Link from "next/link";

export default async function NewEventPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const id = Number(competitionId);
  const competition = await getAdminCompetitionById(id);
  const action = createEventAction.bind(null, id);
  return <div className="max-w-4xl">
    <Link href={`/admin/competitions/${id}/events`} className="text-sm font-bold text-slate-400 hover:text-white">← Back to events</Link>
    <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">{competition.name}</p><h1 className="mt-3 text-4xl font-black">New Event</h1>
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><EventForm action={action} submitLabel="Create Event" /></div>
  </div>;
}
