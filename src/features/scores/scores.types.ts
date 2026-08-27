import type { UserRole } from "@/features/auth/auth.types";
import type {
  ScoreType,
  TiebreakType,
  WeightUnit,
} from "@/features/events/events.types";

export type ScoreStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "VALIDATED"
  | "REJECTED"
  | "PUBLISHED"
  | "LOCKED";

export type ScoreAuditAction =
  | "CREATED"
  | "UPDATED"
  | "VALIDATED"
  | "REJECTED"
  | "PUBLISHED"
  | "LOCKED"
  | "UNLOCKED"
  | "REOPENED";

export interface ScoreEntryRequest {
  completed?: boolean;
  scoreSeconds?: number;
  reps?: number;
  weightValue?: number;
  pointsValue?: number;
  customValue?: number;
  tiebreakValue?: number;
  notes?: string;
}

export interface ScoreActionRequest {
  reason: string;
}

export interface ScoreResponse {
  id: number;
  competitionId: number;
  eventId: number;
  eventCode: string;
  eventName: string;
  scoreType: ScoreType;
  athleteId: number;
  athleteName: string;
  bibNumber: string | null;
  categoryId: number;
  categoryName: string;
  status: ScoreStatus;
  completed: boolean | null;
  scoreSeconds: number | null;
  reps: number | null;
  weightValue: number | null;
  weightUnit: WeightUnit | null;
  pointsValue: number | null;
  customValue: number | null;
  tiebreakValue: number | null;
  tiebreakType: TiebreakType;
  tiebreakLabel: string | null;
  notes: string | null;
  createdByUserId: number;
  createdByRole: UserRole;
  lastModifiedByUserId: number;
  lastModifiedByRole: UserRole;
  validatedByUserId: number | null;
  validatedAt: string | null;
  publishedByUserId: number | null;
  publishedAt: string | null;
  lockedByUserId: number | null;
  lockedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreAuditResponse {
  id: number;
  action: ScoreAuditAction;
  actorUserId: number;
  actorRole: UserRole;
  previousStatus: ScoreStatus | null;
  newStatus: ScoreStatus;
  scoreSnapshot: string;
  reason: string | null;
  occurredAt: string;
}