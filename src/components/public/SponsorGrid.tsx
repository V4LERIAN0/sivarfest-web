import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { sponsors } from "@/content/sponsors";

type SponsorGridProps = {
  instagramLabel: (name: string) => string;
};

export function SponsorGrid({ instagramLabel }: SponsorGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {sponsors.map((sponsor) => (
        <a
          key={sponsor.name}
          href={sponsor.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={instagramLabel(sponsor.name)}
          className="group overflow-hidden border border-white/12 bg-[#0b0b0b] transition hover:-translate-y-1 hover:border-[#ffd400]/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd400]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[#f2f0eb]">
            <Image
              src={sponsor.logoSrc}
              alt={sponsor.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-4 transition duration-300 group-hover:scale-[1.04] sm:p-5"
            />
          </div>

          <div className="flex min-h-14 items-center justify-between gap-2 px-3 py-3 sm:px-4">
            <span className="text-sm font-black text-white sm:text-base">
              {sponsor.name}
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-[#ffd400] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </a>
      ))}
    </div>
  );
}
