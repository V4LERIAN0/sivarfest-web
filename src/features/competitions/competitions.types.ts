export type RegistrationStatus = "CLOSED" | "OPEN" | "WAITLIST" | "FULL";

export type VisibilityStatus = "PRIVATE" | "PUBLIC";

export type CompetitionStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "LIVE"
  | "FINISHED"
  | "ARCHIVED";

export interface CompetitionResponse {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  locationName: string | null;
  address: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  registrationStatus: RegistrationStatus;
  visibilityStatus: VisibilityStatus;
  status: CompetitionStatus;
  logoImageUrl: string | null;
  bannerImageUrl: string | null;
  checkInOpenMinutesBeforeHeat: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionSummaryResponse {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  locationName: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  registrationStatus: RegistrationStatus;
  visibilityStatus: VisibilityStatus;
  status: CompetitionStatus;
  logoImageUrl: string | null;
  bannerImageUrl: string | null;
}

export interface CompetitionCreateRequest {
  name: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  locationName?: string;
  address?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  registrationStatus?: RegistrationStatus;
  visibilityStatus?: VisibilityStatus;
  status?: CompetitionStatus;
  logoImageUrl?: string;
  bannerImageUrl?: string;
  checkInOpenMinutesBeforeHeat?: number;
}

export interface CompetitionUpdateRequest {
  name: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  locationName?: string;
  address?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  registrationStatus?: RegistrationStatus;
  visibilityStatus?: VisibilityStatus;
  status?: CompetitionStatus;
  logoImageUrl?: string;
  bannerImageUrl?: string;
  checkInOpenMinutesBeforeHeat?: number;
}