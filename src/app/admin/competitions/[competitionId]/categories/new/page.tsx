import { createCategoryAction } from "@/features/categories/category.actions";
import { CategoryForm } from "@/features/categories/CategoryForm";
import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import Link from "next/link";

interface NewCategoryPageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function NewCategoryPage({ params }: NewCategoryPageProps) {
  const { competitionId } = await params;
  const numericCompetitionId = Number(competitionId);
  const competition = await getAdminCompetitionById(numericCompetitionId);

  async function createAction(formData: FormData) {
    "use server";
    await createCategoryAction(numericCompetitionId, formData);
  }

  return (
    <div className="max-w-4xl">
      <Link
        href={`/admin/competitions/${numericCompetitionId}/categories`}
        className="text-sm font-bold text-slate-400 hover:text-white"
      >
        ← Back to categories
      </Link>

      <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
        {competition.name}
      </p>
      <h1 className="mt-3 text-4xl font-black">New Category</h1>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <CategoryForm action={createAction} submitLabel="Create Category" />
      </div>
    </div>
  );
}
