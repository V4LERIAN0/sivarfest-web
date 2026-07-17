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

export interface AthleteAdminResponse extends AthletePublicResponse {
  competitionName: string;
  userAccountId: number | null;
  email: string | null;
  phoneNumber: string | null;
  age: number | null;
  birthdate: string | null;
  checkedIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteCreateRequest {
  categoryId: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  gymName?: string;
  age?: number;
  birthdate?: string;
  height?: number;
  weight?: number;
  profilePhotoUrl?: string;
  bibNumber?: string;
  status: AthleteStatus;
  checkedIn: boolean;
  publicBio?: string;
}

export type AthleteUpdateRequest = AthleteCreateRequest;

export interface AthleteFormState {
  error: string | null;
}
