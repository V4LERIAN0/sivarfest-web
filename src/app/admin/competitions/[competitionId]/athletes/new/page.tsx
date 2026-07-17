import { createAthleteAction } from "@/features/athletes/athlete.actions";
import { AthleteForm } from "@/features/athletes/AthleteForm";
import { getAdminCategories } from "@/features/categories/categories.api";
import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import Link from "next/link";
import { AthleteFormState } from "@/features/athletes/athletes.types";

export default async function NewAthletePage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const id = Number(competitionId);
  const [competition, categories] = await Promise.all([getAdminCompetitionById(id), getAdminCategories(id)]);
  async function action(state: AthleteFormState, formData: FormData) { "use server"; return createAthleteAction(id, state, formData); }
  return <div className="max-w-5xl"><Link href={`/admin/competitions/${id}/athletes`} className="text-sm font-bold text-slate-400 hover:text-white">← Back to athletes</Link><p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">{competition.name}</p><h1 className="mt-3 text-4xl font-black">New Athlete</h1><div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><AthleteForm categories={categories} action={action} submitLabel="Create Athlete" /></div></div>;
}
