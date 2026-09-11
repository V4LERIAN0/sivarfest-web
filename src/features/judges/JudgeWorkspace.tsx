"use client";
import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ClipboardCheck, MapPin, RefreshCw } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { JudgeAssignmentResponse } from "./judges.types";
import type { ScoreResponse } from "@/features/scores/scores.types";
import { JudgeScoreEntryForm } from "@/features/scores/JudgeScoreEntryForm";
import { ExperienceAction } from "@/features/athletes/ExperienceAction";
export function JudgeWorkspace({
  assignments,
  scores,
  userId,
}: {
  assignments: JudgeAssignmentResponse[];
  scores: (ScoreResponse | null)[];
  userId: number;
}) {
  const t = useTranslations("JudgeWorkspace");
  const athlete = useTranslations("AthleteArea");
  const locale = useLocale();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [eventId, setEventId] = useState("");
  const [heatId, setHeatId] = useState("");
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [offline, setOffline] = useState(false);
  const [refreshing, startTransition] = useTransition();
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const timer = setTimeout(update, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  const entries = assignments.map((assignment, i) => ({
    assignment,
    score: scores[i],
  }));
  const events = [
    ...new Map(assignments.map((a) => [a.eventId, a.eventName])).entries(),
  ];
  const heats = [
    ...new Map(
      assignments
        .filter((a) => !eventId || String(a.eventId) === eventId)
        .map((a) => [a.heatId, `${a.eventName} · ${a.heatName}`]),
    ).entries(),
  ];
  const needsScore = (score: ScoreResponse | null) =>
    !score || score.status === "REJECTED" || score.status === "DRAFT";
  const visible = entries.filter(
    ({ assignment: a, score }) =>
      (!eventId || String(a.eventId) === eventId) &&
      (!heatId || String(a.heatId) === heatId) &&
      (status === "all" ||
        (status === "pending" ? needsScore(score) : !needsScore(score))) &&
      `${a.athleteName} ${a.bibNumber ?? ""}`
        .toLocaleLowerCase(locale)
        .includes(query.toLocaleLowerCase(locale)),
  );
  const field =
    "mt-2 min-h-12 w-full border border-white/20 bg-[#101010] px-3 py-3 text-base text-white focus:outline-2 focus:outline-[#ffd400]";
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="sivar-kicker">{t("eyebrow")}</p>
          <h1 className="sivar-display mt-3 text-5xl sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
            {t("description")}
          </p>
        </div>
        <button
          onClick={() => startTransition(() => router.refresh())}
          disabled={refreshing}
          className="flex min-h-12 items-center gap-2 border border-white/20 px-4 py-3 text-sm font-bold disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {t(refreshing ? "refreshing" : "refresh")}
        </button>
      </header>
      {notice && (
        <p
          role="status"
          className="mt-5 border border-[#ffd400]/30 bg-[#ffd400]/5 p-4 text-sm font-bold text-[#ffd400]"
        >
          {notice}
        </p>
      )}
      {offline && (
        <p
          role="alert"
          className="mt-6 border border-orange-400/40 bg-orange-400/10 p-4 text-sm text-orange-200"
        >
          {t("offline")}
        </p>
      )}
      <div className="my-7 grid grid-cols-1 gap-4 border-y border-white/15 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-black uppercase tracking-wide text-white/60">
          {t("event")}
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setHeatId("");
            }}
            className={field}
          >
            <option value="">{t("allEvents")}</option>
            {events.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black uppercase tracking-wide text-white/60">
          {t("heat")}
          <select
            value={heatId}
            onChange={(e) => setHeatId(e.target.value)}
            className={field}
          >
            <option value="">{t("allHeats")}</option>
            {heats.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black uppercase tracking-wide text-white/60">
          {t("status")}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={field}
          >
            {(["pending", "submitted", "all"] as const).map((s) => (
              <option value={s} key={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black uppercase tracking-wide text-white/60">
          {t("search")}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={field}
          />
        </label>
      </div>
      <p className="mb-5 text-xs font-bold text-white/45" role="status">
        {t("count", { count: visible.length })}
      </p>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {visible.map(({ assignment: a, score }) => (
          <article
            key={a.id}
            className="border border-white/15 bg-[#0c0c0c] p-5 sm:p-6"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#ffd400]">
                  {a.eventName}
                </p>
                <h2 className="sivar-display mt-2 text-3xl">{a.heatName}</h2>
                <p className="mt-2 text-xs text-white/50">
                  {a.scheduledTime
                    ? new Intl.DateTimeFormat(locale, {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: "UTC",
                      }).format(new Date(`${a.scheduledTime}Z`))
                    : athlete("notScheduled")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 border border-[#ffd400]/30 bg-[#ffd400]/10 px-3 py-2 font-black text-[#ffd400]">
                <MapPin className="h-4 w-4" />
                {athlete("lane", { lane: a.positionNumber })}
              </div>
            </header>
            <div className="my-5 border-y border-white/10 py-5">
              <p className="break-words text-xl font-black">{a.athleteName}</p>
              <p className="mt-2 text-sm text-white/55">
                {a.categoryName}
                {a.bibNumber ? ` · #${a.bibNumber}` : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/55">
                {a.totalReps != null && (
                  <span className="border border-white/10 px-2 py-1">
                    {t("reps", { count: a.totalReps })}
                  </span>
                )}
                {a.repsPerRound != null && (
                  <span className="border border-white/10 px-2 py-1">
                    {t("round", { count: a.repsPerRound })}
                  </span>
                )}
              </div>
              <div className="mt-4">
                {["CHECKED_IN", "MANUAL_CHECKED_IN"].includes(
                  a.checkInStatus,
                ) ? (
                  <p className="flex items-center gap-2 text-sm font-bold text-[#ffd400]">
                    <ClipboardCheck className="h-4 w-4" />
                    {t("confirmed")}
                  </p>
                ) : a.heatStatus !== "COMPLETED" ? (
                  <ExperienceAction
                    path={`/judge/assignments/${a.id}/check-in`}
                    label={t("checkIn")}
                  />
                ) : null}
              </div>
            </div>
            <JudgeScoreEntryForm
              key={`${a.id}:${score?.updatedAt ?? "new"}`}
              userId={userId}
              onSubmitted={setNotice}
              assignment={a}
              score={score}
            />
            <Link
              className="mt-5 inline-block py-2 text-xs font-black text-[#ffd400]"
              href={`/events?category=${a.categoryId}#event-${a.eventId}`}
            >
              {t("workout")} →
            </Link>
          </article>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="border border-dashed border-white/20 p-10 text-center text-white/55">
          {t("empty")}
        </p>
      )}
      <p className="mt-6 text-xs text-white/45">{athlete("localTime")}</p>
    </div>
  );
}
