export type ScoreType =
  | "FOR_TIME"
  | "AMRAP_REPS"
  | "MAX_WEIGHT"
  | "EMOM_REPS"
  | "ROUNDS_COMPLETED"
  | "POINTS"
  | "CUSTOM";

export type RankingDirection = "LOWER_IS_BETTER" | "HIGHER_IS_BETTER";
export type TiebreakType = "NONE" | "TIME" | "REPS" | "WEIGHT" | "POINTS" | "CUSTOM_NUMERIC";
export type WeightUnit = "POUNDS" | "KILOGRAMS";

export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SCORES_PUBLISHED"
  | "SCORES_LOCKED";

export interface EventPublicResponse {
  id: number;
  competitionId: number;
  eventCode: string;
  name: string;
  description: string | null;
  workoutInstructions: string | null;
  movementStandards: string | null;
  scoreType: ScoreType;
  rankingDirection: RankingDirection;
  timeCapSeconds: number | null;
  totalReps: number | null;
  repsPerRound: number | null;
  cappedScoringEnabled: boolean;
  weightUnit: WeightUnit | null;
  tiebreakType: TiebreakType;
  tiebreakLabel: string | null;
  tiebreakInstructions: string | null;
  tiebreakRankingDirection: RankingDirection | null;
  tiebreakWeightUnit: WeightUnit | null;
  tiebreakRequired: boolean;
  displayOrder: number;
  scoreVisible: boolean;
  status: EventStatus;
}

export interface EventResponse extends EventPublicResponse {
  competitionName: string;
  publicVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreateRequest {
  eventCode: string;
  name: string;
  description?: string;
  workoutInstructions?: string;
  movementStandards?: string;
  scoreType: ScoreType;
  rankingDirection: RankingDirection;
  timeCapSeconds?: number;
  totalReps?: number;
  repsPerRound?: number;
  cappedScoringEnabled: boolean;
  weightUnit?: WeightUnit;
  tiebreakType: TiebreakType;
  tiebreakLabel?: string;
  tiebreakInstructions?: string;
  tiebreakRankingDirection?: RankingDirection;
  tiebreakWeightUnit?: WeightUnit;
  tiebreakRequired: boolean;
  displayOrder: number;
  publicVisible: boolean;
  scoreVisible: boolean;
  status: EventStatus;
}

export type EventUpdateRequest = EventCreateRequest;
export interface EventFormState {
  error: string | null;
  values?: EventCreateRequest;
  submissionKey?: number;
}
