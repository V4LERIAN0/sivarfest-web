"use client";

import { AthleteAdminResponse } from "@/features/athletes/athletes.types";
import { CategoryResponse } from "@/features/categories/categories.types";
import { EventResponse } from "@/features/events/events.types";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  assignAthleteAction,
  createHeatAction,
  generateHeatsAction,
  updateAssignmentAction,
} from "./heat.actions";
import { HeatAssignmentResponse } from "./heats.types";

const field =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-orange-500 focus:ring-2";

export function CreateHeatForm({
  competitionId,
  eventId,
  nextHeatNumber,
}: {
  competitionId: number;
  eventId: number;
  nextHeatNumber: number;
}) {
  const [state, action] = useActionState(
    createHeatAction.bind(null, competitionId, eventId),
    { error: null }
  );
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <Field label="Name">
        <input
          name="name"
          defaultValue={`Heat ${nextHeatNumber}`}
          required
          className={field}
        />
      </Field>
      <Field label="Heat number">
        <input
          name="heatNumber"
          type="number"
          min={1}
          defaultValue={nextHeatNumber}
          required
          className={field}
        />
      </Field>
      <Field label="Scheduled time">
        <input name="scheduledTime" type="datetime-local" className={field} />
      </Field>
      <Field label="Capacity">
        <input
          name="capacity"
          type="number"
          min={1}
          defaultValue={4}
          required
          className={field}
        />
      </Field>
      <Field label="Status">
        <select name="status" defaultValue="SCHEDULED" className={field}>
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
          defaultValue={nextHeatNumber}
          required
          className={field}
        />
      </Field>
      <Field label="Notes">
        <input name="notes" className={field} />
      </Field>
      <label className="mt-7 flex items-center gap-3 text-sm font-bold">
        <input
          name="publicVisible"
          type="checkbox"
          defaultChecked
          className="size-4 accent-orange-500"
        />
        Show publicly
      </label>
      <Feedback state={state} />
      <div className="md:col-span-2">
        <Submit label="Create heat" />
      </div>
    </form>
  );
}

export function GenerateHeatsForm({
  competitionId,
  eventId,
  categories,
  events,
  currentEventDisplayOrder,
  athletes,
  nextHeatNumber,
}: {
  competitionId: number;
  eventId: number;
  categories: CategoryResponse[];
  events: EventResponse[];
  currentEventDisplayOrder: number;
  athletes: AthleteAdminResponse[];
  nextHeatNumber: number;
}) {
  const activeCategories = useMemo(
    () =>
      categories
        .filter((category) => category.active)
        .toSorted(
          (left, right) =>
            left.displayOrder - right.displayOrder ||
            left.name.localeCompare(right.name)
        ),
    [categories]
  );
  const previousEvents = useMemo(
    () =>
      events
        .filter(
          (candidate) =>
            candidate.id !== eventId &&
            candidate.displayOrder < currentEventDisplayOrder
        )
        .toSorted((left, right) => right.displayOrder - left.displayOrder),
    [currentEventDisplayOrder, eventId, events]
  );
  const [seedingMode, setSeedingMode] = useState("RANDOM");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(
    () => new Set(activeCategories.map((category) => category.id))
  );
  const [state, action] = useActionState(
    generateHeatsAction.bind(null, competitionId, eventId),
    { error: null }
  );

  const toggleCategory = (categoryId: number, selected: boolean) => {
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      if (selected) next.add(categoryId);
      else next.delete(categoryId);
      return next;
    });
  };

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <p className="text-sm leading-6 text-slate-400 md:col-span-2">
        Every selected category is generated as its own block. Athletes from
        different categories are never placed in the same heat.
      </p>
      <Field label="Seeding">
        <select
          name="seedingMode"
          value={seedingMode}
          onChange={(event) => setSeedingMode(event.target.value)}
          className={field}
        >
          <option value="RANDOM">Random within each category</option>
          <option value="EVENT_STANDINGS">Previous event standings</option>
          <option value="OVERALL_STANDINGS">Current overall standings</option>
        </select>
      </Field>
      <Field label="Athletes per heat">
        <input
          name="capacity"
          type="number"
          min={1}
          defaultValue={10}
          required
          className={field}
        />
      </Field>
      <Field label="Starting heat number">
        <input
          name="startingHeatNumber"
          type="number"
          min={1}
          defaultValue={nextHeatNumber}
          className={field}
        />
      </Field>
      <Field label="Start-to-start interval (minutes)">
        <input
          name="minutesBetweenHeats"
          type="number"
          min={1}
          defaultValue={15}
          className={field}
        />
      </Field>
      {seedingMode === "RANDOM" ? (
        <Field label="Random seed (optional)">
          <input name="randomSeed" type="number" className={field} />
        </Field>
      ) : seedingMode === "EVENT_STANDINGS" ? (
        <Field label="Source event">
          <select
            name="sourceEventId"
            defaultValue={previousEvents[0]?.id ?? ""}
            required
            className={field}
          >
            <option value="" disabled>
              Choose the completed event
            </option>
            {previousEvents.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.eventCode} · {candidate.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <p className="mt-7 text-sm leading-6 text-slate-400">
          Highest-ranked eligible athletes will be placed in the last heat of
          each category.
        </p>
      )}

      <fieldset className="space-y-3 rounded-xl border border-slate-800 p-4 md:col-span-2">
        <legend className="px-2 text-sm font-black text-slate-200">
          Categories and first start times
        </legend>
        <div className="grid gap-3">
          {activeCategories.map((category) => {
            const athleteCount = athletes.filter(
              (athlete) => athlete.categoryId === category.id
            ).length;
            const selected = selectedCategoryIds.has(category.id);
            return (
              <div
                key={category.id}
                className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.8fr)] sm:items-end"
              >
                <label className="flex items-start gap-3 text-sm font-bold text-slate-200">
                  <input
                    name="categoryId"
                    type="checkbox"
                    value={category.id}
                    checked={selected}
                    onChange={(event) =>
                      toggleCategory(category.id, event.target.checked)
                    }
                    className="mt-1 size-4 accent-orange-500"
                  />
                  <span>
                    {category.name}
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      {athleteCount} eligible athletes
                    </span>
                  </span>
                </label>
                <label className="text-xs font-bold text-slate-400">
                  First heat time
                  <input
                    name={`category-${category.id}-firstHeatTime`}
                    type="datetime-local"
                    disabled={!selected}
                    className={field}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
      <label className="flex items-center gap-3 text-sm font-bold">
        <input
          name="publicVisible"
          type="checkbox"
          defaultChecked
          className="size-4 accent-orange-500"
        />
        Show generated heats publicly
      </label>
      <Feedback state={state} />
      <div className="md:col-span-2">
        <Submit label="Generate category-separated heats" />
      </div>
    </form>
  );
}

export function AssignAthleteForm({
  competitionId,
  eventId,
  heatId,
  athletes,
  nextPosition,
}: {
  competitionId: number;
  eventId: number;
  heatId: number;
  athletes: AthleteAdminResponse[];
  nextPosition: number;
}) {
  const [state, action] = useActionState(
    assignAthleteAction.bind(null, competitionId, eventId, heatId),
    { error: null }
  );
  return (
    <form action={action} className="grid gap-3 md:grid-cols-3">
      <select name="athleteId" required className={field}>
        <option value="">Choose athlete</option>
        {athletes.map((athlete) => (
          <option key={athlete.id} value={athlete.id}>
            {athlete.bibNumber ? `#${athlete.bibNumber} · ` : ""}
            {athlete.fullName} · {athlete.categoryName}
          </option>
        ))}
      </select>
      <input
        aria-label="Lane or station number"
        name="positionNumber"
        type="number"
        min={1}
        defaultValue={nextPosition}
        required
        className={field}
      />
      <div className="mt-2">
        <Submit label="Assign" />
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-300 md:col-span-2">
        <input name="allowCapacityOverride" type="checkbox" />
        Allow capacity override
      </label>
      <Feedback state={state} />
    </form>
  );
}

export function AssignmentPositionForm({
  competitionId,
  eventId,
  assignment,
}: {
  competitionId: number;
  eventId: number;
  assignment: HeatAssignmentResponse;
}) {
  const [state, action] = useActionState(
    updateAssignmentAction.bind(
      null,
      competitionId,
      eventId,
      assignment.id,
      assignment.athleteId
    ),
    { error: null }
  );
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <label className="text-xs text-slate-400">
        Lane / station
        <input
          name="positionNumber"
          type="number"
          min={1}
          defaultValue={assignment.positionNumber}
          required
          className="ml-2 w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
        />
      </label>
      <Submit label="Save position" />
      {state.success && (
        <span className="text-xs text-emerald-300">{state.success}</span>
      )}
      {state.error && <span className="text-xs text-red-300">{state.error}</span>}
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
    <label className="text-sm font-bold text-slate-200">
      {label}
      {children}
    </label>
  );
}

function Feedback({
  state,
}: {
  state: { error: string | null; success?: string | null };
}) {
  if (!state.error && !state.success) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`text-sm font-bold md:col-span-2 ${
        state.error ? "text-red-300" : "text-emerald-300"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-50"
    >
      {pending ? "Working..." : label}
    </button>
  );
}
