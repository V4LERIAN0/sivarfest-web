import { getTranslations } from "next-intl/server";
import { serverApiGet } from "@/lib/server-api-client";
import { ProfileEditor } from "@/features/athletes/ProfileEditor";
import type { AthleteDashboard } from "@/features/athletes/experience.types";
import { Link } from "@/i18n/navigation";
export default async function ProfileEditorPage() {
  const [data, t] = await Promise.all([
    serverApiGet<AthleteDashboard>("/athlete/me"),
    getTranslations("AthleteArea"),
  ]);
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="sivar-kicker">{t("profile")}</p>
          <h1 className="sivar-display mt-3 text-4xl sm:text-5xl">
            {data.profile.fullName}
          </h1>
          <p className="mt-3 text-sm text-white/50">
            {data.profile.categoryName}
          </p>
        </div>
        <Link
          href={`/athletes/${data.profile.id}`}
          className="text-sm font-black text-[#ffd400]"
        >
          {t("publicProfile")} →
        </Link>
      </div>
      <ProfileEditor profile={data.profile} />
    </section>
  );
}
