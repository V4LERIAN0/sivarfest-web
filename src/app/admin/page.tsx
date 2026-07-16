import { getAdminCompetitions } from "@/features/competitions/competitions.api";

export default async function AdminDashboardPage() {
  const competitions = await getAdminCompetitions();

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
        Admin
      </p>

      <h1 className="mt-3 text-4xl font-black">Dashboard</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-400">Competitions</p>
          <p className="mt-2 text-3xl font-black">{competitions.length}</p>
        </div>
      </div>
    </div>
  );
}