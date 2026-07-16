import { apiClient } from "@/lib/api-client";
import {
  serverApiDelete,
  serverApiGet,
  serverApiPost,
  serverApiPut,
} from "@/lib/server-api-client";
import {
  CompetitionCreateRequest,
  CompetitionResponse,
  CompetitionSummaryResponse,
  CompetitionUpdateRequest,
} from "./competitions.types";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export async function getPublicCompetition() {
  const response = await apiClient.get<CompetitionResponse>(
    `/public/competitions/${COMPETITION_SLUG}`
  );

  return response.data;
}

export async function getAdminCompetitions() {
  return serverApiGet<CompetitionSummaryResponse[]>("/admin/competitions");
}

export async function getAdminCompetitionById(competitionId: number) {
  return serverApiGet<CompetitionResponse>(
    `/admin/competitions/${competitionId}`
  );
}

export async function createAdminCompetition(
  request: CompetitionCreateRequest
) {
  return serverApiPost<CompetitionResponse, CompetitionCreateRequest>(
    "/admin/competitions",
    request
  );
}

export async function updateAdminCompetition(
  competitionId: number,
  request: CompetitionUpdateRequest
) {
  return serverApiPut<CompetitionResponse, CompetitionUpdateRequest>(
    `/admin/competitions/${competitionId}`,
    request
  );
}

export async function archiveAdminCompetition(competitionId: number) {
  return serverApiDelete(`/admin/competitions/${competitionId}`);
}