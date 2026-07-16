"use server";

import {
  archiveAdminCompetition,
  createAdminCompetition,
  updateAdminCompetition,
} from "@/features/competitions/competitions.api";
import {
  CompetitionCreateRequest,
  CompetitionStatus,
  RegistrationStatus,
  VisibilityStatus,
} from "@/features/competitions/competitions.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function emptyToUndefined(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();

  if (!text) {
    return undefined;
  }

  return text;
}

function parseNumberOrDefault(value: FormDataEntryValue | null, fallback: number) {
  const text = value?.toString().trim();

  if (!text) {
    return fallback;
  }

  const parsed = Number(text);

  return Number.isNaN(parsed) ? fallback : parsed;
}

function formDataToCompetitionRequest(
  formData: FormData
): CompetitionCreateRequest {
  return {
    name: formData.get("name")?.toString().trim() ?? "",
    slug: emptyToUndefined(formData.get("slug")),
    shortDescription: emptyToUndefined(formData.get("shortDescription")),
    fullDescription: emptyToUndefined(formData.get("fullDescription")),
    locationName: emptyToUndefined(formData.get("locationName")),
    address: emptyToUndefined(formData.get("address")),
    eventDate: emptyToUndefined(formData.get("eventDate")),
    startTime: emptyToUndefined(formData.get("startTime")),
    endTime: emptyToUndefined(formData.get("endTime")),
    registrationStatus:
      (formData.get("registrationStatus")?.toString() as RegistrationStatus) ??
      "CLOSED",
    visibilityStatus:
      (formData.get("visibilityStatus")?.toString() as VisibilityStatus) ??
      "PRIVATE",
    status:
      (formData.get("status")?.toString() as CompetitionStatus) ?? "DRAFT",
    logoImageUrl: emptyToUndefined(formData.get("logoImageUrl")),
    bannerImageUrl: emptyToUndefined(formData.get("bannerImageUrl")),
    checkInOpenMinutesBeforeHeat: parseNumberOrDefault(
      formData.get("checkInOpenMinutesBeforeHeat"),
      10
    ),
  };
}

export async function createCompetitionAction(formData: FormData) {
  const request = formDataToCompetitionRequest(formData);

  await createAdminCompetition(request);

  revalidatePath("/admin");
  revalidatePath("/admin/competitions");

  redirect("/admin/competitions");
}

export async function updateCompetitionAction(
  competitionId: number,
  formData: FormData
) {
  const request = formDataToCompetitionRequest(formData);

  await updateAdminCompetition(competitionId, request);

  revalidatePath("/admin");
  revalidatePath("/admin/competitions");
  revalidatePath(`/admin/competitions/${competitionId}/settings`);

  redirect("/admin/competitions");
}

export async function archiveCompetitionAction(competitionId: number) {
  await archiveAdminCompetition(competitionId);

  revalidatePath("/admin");
  revalidatePath("/admin/competitions");
}