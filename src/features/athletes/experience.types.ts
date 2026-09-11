import type { AthletePublicResponse } from "./athletes.types";
import type { OverallLeaderboardRow } from "@/features/leaderboards/leaderboards.types";
import type { CheckInStatus, HeatStatus } from "@/features/heats/heats.types";
export interface AthleteSelf {
  id: number;
  fullName: string;
  username: string;
  categoryName: string;
  country: string | null;
  gymName: string | null;
  height: number | null;
  weight: number | null;
  publicBio: string | null;
  profilePhotoUrl: string | null;
  showBodyMetrics: boolean;
}
export interface AthleteHeat {
  assignmentId: number;
  eventId: number;
  eventName: string;
  eventCode: string;
  heatName: string;
  heatNumber: number;
  lane: number;
  scheduledTime: string | null;
  status: HeatStatus;
  checkInStatus: CheckInStatus;
  checkInOpensAt: string | null;
  canCheckIn: boolean;
}
export interface AthleteDashboard {
  profile: AthleteSelf;
  competitionSlug: string;
  competitionName: string;
  timezone: string;
  heats: AthleteHeat[];
  standings: OverallLeaderboardRow | null;
}
export interface AthletePublicProfile {
  athlete: AthletePublicResponse;
  standing: OverallLeaderboardRow | null;
}
