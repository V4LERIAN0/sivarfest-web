import { createCompetitionAction } from "@/features/competitions/competition.actions";
import { CompetitionForm } from "@/features/competitions/CompetitionForm";
import Link from "next/link";

export default function NewCompetitionPage() {
  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/competitions"
        className="text-sm font-bold text-slate-400 hover:text-white"
      >
        ← Back to competitions
      </Link>

      <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
        Admin
      </p>

      <h1 className="mt-3 text-4xl font-black">New Competition</h1>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <CompetitionForm
          action={createCompetitionAction}
          submitLabel="Create Competition"
        />
      </div>
    </div>
  );
}