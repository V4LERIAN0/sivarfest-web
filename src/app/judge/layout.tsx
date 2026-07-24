import { requireJudgeServer } from "@/features/auth/auth.server";
import { LogoutButton } from "@/features/auth/LogoutButton";
import Link from "next/link";

export default async function JudgeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireJudgeServer();
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/judge" className="text-lg font-black">SIVARFEST Judge</Link>
          <LogoutButton />
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-10">{children}</section>
    </main>
  );
}
