import { HeatEditForm } from "@/features/heats/HeatEditForm";
import { getAdminHeat } from "@/features/heats/heats.api";
import Link from "next/link";

export default async function EditHeatPage({
  params,
}: {
  params: Promise<{
    competitionId: string;
    eventId: string;
    heatId: string;
  }>;
}) {
  const route = await params;
  const competitionId = Number(route.competitionId);
  const eventId = Number(route.eventId);
  const heat = await getAdminHeat(Number(route.heatId));
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/competitions/${competitionId}/events/${eventId}/heats`}
        className="text-sm font-bold text-slate-400 hover:text-white"
      >
        ← Back to heat management
      </Link>
      <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
        Event {heat.eventCode}
      </p>
      <h1 className="mt-3 text-4xl font-black">Edit {heat.name}</h1>
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <HeatEditForm
          competitionId={competitionId}
          eventId={eventId}
          heat={heat}
        />
      </div>
    </div>
  );
}
