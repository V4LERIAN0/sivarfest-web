import { requireAthleteServer } from "@/features/auth/auth.server";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicPageFooter } from "@/components/public/PublicPageFooter";
export default async function AthleteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAthleteServer(locale);
  return (
    <main className="sivar-public min-h-screen bg-[#050505] text-[#f2f0eb]">
      <PublicNavbar athleteAccount />
      {children}
      <PublicPageFooter />
    </main>
  );
}
