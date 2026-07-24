import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import { deleteJudgeAction } from "@/features/judges/judge.actions";
import { CreateJudgeForm, EditJudgeForm } from "@/features/judges/JudgeForms";
import { getAdminJudges } from "@/features/judges/judges.api";

export default async function AdminJudgesPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const competitionId = Number((await params).competitionId);
  const [competition, judges] = await Promise.all([
    getAdminCompetitionById(competitionId),
    getAdminJudges(competitionId),
  ]);
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">{competition.name}</p>
      <h1 className="mt-3 text-4xl font-black">Judges</h1>
      <p className="mt-2 text-slate-400">Create judge logins and control who can receive heat positions.</p>
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-5 text-xl font-black">Add judge</h2>
        <CreateJudgeForm competitionId={competitionId} />
      </section>
      <div className="mt-10">
        <h2 className="text-2xl font-black">Competition judges</h2>
        <p className="mt-1 text-sm text-slate-400">{judges.length} total</p>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {judges.map((judge) => (
          <article key={judge.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-black">{judge.fullName}</h3><p className="text-sm text-slate-400">{judge.email}</p></div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${judge.active ? "border-emerald-500/40 text-emerald-300" : "border-slate-600 text-slate-400"}`}>{judge.active ? "Active" : "Inactive"}</span>
            </div>
            <EditJudgeForm competitionId={competitionId} judge={judge} />
            <form action={deleteJudgeAction.bind(null, competitionId, judge.id)} className="mt-4 border-t border-slate-800 pt-4 text-right">
              <button className="text-xs font-bold text-red-300 hover:text-red-200">Delete judge and assignments</button>
            </form>
          </article>
        ))}
        {judges.length === 0 && <p className="rounded-2xl border border-dashed border-slate-700 py-12 text-center text-slate-400 xl:col-span-2">No judges created yet.</p>}
      </div>
    </div>
  );
}
