import { withdrawAthleteAction } from "@/features/athletes/athlete.actions";
import { getAdminAthletes } from "@/features/athletes/athletes.api";
import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import Link from "next/link";

export default async function AdminAthletesPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const id = Number(competitionId);
  const [competition, athletes] = await Promise.all([getAdminCompetitionById(id), getAdminAthletes(id)]);

  return <div>
    <Link href="/admin/competitions" className="text-sm font-bold text-slate-400 hover:text-white">← Back to competitions</Link>
    <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">{competition.name}</p><h1 className="mt-3 text-4xl font-black">Athletes</h1><p className="mt-2 text-slate-400">Manage registrations, categories, bibs, and athlete details.</p></div>
      <Link href={`/admin/competitions/${id}/athletes/new`} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400">New Athlete</Link>
    </div>
    <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full min-w-4xl text-left text-sm">
        <thead className="bg-slate-900 text-slate-400"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Bib</th><th className="px-4 py-3">Gym</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
        <tbody>
          {athletes.map((athlete) => <tr key={athlete.id} className="border-t border-slate-800">
            <td className="px-4 py-3 font-bold">{athlete.fullName}</td><td className="px-4 py-3 text-slate-300">{athlete.categoryName}</td><td className="px-4 py-3 text-slate-300">{athlete.bibNumber ?? "—"}</td><td className="px-4 py-3 text-slate-300">{athlete.gymName ?? "—"}</td><td className="px-4 py-3">{athlete.status}</td>
            <td className="px-4 py-3"><div className="flex justify-end gap-2"><Link href={`/admin/competitions/${id}/athletes/${athlete.id}/edit`} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900">Edit</Link>{athlete.status !== "WITHDRAWN" && <form action={async () => { "use server"; await withdrawAthleteAction(id, athlete.id); }}><button className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/10">Withdraw</button></form>}</div></td>
          </tr>)}
          {athletes.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No athletes yet. Add the first athlete to this competition.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>;
}
