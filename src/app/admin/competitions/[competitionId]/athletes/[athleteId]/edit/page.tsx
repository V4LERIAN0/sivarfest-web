import { updateAthleteAction } from "@/features/athletes/athlete.actions";
import { getAdminAthlete } from "@/features/athletes/athletes.api";
import { AthleteForm } from "@/features/athletes/AthleteForm";
import { getAdminCategories } from "@/features/categories/categories.api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AthleteFormState } from "@/features/athletes/athletes.types";

export default async function EditAthletePage({ params }: { params: Promise<{ competitionId: string; athleteId: string }> }) {
  const { competitionId, athleteId } = await params;
  const competition = Number(competitionId), athleteIdNumber = Number(athleteId);
  const [athlete, categories] = await Promise.all([getAdminAthlete(athleteIdNumber), getAdminCategories(competition)]);
  if (athlete.competitionId !== competition) notFound();
  async function action(state: AthleteFormState, formData: FormData) { "use server"; return updateAthleteAction(competition, athleteIdNumber, state, formData); }
  return <div className="max-w-5xl"><Link href={`/admin/competitions/${competition}/athletes`} className="text-sm font-bold text-slate-400 hover:text-white">← Back to athletes</Link><p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">{athlete.competitionName}</p><h1 className="mt-3 text-4xl font-black">Edit Athlete</h1><div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><AthleteForm athlete={athlete} categories={categories} action={action} submitLabel="Save Changes" /></div></div>;
}
