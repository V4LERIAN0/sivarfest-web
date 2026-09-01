"use server";

import type {
  ScoreType,
  TiebreakType,
} from "@/features/events/events.types";
import type { AppLocale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import {
  buildScoreEntryRequest,
  ScoreRequestValidationError,
} from "./score-request";
import { upsertJudgeAssignmentScore } from "./scores.api";
import type { ScoreFormState } from "./scores.types";

export async function upsertJudgeScoreAction(
  assignmentId: number,
  scoreType: ScoreType,
  tiebreakType: TiebreakType,
  timeCapSeconds: number | null,
  cappedScoringEnabled: boolean,
  tiebreakRequired: boolean,
  locale: AppLocale,
  _state: ScoreFormState,
  formData: FormData
): Promise<ScoreFormState> {
  const t = await getTranslations({
    locale,
    namespace: "Judging.scoreEntry",
  });

  try {
    const request = buildScoreEntryRequest(
      {
        scoreType,
        tiebreakType,
        timeCapSeconds,
        cappedScoringEnabled,
        tiebreakRequired,
      },
      formData,
      {
        completionTime: t("completionTime"),
        completedReps: t("completedReps"),
        totalReps: t("totalReps"),
        completedRounds: t("completedRounds"),
        weight: t("weight"),
        points: t("points"),
        customValue: t("customValue"),
        tiebreakTime: t("tiebreakTime"),
        tiebreakValue: t("tiebreakValue"),
      },
      {
        chooseFinished: t("validation.chooseFinished"),
        cappedNotAllowed: t("validation.cappedNotAllowed"),
        required: (field) =>
          t("validation.required", { field }),
        wholeNumber: (field) =>
          t("validation.wholeNumber", { field }),
        number: (field) =>
          t("validation.number", { field }),
        timeFormat: (field) =>
          t("validation.timeFormat", { field }),
        secondsRange: (field) =>
          t("validation.secondsRange", { field }),
        minutesRange: (field) =>
          t("validation.minutesRange", { field }),
        exceedsTimeCap: (field, cap) =>
          t("validation.exceedsTimeCap", {
            field,
            cap,
          }),
      }
    );

    await upsertJudgeAssignmentScore(
      assignmentId,
      request
    );
  } catch (error) {
    return {
      error:
        error instanceof ScoreRequestValidationError
          ? error.message
          : t("saveError"),
    };
  }

  revalidatePath(`/${locale}/judge`);

  return {
    error: null,
    success: t("submitted"),
  };
}