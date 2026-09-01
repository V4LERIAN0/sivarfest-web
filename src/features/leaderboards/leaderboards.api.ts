import { apiClient } from "@/lib/api-client";
import { serverApiGet } from "@/lib/server-api-client";
import type {
  EventLeaderboardResponse,
  OverallLeaderboardResponse,
} from "./leaderboards.types";
import axios from "axios";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export function getAdminOverallLeaderboardPreview(
  competitionId: number
) {
  return serverApiGet<OverallLeaderboardResponse>(
    `/admin/competitions/${competitionId}/leaderboard/preview`
  );
}

export function getAdminEventLeaderboardPreview(
  competitionId: number,
  eventId: number
) {
  return serverApiGet<EventLeaderboardResponse>(
    `/admin/competitions/${competitionId}/leaderboard/events/${eventId}/preview`
  );
}

export async function getPublicOverallLeaderboard() {
  const response = await apiClient.get<OverallLeaderboardResponse>(
    `/public/competitions/${COMPETITION_SLUG}/leaderboard`
  );

  return response.data;
}

export async function getPublicEventLeaderboard(eventId: number) {
  try {
    const response = await apiClient.get<EventLeaderboardResponse>(
      `/public/competitions/${COMPETITION_SLUG}/leaderboard/events/${eventId}`
    );

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404
    ) {
      return null;
    }

    throw error;
  }
}