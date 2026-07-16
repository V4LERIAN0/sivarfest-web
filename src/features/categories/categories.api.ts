import { apiClient } from "@/lib/api-client";
import { CategoryResponse } from "./categories.types";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export async function getPublicCategories() {
  const response = await apiClient.get<CategoryResponse[]>(
    `/public/competitions/${COMPETITION_SLUG}/categories`
  );

  return response.data;
}