import Link from "next/link";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-black tracking-wide text-white">
          SIVARFEST
        </Link>

        <nav className="flex items-center gap-4 text-sm text-neutral-300">
          <Link href="/athletes" className="hover:text-white">
            Athletes
          </Link>
          <Link href="/events" className="hover:text-white">
            Events
          </Link>
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}