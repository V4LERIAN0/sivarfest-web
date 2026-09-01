import {
  serverApiGet,
  serverApiGetOrNull,
  serverApiPost,
  serverApiPut,
} from "@/lib/server-api-client";
import type {
  ScoreActionRequest,
  ScoreAuditResponse,
  ScoreEntryRequest,
  ScoreResponse,
} from "./scores.types";

const emptyBody: Record<string, never> = {};

export function getAdminEventScores(eventId: number) {
  return serverApiGet<ScoreResponse[]>(
    `/admin/events/${eventId}/scores`
  );
}

export function getAdminScore(scoreId: number) {
  return serverApiGet<ScoreResponse>(
    `/admin/scores/${scoreId}`
  );
}

export function upsertAdminScore(
  eventId: number,
  athleteId: number,
  request: ScoreEntryRequest
) {
  return serverApiPut<ScoreResponse, ScoreEntryRequest>(
    `/admin/events/${eventId}/athletes/${athleteId}/score`,
    request
  );
}

export function getJudgeAssignmentScore(
  assignmentId: number
) {
  return serverApiGetOrNull<ScoreResponse>(
    `/judge/assignments/${assignmentId}/score`
  );
}

export function upsertJudgeAssignmentScore(
  assignmentId: number,
  request: ScoreEntryRequest
) {
  return serverApiPut<ScoreResponse, ScoreEntryRequest>(
    `/judge/assignments/${assignmentId}/score`,
    request
  );
}

export function validateAdminScore(scoreId: number) {
  return serverApiPost<ScoreResponse, Record<string, never>>(
    `/admin/scores/${scoreId}/validate`,
    emptyBody
  );
}

export function rejectAdminScore(
  scoreId: number,
  request: ScoreActionRequest
) {
  return serverApiPost<ScoreResponse, ScoreActionRequest>(
    `/admin/scores/${scoreId}/reject`,
    request
  );
}

export function publishAdminScore(scoreId: number) {
  return serverApiPost<ScoreResponse, Record<string, never>>(
    `/admin/scores/${scoreId}/publish`,
    emptyBody
  );
}

export function lockAdminScore(scoreId: number) {
  return serverApiPost<ScoreResponse, Record<string, never>>(
    `/admin/scores/${scoreId}/lock`,
    emptyBody
  );
}

export function unlockAdminScore(
  scoreId: number,
  request: ScoreActionRequest
) {
  return serverApiPost<ScoreResponse, ScoreActionRequest>(
    `/admin/scores/${scoreId}/unlock`,
    request
  );
}

export function reopenAdminScore(
  scoreId: number,
  request: ScoreActionRequest
) {
  return serverApiPost<ScoreResponse, ScoreActionRequest>(
    `/admin/scores/${scoreId}/reopen`,
    request
  );
}

export function getAdminScoreAudit(scoreId: number) {
  return serverApiGet<ScoreAuditResponse[]>(
    `/admin/scores/${scoreId}/audit`
  );
}