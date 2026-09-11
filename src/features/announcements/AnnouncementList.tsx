import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { serverApiGetOrNull } from "@/lib/server-api-client";
import type { Announcement } from "./announcements.types";
export async function AnnouncementList({ path }: { path: string }) {
  const [notices, t] = await Promise.all([
    serverApiGetOrNull<Announcement[]>(path),
    getTranslations("Announcements"),
  ]);
  if (!notices?.length) return null;
  return (
    <section aria-label={t("title")} className="space-y-3">
      {notices.map((n) => (
        <article
          key={n.id}
          className="border-l-2 border-[#ffd400] bg-[#ffd400]/[0.055] p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <Megaphone
              className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd400]"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h2 className="text-base font-black text-[#f2f0eb]">{n.title}</h2>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-white/70">
                {n.message}
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
