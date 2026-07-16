import { updateCompetitionAction } from "@/features/competitions/competition.actions";
import { CompetitionForm } from "@/features/competitions/CompetitionForm";
import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import Link from "next/link";

interface CompetitionSettingsPageProps {
  params: Promise<{
    competitionId: string;
  }>;
}

export default async function CompetitionSettingsPage({
  params,
}: CompetitionSettingsPageProps) {
  const { competitionId } = await params;
  const numericCompetitionId = Number(competitionId);

  const competition = await getAdminCompetitionById(numericCompetitionId);

  async function updateAction(formData: FormData) {
    "use server";
    await updateCompetitionAction(numericCompetitionId, formData);
  }

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

      <h1 className="mt-3 text-4xl font-black">Competition Settings</h1>

      <p className="mt-2 text-slate-400">
        Editing: <span className="font-bold text-white">{competition.name}</span>
      </p>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <CompetitionForm
          competition={competition}
          action={updateAction}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}