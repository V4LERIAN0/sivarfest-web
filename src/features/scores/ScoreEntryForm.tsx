"use client";

import type {
  ScoreType,
  TiebreakType,
  WeightUnit,
} from "@/features/events/events.types";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { upsertScoreAction } from "./score.actions";
import type { ScoreResponse } from "./scores.types";

interface ScoreEntryEvent {
  id: number;
  scoreType: ScoreType;
  timeCapSeconds: number | null;
  cappedScoringEnabled: boolean;
  weightUnit: WeightUnit | null;
  tiebreakType: TiebreakType;
  tiebreakLabel: string | null;
  tiebreakRequired: boolean;
  tiebreakWeightUnit: WeightUnit | null;
}

interface ScoreEntryFormProps {
  competitionId: number;
  athleteId: number;
  event: ScoreEntryEvent;
  score?: ScoreResponse;
  scoreDisplay: string | null;
}

const field =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-orange-500 focus:ring-2";

export function ScoreEntryForm({
  competitionId,
  athleteId,
  event,
  score,
  scoreDisplay,
}: ScoreEntryFormProps) {
  const [completion, setCompletion] = useState(
    score?.completed === false ? "false" : "true"
  );

  const [state, action] = useActionState(
    upsertScoreAction.bind(
      null,
      competitionId,
      event.id,
      athleteId,
      event.scoreType,
      event.tiebreakType
    ),
    { error: null }
  );

  const cannotEdit =
    score?.status === "PUBLISHED" ||
    score?.status === "LOCKED";

  const displayValue =
    scoreDisplay ?? (score ? "Existing score" : "No score");

  if (cannotEdit) {
    return (
      <div className="min-w-48">
        <p className="font-bold">{displayValue}</p>
        <p className="mt-1 text-xs text-amber-300">
          Reopen this score before editing.
        </p>
      </div>
    );
  }

  const usesReps =
    event.scoreType === "AMRAP_REPS" ||
    event.scoreType === "EMOM_REPS" ||
    event.scoreType === "ROUNDS_COMPLETED";

  return (
    <details className="min-w-56">
      <summary className="cursor-pointer list-none">
        <p className="font-bold">{displayValue}</p>
        <p className="mt-1 text-xs font-bold text-orange-300">
          {score ? "Edit score" : "Enter score"}
        </p>
      </summary>

      <form action={action} className="mt-4 space-y-3">
        {event.scoreType === "FOR_TIME" && (
          <>
            <Field label="Result">
              <select
                name="completed"
                value={completion}
                onChange={(event) =>
                  setCompletion(event.target.value)
                }
                className={field}
              >
                <option value="true">Finished</option>

                {event.cappedScoringEnabled && (
                  <option value="false">
                    Capped / DNF
                  </option>
                )}
              </select>
            </Field>

            {completion === "true" ? (
              <Field label="Completion time">
                <input
                  name="scoreTime"
                  defaultValue={formatTime(score?.scoreSeconds)}
                  placeholder="MM:SS"
                  required
                  className={field}
                />

                {event.timeCapSeconds !== null && (
                  <p className="mt-1 text-xs text-slate-500">
                    Cap: {formatTime(event.timeCapSeconds)}
                  </p>
                )}
              </Field>
            ) : (
              <Field label="Completed reps">
                <input
                  name="reps"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={score?.reps ?? ""}
                  required
                  className={field}
                />
              </Field>
            )}
          </>
        )}

        {usesReps && (
          <Field
            label={
              event.scoreType === "ROUNDS_COMPLETED"
                ? "Completed rounds"
                : "Total reps"
            }
          >
            <input
              name="reps"
              type="number"
              min={0}
              step={1}
              defaultValue={score?.reps ?? ""}
              required
              className={field}
            />
          </Field>
        )}

        {event.scoreType === "MAX_WEIGHT" && (
          <Field
            label={`Weight${
              event.weightUnit
                ? ` (${weightUnit(event.weightUnit)})`
                : ""
            }`}
          >
            <input
              name="weightValue"
              type="number"
              min={0}
              step="any"
              defaultValue={score?.weightValue ?? ""}
              required
              className={field}
            />
          </Field>
        )}

        {event.scoreType === "POINTS" && (
          <Field label="Points">
            <input
              name="pointsValue"
              type="number"
              min={0}
              step="any"
              defaultValue={score?.pointsValue ?? ""}
              required
              className={field}
            />
          </Field>
        )}

        {event.scoreType === "CUSTOM" && (
          <Field label="Custom value">
            <input
              name="customValue"
              type="number"
              min={0}
              step="any"
              defaultValue={score?.customValue ?? ""}
              required
              className={field}
            />
          </Field>
        )}

        {event.tiebreakType !== "NONE" && (
          <Field
            label={
              event.tiebreakLabel ??
              tiebreakName(
                event.tiebreakType,
                event.tiebreakWeightUnit
              )
            }
          >
            <input
              name="tiebreakValue"
              type={
                event.tiebreakType === "TIME"
                  ? "text"
                  : "number"
              }
              min={
                event.tiebreakType === "TIME"
                  ? undefined
                  : 0
              }
              step={
                event.tiebreakType === "TIME"
                  ? undefined
                  : "any"
              }
              placeholder={
                event.tiebreakType === "TIME"
                  ? "MM:SS"
                  : undefined
              }
              defaultValue={
                event.tiebreakType === "TIME"
                  ? formatTime(score?.tiebreakValue)
                  : score?.tiebreakValue ?? ""
              }
              required={event.tiebreakRequired}
              className={field}
            />
          </Field>
        )}

        <Field label="Notes">
          <textarea
            name="notes"
            defaultValue={score?.notes ?? ""}
            maxLength={2000}
            rows={2}
            className={field}
          />
        </Field>

        {state.error && (
          <p role="alert" className="text-xs text-red-300">
            {state.error}
          </p>
        )}

        {state.success && (
          <p role="status" className="text-xs text-emerald-300">
            {state.success}
          </p>
        )}

        <SubmitButton scoreExists={Boolean(score)} />
      </form>
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-bold text-slate-300">
      {label}
      {children}
    </label>
  );
}

function SubmitButton({
  scoreExists,
}: {
  scoreExists: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-black hover:bg-orange-400 disabled:opacity-50"
    >
      {pending
        ? "Saving..."
        : scoreExists
          ? "Save changes"
          : "Save draft"}
    </button>
  );
}

function formatTime(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = Math.floor(value % 60);

  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function weightUnit(unit: WeightUnit) {
  return unit === "KILOGRAMS" ? "kg" : "lb";
}

function tiebreakName(
  type: TiebreakType,
  unit: WeightUnit | null
) {
  switch (type) {
    case "TIME":
      return "Tiebreak time";
    case "REPS":
      return "Tiebreak reps";
    case "WEIGHT":
      return `Tiebreak weight${unit ? ` (${weightUnit(unit)})` : ""}`;
    case "POINTS":
      return "Tiebreak points";
    case "CUSTOM_NUMERIC":
      return "Tiebreak value";
    case "NONE":
      return "Tiebreak";
  }
}