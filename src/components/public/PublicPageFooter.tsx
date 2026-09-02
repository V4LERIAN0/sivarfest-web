import Image from "next/image";

export function PublicPageFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <Image
          src="/brand/sivarfest-logo.png"
          alt="SIVARFEST"
          width={1080}
          height={1080}
          className="h-12 w-12 object-contain"
        />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white">
            SIVARFEST 2026
          </p>
          <p className="mt-1 text-xs text-white/45">
            19 · 09 · 26 · San Salvador
          </p>
        </div>
      </div>
    </footer>
  );
}
