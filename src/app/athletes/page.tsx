import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getPublicAthletes } from "@/features/athletes/athletes.api";

export default async function AthletesPage() {
  const athletes = await getPublicAthletes();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <PublicNavbar />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
          Competitors
        </p>

        <h1 className="mt-3 text-4xl font-black">Athletes</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {athletes.map((athlete) => (
            <article
              key={athlete.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{athlete.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {athlete.categoryName}
                  </p>
                </div>

                {athlete.bibNumber && (
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-black">
                    #{athlete.bibNumber}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1 text-sm text-slate-300">
                <p>{athlete.country ?? "Country TBA"}</p>
                <p>{athlete.gymName ?? "Independent athlete"}</p>
              </div>

              {athlete.publicBio && (
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {athlete.publicBio}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}