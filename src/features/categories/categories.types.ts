export type GenderClassification =
  | "MALE"
  | "FEMALE"
  | "MIXED"
  | "OPEN"
  | "OTHER";

export interface CategoryResponse {
  id: number;
  competitionId: number;
  competitionName: string;
  name: string;
  genderClassification: GenderClassification;
  divisionLabel: string | null;
  description: string | null;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}