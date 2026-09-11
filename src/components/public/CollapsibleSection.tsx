"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

/** Native disclosure: keyboard accessible and independently expandable. */
export function CollapsibleSection({
  title,
  children,
  id,
  defaultOpen = false,
  className = "",
  summaryClassName = "",
  categoryId,
}: {
  title: ReactNode;
  children: ReactNode;
  id?: string;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  categoryId?: number;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const query = useSearchParams().toString();
  useEffect(() => {
    let frame = 0;
    function revealLinkedContent() {
      const details = ref.current;
      if (!details) return;
      let hash = "";
      try {
        hash = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = hash ? document.getElementById(hash) : null;
      const matchesCategory =
        categoryId !== undefined &&
        new URLSearchParams(query).get("category") === String(categoryId);
      if ((target && details.contains(target)) || matchesCategory)
        details.open = true;
      if (target === details) {
        frame = requestAnimationFrame(() =>
          details.scrollIntoView({ block: "start", behavior: "instant" }),
        );
      }
    }
    revealLinkedContent();
    window.addEventListener("hashchange", revealLinkedContent);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", revealLinkedContent);
    };
  }, [query, categoryId]);
  return (
    <details
      ref={ref}
      id={id}
      open={defaultOpen || undefined}
      className={`sivar-disclosure scroll-mt-36 border border-white/12 bg-[#0b0b0b] ${className}`}
    >
      <summary
        className={`flex min-h-14 cursor-pointer list-none items-center gap-4 bg-white/[0.025] px-5 py-4 transition hover:bg-white/[0.055] focus-visible:outline-2 focus-visible:outline-[#ffd400] sm:px-6 ${summaryClassName}`}
      >
        <div className="min-w-0 flex-1">{title}</div>
        <ChevronDown
          className="sivar-disclosure-chevron h-5 w-5 shrink-0 text-[#ffd400] transition-transform"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-white/10">{children}</div>
    </details>
  );
}
