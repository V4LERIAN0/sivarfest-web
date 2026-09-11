import { AnnouncementList } from "@/features/announcements/AnnouncementList";
import { CalendarDays, Trophy } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serverApiGet } from "@/lib/server-api-client";
import type {
  AthleteDashboard,
  AthleteHeat,
} from "@/features/athletes/experience.types";
import { AthletePortrait } from "@/components/public/AthletePortrait";
import { AthleteResults } from "@/features/athletes/AthleteResults";
import { ExperienceAction } from "@/features/athletes/ExperienceAction";
export const dynamic = "force-dynamic";
export default async function AthletePage() {
  const [data, t] = await Promise.all([
    serverApiGet<AthleteDashboard>("/athlete/me"),
    getTranslations("AthleteArea"),
  ]);
  const next = data.heats.find(
    (h) => h.status !== "COMPLETED" && h.status !== "CANCELLED",
  );

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-wrap items-center gap-5">
        <AthletePortrait
          name={data.profile.fullName}
          url={data.profile.profilePhotoUrl}
        />
        <div className="min-w-0 flex-1">
          <p className="sivar-kicker">{t("eyebrow")}</p>
          <h1 className="sivar-display mt-2 break-words text-4xl sm:text-5xl">
            {data.profile.fullName}
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {data.profile.categoryName} · @{data.profile.username}
          </p>
        </div>
        <Link
          href="/athlete/profile"
          className="sivar-primary-button px-5 py-3 text-sm font-black"
        >
          {t("edit")}
        </Link>
      </header>
      <AnnouncementList path="/athlete/me/announcements" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="sivar-display mb-4 text-3xl">{t("next")}</h2>
          {next ? (
            <Heat heat={next} prominent />
          ) : (
            <p className="border border-white/15 p-6 text-white/60">
              {t("noNext")}
            </p>
          )}
          <p className="mt-3 text-xs text-white/45">{t("localTime")}</p>
        </section>
        <aside className="self-start border border-white/15 bg-white/[0.025] p-6">
          <Trophy className="h-6 w-6 text-[#ffd400]" />
          <p className="mt-5 text-xs uppercase tracking-wider text-white/55">
            {t("rank")}
          </p>
          <p className="sivar-display mt-2 text-6xl">
            {data.standings?.scoredEvents
              ? `#${data.standings.rank ?? "—"}`
              : "—"}
          </p>
          <p className="mt-3 text-sm text-white/60">
            {t("points")}:{" "}
            {data.standings?.scoredEvents ? data.standings.totalPoints : "—"}
          </p>
          <div className="mt-6 flex flex-col gap-4 text-sm font-bold text-[#ffd400]">
            <Link href="/leaderboard">{t("leaderboard")} →</Link>
            <Link href="/events">{t("events")} →</Link>
            <Link href={`/athletes/${data.profile.id}`}>
              {t("publicProfile")} →
            </Link>
          </div>
        </aside>
      </div>
      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="sivar-display text-3xl">{t("schedule")}</h2>
          <ExperienceAction label={t("refresh")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.heats.map((h) => (
            <Heat key={h.assignmentId} heat={h} />
          ))}
        </div>
      </section>
      <AthleteResults results={data.standings?.eventResults ?? []} />
    </div>
  );
}

async function Heat({
  heat,
  prominent = false,
}: {
  heat: AthleteHeat;
  prominent?: boolean;
}) {
  const t = await getTranslations("AthleteArea");
  const locale = await getLocale();
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        }).format(new Date(`${value}Z`))
      : t("notScheduled");
  return (
    <article
      className={`border p-5 sm:p-6 ${prominent ? "border-[#ffd400]/40 bg-[#ffd400]/[0.04]" : "border-white/15 bg-white/[0.02]"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#ffd400]">{heat.eventName}</p>
          <h3 className="sivar-display mt-2 text-3xl">{heat.heatName}</h3>
        </div>
        <span className="border border-[#ffd400]/30 bg-[#ffd400]/10 px-3 py-2 font-black text-[#ffd400]">
          {t("lane", { lane: heat.lane })}
        </span>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
        <CalendarDays className="h-4 w-4 shrink-0" />
        {date(heat.scheduledTime)}
      </p>
      <p className="mt-2 text-xs font-bold text-white/50">
        {t(`heatStatus.${heat.status}`)}
      </p>
      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-sm font-bold">
          {t(`checkInStatus.${heat.checkInStatus}`)}
        </p>
        {heat.canCheckIn ? (
          <div className="mt-3">
            <ExperienceAction
              path={`/athlete/me/heats/${heat.assignmentId}/check-in`}
              label={t("checkIn")}
            />
          </div>
        ) : heat.checkInStatus === "NOT_OPEN" && heat.checkInOpensAt ? (
          <p className="mt-2 text-xs text-white/50">
            {t("opens", { time: date(heat.checkInOpensAt) })}
          </p>
        ) : null}
      </div>
    </article>
  );
}
