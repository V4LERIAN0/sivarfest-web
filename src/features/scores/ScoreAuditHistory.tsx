"use client";

import { useState, useTransition } from "react";
import { getScoreAuditAction } from "./score.actions";
import type {
  ScoreAuditAction,
  ScoreAuditState,
  ScoreResponse,
} from "./scores.types";

interface ScoreAuditHistoryProps {
  score: ScoreResponse;
}

export function ScoreAuditHistory({
  score,
}: ScoreAuditHistoryProps) {
  const [audit, setAudit] =
    useState<ScoreAuditState | null>(null);
  const [pending, startTransition] = useTransition();

  const loadHistory = () => {
    if (audit !== null || pending) {
      return;
    }

    startTransition(async () => {
      setAudit(await getScoreAuditAction(score.id));
    });
  };

  const entries = audit
    ? [...audit.entries].reverse()
    : [];

  return (
    <details
      className="mt-3 max-w-80"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          loadHistory();
        }
      }}
    >
      <summary className="cursor-pointer list-none text-xs font-bold text-slate-400 hover:text-white">
        View audit history
      </summary>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
        {pending && (
          <p className="text-xs text-slate-400">
            Loading history...
          </p>
        )}

        {audit?.error && (
          <p role="alert" className="text-xs text-red-300">
            {audit.error}
          </p>
        )}

        {audit &&
          !audit.error &&
          entries.length === 0 && (
            <p className="text-xs text-slate-400">
              No audit entries were recorded.
            </p>
          )}

        {entries.length > 0 && (
          <ol className="space-y-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="border-l-2 border-slate-700 pl-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-black text-white">
                    {actionLabel(entry.action)}
                  </p>

                  <time className="text-[0.65rem] text-slate-500">
                    {formatDateTime(entry.occurredAt)}
                  </time>
                </div>

                <p className="mt-1 text-xs text-slate-300">
                  {statusTransition(
                    entry.previousStatus,
                    entry.newStatus
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Score:{" "}
                  {snapshotSummary(
                    entry.scoreSnapshot,
                    score
                  )}
                </p>

                {entry.reason && (
                  <p className="mt-1 text-xs text-amber-200">
                    Reason: {entry.reason}
                  </p>
                )}

                <p className="mt-1 text-[0.65rem] uppercase tracking-wide text-slate-500">
                  {entry.actorRole} user #{entry.actorUserId}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}

function actionLabel(action: ScoreAuditAction) {
  return (
    action.charAt(0) +
    action.slice(1).toLowerCase()
  );
}

function statusTransition(
  previousStatus: string | null,
  newStatus: string
) {
  return previousStatus
    ? `${previousStatus} → ${newStatus}`
    : `Created as ${newStatus}`;
}

function snapshotSummary(
  rawSnapshot: string,
  score: ScoreResponse
) {
  const values = parseSnapshot(rawSnapshot);
  let primary = "No score";

  switch (score.scoreType) {
    case "FOR_TIME":
      if (
        values.completed === "true" &&
        hasValue(values.scoreSeconds)
      ) {
        primary = formatSeconds(
          Number(values.scoreSeconds)
        );
      } else if (hasValue(values.reps)) {
        primary = `CAP + ${values.reps} reps`;
      } else {
        primary = "Capped / DNF";
      }
      break;

    case "AMRAP_REPS":
    case "EMOM_REPS":
      primary = hasValue(values.reps)
        ? `${values.reps} reps`
        : "No score";
      break;

    case "ROUNDS_COMPLETED":
      primary = hasValue(values.reps)
        ? `${values.reps} rounds`
        : "No score";
      break;

    case "MAX_WEIGHT":
      primary = hasValue(values.weight)
        ? `${values.weight} ${
            score.weightUnit === "KILOGRAMS"
              ? "kg"
              : "lb"
          }`
        : "No score";
      break;

    case "POINTS":
      primary = hasValue(values.points)
        ? `${values.points} pts`
        : "No score";
      break;

    case "CUSTOM":
      primary = hasValue(values.custom)
        ? values.custom
        : "No score";
      break;
  }

  if (!hasValue(values.tiebreak)) {
    return primary;
  }

  const tiebreak =
    score.tiebreakType === "TIME"
      ? formatSeconds(Number(values.tiebreak))
      : values.tiebreak;

  return `${primary} · Tiebreak: ${tiebreak}`;
}

function parseSnapshot(rawSnapshot: string) {
  const values: Record<string, string> = {};

  for (const section of rawSnapshot.split(";")) {
    const separator = section.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = section.slice(0, separator);
    const value = section.slice(separator + 1);

    values[key] = value;
  }

  return values;
}

function hasValue(value: string | undefined) {
  return (
    value !== undefined &&
    value !== "" &&
    value !== "null"
  );
}

function formatSeconds(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds)) {
    return "Invalid time";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${hours}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    : `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}