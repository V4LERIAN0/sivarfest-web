export type AthleteStatus =
  | "REGISTERED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "WITHDRAWN"
  | "DISQUALIFIED";

export interface AthletePublicResponse {
  id: number;
  competitionId: number;
  categoryId: number;
  categoryName: string;
  fullName: string;
  country: string | null;
  gymName: string | null;
  height: number | null;
  weight: number | null;
  profilePhotoUrl: string | null;
  bibNumber: string | null;
  status: AthleteStatus;
  publicBio: string | null;
}