import type {
  ScoreType,
  TiebreakType,
} from "@/features/events/events.types";
import type { ScoreEntryRequest } from "./scores.types";

export interface ScoreRequestConfiguration {
  scoreType: ScoreType;
  tiebreakType: TiebreakType;
  timeCapSeconds?: number | null;
  cappedScoringEnabled?: boolean;
  tiebreakRequired?: boolean;
}

export interface ScoreRequestLabels {
  completionTime: string;
  completedReps: string;
  totalReps: string;
  completedRounds: string;
  weight: string;
  points: string;
  customValue: string;
  tiebreakTime: string;
  tiebreakValue: string;
}

export interface ScoreRequestMessages {
  chooseFinished: string;
  cappedNotAllowed: string;
  required: (field: string) => string;
  wholeNumber: (field: string) => string;
  number: (field: string) => string;
  timeFormat: (field: string) => string;
  secondsRange: (field: string) => string;
  minutesRange: (field: string) => string;
  exceedsTimeCap: (field: string, cap: string) => string;
}

export class ScoreRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoreRequestValidationError";
  }
}

export function buildScoreEntryRequest(
  configuration: ScoreRequestConfiguration,
  formData: FormData,
  labels: ScoreRequestLabels,
  messages: ScoreRequestMessages
): ScoreEntryRequest {
  const request: ScoreEntryRequest = {
    notes: optionalText(formData, "notes"),
  };

  switch (configuration.scoreType) {
    case "FOR_TIME": {
      const completedValue = requiredText(
        formData,
        "completed",
        messages.chooseFinished
      );

      if (
        completedValue !== "true" &&
        completedValue !== "false"
      ) {
        throw new ScoreRequestValidationError(
          messages.chooseFinished
        );
      }

      request.completed = completedValue === "true";

      if (request.completed) {
        request.scoreSeconds = timeInSeconds(
          formData,
          "scoreTime",
          labels.completionTime,
          messages
        );

        if (
          configuration.timeCapSeconds !== null &&
          configuration.timeCapSeconds !== undefined &&
          request.scoreSeconds > configuration.timeCapSeconds
        ) {
          throw new ScoreRequestValidationError(
            messages.exceedsTimeCap(
              labels.completionTime,
              formatScoreTime(configuration.timeCapSeconds)
            )
          );
        }
      } else {
        if (configuration.cappedScoringEnabled === false) {
          throw new ScoreRequestValidationError(
            messages.cappedNotAllowed
          );
        }

        request.reps = wholeNumber(
          formData,
          "reps",
          labels.completedReps,
          messages
        );
      }

      break;
    }

    case "AMRAP_REPS":
    case "EMOM_REPS":
      request.reps = wholeNumber(
        formData,
        "reps",
        labels.totalReps,
        messages
      );
      break;

    case "ROUNDS_COMPLETED":
      request.reps = wholeNumber(
        formData,
        "reps",
        labels.completedRounds,
        messages
      );
      break;

    case "MAX_WEIGHT":
      request.weightValue = decimalNumber(
        formData,
        "weightValue",
        labels.weight,
        messages
      );
      break;

    case "POINTS":
      request.pointsValue = decimalNumber(
        formData,
        "pointsValue",
        labels.points,
        messages
      );
      break;

    case "CUSTOM":
      request.customValue = decimalNumber(
        formData,
        "customValue",
        labels.customValue,
        messages
      );
      break;
  }

  const rawTiebreak = optionalText(
    formData,
    "tiebreakValue"
  );

  const tiebreakLabel =
    configuration.tiebreakType === "TIME"
      ? labels.tiebreakTime
      : labels.tiebreakValue;

  if (
    configuration.tiebreakType !== "NONE" &&
    configuration.tiebreakRequired &&
    rawTiebreak === undefined
  ) {
    throw new ScoreRequestValidationError(
      messages.required(tiebreakLabel)
    );
  }

  if (
    configuration.tiebreakType !== "NONE" &&
    rawTiebreak !== undefined
  ) {
    request.tiebreakValue =
      configuration.tiebreakType === "TIME"
        ? parseTime(rawTiebreak, tiebreakLabel, messages)
        : parseDecimal(rawTiebreak, tiebreakLabel, messages);
  }

  return request;
}

export function formatScoreTime(
  value: number | null | undefined
) {
  if (value === null || value === undefined) {
    return "";
  }

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = Math.floor(value % 60);

  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function optionalText(formData: FormData, name: string) {
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
    throw new ScoreRequestValidationError(message);
  }

  return value;
}

function wholeNumber(
  formData: FormData,
  name: string,
  label: string,
  messages: ScoreRequestMessages
) {
  const rawValue = requiredText(
    formData,
    name,
    messages.required(label)
  );

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 0) {
    throw new ScoreRequestValidationError(
      messages.wholeNumber(label)
    );
  }

  return value;
}

function decimalNumber(
  formData: FormData,
  name: string,
  label: string,
  messages: ScoreRequestMessages
) {
  const rawValue = requiredText(
    formData,
    name,
    messages.required(label)
  );

  return parseDecimal(rawValue, label, messages);
}

function parseDecimal(
  rawValue: string,
  label: string,
  messages: ScoreRequestMessages
) {
  const value = Number(rawValue);

  if (!Number.isFinite(value) || value < 0) {
    throw new ScoreRequestValidationError(
      messages.number(label)
    );
  }

  return value;
}

function timeInSeconds(
  formData: FormData,
  name: string,
  label: string,
  messages: ScoreRequestMessages
) {
  const rawValue = requiredText(
    formData,
    name,
    messages.required(label)
  );

  return parseTime(rawValue, label, messages);
}

function parseTime(
  rawValue: string,
  label: string,
  messages: ScoreRequestMessages
) {
  if (!/^\d+(?::\d{1,2}){0,2}$/.test(rawValue)) {
    throw new ScoreRequestValidationError(
      messages.timeFormat(label)
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
    throw new ScoreRequestValidationError(
      messages.secondsRange(label)
    );
  }

  if (parts.length === 3 && minutes >= 60) {
    throw new ScoreRequestValidationError(
      messages.minutesRange(label)
    );
  }

  return hours * 3600 + minutes * 60 + seconds;
}