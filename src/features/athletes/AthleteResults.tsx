import { getTranslations } from "next-intl/server";
import { getPublicEvents } from "@/features/events/events.api";
import { Link } from "@/i18n/navigation";
import type { EventLeaderboardRow } from "@/features/leaderboards/leaderboards.types";
export async function AthleteResults({
  results,
}: {
  results: EventLeaderboardRow[];
}) {
  const [t, events] = await Promise.all([
    getTranslations("AthleteArea"),
    getPublicEvents(),
  ]);
  const eventNames = new Map(events.map((e) => [e.id, e.name]));
  const published = results.filter((r) => r.scoreId !== null);
  return (
    <section>
      <h2 className="sivar-display text-3xl sm:text-4xl">{t("results")}</h2>
      {!published.length ? (
        <p className="mt-4 border border-white/10 bg-white/[0.02] p-6 text-white/60">
          {t("noResults")}
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((r) => (
            <Link
              key={r.eventId}
              href={`/leaderboard/events/${r.eventId}`}
              className="border border-white/15 bg-white/[0.025] p-5 transition hover:border-[#ffd400]/60 focus-visible:outline-2 focus-visible:outline-[#ffd400]"
            >
              <p className="text-xs font-black uppercase tracking-wider text-[#ffd400]">
                {eventNames.get(r.eventId) ?? t("results")}
              </p>
              <p className="mt-3 text-2xl font-black">
                {r.scoreDisplay ?? "—"}
              </p>
              <p className="mt-2 text-sm text-white/50">
                #{r.rank ?? "—"} · {t("points")}: {r.placementPoints ?? "—"}
              </p>
              {r.tiebreakDisplay && (
                <p className="mt-1 text-xs text-white/45">
                  TB {r.tiebreakDisplay}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
