import { apiClient } from "@/lib/api-client";
import { serverApiDelete, serverApiGet, serverApiPost, serverApiPut } from "@/lib/server-api-client";
import { AthleteAdminResponse, AthleteCreateRequest, AthletePublicResponse, AthleteUpdateRequest } from "./athletes.types";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export async function getPublicAthletes() {
  const response = await apiClient.get<AthletePublicResponse[]>(
    `/public/competitions/${COMPETITION_SLUG}/athletes`
  );

  return response.data;
}

export async function getAdminAthletes(competitionId: number) {
  return serverApiGet<AthleteAdminResponse[]>(`/admin/competitions/${competitionId}/athletes`);
}

export async function getAdminAthlete(athleteId: number) {
  return serverApiGet<AthleteAdminResponse>(`/admin/athletes/${athleteId}`);
}

export async function createAdminAthlete(competitionId: number, request: AthleteCreateRequest) {
  return serverApiPost<AthleteAdminResponse, AthleteCreateRequest>(`/admin/competitions/${competitionId}/athletes`, request);
}

export async function updateAdminAthlete(athleteId: number, request: AthleteUpdateRequest) {
  return serverApiPut<AthleteAdminResponse, AthleteUpdateRequest>(`/admin/athletes/${athleteId}`, request);
}

export async function withdrawAdminAthlete(athleteId: number) {
  return serverApiDelete(`/admin/athletes/${athleteId}`);
}
