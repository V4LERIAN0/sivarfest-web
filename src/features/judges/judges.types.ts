export interface JudgeResponse {
  id: number;
  competitionId: number;
  userAccountId: number;
  fullName: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JudgeCreateRequest {
  fullName: string;
  email: string;
  password: string;
  active: boolean;
}

export interface JudgeUpdateRequest {
  fullName: string;
  email: string;
  password?: string;
  active: boolean;
}

export interface JudgeAssignmentResponse {
  id: number;
  judgeId: number;
  judgeName: string;
  judgeEmail: string;
  judgeActive: boolean;
  competitionId: number;
  eventId: number;
  eventCode: string;
  eventName: string;
  heatId: number;
  heatName: string;
  heatNumber: number;
  scheduledTime: string | null;
  heatAssignmentId: number;
  athleteId: number;
  athleteName: string;
  bibNumber: string | null;
  categoryId: number;
  categoryName: string;
  positionNumber: number;
}

export interface JudgeFormState {
  error: string | null;
  success?: string;
}
