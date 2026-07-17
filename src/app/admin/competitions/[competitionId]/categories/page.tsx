import { deactivateCategoryAction } from "@/features/categories/category.actions";
import { getAdminCategories } from "@/features/categories/categories.api";
import { getAdminCompetitionById } from "@/features/competitions/competitions.api";
import Link from "next/link";

interface AdminCategoriesPageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function AdminCategoriesPage({
  params,
}: AdminCategoriesPageProps) {
  const { competitionId } = await params;
  const numericCompetitionId = Number(competitionId);
  const [competition, categories] = await Promise.all([
    getAdminCompetitionById(numericCompetitionId),
    getAdminCategories(numericCompetitionId),
  ]);

  return (
    <div>
      <Link
        href="/admin/competitions"
        className="text-sm font-bold text-slate-400 hover:text-white"
      >
        ← Back to competitions
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            {competition.name}
          </p>
          <h1 className="mt-3 text-4xl font-black">Categories</h1>
          <p className="mt-2 text-slate-400">
            Configure divisions and their public display order.
          </p>
        </div>

        <Link
          href={`/admin/competitions/${numericCompetitionId}/categories/new`}
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400"
        >
          New Category
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Division</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-slate-800">
                <td className="px-4 py-3 text-slate-300">
                  {category.displayOrder}
                </td>
                <td className="px-4 py-3 font-bold">{category.name}</td>
                <td className="px-4 py-3 text-slate-300">
                  {category.genderClassification}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {category.divisionLabel ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      category.active
                        ? "rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300"
                        : "rounded-full bg-slate-700 px-2 py-1 text-xs font-bold text-slate-300"
                    }
                  >
                    {category.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/competitions/${numericCompetitionId}/categories/${category.id}/edit`}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900"
                    >
                      Edit
                    </Link>

                    {category.active && (
                      <form
                        action={async () => {
                          "use server";
                          await deactivateCategoryAction(
                            numericCompetitionId,
                            category.id
                          );
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/10"
                        >
                          Deactivate
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No categories yet. Create the first category for this
                  competition.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
