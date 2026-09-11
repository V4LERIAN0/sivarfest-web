import { serverApiGet } from "@/lib/server-api-client";
import { AnnouncementManager } from "@/features/announcements/AnnouncementManager";
import type { Announcement } from "@/features/announcements/announcements.types";
export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  const initial = await serverApiGet<Announcement[]>(
    `/admin/competitions/${competitionId}/announcements`,
  );
  return (
    <div>
      <h1 className="text-3xl font-black">Avisos de competencia</h1>
      <AnnouncementManager
        competitionId={Number(competitionId)}
        initial={initial}
      />
    </div>
  );
}
