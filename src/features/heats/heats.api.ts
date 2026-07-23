import { apiClient } from "@/lib/api-client";
import {
  serverApiDelete,
  serverApiGet,
  serverApiPost,
  serverApiPut,
} from "@/lib/server-api-client";
import {
  GenerateRandomHeatsRequest,
  HeatAssignmentRequest,
  HeatCreateRequest,
  HeatResponse,
  HeatUpdateRequest,
} from "./heats.types";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export function getAdminHeats(eventId: number) {
  return serverApiGet<HeatResponse[]>(`/admin/events/${eventId}/heats`);
}

export function getAdminHeat(heatId: number) {
  return serverApiGet<HeatResponse>(`/admin/heats/${heatId}`);
}

export function createAdminHeat(eventId: number, request: HeatCreateRequest) {
  return serverApiPost<HeatResponse, HeatCreateRequest>(
    `/admin/events/${eventId}/heats`,
    request
  );
}

export function updateAdminHeat(heatId: number, request: HeatUpdateRequest) {
  return serverApiPut<HeatResponse, HeatUpdateRequest>(
    `/admin/heats/${heatId}`,
    request
  );
}

export function cancelAdminHeat(heatId: number) {
  return serverApiDelete(`/admin/heats/${heatId}`);
}

export function assignAdminAthlete(
  heatId: number,
  request: HeatAssignmentRequest
) {
  return serverApiPost<HeatResponse, HeatAssignmentRequest>(
    `/admin/heats/${heatId}/assignments`,
    request
  );
}

export function updateAdminAssignment(
  assignmentId: number,
  request: HeatAssignmentRequest
) {
  return serverApiPut<HeatResponse, HeatAssignmentRequest>(
    `/admin/heat-assignments/${assignmentId}`,
    request
  );
}

export function removeAdminAssignment(assignmentId: number) {
  return serverApiDelete(`/admin/heat-assignments/${assignmentId}`);
}

export function generateAdminHeats(
  eventId: number,
  request: GenerateRandomHeatsRequest
) {
  return serverApiPost<HeatResponse[], GenerateRandomHeatsRequest>(
    `/admin/events/${eventId}/heats/generate-random`,
    request
  );
}

export async function getPublicHeats() {
  const response = await apiClient.get<HeatResponse[]>(
    `/public/competitions/${COMPETITION_SLUG}/heats`
  );
  return response.data;
}
