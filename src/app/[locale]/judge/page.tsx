import { AnnouncementList } from "@/features/announcements/AnnouncementList";
import { requireJudgeServer } from "@/features/auth/auth.server";
import { getMyJudgeAssignments } from "@/features/judges/judges.api";
import { getJudgeAssignmentScore } from "@/features/scores/scores.api";
import { JudgeWorkspace } from "@/features/judges/JudgeWorkspace";
export const dynamic = "force-dynamic";
export default async function JudgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireJudgeServer(`/${locale}/login`);
  const assignments = await getMyJudgeAssignments();
  const scores = await Promise.all(
    assignments.map((a) => getJudgeAssignmentScore(a.id)),
  );
  return (
    <>
      <div className="mb-6">
        <AnnouncementList path="/judge/announcements" />
      </div>
      <JudgeWorkspace
        assignments={assignments}
        scores={scores}
        userId={user.id}
      />
    </>
  );
}
