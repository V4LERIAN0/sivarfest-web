"use server";

import {
  createAdminCategory,
  deactivateAdminCategory,
  updateAdminCategory,
} from "./categories.api";
import {
  CategoryCreateRequest,
  GenderClassification,
} from "./categories.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

function formDataToCategoryRequest(formData: FormData): CategoryCreateRequest {
  const parsedOrder = Number(formData.get("displayOrder")?.toString() ?? "0");

  return {
    name: formData.get("name")?.toString().trim() ?? "",
    genderClassification:
      (formData
        .get("genderClassification")
        ?.toString() as GenderClassification) ?? "OPEN",
    divisionLabel: optionalText(formData.get("divisionLabel")),
    description: optionalText(formData.get("description")),
    displayOrder: Number.isFinite(parsedOrder) ? parsedOrder : 0,
    active: formData.get("active") === "on",
  };
}

export async function createCategoryAction(
  competitionId: number,
  formData: FormData
) {
  await createAdminCategory(
    competitionId,
    formDataToCategoryRequest(formData)
  );

  revalidatePath(`/admin/competitions/${competitionId}/categories`);
  redirect(`/admin/competitions/${competitionId}/categories`);
}

export async function updateCategoryAction(
  competitionId: number,
  categoryId: number,
  formData: FormData
) {
  await updateAdminCategory(categoryId, formDataToCategoryRequest(formData));

  revalidatePath(`/admin/competitions/${competitionId}/categories`);
  redirect(`/admin/competitions/${competitionId}/categories`);
}

export async function deactivateCategoryAction(
  competitionId: number,
  categoryId: number
) {
  await deactivateAdminCategory(categoryId);
  revalidatePath(`/admin/competitions/${competitionId}/categories`);
}
