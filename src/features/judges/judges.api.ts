import {
  serverApiDelete,
  serverApiGet,
  serverApiPost,
  serverApiPut,
} from "@/lib/server-api-client";
import {
  JudgeAssignmentResponse,
  JudgeCreateRequest,
  JudgeResponse,
  JudgeUpdateRequest,
} from "./judges.types";

export const getAdminJudges = (competitionId: number) =>
  serverApiGet<JudgeResponse[]>(`/admin/competitions/${competitionId}/judges`);

export const createAdminJudge = (
  competitionId: number,
  request: JudgeCreateRequest
) =>
  serverApiPost<JudgeResponse, JudgeCreateRequest>(
    `/admin/competitions/${competitionId}/judges`,
    request
  );

export const updateAdminJudge = (
  judgeId: number,
  request: JudgeUpdateRequest
) =>
  serverApiPut<JudgeResponse, JudgeUpdateRequest>(
    `/admin/judges/${judgeId}`,
    request
  );

export const deleteAdminJudge = (judgeId: number) =>
  serverApiDelete(`/admin/judges/${judgeId}`);

export const getAdminHeatJudgeAssignments = (heatId: number) =>
  serverApiGet<JudgeAssignmentResponse[]>(
    `/admin/heats/${heatId}/judge-assignments`
  );

export const assignAdminJudge = (positionId: number, judgeId: number) =>
  serverApiPost<JudgeAssignmentResponse, { judgeId: number }>(
    `/admin/heat-assignments/${positionId}/judge`,
    { judgeId }
  );

export const deleteAdminJudgeAssignment = (assignmentId: number) =>
  serverApiDelete(`/admin/judge-assignments/${assignmentId}`);

export const getMyJudgeAssignments = () =>
  serverApiGet<JudgeAssignmentResponse[]>("/judge/assignments");
