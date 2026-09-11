import Link from "next/link";
import { serverApiGet } from "@/lib/server-api-client";
import {
  AthleteAccessPanel,
  type AthleteAccess,
} from "@/features/athletes/AthleteAccessPanel";
export default async function AthleteAccessPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  const rows = await serverApiGet<AthleteAccess[]>(
    `/admin/competitions/${competitionId}/athlete-access`,
  );
  return (
    <div>
      <Link
        href={`/admin/competitions/${competitionId}/athletes`}
        className="text-sm text-orange-300"
      >
        ← Atletas
      </Link>
      <h1 className="mt-6 text-3xl font-black">Acceso de atletas</h1>
      <AthleteAccessPanel
        competitionId={Number(competitionId)}
        initial={rows}
      />
    </div>
  );
}
