"use client";

import { CategoryResponse } from "@/features/categories/categories.types";
import { AthleteAdminResponse, AthleteFormState, AthleteStatus } from "./athletes.types";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

interface Props {
  athlete?: AthleteAdminResponse;
  categories: CategoryResponse[];
  action: (state: AthleteFormState, formData: FormData) => Promise<AthleteFormState>;
  submitLabel: string;
}

const statuses: AthleteStatus[] = ["REGISTERED", "CONFIRMED", "WITHDRAWN", "DISQUALIFIED"];
const field = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2";

export function AthleteForm({ athlete, categories, action, submitLabel }: Props) {
  const available = categories.filter((category) => category.active || category.id === athlete?.categoryId);
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="checkedIn" value={String(athlete?.checkedIn ?? false)} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name"><input name="fullName" defaultValue={athlete?.fullName ?? ""} maxLength={180} required className={field} /></Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={athlete?.categoryId ?? ""} required className={field}>
            <option value="" disabled>Select a category</option>
            {available.map((category) => <option key={category.id} value={category.id}>{category.name}{!category.active ? " (inactive)" : ""}</option>)}
          </select>
        </Field>
      </div>

      {available.length === 0 && <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Create an active category before adding an athlete.</p>}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Email"><input name="email" type="email" defaultValue={athlete?.email ?? ""} maxLength={150} className={field} /></Field>
        <Field label="Phone"><input name="phoneNumber" defaultValue={athlete?.phoneNumber ?? ""} maxLength={40} className={field} /></Field>
        <Field label="Country"><input name="country" defaultValue={athlete?.country ?? ""} maxLength={80} className={field} /></Field>
        <Field label="Gym"><input name="gymName" defaultValue={athlete?.gymName ?? ""} maxLength={150} className={field} /></Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Age"><input name="age" type="number" min={0} defaultValue={athlete?.age ?? ""} className={field} /></Field>
        <Field label="Birthdate"><input name="birthdate" type="date" defaultValue={athlete?.birthdate ?? ""} className={field} /></Field>
        <Field label="Bib number"><input name="bibNumber" defaultValue={athlete?.bibNumber ?? ""} maxLength={30} className={field} /></Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Height (cm)"><input name="height" type="number" min={0} step="0.01" defaultValue={athlete?.height ?? ""} className={field} /></Field>
        <Field label="Weight (kg)"><input name="weight" type="number" min={0} step="0.01" defaultValue={athlete?.weight ?? ""} className={field} /></Field>
      </div>

      <Field label="Profile photo URL"><input name="profilePhotoUrl" type="url" defaultValue={athlete?.profilePhotoUrl ?? ""} className={field} /></Field>
      <Field label="Public bio"><textarea name="publicBio" defaultValue={athlete?.publicBio ?? ""} rows={4} className={field} /></Field>

      <div>
        <Field label="Status">
          <select name="status" defaultValue={athlete?.status ?? "REGISTERED"} className={field}>
            {athlete?.status === "CHECKED_IN" && <option value="CHECKED_IN">CHECKED_IN (legacy)</option>}
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </Field>
      </div>

      {state.error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{state.error}</p>}
      <SubmitButton label={submitLabel} disabled={available.length === 0} />
    </form>
  );
}

function SubmitButton({ label, disabled }: { label: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Saving..." : label}</button>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-sm font-bold text-slate-200">{label}</label>{children}</div>;
}
