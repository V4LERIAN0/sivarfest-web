"use client";

import type { EventPublicResponse } from "@/features/events/events.types";
import { Clock3, Dumbbell, ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function EventVariationPanel({ event }: { event: EventPublicResponse }) {
  const t = useTranslations("Events.publicList");
  const variations = event.variations ?? [];
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    variations[0]?.categoryId ?? null,
  );
  const selectedVariation =
    variations.find(
      (variation) => variation.categoryId === selectedCategoryId,
    ) ?? variations[0];

  const description = selectedVariation?.description ?? event.description;
  const workoutInstructions =
    selectedVariation?.workoutInstructions ?? event.workoutInstructions;
  const movementStandards =
    selectedVariation?.movementStandards ?? event.movementStandards;
  const timeCapSeconds =
    selectedVariation?.timeCapSeconds ?? event.timeCapSeconds;
  const totalReps = selectedVariation?.totalReps ?? event.totalReps;
  const repsPerRound =
    selectedVariation?.repsPerRound ?? event.repsPerRound;
  let formattedDuration: string | null = null;
  if (timeCapSeconds !== null) {
    const minutes = Math.floor(timeCapSeconds / 60);
    const seconds = timeCapSeconds % 60;
    formattedDuration = minutes === 0
      ? t("seconds", { seconds })
      : seconds === 0
        ? t("minutes", { minutes })
        : t("minutesAndSeconds", { minutes, seconds });
  }

  return (
    <>
      {variations.length > 0 && (
        <section className="mt-7 border-y border-white/10 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ffd400]">
                {t("chooseVariation")}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/45">
                {t("variationHelp")}
              </p>
            </div>
            <div
              role="group"
              aria-label={t("chooseVariation")}
              className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end"
            >
              {variations.map((variation) => {
                const selected =
                  variation.categoryId === selectedVariation?.categoryId;
                return (
                  <button
                    key={variation.categoryId}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedCategoryId(variation.categoryId)}
                    className={`min-h-11 border px-3 py-2 text-xs font-black uppercase tracking-[0.08em] transition sm:px-4 ${
                      selected
                        ? "border-[#ffd400] bg-[#ffd400] text-black"
                        : "border-white/15 bg-white/[0.025] text-white/60 hover:border-[#ffd400]/60 hover:text-[#ffe45c]"
                    }`}
                  >
                    {variation.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {formattedDuration !== null && (
          <span className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1 text-xs font-bold text-white/55">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("timeCap", { duration: formattedDuration })}
          </span>
        )}
        {repsPerRound !== null && (
          <span className="border border-white/15 px-3 py-1 text-xs font-bold text-white/55">
            {t("repsPerRound", { reps: repsPerRound })}
          </span>
        )}
        {totalReps !== null && event.scoreType === "FOR_TIME" && (
          <span className="border border-white/15 px-3 py-1 text-xs font-bold text-white/55">
            {t("totalReps", { reps: totalReps })}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">
          {description}
        </p>
      )}

      {(workoutInstructions || movementStandards) && (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {workoutInstructions && (
            <section className="border border-white/10 bg-black/35 p-5">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffd400]">
                <Dumbbell className="h-4 w-4" aria-hidden="true" />
                {t("workout")}
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70 sm:text-base">
                {workoutInstructions}
              </p>
            </section>
          )}

          {movementStandards && (
            <section className="border border-white/10 bg-black/35 p-5">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffd400]">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                {t("standards")}
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70 sm:text-base">
                {movementStandards}
              </p>
            </section>
          )}
        </div>
      )}
    </>
  );
}
