"use client";

import type {
  TiebreakType,
  WeightUnit,
} from "@/features/events/events.types";
import type { JudgeAssignmentResponse } from "@/features/judges/judges.types";
import type { AppLocale } from "@/i18n/routing";
import {
  useFormatter,
  useLocale,
  useTranslations,
} from "next-intl";
import {
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { upsertJudgeScoreAction } from "./judge-score.actions";
import { formatScoreTime } from "./score-request";
import type {
  ScoreFormState,
  ScoreResponse,
} from "./scores.types";

interface JudgeScoreEntryFormProps {
  assignment: JudgeAssignmentResponse;
  score: ScoreResponse | null;
}

const field =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-orange-500 focus:ring-2";

const initialState: ScoreFormState = {
  error: null,
  success: null,
};

export function JudgeScoreEntryForm({
  assignment,
  score,
}: JudgeScoreEntryFormProps) {
  const t = useTranslations("Judging.scoreEntry");
  const tStatus = useTranslations("Scoring.status");
  const format = useFormatter();
  const locale = useLocale() as AppLocale;

  const detailsRef = useRef<HTMLDetailsElement>(null);

  const [completion, setCompletion] = useState(
    score?.completed === false ? "false" : "true"
  );

  const boundAction = upsertJudgeScoreAction.bind(
    null,
    assignment.id,
    assignment.scoreType,
    assignment.tiebreakType,
    assignment.timeCapSeconds,
    assignment.cappedScoringEnabled,
    assignment.tiebreakRequired,
    locale
  );

  const [state, action] = useActionState(
    boundAction,
    initialState
  );

  useEffect(() => {
    if (state.success && detailsRef.current) {
      detailsRef.current.open = false;
    }
  }, [state]);

  const cannotEdit =
    score?.status === "VALIDATED" ||
    score?.status === "PUBLISHED" ||
    score?.status === "LOCKED";

  const usesReps =
    assignment.scoreType === "AMRAP_REPS" ||
    assignment.scoreType === "EMOM_REPS" ||
    assignment.scoreType === "ROUNDS_COMPLETED";

  const displayValue = (() => {
    if (!score) {
      return t("noScore");
    }

    switch (score.scoreType) {
      case "FOR_TIME":
        if (
          score.completed === true &&
          score.scoreSeconds !== null
        ) {
          return formatScoreTime(score.scoreSeconds);
        }

        if (
          score.completed === false &&
          score.reps !== null
        ) {
          return t("repsDisplay", {
            count: score.reps,
          });
        }

        return t("existingScore");

      case "AMRAP_REPS":
      case "EMOM_REPS":
        return score.reps !== null
          ? t("repsDisplay", { count: score.reps })
          : t("existingScore");

      case "ROUNDS_COMPLETED":
        return score.reps !== null
          ? t("roundsDisplay", { count: score.reps })
          : t("existingScore");

      case "MAX_WEIGHT":
        return score.weightValue !== null
          ? `${format.number(score.weightValue)}${
              score.weightUnit
                ? ` ${weightUnit(score.weightUnit)}`
                : ""
            }`
          : t("existingScore");

      case "POINTS":
        return score.pointsValue !== null
          ? t("pointsDisplay", {
              count: score.pointsValue,
            })
          : t("existingScore");

      case "CUSTOM":
        return score.customValue !== null
          ? format.number(score.customValue)
          : t("existingScore");
    }
  })();

  const tiebreakLabel =
    assignment.tiebreakLabel ??
    translatedTiebreakLabel(
      assignment.tiebreakType,
      assignment.tiebreakWeightUnit,
      {
        default: t("tiebreak"),
        time: t("tiebreakTime"),
        reps: t("tiebreakReps"),
        weight: t("tiebreakWeight"),
        points: t("tiebreakPoints"),
        value: t("tiebreakValue"),
      }
    );

  if (cannotEdit && score) {
    return (
      <div>
        <p className="font-black">{displayValue}</p>

        <p className="mt-1 text-xs font-bold text-amber-300">
          {t("status", {
            status: tStatus(score.status),
          })}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {t("readOnly")}
        </p>
      </div>
    );
  }

  return (
    <details ref={detailsRef}>
      <summary className="cursor-pointer list-none">
        <p className="font-black">{displayValue}</p>

        {score && (
          <p className="mt-1 text-xs text-slate-400">
            {t("status", {
              status: tStatus(score.status),
            })}
          </p>
        )}

        <p className="mt-2 text-xs font-black text-orange-300">
          {score ? t("editScore") : t("enterScore")}
        </p>
      </summary>

      <form
        action={action}
        noValidate
        className="mt-5 space-y-4 border-t border-slate-800 pt-5"
      >
        {assignment.scoreType === "FOR_TIME" && (
          <>
            <Field label={t("result")}>
              <select
                name="completed"
                value={completion}
                onChange={(event) =>
                  setCompletion(event.target.value)
                }
                className={field}
              >
                <option value="true">
                  {t("finished")}
                </option>

                {assignment.cappedScoringEnabled && (
                  <option value="false">
                    {t("cappedDnf")}
                  </option>
                )}
              </select>
            </Field>

            {completion === "true" ? (
              <Field label={t("completionTime")}>
                <input
                  name="scoreTime"
                  inputMode="numeric"
                  defaultValue={formatScoreTime(
                    score?.scoreSeconds
                  )}
                  placeholder="MM:SS"
                  className={field}
                />

                {assignment.timeCapSeconds !== null && (
                  <p className="mt-1 text-xs text-slate-500">
                    {t("timeCap", {
                      cap: formatScoreTime(
                        assignment.timeCapSeconds
                      ),
                    })}
                  </p>
                )}
              </Field>
            ) : (
              <Field label={t("completedReps")}>
                <input
                  name="reps"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={score?.reps ?? ""}
                  className={field}
                />
              </Field>
            )}
          </>
        )}

        {usesReps && (
          <Field
            label={
              assignment.scoreType === "ROUNDS_COMPLETED"
                ? t("completedRounds")
                : t("totalReps")
            }
          >
            <input
              name="reps"
              type="number"
              min={0}
              step={1}
              defaultValue={score?.reps ?? ""}
              className={field}
            />
          </Field>
        )}

        {assignment.scoreType === "MAX_WEIGHT" && (
          <Field
            label={`${t("weight")}${
              assignment.weightUnit
                ? ` (${weightUnit(assignment.weightUnit)})`
                : ""
            }`}
          >
            <input
              name="weightValue"
              type="number"
              min={0}
              step="any"
              defaultValue={score?.weightValue ?? ""}
              className={field}
            />
          </Field>
        )}

        {assignment.scoreType === "POINTS" && (
          <Field label={t("points")}>
            <input
              name="pointsValue"
              type="number"
              min={0}
              step="any"
              defaultValue={score?.pointsValue ?? ""}
              className={field}
            />
          </Field>
        )}

        {assignment.scoreType === "CUSTOM" && (
          <Field label={t("customValue")}>
            <input
              name="customValue"
              type="number"
              min={0}
              step="any"
              defaultValue={score?.customValue ?? ""}
              className={field}
            />
          </Field>
        )}

        {assignment.tiebreakType !== "NONE" && (
          <Field label={tiebreakLabel}>
            <input
              name="tiebreakValue"
              type={
                assignment.tiebreakType === "TIME"
                  ? "text"
                  : "number"
              }
              inputMode={
                assignment.tiebreakType === "TIME"
                  ? "numeric"
                  : "decimal"
              }
              min={
                assignment.tiebreakType === "TIME"
                  ? undefined
                  : 0
              }
              step={
                assignment.tiebreakType === "TIME"
                  ? undefined
                  : "any"
              }
              placeholder={
                assignment.tiebreakType === "TIME"
                  ? "MM:SS"
                  : undefined
              }
              defaultValue={
                assignment.tiebreakType === "TIME"
                  ? formatScoreTime(score?.tiebreakValue)
                  : score?.tiebreakValue ?? ""
              }
              className={field}
            />
          </Field>
        )}

        <Field label={t("notes")}>
          <textarea
            name="notes"
            defaultValue={score?.notes ?? ""}
            maxLength={2000}
            rows={2}
            className={field}
          />
        </Field>

        {state.error && (
          <p
            role="alert"
            className="text-sm font-bold text-red-300"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <p
            role="status"
            className="text-sm font-bold text-emerald-300"
          >
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
  children: ReactNode;
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
  const t = useTranslations("Judging.scoreEntry");
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-black text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending
        ? t("saving")
        : scoreExists
          ? t("saveChanges")
          : t("submitScore")}
    </button>
  );
}

function weightUnit(unit: WeightUnit) {
  return unit === "KILOGRAMS" ? "kg" : "lb";
}

function translatedTiebreakLabel(
  type: TiebreakType,
  unit: WeightUnit | null,
  labels: {
    default: string;
    time: string;
    reps: string;
    weight: string;
    points: string;
    value: string;
  }
) {
  switch (type) {
    case "TIME":
      return labels.time;

    case "REPS":
      return labels.reps;

    case "WEIGHT":
      return `${labels.weight}${
        unit ? ` (${weightUnit(unit)})` : ""
      }`;

    case "POINTS":
      return labels.points;

    case "CUSTOM_NUMERIC":
      return labels.value;

    case "NONE":
      return labels.default;
  }
}