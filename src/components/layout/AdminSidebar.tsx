import Link from "next/link";
import { LogoutButton } from "@/features/auth/LogoutButton";

export function AdminSidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 p-5 text-white">
      <Link href="/admin" className="text-lg font-black">
        SIVARFEST Admin
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-2 text-sm text-slate-300">
        <Link
          href="/admin"
          className="rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white"
        >
          Dashboard
        </Link>

        <Link
          href="/admin/competitions"
          className="rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white"
        >
          Competitions
        </Link>

        <div className="my-2 border-t border-slate-800" />

        <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Current Competition
        </p>

        <Link
          href="/admin/competitions/1/settings"
          className="rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white"
        >
          Settings
        </Link>

        <Link
          href="/admin/competitions/1/categories"
          className="rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white"
        >
          Categories
        </Link>

        <Link
          href="/admin/competitions/1/athletes"
          className="rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white"
        >
          Athletes
        </Link>

        <Link
          href="/admin/competitions/1/events"
          className="rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white"
        >
          Events
        </Link>

        <Link
          href="/"
          className="rounded-lg px-3 py-2 hover:bg-slate-900 hover:text-white"
        >
          Public Site
        </Link>

        <div className="mt-auto border-t border-slate-800 pt-4">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}