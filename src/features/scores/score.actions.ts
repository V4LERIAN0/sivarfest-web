"use server";

import type { ScoreType, TiebreakType } from "@/features/events/events.types";
import { revalidatePath } from "next/cache";
import {
  getAdminScoreAudit,
  lockAdminScore,
  publishAdminScore,
  rejectAdminScore,
  reopenAdminScore,
  unlockAdminScore,
  upsertAdminScore,
  validateAdminScore,
} from "./scores.api";
import type {
  ScoreAuditState,
  ScoreFormState,
  ScoreLifecycleAction,
} from "./scores.types";
import { buildScoreEntryRequest } from "./score-request";

const scorePath = (competitionId: number, eventId: number) =>
  `/admin/competitions/${competitionId}/events/${eventId}/scores`;

const errorMessage = (
  error: unknown,
  fallback = "The score could not be saved.",
) => (error instanceof Error ? error.message : fallback);

const adminScoreLabels = {
  completionTime: "Completion time",
  completedReps: "Completed reps",
  totalReps: "Total reps",
  completedRounds: "Completed rounds",
  weight: "Weight",
  points: "Points",
  customValue: "Custom value",
  tiebreakTime: "Tiebreak time",
  tiebreakValue: "Tiebreak value",
};

const adminScoreMessages = {
  chooseFinished: "Choose whether the athlete finished.",
  cappedNotAllowed: "This event does not allow capped results.",
  required: (field: string) => `${field} is required.`,
  wholeNumber: (field: string) =>
    `${field} must be a non-negative whole number.`,
  number: (field: string) => `${field} must be a non-negative number.`,
  timeFormat: (field: string) =>
    `${field} must use seconds, MM:SS, or HH:MM:SS.`,
  secondsRange: (field: string) =>
    `${field} seconds must be between 00 and 59.`,
  minutesRange: (field: string) =>
    `${field} minutes must be between 00 and 59 when hours are provided.`,
  exceedsTimeCap: (field: string, cap: string) =>
    `${field} cannot exceed the event time cap (${cap}).`,
};

export async function upsertScoreAction(
  competitionId: number,
  eventId: number,
  athleteId: number,
  scoreType: ScoreType,
  tiebreakType: TiebreakType,
  _state: ScoreFormState,
  formData: FormData,
): Promise<ScoreFormState> {
  try {
    const request = buildScoreEntryRequest(
      {
        scoreType,
        tiebreakType,
      },
      formData,
      adminScoreLabels,
      adminScoreMessages,
    );

    await upsertAdminScore(eventId, athleteId, request);
  } catch (error) {
    return {
      error: errorMessage(error),
    };
  }

  revalidatePath(scorePath(competitionId, eventId));

  return {
    error: null,
    success: "Draft score saved.",
  };
}

export async function transitionScoreAction(
  competitionId: number,
  eventId: number,
  scoreId: number,
  transition: ScoreLifecycleAction,
  _state: ScoreFormState,
  formData: FormData,
): Promise<ScoreFormState> {
  try {
    switch (transition) {
      case "VALIDATE":
        await validateAdminScore(scoreId);
        break;

      case "REJECT":
        await rejectAdminScore(scoreId, {
          reason: lifecycleReason(formData),
        });
        break;

      case "PUBLISH":
        await publishAdminScore(scoreId);
        break;

      case "LOCK":
        await lockAdminScore(scoreId);
        break;

      case "UNLOCK":
        await unlockAdminScore(scoreId, {
          reason: lifecycleReason(formData),
        });
        break;

      case "REOPEN":
        await reopenAdminScore(scoreId, {
          reason: lifecycleReason(formData),
        });
        break;
    }
  } catch (error) {
    return {
      error: errorMessage(error, "The score status could not be updated."),
    };
  }

  revalidatePath(scorePath(competitionId, eventId));

  return {
    error: null,
    success: lifecycleSuccessMessage(transition),
  };
}

export async function getScoreAuditAction(
  scoreId: number,
): Promise<ScoreAuditState> {
  try {
    return {
      entries: await getAdminScoreAudit(scoreId),
      error: null,
    };
  } catch (error) {
    return {
      entries: [],
      error: errorMessage(error, "The score history could not be loaded."),
    };
  }
}

function lifecycleReason(formData: FormData) {
  const reason = formData.get("reason")?.toString().trim();

  if (!reason) {
    throw new Error("A reason is required for this action.");
  }

  return reason;
}

function lifecycleSuccessMessage(transition: ScoreLifecycleAction) {
  switch (transition) {
    case "VALIDATE":
      return "Score validated.";
    case "REJECT":
      return "Score rejected.";
    case "PUBLISH":
      return "Score published.";
    case "LOCK":
      return "Score locked.";
    case "UNLOCK":
      return "Score unlocked.";
    case "REOPEN":
      return "Score reopened as a draft.";
  }
}