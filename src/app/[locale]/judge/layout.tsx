import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { requireJudgeServer } from "@/features/auth/auth.server";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { Link } from "@/i18n/navigation";

type JudgeLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export default async function JudgeLayout({
  children,
  params,
}: JudgeLayoutProps) {
  const { locale } = await params;

  await requireJudgeServer(`/${locale}/login`);

  const [commonT, judgingT, authT] = await Promise.all([
    getTranslations("Common"),
    getTranslations("Judging"),
    getTranslations("Auth"),
  ]);

  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-[#f2f0eb]">
      <header className="sticky top-0 z-30 border-b border-white/15 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/judge" className="sivar-display text-2xl sm:text-3xl">
            {commonT("appName")} · {judgingT("layout.role")}
          </Link>

          <div className="flex items-center gap-3">
            <LocaleSwitcher />

            <LogoutButton
              label={authT("signOut")}
              loadingLabel={authT("signingOut")}
              redirectTo={`/${locale}/login`}
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </section>
    </main>
  );
}
