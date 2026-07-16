export type ScoreType =
  | "FOR_TIME"
  | "AMRAP_REPS"
  | "MAX_WEIGHT"
  | "EMOM_REPS"
  | "POINTS"
  | "CUSTOM";

export type RankingDirection = "LOWER_IS_BETTER" | "HIGHER_IS_BETTER";

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
  displayOrder: number;
  scoreVisible: boolean;
  status: EventStatus;
}