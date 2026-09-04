"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminEvent, hideAdminEvent, updateAdminEvent } from "./events.api";
import { EventCategoryConfigRequest, EventCreateRequest, EventEligibilityMode, EventFormState, EventStatus, RankingDirection, ScoreType, TiebreakType, WeightUnit } from "./events.types";

const text = (value: FormDataEntryValue | null) => value?.toString().trim() || undefined;
const number = (value: FormDataEntryValue | null) => {
  const raw = text(value);
  return raw === undefined ? undefined : Number(raw);
};

function request(formData: FormData): EventCreateRequest {
  const categoryConfigurations: EventCategoryConfigRequest[] = formData
    .getAll("configuredCategoryId")
    .map((value) => Number(value))
    .filter(Number.isFinite)
    .map((categoryId) => ({
      categoryId,
      variantLabel: text(formData.get(`category-${categoryId}-variantLabel`)),
      description: text(formData.get(`category-${categoryId}-description`)),
      workoutInstructions: text(formData.get(`category-${categoryId}-workoutInstructions`)),
      movementStandards: text(formData.get(`category-${categoryId}-movementStandards`)),
      timeCapSeconds: number(formData.get(`category-${categoryId}-timeCapSeconds`)),
      totalReps: number(formData.get(`category-${categoryId}-totalReps`)),
      repsPerRound: number(formData.get(`category-${categoryId}-repsPerRound`)),
      cappedScoringEnabled:
        formData.get(`category-${categoryId}-cappedScoringEnabled`) === "on",
    }));

  return {
    eventCode: text(formData.get("eventCode")) ?? "",
    name: text(formData.get("name")) ?? "",
    description: text(formData.get("description")),
    workoutInstructions: text(formData.get("workoutInstructions")),
    movementStandards: text(formData.get("movementStandards")),
    scoreType: formData.get("scoreType") as ScoreType,
    rankingDirection: formData.get("rankingDirection") as RankingDirection,
    timeCapSeconds: number(formData.get("timeCapSeconds")),
    totalReps: number(formData.get("totalReps")),
    repsPerRound: number(formData.get("repsPerRound")),
    cappedScoringEnabled: formData.get("cappedScoringEnabled") === "on",
    weightUnit: text(formData.get("weightUnit")) as WeightUnit | undefined,
    tiebreakType: (formData.get("tiebreakType") as TiebreakType) ?? "NONE",
    tiebreakLabel: text(formData.get("tiebreakLabel")),
    tiebreakInstructions: text(formData.get("tiebreakInstructions")),
    tiebreakRankingDirection: text(formData.get("tiebreakRankingDirection")) as RankingDirection | undefined,
    tiebreakWeightUnit: text(formData.get("tiebreakWeightUnit")) as WeightUnit | undefined,
    tiebreakRequired: formData.get("tiebreakRequired") === "on",
    displayOrder: number(formData.get("displayOrder")) ?? 0,
    publicVisible: formData.get("publicVisible") === "on",
    scoreVisible: formData.get("scoreVisible") === "on",
    status: (formData.get("status") as EventStatus) ?? "DRAFT",
    eligibilityMode:
      (formData.get("eligibilityMode") as EventEligibilityMode) ??
      "ALL_ACTIVE",
    eligibleAthleteIds: formData
      .getAll("eligibleAthleteIds")
      .map((value) => Number(value))
      .filter(Number.isFinite),
    categoryConfigurations,
  };
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save the event.";
  return /event code.*already|already.*event code/i.test(message)
    ? "That event code is already used in this competition. Please choose a different code."
    : message;
}

export async function createEventAction(competitionId: number, _state: EventFormState, formData: FormData): Promise<EventFormState> {
  const values = request(formData);
  try { await createAdminEvent(competitionId, values); }
  catch (error) { return { error: friendlyError(error), values, submissionKey: Date.now() }; }
  revalidatePath(`/admin/competitions/${competitionId}/events`);
  redirect(`/admin/competitions/${competitionId}/events`);
}

export async function updateEventAction(competitionId: number, eventId: number, _state: EventFormState, formData: FormData): Promise<EventFormState> {
  const values = request(formData);
  try { await updateAdminEvent(eventId, values); }
  catch (error) { return { error: friendlyError(error), values, submissionKey: Date.now() }; }
  revalidatePath(`/admin/competitions/${competitionId}/events`);
  redirect(`/admin/competitions/${competitionId}/events`);
}

export async function hideEventAction(competitionId: number, eventId: number) {
  await hideAdminEvent(eventId);
  revalidatePath(`/admin/competitions/${competitionId}/events`);
}
