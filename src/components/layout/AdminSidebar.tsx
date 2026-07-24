"use client";

import Link from "next/link";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const competitionId = pathname.match(/\/admin\/competitions\/(\d+)/)?.[1];
  const item = "rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white";

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 p-5 text-white">
      <Link href="/admin" className="text-lg font-black">SIVARFEST Admin</Link>
      <nav className="mt-8 flex flex-1 flex-col gap-2 text-sm text-slate-300">
        <Link href="/admin" className={item}>Dashboard</Link>
        <Link href="/admin/competitions" className={item}>Competitions</Link>
        {competitionId && (
          <>
            <div className="my-2 border-t border-slate-800" />
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Current Competition</p>
            <Link href={`/admin/competitions/${competitionId}/settings`} className={item}>Settings</Link>
            <Link href={`/admin/competitions/${competitionId}/categories`} className={item}>Categories</Link>
            <Link href={`/admin/competitions/${competitionId}/athletes`} className={item}>Athletes</Link>
            <Link href={`/admin/competitions/${competitionId}/events`} className={item}>Events</Link>
            <Link href={`/admin/competitions/${competitionId}/judges`} className={item}>Judges</Link>
          </>
        )}
        <Link href="/" className={item}>Public Site</Link>
        <div className="mt-auto border-t border-slate-800 pt-4"><LogoutButton /></div>
      </nav>
    </aside>
  );
}
