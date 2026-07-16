import { apiClient } from "@/lib/api-client";
import { EventPublicResponse } from "./events.types";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export async function getPublicEvents() {
  const response = await apiClient.get<EventPublicResponse[]>(
    `/public/competitions/${COMPETITION_SLUG}/events`
  );

  return response.data;
}