"use server";

import { revalidatePath } from "next/cache";
import {
  assignAdminJudge,
  createAdminJudge,
  deleteAdminJudge,
  deleteAdminJudgeAssignment,
  updateAdminJudge,
} from "./judges.api";
import { JudgeFormState } from "./judges.types";

const value = (formData: FormData, name: string) =>
  formData.get(name)?.toString().trim() ?? "";
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "The judge operation failed.";
const judgesPath = (competitionId: number) =>
  `/admin/competitions/${competitionId}/judges`;
const heatsPath = (competitionId: number, eventId: number) =>
  `/admin/competitions/${competitionId}/events/${eventId}/heats`;

export async function createJudgeAction(
  competitionId: number,
  _state: JudgeFormState,
  formData: FormData
): Promise<JudgeFormState> {
  try {
    await createAdminJudge(competitionId, {
      fullName: value(formData, "fullName"),
      email: value(formData, "email"),
      password: value(formData, "password"),
      active: formData.get("active") === "on",
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(judgesPath(competitionId));
  return { error: null, success: "Judge created." };
}

export async function updateJudgeAction(
  competitionId: number,
  judgeId: number,
  _state: JudgeFormState,
  formData: FormData
): Promise<JudgeFormState> {
  const password = value(formData, "password");
  try {
    await updateAdminJudge(judgeId, {
      fullName: value(formData, "fullName"),
      email: value(formData, "email"),
      password: password || undefined,
      active: formData.get("active") === "on",
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(judgesPath(competitionId));
  return { error: null, success: "Judge updated." };
}

export async function deleteJudgeAction(
  competitionId: number,
  judgeId: number
) {
  await deleteAdminJudge(judgeId);
  revalidatePath(judgesPath(competitionId));
}

export async function assignJudgeAction(
  competitionId: number,
  eventId: number,
  positionId: number,
  _state: JudgeFormState,
  formData: FormData
): Promise<JudgeFormState> {
  try {
    await assignAdminJudge(positionId, Number(value(formData, "judgeId")));
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath(heatsPath(competitionId, eventId));
  return { error: null, success: "Judge assigned." };
}

export async function removeJudgeAssignmentAction(
  competitionId: number,
  eventId: number,
  assignmentId: number
) {
  await deleteAdminJudgeAssignment(assignmentId);
  revalidatePath(heatsPath(competitionId, eventId));
}
