"use server";

import type {
  ScoreType,
  TiebreakType,
} from "@/features/events/events.types";
import { revalidatePath } from "next/cache";
import {
  lockAdminScore,
  publishAdminScore,
  rejectAdminScore,
  reopenAdminScore,
  unlockAdminScore,
  upsertAdminScore,
  validateAdminScore,
} from "./scores.api";
import type {
  ScoreEntryRequest,
  ScoreFormState,
  ScoreLifecycleAction
} from "./scores.types";

const scorePath = (
  competitionId: number,
  eventId: number
) =>
  `/admin/competitions/${competitionId}/events/${eventId}/scores`;

const errorMessage = (
  error: unknown,
  fallback = "The score could not be saved."
) =>
  error instanceof Error
    ? error.message
    : fallback;

export async function upsertScoreAction(
  competitionId: number,
  eventId: number,
  athleteId: number,
  scoreType: ScoreType,
  tiebreakType: TiebreakType,
  _state: ScoreFormState,
  formData: FormData
): Promise<ScoreFormState> {
  try {
    const request = scoreRequest(
      scoreType,
      tiebreakType,
      formData
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
  formData: FormData
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
      error: errorMessage(
        error,
        "The score status could not be updated."
      ),
    };
  }

  revalidatePath(scorePath(competitionId, eventId));

  return {
    error: null,
    success: lifecycleSuccessMessage(transition),
  };
}

function lifecycleReason(formData: FormData) {
  return requiredText(
    formData,
    "reason",
    "A reason is required for this action."
  );
}

function lifecycleSuccessMessage(
  transition: ScoreLifecycleAction
) {
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

function scoreRequest(
  scoreType: ScoreType,
  tiebreakType: TiebreakType,
  formData: FormData
): ScoreEntryRequest {
  const request: ScoreEntryRequest = {
    notes: optionalText(formData, "notes"),
  };

  switch (scoreType) {
    case "FOR_TIME": {
      const completedValue = requiredText(
        formData,
        "completed",
        "Choose whether the athlete finished."
      );

      request.completed = completedValue === "true";

      if (request.completed) {
        request.scoreSeconds = timeInSeconds(
          formData,
          "scoreTime",
          "Completion time"
        );
      } else {
        request.reps = wholeNumber(
          formData,
          "reps",
          "Completed reps"
        );
      }

      break;
    }

    case "AMRAP_REPS":
    case "EMOM_REPS":
      request.reps = wholeNumber(
        formData,
        "reps",
        "Total reps"
      );
      break;

    case "ROUNDS_COMPLETED":
      request.reps = wholeNumber(
        formData,
        "reps",
        "Completed rounds"
      );
      break;

    case "MAX_WEIGHT":
      request.weightValue = decimalNumber(
        formData,
        "weightValue",
        "Weight"
      );
      break;

    case "POINTS":
      request.pointsValue = decimalNumber(
        formData,
        "pointsValue",
        "Points"
      );
      break;

    case "CUSTOM":
      request.customValue = decimalNumber(
        formData,
        "customValue",
        "Custom value"
      );
      break;
  }

  const rawTiebreak = optionalText(formData, "tiebreakValue");

  if (tiebreakType !== "NONE" && rawTiebreak !== undefined) {
    request.tiebreakValue =
      tiebreakType === "TIME"
        ? parseTime(rawTiebreak, "Tiebreak time")
        : parseDecimal(rawTiebreak, "Tiebreak value");
  }

  return request;
}

function optionalText(
  formData: FormData,
  name: string
) {
  const value = formData.get(name)?.toString().trim();
  return value || undefined;
}

function requiredText(
  formData: FormData,
  name: string,
  message: string
) {
  const value = optionalText(formData, name);

  if (value === undefined) {
    throw new Error(message);
  }

  return value;
}

function wholeNumber(
  formData: FormData,
  name: string,
  label: string
) {
  const rawValue = requiredText(
    formData,
    name,
    `${label} are required.`
  );

  const value = Number(rawValue);

  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a non-negative whole number.`
    );
  }

  return value;
}

function decimalNumber(
  formData: FormData,
  name: string,
  label: string
) {
  const rawValue = requiredText(
    formData,
    name,
    `${label} is required.`
  );

  return parseDecimal(rawValue, label);
}

function parseDecimal(
  rawValue: string,
  label: string
) {
  const value = Number(rawValue);

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      `${label} must be a non-negative number.`
    );
  }

  return value;
}

function timeInSeconds(
  formData: FormData,
  name: string,
  label: string
) {
  const rawValue = requiredText(
    formData,
    name,
    `${label} is required.`
  );

  return parseTime(rawValue, label);
}

function parseTime(
  rawValue: string,
  label: string
) {
  if (!/^\d+(?::\d{1,2}){0,2}$/.test(rawValue)) {
    throw new Error(
      `${label} must use seconds, MM:SS, or HH:MM:SS.`
    );
  }

  const parts = rawValue.split(":").map(Number);

  if (parts.length === 1) {
    return parts[0];
  }

  const seconds = parts.at(-1) ?? 0;
  const minutes = parts.at(-2) ?? 0;
  const hours = parts.length === 3 ? parts[0] : 0;

  if (seconds >= 60) {
    throw new Error(
      `${label} seconds must be between 00 and 59.`
    );
  }

  if (parts.length === 3 && minutes >= 60) {
    throw new Error(
      `${label} minutes must be between 00 and 59 when hours are provided.`
    );
  }

  return hours * 3600 + minutes * 60 + seconds;
}