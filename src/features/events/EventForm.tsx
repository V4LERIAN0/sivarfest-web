"use client";

import type { AthleteAdminResponse } from "@/features/athletes/athletes.types";
import type { CategoryResponse } from "@/features/categories/categories.types";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type {
  EventCategoryConfigRequest,
  EventEligibilityMode,
  EventFormState,
  EventResponse,
  EventStatus,
  RankingDirection,
  ScoreType,
  TiebreakType,
} from "./events.types";

interface Props {
  event?: EventResponse;
  categories: CategoryResponse[];
  athletes: AthleteAdminResponse[];
  action: (state: EventFormState, formData: FormData) => Promise<EventFormState>;
  submitLabel: string;
}

const scores: ScoreType[] = [
  "FOR_TIME", "AMRAP_REPS", "MAX_WEIGHT", "EMOM_REPS",
  "ROUNDS_COMPLETED", "POINTS", "CUSTOM",
];
const statuses: EventStatus[] = [
  "DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED",
  "SCORES_PUBLISHED", "SCORES_LOCKED",
];
const tiebreaks: TiebreakType[] = [
  "NONE", "TIME", "REPS", "WEIGHT", "POINTS", "CUSTOM_NUMERIC",
];
const field = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2";

const primaryDirection = (type: ScoreType): RankingDirection | null =>
  type === "CUSTOM" ? null : type === "FOR_TIME" ? "LOWER_IS_BETTER" : "HIGHER_IS_BETTER";
const tiebreakDirection = (type: TiebreakType): RankingDirection | null =>
  type === "NONE" || type === "CUSTOM_NUMERIC" ? null : type === "TIME" ? "LOWER_IS_BETTER" : "HIGHER_IS_BETTER";

export function EventForm({ event, categories, athletes, action, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, { error: null });
  const values = state.values ?? event;
  const [scoreType, setScoreType] = useState<ScoreType>(values?.scoreType ?? "FOR_TIME");
  const [capped, setCapped] = useState(values?.cappedScoringEnabled ?? true);
  const [tiebreak, setTiebreak] = useState<TiebreakType>(values?.tiebreakType ?? "NONE");
  const [eligibilityMode, setEligibilityMode] = useState<EventEligibilityMode>(values?.eligibilityMode ?? "ALL_ACTIVE");

  const existingConfigurations = values?.categoryConfigurations ?? [];
  const configurationByCategory = new Map<number, EventCategoryConfigRequest>(
    existingConfigurations.map((configuration) => [configuration.categoryId, configuration]),
  );
  const [configuredCategoryIds, setConfiguredCategoryIds] = useState<number[]>(
    existingConfigurations.map((configuration) => configuration.categoryId),
  );

  const selectedAthleteIds = new Set(values?.eligibleAthleteIds ?? []);
  const activeCategories = categories
    .filter((category) => category.active)
    .sort((first, second) => first.displayOrder - second.displayOrder || first.name.localeCompare(second.name));
  const eligibleAthletes = athletes.filter(
    (athlete) => athlete.status !== "WITHDRAWN" && athlete.status !== "DISQUALIFIED",
  );
  const fixedDirection = primaryDirection(scoreType);
  const fixedTiebreakDirection = tiebreakDirection(tiebreak);
  const showsDuration = ["FOR_TIME", "AMRAP_REPS", "EMOM_REPS"].includes(scoreType);

  const toggleCategory = (categoryId: number, checked: boolean) => {
    setConfiguredCategoryIds((current) => checked
      ? [...new Set([...current, categoryId])]
      : current.filter((id) => id !== categoryId));
  };

  return (
    <form key={state.submissionKey ?? "initial"} action={formAction} className="space-y-8">
      <Section title="Event details">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Event code"><input name="eventCode" defaultValue={values?.eventCode ?? ""} maxLength={30} required className={field} placeholder="1" /></Field>
          <Field label="Name"><input name="name" defaultValue={values?.name ?? ""} maxLength={180} required className={field} /></Field>
          <Field label="Display order"><input name="displayOrder" type="number" min={0} defaultValue={values?.displayOrder ?? 0} required className={field} /></Field>
          <Field label="Status"><select name="status" defaultValue={values?.status ?? "DRAFT"} className={field}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
        </div>
        <Field label="Default public description"><textarea name="description" defaultValue={values?.description ?? ""} rows={3} className={field} /></Field>
        <Field label="Default workout instructions"><textarea name="workoutInstructions" defaultValue={values?.workoutInstructions ?? ""} rows={5} className={field} /></Field>
        <Field label="Default movement standards"><textarea name="movementStandards" defaultValue={values?.movementStandards ?? ""} rows={5} className={field} /><Help>These values remain the fallback when a category does not override them below.</Help></Field>
      </Section>

      <Section title="Scoring defaults">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Score type"><select name="scoreType" value={scoreType} onChange={(event) => setScoreType(event.target.value as ScoreType)} className={field}>{scores.map((score) => <option key={score}>{score}</option>)}</select></Field>
          <Field label="Primary ranking">
            {fixedDirection ? <><input type="hidden" name="rankingDirection" value={fixedDirection} /><p className="mt-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300">{fixedDirection}</p></> :
              <select name="rankingDirection" defaultValue={values?.rankingDirection ?? "HIGHER_IS_BETTER"} className={field}><option>HIGHER_IS_BETTER</option><option>LOWER_IS_BETTER</option></select>}
          </Field>
        </div>
        {showsDuration && <Field label="Default workout duration / time cap (seconds)"><input name="timeCapSeconds" type="number" min={1} defaultValue={values?.timeCapSeconds ?? ""} required={scoreType === "FOR_TIME"} className={field} /></Field>}
        {(scoreType === "AMRAP_REPS" || scoreType === "EMOM_REPS") && <Field label="Default reps per round (optional)"><input name="repsPerRound" type="number" min={1} defaultValue={values?.repsPerRound ?? ""} className={field} /><Help>Used to display scores as rounds + reps while ranking by total reps.</Help></Field>}
        {scoreType === "MAX_WEIGHT" && <Field label="Weight unit"><select name="weightUnit" defaultValue={values?.weightUnit ?? "POUNDS"} className={field}><option>POUNDS</option><option>KILOGRAMS</option></select></Field>}
        {scoreType === "FOR_TIME" && <>
          <Check name="cappedScoringEnabled" checked={capped} onChange={(event) => setCapped(event.target.checked)} label="Rank capped athletes by completed reps" />
          {capped && <Field label="Default total workout reps"><input name="totalReps" type="number" min={1} defaultValue={values?.totalReps ?? ""} required className={field} /></Field>}
        </>}
      </Section>

      <Section title="Category variations">
        <p className="text-sm leading-6 text-slate-400">Enable a category to give it its own workout text and scoring totals. Blank text fields inherit the defaults above.</p>
        <div className="space-y-4">
          {activeCategories.map((category) => {
            const configuration = configurationByCategory.get(category.id);
            const configured = configuredCategoryIds.includes(category.id);
            return (
              <div key={category.id} className="rounded-xl border border-slate-800 bg-slate-950/65">
                <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
                  <span><span className="block font-black text-white">{category.name}</span><span className="mt-1 block text-xs text-slate-500">{category.genderClassification} · {category.divisionLabel ?? "No division label"}</span></span>
                  <input type="checkbox" name="configuredCategoryId" value={category.id} checked={configured} onChange={(event) => toggleCategory(category.id, event.target.checked)} className="size-5 accent-orange-500" />
                </label>
                {configured && (
                  <div className="space-y-5 border-t border-slate-800 p-4">
                    <Field label="Public variation label"><input name={`category-${category.id}-variantLabel`} defaultValue={configuration?.variantLabel ?? category.name} maxLength={120} className={field} /></Field>
                    <Field label="Short description (optional override)"><textarea name={`category-${category.id}-description`} defaultValue={configuration?.description ?? ""} rows={3} className={field} /></Field>
                    <Field label="Workout instructions (optional override)"><textarea name={`category-${category.id}-workoutInstructions`} defaultValue={configuration?.workoutInstructions ?? ""} rows={7} className={field} /></Field>
                    <Field label="Movement standards (optional override)"><textarea name={`category-${category.id}-movementStandards`} defaultValue={configuration?.movementStandards ?? ""} rows={7} className={field} /></Field>
                    <div className="grid gap-5 md:grid-cols-3">
                      {showsDuration && <Field label="Time cap (seconds)"><input name={`category-${category.id}-timeCapSeconds`} type="number" min={1} defaultValue={configuration?.timeCapSeconds ?? values?.timeCapSeconds ?? ""} className={field} /></Field>}
                      {scoreType === "FOR_TIME" && <Field label="Total reps"><input name={`category-${category.id}-totalReps`} type="number" min={1} defaultValue={configuration?.totalReps ?? values?.totalReps ?? ""} className={field} /></Field>}
                      {(scoreType === "AMRAP_REPS" || scoreType === "EMOM_REPS") && <Field label="Reps per round"><input name={`category-${category.id}-repsPerRound`} type="number" min={1} defaultValue={configuration?.repsPerRound ?? values?.repsPerRound ?? ""} className={field} /></Field>}
                    </div>
                    {scoreType === "FOR_TIME" && <Check name={`category-${category.id}-cappedScoringEnabled`} defaultChecked={configuration?.cappedScoringEnabled ?? capped} label="Allow capped scores for this category" />}
                  </div>
                )}
              </div>
            );
          })}
          {activeCategories.length === 0 && <p className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-400">Create active competition categories before adding variations.</p>}
        </div>
      </Section>

      <Section title="Athlete eligibility">
        <Field label="Who competes in this event?"><select name="eligibilityMode" value={eligibilityMode} onChange={(event) => setEligibilityMode(event.target.value as EventEligibilityMode)} className={field}><option value="ALL_ACTIVE">All active athletes</option><option value="EXPLICIT">Only selected athletes</option></select></Field>
        {eligibilityMode === "EXPLICIT" && (
          <div className="max-h-[32rem] space-y-5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
            {activeCategories.map((category) => {
              const categoryAthletes = eligibleAthletes.filter((athlete) => athlete.categoryId === category.id);
              return (
                <fieldset key={category.id}>
                  <legend className="text-sm font-black text-orange-300">{category.name} ({categoryAthletes.length})</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {categoryAthletes.map((athlete) => <label key={athlete.id} className="flex items-center gap-3 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-200"><input type="checkbox" name="eligibleAthleteIds" value={athlete.id} defaultChecked={selectedAthleteIds.has(athlete.id)} className="size-4 accent-orange-500" /><span>{athlete.fullName}</span></label>)}
                  </div>
                </fieldset>
              );
            })}
          </div>
        )}
        <Help>Use explicit selection for finals or qualified-only events. An empty explicit event intentionally has no eligible athletes until finalists are chosen.</Help>
      </Section>

      <Section title="Tiebreaker">
        <Field label="Tiebreak type"><select name="tiebreakType" value={tiebreak} onChange={(event) => setTiebreak(event.target.value as TiebreakType)} className={field}>{tiebreaks.map((type) => <option key={type}>{type}</option>)}</select></Field>
        {tiebreak !== "NONE" && <>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tiebreak label"><input name="tiebreakLabel" defaultValue={values?.tiebreakLabel ?? ""} required maxLength={180} className={field} placeholder={tiebreak === "TIME" ? "Tiempo al completar la primera ronda" : "Tiebreak score"} /></Field>
            <Field label="Tiebreak ranking">{fixedTiebreakDirection ? <><input type="hidden" name="tiebreakRankingDirection" value={fixedTiebreakDirection} /><p className="mt-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300">{fixedTiebreakDirection}</p></> : <select name="tiebreakRankingDirection" defaultValue={values?.tiebreakRankingDirection ?? "HIGHER_IS_BETTER"} className={field}><option>HIGHER_IS_BETTER</option><option>LOWER_IS_BETTER</option></select>}</Field>
          </div>
          {tiebreak === "WEIGHT" && <Field label="Tiebreak weight unit"><select name="tiebreakWeightUnit" defaultValue={values?.tiebreakWeightUnit ?? values?.weightUnit ?? "POUNDS"} className={field}><option>POUNDS</option><option>KILOGRAMS</option></select></Field>}
          <Field label="Instructions for judges"><textarea name="tiebreakInstructions" defaultValue={values?.tiebreakInstructions ?? ""} rows={3} className={field} /></Field>
          <Check name="tiebreakRequired" defaultChecked={values?.tiebreakRequired ?? false} label="Require a tiebreak score for every athlete" />
        </>}
      </Section>

      <Section title="Publishing"><div className="grid gap-4 md:grid-cols-2"><Check name="publicVisible" defaultChecked={values?.publicVisible ?? false} label="Show event publicly" /><Check name="scoreVisible" defaultChecked={values?.scoreVisible ?? false} label="Show this event's scores publicly" /></div></Section>
      {state.error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{state.error}</p>}
      <Submit label={submitLabel} />
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-5"><h2 className="border-b border-slate-800 pb-3 text-xl font-black">{title}</h2>{children}</section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="text-sm font-bold text-slate-200">{label}</label>{children}</div>; }
function Help({ children }: { children: React.ReactNode }) { return <p className="mt-2 text-xs text-slate-400">{children}</p>; }
function Check({ label, ...props }: { label: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) { return <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-200"><input {...props} type="checkbox" className="size-4 accent-orange-500" />{label}</label>; }
function Submit({ label }: { label: string }) { const { pending } = useFormStatus(); return <button disabled={pending} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-50">{pending ? "Saving..." : label}</button>; }
