"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { EventFormState, EventResponse, EventStatus, RankingDirection, ScoreType, TiebreakType } from "./events.types";

interface Props {
  event?: EventResponse;
  action: (state: EventFormState, formData: FormData) => Promise<EventFormState>;
  submitLabel: string;
}

const scores: ScoreType[] = ["FOR_TIME", "AMRAP_REPS", "MAX_WEIGHT", "EMOM_REPS", "ROUNDS_COMPLETED", "POINTS", "CUSTOM"];
const statuses: EventStatus[] = ["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED", "SCORES_PUBLISHED", "SCORES_LOCKED"];
const tiebreaks: TiebreakType[] = ["NONE", "TIME", "REPS", "WEIGHT", "POINTS", "CUSTOM_NUMERIC"];
const field = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2";

const primaryDirection = (type: ScoreType): RankingDirection | null =>
  type === "CUSTOM" ? null : type === "FOR_TIME" ? "LOWER_IS_BETTER" : "HIGHER_IS_BETTER";
const tiebreakDirection = (type: TiebreakType): RankingDirection | null =>
  type === "NONE" || type === "CUSTOM_NUMERIC" ? null : type === "TIME" ? "LOWER_IS_BETTER" : "HIGHER_IS_BETTER";

export function EventForm({ event, action, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, { error: null });
  const values = state.values ?? event;
  const [scoreType, setScoreType] = useState<ScoreType>(event?.scoreType ?? "FOR_TIME");
  const [capped, setCapped] = useState(event?.cappedScoringEnabled ?? true);
  const [tiebreak, setTiebreak] = useState<TiebreakType>(event?.tiebreakType ?? "NONE");
  const fixedDirection = primaryDirection(scoreType);
  const fixedTiebreakDirection = tiebreakDirection(tiebreak);
  const showsDuration = ["FOR_TIME", "AMRAP_REPS", "EMOM_REPS"].includes(scoreType);

  return <form key={state.submissionKey ?? "initial"} action={formAction} className="space-y-8">
    <Section title="Event details">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Event code"><input name="eventCode" defaultValue={values?.eventCode ?? ""} maxLength={50} required className={field} placeholder="EVENT-1" /></Field>
        <Field label="Name"><input name="name" defaultValue={values?.name ?? ""} maxLength={150} required className={field} /></Field>
        <Field label="Display order"><input name="displayOrder" type="number" min={0} defaultValue={values?.displayOrder ?? 0} required className={field} /></Field>
        <Field label="Status"><select name="status" defaultValue={values?.status ?? "DRAFT"} className={field}>{statuses.map(x => <option key={x}>{x}</option>)}</select></Field>
      </div>
      <Field label="Public description"><textarea name="description" defaultValue={values?.description ?? ""} rows={3} className={field} /></Field>
      <Field label="Workout instructions"><textarea name="workoutInstructions" defaultValue={values?.workoutInstructions ?? ""} rows={5} className={field} /></Field>
      <Field label="Movement standards"><textarea name="movementStandards" defaultValue={values?.movementStandards ?? ""} rows={5} className={field} /></Field>
    </Section>

    <Section title="Scoring">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Score type"><select name="scoreType" value={scoreType} onChange={e => setScoreType(e.target.value as ScoreType)} className={field}>{scores.map(x => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Primary ranking">
          {fixedDirection ? <><input type="hidden" name="rankingDirection" value={fixedDirection} /><p className="mt-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300">{fixedDirection}</p></> :
            <select name="rankingDirection" defaultValue={values?.rankingDirection ?? "HIGHER_IS_BETTER"} className={field}><option>HIGHER_IS_BETTER</option><option>LOWER_IS_BETTER</option></select>}
        </Field>
      </div>
      {showsDuration && <Field label="Workout duration / time cap (seconds)"><input name="timeCapSeconds" type="number" min={1} defaultValue={values?.timeCapSeconds ?? ""} required={scoreType === "FOR_TIME"} className={field} /></Field>}
      {(scoreType === "AMRAP_REPS" || scoreType === "EMOM_REPS") && <Field label="Reps per round (optional)"><input name="repsPerRound" type="number" min={1} defaultValue={values?.repsPerRound ?? ""} className={field} /><Help>Useful for displaying scores as rounds + reps while ranking by total reps.</Help></Field>}
      {scoreType === "MAX_WEIGHT" && <Field label="Weight unit"><select name="weightUnit" defaultValue={values?.weightUnit ?? "POUNDS"} className={field}><option>POUNDS</option><option>KILOGRAMS</option></select></Field>}
      {scoreType === "FOR_TIME" && <>
        <Check name="cappedScoringEnabled" checked={capped} onChange={event => setCapped(event.target.checked)} label="Rank capped athletes by completed reps" />
        {capped && <Field label="Total workout reps"><input name="totalReps" type="number" min={1} defaultValue={values?.totalReps ?? ""} required className={field} /><Help>Athletes who finish rank by time. Capped athletes rank after finishers, by reps completed.</Help></Field>}
      </>}
    </Section>

    <Section title="Tiebreaker">
      <Field label="Tiebreak type"><select name="tiebreakType" value={tiebreak} onChange={e => setTiebreak(e.target.value as TiebreakType)} className={field}>{tiebreaks.map(x => <option key={x}>{x}</option>)}</select></Field>
      {tiebreak !== "NONE" && <>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tiebreak label"><input name="tiebreakLabel" defaultValue={values?.tiebreakLabel ?? ""} required maxLength={120} className={field} placeholder={tiebreak === "TIME" ? "Time after movement 2" : "Tiebreak score"} /></Field>
          <Field label="Tiebreak ranking">
            {fixedTiebreakDirection ? <><input type="hidden" name="tiebreakRankingDirection" value={fixedTiebreakDirection} /><p className="mt-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300">{fixedTiebreakDirection}</p></> :
              <select name="tiebreakRankingDirection" defaultValue={values?.tiebreakRankingDirection ?? "HIGHER_IS_BETTER"} className={field}><option>HIGHER_IS_BETTER</option><option>LOWER_IS_BETTER</option></select>}
          </Field>
        </div>
        {tiebreak === "WEIGHT" && <Field label="Tiebreak weight unit"><select name="tiebreakWeightUnit" defaultValue={values?.tiebreakWeightUnit ?? values?.weightUnit ?? "POUNDS"} className={field}><option>POUNDS</option><option>KILOGRAMS</option></select></Field>}
        <Field label="Instructions for judges"><textarea name="tiebreakInstructions" defaultValue={values?.tiebreakInstructions ?? ""} rows={3} className={field} /></Field>
        <Check name="tiebreakRequired" defaultChecked={values?.tiebreakRequired ?? false} label="Require a tiebreak score for every athlete" />
      </>}
    </Section>

    <Section title="Publishing">
      <div className="grid gap-4 md:grid-cols-2">
        <Check name="publicVisible" defaultChecked={values?.publicVisible ?? false} label="Show event publicly" />
        <Check name="scoreVisible" defaultChecked={values?.scoreVisible ?? false} label="Show this event's scores publicly" />
      </div>
    </Section>
    {state.error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{state.error}</p>}
    <Submit label={submitLabel} />
  </form>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-5"><h2 className="border-b border-slate-800 pb-3 text-xl font-black">{title}</h2>{children}</section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="text-sm font-bold text-slate-200">{label}</label>{children}</div>; }
function Help({ children }: { children: React.ReactNode }) { return <p className="mt-2 text-xs text-slate-400">{children}</p>; }
function Check({ label, ...props }: { label: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) { return <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-200"><input {...props} type="checkbox" className="size-4 accent-orange-500" />{label}</label>; }
function Submit({ label }: { label: string }) { const { pending } = useFormStatus(); return <button disabled={pending} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-50">{pending ? "Saving..." : label}</button>; }
