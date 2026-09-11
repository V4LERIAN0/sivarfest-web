"use client";

import type { TiebreakType, WeightUnit } from "@/features/events/events.types";
import type { JudgeAssignmentResponse } from "@/features/judges/judges.types";
import type { AppLocale } from "@/i18n/routing";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { type ReactNode, useRef, useState } from "react";
import { upsertJudgeScoreAction } from "./judge-score.actions";
import { formatScoreTime } from "./score-request";
import type { ScoreFormState, ScoreResponse } from "./scores.types";

interface JudgeScoreEntryFormProps {
  assignment: JudgeAssignmentResponse;
  score: ScoreResponse | null;
  userId: number;
  onSubmitted?: (message: string) => void;
}

const field =
  "mt-2 min-h-12 w-full border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#ffd400] focus:ring-2 focus:ring-[#ffd400]/30";

const initialState: ScoreFormState = {
  error: null,
  success: null,
};

export function JudgeScoreEntryForm({
  assignment,
  score,
  userId,
  onSubmitted,
}: JudgeScoreEntryFormProps) {
  const t = useTranslations("Judging.scoreEntry");
  const workspace = useTranslations("JudgeWorkspace");
  const tStatus = useTranslations("Scoring.status");
  const format = useFormatter();
  const locale = useLocale() as AppLocale;

  const detailsRef = useRef<HTMLDetailsElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const restored = useRef(false);
  const [review, setReview] = useState<Array<{
    label: string;
    value: string;
  }> | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ScoreFormState>(initialState);
  const draftKey = `sivar-judge:${userId}:${assignment.id}:${score?.updatedAt ?? "new"}`;

  function restoreDraft() {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as Record<string, string>;
      if (draft.completed) setCompletion(draft.completed);
      requestAnimationFrame(() => {
        for (const [name, value] of Object.entries(draft)) {
          const control = formRef.current?.elements.namedItem(name);
          if (
            control instanceof HTMLInputElement ||
            control instanceof HTMLTextAreaElement ||
            control instanceof HTMLSelectElement
          )
            control.value = value;
        }
        setDraftSaved(true);
      });
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }
  function saveDraft() {
    setReview(null);
    confirmed.current = false;
    setState(initialState);
    if (!formRef.current) return;
    try {
      const values = Object.fromEntries(
        [...new FormData(formRef.current).entries()].filter(
          ([key]) => !key.startsWith("$ACTION_"),
        ),
      );
      sessionStorage.setItem(draftKey, JSON.stringify(values));
      setDraftSaved(true);
    } catch {
      setDraftSaved(false);
    }
  }
  function reviewBeforeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (confirmed.current) {
      confirmed.current = false;
      void submitScore(event.currentTarget);
      return;
    }
    const values: Array<{ label: string; value: string }> = [];
    for (const control of Array.from(event.currentTarget.elements)) {
      if (
        !(
          control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement ||
          control instanceof HTMLSelectElement
        ) ||
        !control.name ||
        control.type === "hidden"
      )
        continue;
      const label =
        control.closest("label")?.firstChild?.textContent?.trim() ||
        control.name;
      const value =
        control instanceof HTMLSelectElement
          ? (control.selectedOptions[0]?.textContent ?? "")
          : control.value;
      if (value) values.push({ label, value });
    }
    setReview(values);
  }

  const [completion, setCompletion] = useState(
    score?.completed === false ? "false" : "true",
  );

  const boundAction = upsertJudgeScoreAction.bind(
    null,
    assignment.id,
    assignment.scoreType,
    assignment.tiebreakType,
    assignment.timeCapSeconds,
    assignment.cappedScoringEnabled,
    assignment.tiebreakRequired,
    locale,
  );

  async function submitScore(form: HTMLFormElement) {
    setPending(true);
    setState(initialState);
    try {
      const result = await boundAction(initialState, new FormData(form));
      setState(result);
      if (result.success) {
        try {
          sessionStorage.removeItem(draftKey);
        } catch {
          /* Storage is optional. */
        }
        setDraftSaved(false);
        setReview(null);
        if (detailsRef.current) detailsRef.current.open = false;
        onSubmitted?.(`${assignment.athleteName}: ${result.success}`);
      }
    } catch {
      setState({ error: workspace("notSent") });
    } finally {
      setPending(false);
    }
  }

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
        if (score.completed === true && score.scoreSeconds !== null) {
          return formatScoreTime(score.scoreSeconds);
        }

        if (score.completed === false && score.reps !== null) {
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
              score.weightUnit ? ` ${weightUnit(score.weightUnit)}` : ""
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
      },
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

        <p className="mt-2 text-xs text-white/55">{t("readOnly")}</p>
      </div>
    );
  }

  return (
    <div>
      {score?.rejectionReason && (
        <p className="mb-4 border border-red-500/30 p-3 text-sm text-red-200">
          {workspace("rejected")}: {score.rejectionReason}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="mb-4 border border-[#ffd400]/30 p-3 text-sm font-bold text-[#ffd400]"
        >
          {state.success}
        </p>
      )}
      <details
        ref={detailsRef}
        onToggle={(event) => {
          if (event.currentTarget.open) restoreDraft();
        }}
      >
        <summary className="cursor-pointer list-none">
          <p className="font-black">{displayValue}</p>

          {score && (
            <p className="mt-1 text-xs text-white/55">
              {t("status", {
                status: tStatus(score.status),
              })}
            </p>
          )}

          <p className="mt-2 text-xs font-black text-[#ffd400]">
            {score ? t("editScore") : t("enterScore")}
          </p>
        </summary>

        <form
          ref={formRef}
          onChange={saveDraft}
          onSubmit={reviewBeforeSubmit}
          className="mt-5 space-y-4 border-t border-white/15 pt-5"
        >
          <fieldset
            disabled={pending}
            className="space-y-4 disabled:opacity-60"
          >
            {assignment.scoreType === "FOR_TIME" && (
              <>
                <Field label={t("result")}>
                  <select
                    name="completed"
                    value={completion}
                    onChange={(event) => setCompletion(event.target.value)}
                    className={field}
                  >
                    <option value="true">{t("finished")}</option>

                    {assignment.cappedScoringEnabled && (
                      <option value="false">{t("cappedDnf")}</option>
                    )}
                  </select>
                </Field>

                {completion === "true" ? (
                  <Field label={t("completionTime")}>
                    <input
                      name="scoreTime"
                      inputMode="numeric"
                      defaultValue={formatScoreTime(score?.scoreSeconds)}
                      required
                      placeholder="MM:SS"
                      className={field}
                    />

                    {assignment.timeCapSeconds !== null && (
                      <p className="mt-1 text-xs text-white/45">
                        {t("timeCap", {
                          cap: formatScoreTime(assignment.timeCapSeconds),
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
                      max={
                        assignment.totalReps != null
                          ? assignment.totalReps - 1
                          : undefined
                      }
                      step={1}
                      required
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
                  required
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
                  required={assignment.tiebreakRequired}
                  type={assignment.tiebreakType === "TIME" ? "text" : "number"}
                  inputMode={
                    assignment.tiebreakType === "TIME" ? "numeric" : "decimal"
                  }
                  min={assignment.tiebreakType === "TIME" ? undefined : 0}
                  step={assignment.tiebreakType === "TIME" ? undefined : "any"}
                  placeholder={
                    assignment.tiebreakType === "TIME" ? "MM:SS" : undefined
                  }
                  defaultValue={
                    assignment.tiebreakType === "TIME"
                      ? formatScoreTime(score?.tiebreakValue)
                      : (score?.tiebreakValue ?? "")
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
          </fieldset>
          {state.error && (
            <p role="alert" className="text-sm font-bold text-red-300">
              {state.error}
            </p>
          )}

          {state.success && (
            <p role="status" className="text-sm font-bold text-emerald-300">
              {state.success}
            </p>
          )}

          <p className="text-xs leading-5 text-white/45">
            {workspace("judgeHelp")}
          </p>
          {draftSaved && !state.success && (
            <p className="text-xs text-white/55">{workspace("draft")}</p>
          )}
          {review ? (
            <div className="border border-[#ffd400]/50 bg-[#ffd400]/5 p-4">
              <h3 className="font-black text-[#ffd400]">
                {workspace("reviewTitle")}
              </h3>
              <p className="mt-3 font-black">{assignment.athleteName}</p>
              <p className="text-sm text-white/65">
                {assignment.categoryName} · {assignment.heatName} · #
                {assignment.positionNumber}
              </p>
              <dl className="my-4 space-y-2">
                {review.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap justify-between gap-x-3 border-t border-white/10 pt-2 text-sm"
                  >
                    <dt className="text-white/55">{item.label}</dt>
                    <dd className="max-w-full break-words font-bold">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mb-4 text-xs text-white/60">
                {workspace("reviewHint")}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setReview(null)}
                  className="min-h-12 border border-white/20 px-4 text-sm font-bold"
                >
                  {workspace("edit")}
                </button>
                <SubmitButton
                  pending={pending}
                  confirm
                  onConfirm={() => {
                    confirmed.current = true;
                  }}
                />
              </div>
            </div>
          ) : (
            <SubmitButton pending={pending} />
          )}
        </form>
      </details>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-bold text-white/70">
      {label}
      {children}
    </label>
  );
}

function SubmitButton({
  pending,
  confirm = false,
  onConfirm,
}: {
  pending: boolean;
  confirm?: boolean;
  onConfirm?: () => void;
}) {
  const t = useTranslations("JudgeWorkspace");
  const score = useTranslations("Judging.scoreEntry");
  return (
    <button
      type="submit"
      onClick={onConfirm}
      disabled={pending}
      className="min-h-12 flex-1 bg-[#ffd400] px-5 py-3 text-sm font-black text-black hover:bg-yellow-300 disabled:opacity-50"
    >
      {pending ? score("saving") : t(confirm ? "confirm" : "review")}
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
  },
) {
  switch (type) {
    case "TIME":
      return labels.time;

    case "REPS":
      return labels.reps;

    case "WEIGHT":
      return `${labels.weight}${unit ? ` (${weightUnit(unit)})` : ""}`;

    case "POINTS":
      return labels.points;

    case "CUSTOM_NUMERIC":
      return labels.value;

    case "NONE":
      return labels.default;
  }
}
