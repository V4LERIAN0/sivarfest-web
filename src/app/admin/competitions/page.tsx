import { archiveCompetitionAction } from "@/features/competitions/competition.actions";
import { getAdminCompetitions } from "@/features/competitions/competitions.api";
import Link from "next/link";

export default async function AdminCompetitionsPage() {
  const competitions = await getAdminCompetitions();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            Admin
          </p>

          <h1 className="mt-3 text-4xl font-black">Competitions</h1>
        </div>

        <Link
          href="/admin/competitions/new"
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400"
        >
          New Competition
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {competitions.map((competition) => (
              <tr key={competition.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-bold">{competition.name}</td>
                <td className="px-4 py-3 text-slate-300">
                  {competition.slug}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {competition.eventDate ?? "TBA"}
                </td>
                <td className="px-4 py-3">{competition.status}</td>
                <td className="px-4 py-3">{competition.visibilityStatus}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/competitions/${competition.id}/settings`}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/admin/competitions/${competition.id}/categories`}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900"
                    >
                      Categories
                    </Link>

                    {competition.status !== "ARCHIVED" && (
                      <form
                        action={async () => {
                          "use server";
                          await archiveCompetitionAction(competition.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/10"
                        >
                          Archive
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {competitions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No competitions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
