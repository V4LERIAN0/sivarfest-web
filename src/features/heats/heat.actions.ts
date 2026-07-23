"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  assignAdminAthlete,
  cancelAdminHeat,
  createAdminHeat,
  generateAdminHeats,
  removeAdminAssignment,
  updateAdminAssignment,
  updateAdminHeat,
} from "./heats.api";
import {
  HeatCreateRequest,
  HeatFormState,
  HeatStatus,
  HeatUpdateRequest,
} from "./heats.types";

const text = (value: FormDataEntryValue | null) =>
  value?.toString().trim() || undefined;
const numeric = (value: FormDataEntryValue | null) => {
  const valueText = text(value);
  return valueText === undefined ? undefined : Number(valueText);
};
const checked = (formData: FormData, name: string) =>
  formData.get(name) === "on";
const path = (competitionId: number, eventId: number) =>
  `/admin/competitions/${competitionId}/events/${eventId}/heats`;
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "The heat operation failed.";

function heatRequest(formData: FormData): HeatCreateRequest {
  return {
    name: text(formData.get("name")) ?? "",
    heatNumber: numeric(formData.get("heatNumber")) ?? 1,
    scheduledTime: text(formData.get("scheduledTime")),
    status: (formData.get("status") as HeatStatus) ?? "SCHEDULED",
    capacity: numeric(formData.get("capacity")) ?? 1,
    notes: text(formData.get("notes")),
    displayOrder: numeric(formData.get("displayOrder")) ?? 0,
    publicVisible: checked(formData, "publicVisible"),
  };
}

export async function createHeatAction(
  competitionId: number,
  eventId: number,
  _state: HeatFormState,
  formData: FormData
): Promise<HeatFormState> {
  try {
    await createAdminHeat(eventId, heatRequest(formData));
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(path(competitionId, eventId));
  return { error: null, success: "Heat created." };
}

export async function generateHeatsAction(
  competitionId: number,
  eventId: number,
  _state: HeatFormState,
  formData: FormData
): Promise<HeatFormState> {
  try {
    await generateAdminHeats(eventId, {
      categoryId: numeric(formData.get("categoryId")),
      capacity: numeric(formData.get("capacity")) ?? 1,
      startingHeatNumber: numeric(formData.get("startingHeatNumber")),
      firstHeatTime: text(formData.get("firstHeatTime")),
      minutesBetweenHeats: numeric(formData.get("minutesBetweenHeats")),
      publicVisible: checked(formData, "publicVisible"),
      randomSeed: numeric(formData.get("randomSeed")),
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(path(competitionId, eventId));
  return { error: null, success: "Random heats generated." };
}

export async function assignAthleteAction(
  competitionId: number,
  eventId: number,
  heatId: number,
  _state: HeatFormState,
  formData: FormData
): Promise<HeatFormState> {
  try {
    await assignAdminAthlete(heatId, {
      athleteId: numeric(formData.get("athleteId")) ?? 0,
      positionNumber: numeric(formData.get("positionNumber")) ?? 1,
      allowCapacityOverride: checked(formData, "allowCapacityOverride"),
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(path(competitionId, eventId));
  return { error: null, success: "Athlete assigned." };
}

export async function updateAssignmentAction(
  competitionId: number,
  eventId: number,
  assignmentId: number,
  athleteId: number,
  _state: HeatFormState,
  formData: FormData
): Promise<HeatFormState> {
  try {
    await updateAdminAssignment(assignmentId, {
      athleteId,
      positionNumber: numeric(formData.get("positionNumber")) ?? 1,
      allowCapacityOverride: checked(formData, "allowCapacityOverride"),
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(path(competitionId, eventId));
  return { error: null, success: "Position saved." };
}

export async function removeAssignmentAction(
  competitionId: number,
  eventId: number,
  assignmentId: number
) {
  await removeAdminAssignment(assignmentId);
  revalidatePath(path(competitionId, eventId));
}

export async function cancelHeatAction(
  competitionId: number,
  eventId: number,
  heatId: number
) {
  await cancelAdminHeat(heatId);
  revalidatePath(path(competitionId, eventId));
}

export async function updateHeatAction(
  competitionId: number,
  eventId: number,
  heatId: number,
  _state: HeatFormState,
  formData: FormData
): Promise<HeatFormState> {
  const base = heatRequest(formData);
  const request: HeatUpdateRequest = {
    ...base,
    actualStartTime: text(formData.get("actualStartTime")),
    actualEndTime: text(formData.get("actualEndTime")),
    allowCapacityOverride: checked(formData, "allowCapacityOverride"),
  };
  try {
    await updateAdminHeat(heatId, request);
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(path(competitionId, eventId));
  redirect(path(competitionId, eventId));
}
