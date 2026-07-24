"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  assignJudgeAction,
  createJudgeAction,
  updateJudgeAction,
} from "./judge.actions";
import { JudgeAssignmentResponse, JudgeResponse } from "./judges.types";

const field =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-orange-500 focus:ring-2";

export function CreateJudgeForm({ competitionId }: { competitionId: number }) {
  const [state, action] = useActionState(
    createJudgeAction.bind(null, competitionId),
    { error: null }
  );
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <Field label="Full name">
        <input name="fullName" required maxLength={180} className={field} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required maxLength={150} className={field} />
      </Field>
      <Field label="Temporary password">
        <input name="password" type="password" required minLength={8} maxLength={100} className={field} />
      </Field>
      <label className="mt-8 flex items-center gap-3 text-sm font-bold">
        <input name="active" type="checkbox" defaultChecked className="size-4 accent-orange-500" />
        Active
      </label>
      <Feedback state={state} />
      <div className="md:col-span-2"><Submit label="Create judge" /></div>
    </form>
  );
}

export function EditJudgeForm({
  competitionId,
  judge,
}: {
  competitionId: number;
  judge: JudgeResponse;
}) {
  const [state, action] = useActionState(
    updateJudgeAction.bind(null, competitionId, judge.id),
    { error: null }
  );
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Field label="Full name">
        <input name="fullName" defaultValue={judge.fullName} required maxLength={180} className={field} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" defaultValue={judge.email} required maxLength={150} className={field} />
      </Field>
      <Field label="New password (optional)">
        <input name="password" type="password" minLength={8} maxLength={100} className={field} />
      </Field>
      <label className="mt-8 flex items-center gap-3 text-sm font-bold">
        <input name="active" type="checkbox" defaultChecked={judge.active} className="size-4 accent-orange-500" />
        Active
      </label>
      <Feedback state={state} />
      <div className="md:col-span-2"><Submit label="Save judge" /></div>
    </form>
  );
}

export function JudgeAssignmentForm({
  competitionId,
  eventId,
  positionId,
  judges,
  assignment,
}: {
  competitionId: number;
  eventId: number;
  positionId: number;
  judges: JudgeResponse[];
  assignment?: JudgeAssignmentResponse;
}) {
  const [state, action] = useActionState(
    assignJudgeAction.bind(null, competitionId, eventId, positionId),
    { error: null }
  );
  if (assignment) {
    return (
      <div>
        <p className="font-bold text-slate-200">{assignment.judgeName}</p>
        {!assignment.judgeActive && <p className="text-xs text-amber-300">Inactive judge</p>}
      </div>
    );
  }
  return (
    <form action={action} className="min-w-56">
      <div className="flex gap-2">
        <select name="judgeId" required defaultValue="" className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white">
          <option value="">Choose judge</option>
          {judges.filter((judge) => judge.active).map((judge) => (
            <option key={judge.id} value={judge.id}>{judge.fullName}</option>
          ))}
        </select>
        <Submit label="Assign" compact />
      </div>
      <Feedback state={state} />
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-bold text-slate-200">{label}{children}</label>;
}

function Feedback({ state }: { state: { error: string | null; success?: string } }) {
  if (!state.error && !state.success) return null;
  return <p className={`text-xs ${state.error ? "text-red-300" : "text-emerald-300"}`}>{state.error ?? state.success}</p>;
}

function Submit({ label, compact = false }: { label: string; compact?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={compact ? "rounded-lg bg-orange-500 px-3 py-1 text-xs font-black text-black disabled:opacity-60" : "rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-60"}>
      {pending ? "Saving..." : label}
    </button>
  );
}
