export type HeatStatus =
  | "SCHEDULED"
  | "CHECK_IN_OPEN"
  | "ON_FLOOR"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELLED";

export type CheckInStatus =
  | "NOT_OPEN"
  | "OPEN"
  | "CHECKED_IN"
  | "MISSED"
  | "MANUAL_CHECKED_IN"
  | "NO_SHOW";

export interface HeatAssignmentResponse {
  id: number;
  athleteId: number;
  athleteName: string;
  bibNumber: string | null;
  categoryId: number;
  categoryName: string;
  positionNumber: number;
  checkInStatus: CheckInStatus;
  checkInTime: string | null;
}

export interface HeatResponse {
  id: number;
  competitionId: number;
  eventId: number;
  eventCode: string;
  eventName: string;
  name: string;
  heatNumber: number;
  scheduledTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  status: HeatStatus;
  capacity: number;
  assignedCount: number;
  notes: string | null;
  displayOrder: number;
  publicVisible: boolean;
  assignments: HeatAssignmentResponse[];
}

export interface HeatCreateRequest {
  name: string;
  heatNumber: number;
  scheduledTime?: string;
  status: HeatStatus;
  capacity: number;
  notes?: string;
  displayOrder: number;
  publicVisible: boolean;
}

export interface HeatUpdateRequest extends HeatCreateRequest {
  actualStartTime?: string;
  actualEndTime?: string;
  allowCapacityOverride: boolean;
}

export interface HeatAssignmentRequest {
  athleteId: number;
  positionNumber: number;
  allowCapacityOverride: boolean;
}

export type HeatSeedingMode =
  | "RANDOM"
  | "EVENT_STANDINGS"
  | "OVERALL_STANDINGS";

export interface HeatCategoryScheduleRequest {
  categoryId: number;
  firstHeatTime?: string;
}

export interface GenerateHeatsRequest {
  seedingMode: HeatSeedingMode;
  categorySchedules: HeatCategoryScheduleRequest[];
  capacity: number;
  startingHeatNumber?: number;
  minutesBetweenHeats: number;
  publicVisible: boolean;
  randomSeed?: number;
  sourceEventId?: number;
}

export interface HeatFormState {
  error: string | null;
  success?: string | null;
}
