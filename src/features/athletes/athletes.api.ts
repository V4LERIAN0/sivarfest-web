import { apiClient } from "@/lib/api-client";
import { AthletePublicResponse } from "./athletes.types";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export async function getPublicAthletes() {
  const response = await apiClient.get<AthletePublicResponse[]>(
    `/public/competitions/${COMPETITION_SLUG}/athletes`
  );

  return response.data;
}