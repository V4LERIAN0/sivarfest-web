"use server";

import { createAdminAthlete, updateAdminAthlete, withdrawAdminAthlete } from "./athletes.api";
import { AthleteCreateRequest, AthleteFormState, AthleteStatus } from "./athletes.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formDataToAthleteRequest(formData: FormData): AthleteCreateRequest {
  return {
    categoryId: Number(formData.get("categoryId")),
    fullName: formData.get("fullName")?.toString().trim() ?? "",
    email: optionalText(formData.get("email")),
    phoneNumber: optionalText(formData.get("phoneNumber")),
    country: optionalText(formData.get("country")),
    gymName: optionalText(formData.get("gymName")),
    age: optionalNumber(formData.get("age")),
    birthdate: optionalText(formData.get("birthdate")),
    height: optionalNumber(formData.get("height")),
    weight: optionalNumber(formData.get("weight")),
    profilePhotoUrl: optionalText(formData.get("profilePhotoUrl")),
    bibNumber: optionalText(formData.get("bibNumber")),
    status: (formData.get("status")?.toString() as AthleteStatus) ?? "REGISTERED",
    checkedIn: formData.get("checkedIn") === "true",
    publicBio: optionalText(formData.get("publicBio")),
  };
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save the athlete.";
  const duplicateBib = message.match(/Bib number '(.+)' is already assigned/i);
  return duplicateBib
    ? `Bib number ${duplicateBib[1]} is already in use. Please choose a different bib.`
    : message;
}

export async function createAthleteAction(competitionId: number, _state: AthleteFormState, formData: FormData): Promise<AthleteFormState> {
  try {
    await createAdminAthlete(competitionId, formDataToAthleteRequest(formData));
  } catch (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath(`/admin/competitions/${competitionId}/athletes`);
  redirect(`/admin/competitions/${competitionId}/athletes`);
}

export async function updateAthleteAction(competitionId: number, athleteId: number, _state: AthleteFormState, formData: FormData): Promise<AthleteFormState> {
  try {
    await updateAdminAthlete(athleteId, formDataToAthleteRequest(formData));
  } catch (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath(`/admin/competitions/${competitionId}/athletes`);
  redirect(`/admin/competitions/${competitionId}/athletes`);
}

export async function withdrawAthleteAction(competitionId: number, athleteId: number) {
  await withdrawAdminAthlete(athleteId);
  revalidatePath(`/admin/competitions/${competitionId}/athletes`);
}
