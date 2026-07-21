import { apiClient } from "@/lib/api-client";
import { serverApiDelete, serverApiGet, serverApiPost, serverApiPut } from "@/lib/server-api-client";
import { EventCreateRequest, EventPublicResponse, EventResponse, EventUpdateRequest } from "./events.types";

const COMPETITION_SLUG = process.env.NEXT_PUBLIC_COMPETITION_SLUG ?? "sivarfest-2026";

export async function getPublicEvents() {
  const response = await apiClient.get<EventPublicResponse[]>(`/public/competitions/${COMPETITION_SLUG}/events`);
  return response.data;
}

export function getAdminEvents(competitionId: number) {
  return serverApiGet<EventResponse[]>(`/admin/competitions/${competitionId}/events`);
}

export function getAdminEvent(eventId: number) {
  return serverApiGet<EventResponse>(`/admin/events/${eventId}`);
}

export function createAdminEvent(competitionId: number, request: EventCreateRequest) {
  return serverApiPost<EventResponse, EventCreateRequest>(`/admin/competitions/${competitionId}/events`, request);
}

export function updateAdminEvent(eventId: number, request: EventUpdateRequest) {
  return serverApiPut<EventResponse, EventUpdateRequest>(`/admin/events/${eventId}`, request);
}

export function hideAdminEvent(eventId: number) {
  return serverApiDelete(`/admin/events/${eventId}`);
}
