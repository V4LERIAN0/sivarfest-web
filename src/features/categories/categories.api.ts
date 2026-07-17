import { apiClient } from "@/lib/api-client";
import {
  serverApiDelete,
  serverApiGet,
  serverApiPost,
  serverApiPut,
} from "@/lib/server-api-client";
import {
  CategoryCreateRequest,
  CategoryResponse,
  CategoryUpdateRequest,
} from "./categories.types";

const COMPETITION_SLUG =
  process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export async function getPublicCategories() {
  const response = await apiClient.get<CategoryResponse[]>(
    `/public/competitions/${COMPETITION_SLUG}/categories`
  );

  return response.data;
}

export async function getAdminCategories(competitionId: number) {
  return serverApiGet<CategoryResponse[]>(
    `/admin/competitions/${competitionId}/categories`
  );
}

export async function getAdminCategory(categoryId: number) {
  return serverApiGet<CategoryResponse>(`/admin/categories/${categoryId}`);
}

export async function createAdminCategory(
  competitionId: number,
  request: CategoryCreateRequest
) {
  return serverApiPost<CategoryResponse, CategoryCreateRequest>(
    `/admin/competitions/${competitionId}/categories`,
    request
  );
}

export async function updateAdminCategory(
  categoryId: number,
  request: CategoryUpdateRequest
) {
  return serverApiPut<CategoryResponse, CategoryUpdateRequest>(
    `/admin/categories/${categoryId}`,
    request
  );
}

export async function deactivateAdminCategory(categoryId: number) {
  return serverApiDelete(`/admin/categories/${categoryId}`);
}
