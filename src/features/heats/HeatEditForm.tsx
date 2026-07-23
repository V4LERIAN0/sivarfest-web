"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateHeatAction } from "./heat.actions";
import { HeatResponse } from "./heats.types";

const field =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2";
const localDateTime = (value: string | null) => value?.slice(0, 16) ?? "";

export function HeatEditForm({
  competitionId,
  eventId,
  heat,
}: {
  competitionId: number;
  eventId: number;
  heat: HeatResponse;
}) {
  const [state, action] = useActionState(
    updateHeatAction.bind(null, competitionId, eventId, heat.id),
    { error: null }
  );
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name">
          <input name="name" defaultValue={heat.name} required className={field} />
        </Field>
        <Field label="Heat number">
          <input
            name="heatNumber"
            type="number"
            min={1}
            defaultValue={heat.heatNumber}
            required
            className={field}
          />
        </Field>
        <Field label="Scheduled time">
          <input
            name="scheduledTime"
            type="datetime-local"
            defaultValue={localDateTime(heat.scheduledTime)}
            className={field}
          />
        </Field>
        <Field label="Capacity">
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={heat.capacity}
            required
            className={field}
          />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={heat.status} className={field}>
            <option>SCHEDULED</option>
            <option>CHECK_IN_OPEN</option>
            <option>ON_FLOOR</option>
            <option>IN_PROGRESS</option>
            <option>COMPLETED</option>
            <option>DELAYED</option>
          </select>
        </Field>
        <Field label="Display order">
          <input
            name="displayOrder"
            type="number"
            min={0}
            defaultValue={heat.displayOrder}
            required
            className={field}
          />
        </Field>
        <Field label="Actual start">
          <input
            name="actualStartTime"
            type="datetime-local"
            defaultValue={localDateTime(heat.actualStartTime)}
            className={field}
          />
        </Field>
        <Field label="Actual end">
          <input
            name="actualEndTime"
            type="datetime-local"
            defaultValue={localDateTime(heat.actualEndTime)}
            className={field}
          />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          name="notes"
          defaultValue={heat.notes ?? ""}
          rows={3}
          className={field}
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Check
          name="publicVisible"
          defaultChecked={heat.publicVisible}
          label="Show publicly"
        />
        <Check
          name="allowCapacityOverride"
          label="Allow capacity override for this update"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-bold text-red-300">
          {state.error}
        </p>
      )}
      <Submit />
    </form>
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
    <label className="block text-sm font-bold text-slate-200">
      {label}
      {children}
    </label>
  );
}
function Check({
  label,
  ...props
}: { label: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-bold">
      <input {...props} type="checkbox" className="size-4 accent-orange-500" />
      {label}
    </label>
  );
}
function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save heat"}
    </button>
  );
}
