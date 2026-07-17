import { updateCategoryAction } from "@/features/categories/category.actions";
import { getAdminCategory } from "@/features/categories/categories.api";
import { CategoryForm } from "@/features/categories/CategoryForm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditCategoryPageProps {
  params: Promise<{ competitionId: string; categoryId: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { competitionId, categoryId } = await params;
  const numericCompetitionId = Number(competitionId);
  const numericCategoryId = Number(categoryId);
  const category = await getAdminCategory(numericCategoryId);

  if (category.competitionId !== numericCompetitionId) {
    notFound();
  }

  async function updateAction(formData: FormData) {
    "use server";
    await updateCategoryAction(
      numericCompetitionId,
      numericCategoryId,
      formData
    );
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
        {category.competitionName}
      </p>
      <h1 className="mt-3 text-4xl font-black">Edit Category</h1>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <CategoryForm
          category={category}
          action={updateAction}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
