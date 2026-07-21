import { updateEventAction } from "@/features/events/event.actions";
import { getAdminEvent } from "@/features/events/events.api";
import { EventForm } from "@/features/events/EventForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditEventPage({ params }: { params: Promise<{ competitionId: string; eventId: string }> }) {
  const { competitionId, eventId } = await params;
  const competitionIdNumber = Number(competitionId);
  const eventIdNumber = Number(eventId);
  const event = await getAdminEvent(eventIdNumber);
  if (event.competitionId !== competitionIdNumber) notFound();
  const action = updateEventAction.bind(null, competitionIdNumber, eventIdNumber);
  return <div className="max-w-4xl">
    <Link href={`/admin/competitions/${competitionIdNumber}/events`} className="text-sm font-bold text-slate-400 hover:text-white">← Back to events</Link>
    <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">{event.competitionName}</p><h1 className="mt-3 text-4xl font-black">Edit Event</h1>
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><EventForm event={event} action={action} submitLabel="Save Changes" /></div>
  </div>;
}
