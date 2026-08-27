import type { GenderClassification } from "@/features/categories/categories.types";
import type {
  RankingDirection,
  ScoreType,
  TiebreakType,
  WeightUnit,
} from "@/features/events/events.types";
import type { ScoreStatus } from "@/features/scores/scores.types";

export type LeaderboardStatus =
  | "UNOFFICIAL"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "FINAL";

export interface EventLeaderboardRow {
  rank: number | null;
  placementPoints: number | null;
  tied: boolean;
  athleteId: number;
  athleteName: string;
  bibNumber: string | null;
  country: string | null;
  gymName: string | null;
  categoryId: number;
  categoryName: string;
  scoreId: number | null;
  scoreStatus: ScoreStatus | null;
  scoreType: ScoreType;
  scoreDisplay: string | null;
  completed: boolean | null;
  scoreSeconds: number | null;
  reps: number | null;
  weightValue: number | null;
  weightUnit: WeightUnit | null;
  pointsValue: number | null;
  customValue: number | null;
  tiebreakDisplay: string | null;
  tiebreakValue: number | null;
  tiebreakType: TiebreakType;
}

export interface EventCategoryLeaderboard {
  categoryId: number;
  categoryName: string;
  genderClassification: GenderClassification;
  divisionLabel: string | null;
  active: boolean;
  rows: EventLeaderboardRow[];
}

export interface EventLeaderboardResponse {
  competitionId: number;
  competitionName: string;
  competitionSlug: string;
  eventId: number;
  eventCode: string;
  eventName: string;
  scoreType: ScoreType;
  rankingDirection: RankingDirection;
  weightUnit: WeightUnit | null;
  status: LeaderboardStatus;
  lastUpdatedAt: string | null;
  categories: EventCategoryLeaderboard[];
}

export interface OverallLeaderboardEvent {
  eventId: number;
  eventCode: string;
  eventName: string;
  scoreType: ScoreType;
  weightUnit: WeightUnit | null;
  displayOrder: number;
}

export interface OverallLeaderboardRow {
  rank: number | null;
  tied: boolean;
  athleteId: number;
  athleteName: string;
  bibNumber: string | null;
  country: string | null;
  gymName: string | null;
  categoryId: number;
  categoryName: string;
  totalPoints: number | null;
  scoredEvents: number;
  totalEvents: number;
  eventWins: number;
  topThreePlacements: number;
  mostRecentEventPlacement: number | null;
  eventResults: EventLeaderboardRow[];
}

export interface OverallCategoryLeaderboard {
  categoryId: number;
  categoryName: string;
  genderClassification: GenderClassification;
  divisionLabel: string | null;
  active: boolean;
  rows: OverallLeaderboardRow[];
}

export interface OverallLeaderboardResponse {
  competitionId: number;
  competitionName: string;
  competitionSlug: string;
  status: LeaderboardStatus;
  lastUpdatedAt: string | null;
  events: OverallLeaderboardEvent[];
  categories: OverallCategoryLeaderboard[];
}