import { getTranslations } from "next-intl/server";
export default async function AccountLoading() {
  const t = await getTranslations("AthleteArea");
  return (
    <p role="status" className="mx-auto max-w-7xl px-4 py-12 text-white/60">
      {t("loading")}
    </p>
  );
}
