import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { requireJudgeServer } from "@/features/auth/auth.server";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { Link } from "@/i18n/navigation";

export default async function JudgeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireJudgeServer();

  const [commonT, judgingT, authT] = await Promise.all([
    getTranslations("Common"),
    getTranslations("Judging"),
    getTranslations("Auth"),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/judge" className="text-lg font-black">
            {commonT("appName")} · {judgingT("layout.role")}
          </Link>

          <div className="flex items-center gap-3">
            <LocaleSwitcher />

            <LogoutButton
              label={authT("signOut")}
              loadingLabel={authT("signingOut")}
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </section>
    </main>
  );
}