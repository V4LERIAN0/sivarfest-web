import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  CalendarDays,
  Dumbbell,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { AthleteDirectory } from "@/components/public/AthleteDirectory";
import { SponsorGrid } from "@/components/public/SponsorGrid";
import { getPublicAthletes } from "@/features/athletes/athletes.api";
import { getPublicCategories } from "@/features/categories/categories.api";
import { getPublicCompetition } from "@/features/competitions/competitions.api";
import type { RegistrationStatus } from "@/features/competitions/competitions.types";
import { getPublicEvents } from "@/features/events/events.api";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const INSTAGRAM_URL = "https://www.instagram.com/sivarfest5.0/";

const registrationMessageKeys = {
  CLOSED: "registration.CLOSED",
  OPEN: "registration.OPEN",
  WAITLIST: "registration.WAITLIST",
  FULL: "registration.FULL",
} as const satisfies Record<RegistrationStatus, string>;

function daysUntil(eventDate: string | null) {
  if (!eventDate) {
    return null;
  }

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  const eventUtc = Date.parse(`${eventDate}T00:00:00Z`);

  return Math.ceil((eventUtc - todayUtc) / 86_400_000);
}

export default async function HomePage() {
  const [competition, categories, athletes, events, t, format] =
    await Promise.all([
      getPublicCompetition(),
      getPublicCategories(),
      getPublicAthletes(),
      getPublicEvents(),
      getTranslations("Competitions.publicHome"),
      getFormatter(),
    ]);

  const eventDate = competition.eventDate
    ? format.dateTime(new Date(`${competition.eventDate}T00:00:00Z`), {
        dateStyle: "long",
        timeZone: "UTC",
      })
    : t("tba");

  const countdown = daysUntil(competition.eventDate);
  const featuredEvents = [...events]
    .sort((first, second) => first.displayOrder - second.displayOrder)
    .slice(0, 4);

  return (
    <main className="sivar-public min-h-screen overflow-hidden bg-[#050505] text-white">
      <PublicNavbar />

      <section className="relative isolate overflow-hidden border-b border-white/10 sm:min-h-[calc(100svh-5rem)]">
        <Image
          src="/brand/sivarfest-floor-render.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover object-center"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(3,3,3,0.98)_0%,rgba(3,3,3,0.86)_42%,rgba(3,3,3,0.34)_74%,rgba(3,3,3,0.52)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#050505_0%,transparent_28%,rgba(0,0,0,0.18)_100%)]" />
        <div className="sivar-grid absolute inset-0 -z-10 opacity-25" />

        <div className="mx-auto flex max-w-7xl items-start px-4 pb-12 pt-10 sm:min-h-[calc(100svh-5rem)] sm:items-end sm:px-6 sm:pb-16 sm:pt-24 lg:px-8 lg:pb-20">
          <div className="w-full max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-[#ffd400]/50 bg-[#ffd400]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#ffe45c]">
                <span className="h-2 w-2 bg-[#ffd400]" aria-hidden="true" />
                {t(registrationMessageKeys[competition.registrationStatus])}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
                {t("fifthEdition")}
              </span>
            </div>

            <h1 className="flex justify-center sm:block">
              <span className="sr-only">{competition.name}</span>
              <span className="relative block aspect-[942/515] w-[min(82vw,21rem)] overflow-hidden sm:hidden">
                <Image
                  src="/brand/sivarfest-logo.png"
                  alt=""
                  width={1080}
                  height={1080}
                  priority
                  className="absolute left-1/2 top-[-61.36%] h-auto w-[114.65%] max-w-none -translate-x-1/2 drop-shadow-[0_14px_40px_rgba(0,0,0,0.65)]"
                />
              </span>
              <Image
                src="/brand/sivarfest-logo.png"
                alt=""
                width={1080}
                height={1080}
                priority
                className="hidden h-auto w-[min(72vw,31rem)] drop-shadow-[0_14px_40px_rgba(0,0,0,0.65)] sm:block"
              />
            </h1>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sivar-primary-button inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-[0.08em]"
              >
                <AtSign className="h-4 w-4" aria-hidden="true" />
                {t("followInstagram")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <Link
                href="/leaderboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/25 bg-black/40 px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white backdrop-blur transition hover:border-white/60 hover:bg-white/10"
              >
                <Trophy className="h-4 w-4 text-[#ffd400]" aria-hidden="true" />
                {t("viewLeaderboard")}
              </Link>
            </div>

            <dl className="mt-10 grid max-w-4xl gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-3">
              <div className="bg-black/70 p-4 backdrop-blur sm:p-5">
                <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {t("date")}
                </dt>
                <dd className="mt-2 text-base font-bold text-white sm:text-lg">
                  {eventDate}
                </dd>
              </div>

              <div className="bg-black/70 p-4 backdrop-blur sm:p-5">
                <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {t("location")}
                </dt>
                <dd className="mt-2 text-base font-bold text-white sm:text-lg">
                  {competition.locationName ?? t("tba")}
                </dd>
              </div>

              <div className="bg-black/70 p-4 backdrop-blur sm:p-5">
                <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">
                  <Dumbbell className="h-4 w-4" aria-hidden="true" />
                  {t("countdownLabel")}
                </dt>
                <dd className="mt-2 text-base font-bold text-white sm:text-lg">
                  {countdown === null
                    ? t("tba")
                    : countdown > 0
                      ? t("countdown", { days: countdown })
                      : countdown === 0
                        ? t("eventDay")
                        : t("eventFinished")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="sivar-hazard border-y border-black py-3 text-black" aria-hidden="true">
        <div className="sivar-display whitespace-nowrap text-center text-base tracking-[0.16em] sm:text-xl">
          {t("ticker")}
        </div>
      </div>

      <section className="relative border-b border-white/10 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="sivar-kicker">{t("overviewEyebrow")}</p>
          <h2 className="sivar-display sivar-section-title mt-4 max-w-5xl text-5xl text-[#f2f0eb] sm:text-6xl lg:text-7xl">
            {t("overviewTitle")}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-3">
          <article className="sivar-stat-card">
            <CalendarDays className="h-5 w-5 text-[#ffd400]" aria-hidden="true" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              {t("date")}
            </p>
            <p className="sivar-display mt-2 text-3xl">19 · 09 · 26</p>
          </article>

          <article className="sivar-stat-card">
            <Dumbbell className="h-5 w-5 text-[#ffd400]" aria-hidden="true" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              {t("categories")}
            </p>
            <p className="sivar-display mt-2 text-3xl">
              {t("divisionNames")}
            </p>
          </article>

          <article className="sivar-stat-card">
            <Users className="h-5 w-5 text-[#ffd400]" aria-hidden="true" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              {t("athletes")}
            </p>
            <p className="sivar-display mt-2 text-3xl">
              {format.number(athletes.length)}
            </p>
          </article>

        </div>
      </section>

      <section id="athletes" className="border-b border-white/10 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="sivar-kicker">{t("directoryEyebrow")}</p>
              <h2 className="sivar-display sivar-section-title mt-4 text-5xl text-[#f2f0eb] sm:text-6xl">
                {t("directoryTitle")}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
                {t("directoryDescription")}
              </p>
            </div>

          </div>

          <div className="mt-10">
            <AthleteDirectory
              athletes={athletes}
              categories={categories}
              initialLimit={10}
            />
          </div>
        </div>
      </section>

      <section id="events" className="relative border-b border-white/10 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="absolute right-0 top-0 h-64 w-64 bg-[#ff5a00]/10 blur-[100px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="sivar-kicker">{t("eventsEyebrow")}</p>
              <h2 className="sivar-display sivar-section-title mt-4 text-5xl text-[#f2f0eb] sm:text-6xl">
                {t("officialEvents")}
              </h2>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-[#ffd400] transition hover:text-white"
            >
              {t("viewEvents")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {featuredEvents.length === 0 ? (
            <div className="mt-10 border border-dashed border-white/20 bg-white/[0.025] p-10 text-center sm:p-14">
              <Dumbbell className="mx-auto h-8 w-8 text-[#ffd400]" aria-hidden="true" />
              <h3 className="sivar-display mt-5 text-2xl">
                {t("emptyEventsTitle")}
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/50">
                {t("emptyEventsDescription")}
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {featuredEvents.map((event, index) => (
                <article
                  key={event.id}
                  className="sivar-event-card group flex flex-col"
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="sivar-display text-5xl text-white/12 transition group-hover:text-[#ffd400]/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="border border-[#ff5a00]/50 bg-[#ff5a00]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#ff7a2f]">
                      {t("event", { eventCode: event.eventCode })}
                    </span>
                  </div>
                  <h3 className="sivar-display mt-8 text-3xl leading-none text-white sm:text-4xl">
                    {event.name}
                  </h3>
                  {event.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/55 sm:text-base">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-auto flex w-full flex-nowrap justify-end gap-2 pt-8 sm:gap-3">
                    <Link
                      href={`/events#event-${event.id}`}
                      className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap border border-white/20 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.045em] text-white transition hover:border-[#ffd400]/60 hover:text-[#ffd400] sm:flex-none sm:gap-2 sm:px-4 sm:text-sm sm:tracking-[0.07em]"
                    >
                      {t("viewEventDetails")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    {event.scoreVisible && event.status !== "DRAFT" && (
                      <Link
                        href={`/leaderboard/events/${event.id}`}
                        className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap bg-[#ffd400] px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.045em] text-black transition hover:bg-[#ffe45c] sm:flex-none sm:gap-2 sm:px-4 sm:text-sm sm:tracking-[0.07em]"
                      >
                        <Trophy className="h-4 w-4" aria-hidden="true" />
                        {t("viewEventResults")}
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden border border-[#ffd400]/25 bg-[linear-gradient(120deg,rgba(255,212,0,0.12),rgba(255,90,0,0.06)_48%,rgba(255,255,255,0.02))] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <AtSign
            className="absolute -right-8 -top-12 h-56 w-56 text-[#ffd400]/[0.07] sm:h-72 sm:w-72"
            strokeWidth={1}
            aria-hidden="true"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="sivar-kicker">{t("instagramEyebrow")}</p>
              <h2 className="sivar-display sivar-section-title mt-4 max-w-4xl text-5xl text-[#f2f0eb] sm:text-6xl">
                {t("instagramTitle")}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                {t("instagramDescription")}
              </p>
            </div>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sivar-primary-button inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-[0.08em]"
            >
              <AtSign className="h-4 w-4" aria-hidden="true" />
              {t("instagramCta")}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden border border-white/12 bg-[#0b0b0b] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="sivar-kicker">{t("venueEyebrow")}</p>
            <h2 className="sivar-display sivar-section-title mt-4 text-5xl text-[#f2f0eb] sm:text-6xl">
              {t("venueTitle")}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60">
              {t("venueDescription")}
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm font-bold text-white/80">
              <MapPin className="h-5 w-5 text-[#ffd400]" aria-hidden="true" />
              {competition.locationName ?? t("tba")}
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden lg:min-h-[34rem]">
            <Image
              src="/brand/sivarfest-floor-render.jpg"
              alt={t("venueImageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,11,0.75),transparent_35%)] lg:block" />
            <div className="absolute bottom-0 left-0 border-r border-t border-white/15 bg-black/80 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur">
              {t("floorPreview")}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="sivar-kicker">{t("sponsorsEyebrow")}</p>
            <h2 className="sivar-display sivar-section-title mt-4 text-5xl text-[#f2f0eb] sm:text-6xl">
              {t("sponsorsTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              {t("sponsorsDescription")}
            </p>
          </div>

          <div className="mt-10">
            <SponsorGrid
              instagramLabel={(name) => t("sponsorInstagram", { name })}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/sivarfest-logo.png"
              alt="SIVARFEST"
              width={1080}
              height={1080}
              className="h-16 w-16 object-contain"
            />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white">
                SIVARFEST 2026
              </p>
              <p className="mt-1 text-sm text-white/45">{t("footerLine")}</p>
            </div>
          </div>

          <p className="text-sm font-black uppercase tracking-[0.14em] text-white/55">
            {t("footerEdition")}
          </p>
        </div>
      </footer>
    </main>
  );
}
