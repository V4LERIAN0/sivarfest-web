"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { AthletePublicResponse } from "@/features/athletes/athletes.types";
import type {
  CategoryResponse,
  GenderClassification,
} from "@/features/categories/categories.types";

type AthleteDirectoryProps = {
  athletes: AthletePublicResponse[];
  categories: CategoryResponse[];
  initialLimit?: number;
};

type CategoryGroup = {
  key: string;
  genderClassification: GenderClassification;
  displayOrder: number;
  athletes: AthletePublicResponse[];
};

type DivisionGroup = {
  key: string;
  name: string;
  displayOrder: number;
  categories: CategoryGroup[];
};

function athleteInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");
}

function normalizeDivisionName(value: string) {
  if (/^scaled$/i.test(value)) {
    return "SC";
  }

  if (/^(sc|rx)$/i.test(value)) {
    return value.toUpperCase();
  }

  return value;
}

function divisionName(category: CategoryResponse) {
  const configuredLabel = category.divisionLabel?.trim();

  if (configuredLabel) {
    return normalizeDivisionName(configuredLabel);
  }

  const categoryMatch = category.name.match(/\b(RX|SC|SCALED)\b/i);
  return normalizeDivisionName(categoryMatch?.[1] ?? category.name);
}

function inferGender(categoryName: string): GenderClassification {
  if (/\b(female|women|mujeres|femenin[ao])\b/i.test(categoryName)) {
    return "FEMALE";
  }

  if (/\b(male|men|hombres|masculin[oa])\b/i.test(categoryName)) {
    return "MALE";
  }

  return "OTHER";
}

function sortAthletes(athletes: AthletePublicResponse[]) {
  return [...athletes].sort((first, second) =>
    first.fullName.localeCompare(second.fullName, undefined, {
      sensitivity: "base",
    })
  );
}

function buildGroups(
  athletes: AthletePublicResponse[],
  categories: CategoryResponse[]
) {
  const orderedCategories = [...categories].sort(
    (first, second) => first.displayOrder - second.displayOrder
  );
  const knownCategoryIds = new Set(
    orderedCategories.map((category) => category.id)
  );

  const categoryGroups: CategoryGroup[] = orderedCategories.map((category) => ({
    key: String(category.id),
    genderClassification: category.genderClassification,
    displayOrder: category.displayOrder,
    athletes: sortAthletes(
      athletes.filter((athlete) => athlete.categoryId === category.id)
    ),
  }));

  const fallbackCategories = new Map<string, AthletePublicResponse[]>();

  for (const athlete of athletes) {
    if (knownCategoryIds.has(athlete.categoryId)) {
      continue;
    }

    const groupedAthletes = fallbackCategories.get(athlete.categoryName) ?? [];
    groupedAthletes.push(athlete);
    fallbackCategories.set(athlete.categoryName, groupedAthletes);
  }

  for (const [name, groupedAthletes] of fallbackCategories) {
    categoryGroups.push({
      key: `fallback-${name}`,
      genderClassification: inferGender(name),
      displayOrder: Number.MAX_SAFE_INTEGER,
      athletes: sortAthletes(groupedAthletes),
    });
  }

  const categoryByKey = new Map(categoryGroups.map((group) => [group.key, group]));
  const divisions = new Map<string, DivisionGroup>();

  for (const category of orderedCategories) {
    const name = divisionName(category);
    const key = name.toLocaleLowerCase();
    const current = divisions.get(key) ?? {
      key,
      name,
      displayOrder: category.displayOrder,
      categories: [],
    };

    current.categories.push(categoryByKey.get(String(category.id))!);
    divisions.set(key, current);
  }

  for (const [name] of fallbackCategories) {
    const category = categoryByKey.get(`fallback-${name}`)!;
    const normalizedName = normalizeDivisionName(
      name.match(/\b(RX|SC|SCALED)\b/i)?.[1] ?? name
    );
    const key = normalizedName.toLocaleLowerCase();
    const current = divisions.get(key) ?? {
      key,
      name: normalizedName,
      displayOrder: category.displayOrder,
      categories: [],
    };

    current.categories.push(category);
    divisions.set(key, current);
  }

  return [...divisions.values()]
    .map((division) => ({
      ...division,
      categories: division.categories.sort(
        (first, second) => first.displayOrder - second.displayOrder
      ),
    }))
    .sort((first, second) => first.displayOrder - second.displayOrder);
}

export function AthleteDirectory({
  athletes,
  categories,
  initialLimit,
}: AthleteDirectoryProps) {
  const t = useTranslations("Competitions.publicHome");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set()
  );
  const divisions = buildGroups(athletes, categories);

  function toggleCategory(categoryKey: string) {
    setExpandedCategories((current) => {
      const next = new Set(current);

      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }

      return next;
    });
  }

  if (divisions.length === 0) {
    return (
      <div className="border border-dashed border-white/20 bg-white/[0.025] p-10 text-center sm:p-14">
        <h3 className="sivar-display text-2xl">{t("emptyRosterTitle")}</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/50">
          {t("emptyRosterDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {divisions.map((division) => {
        const divisionAthleteCount = division.categories.reduce(
          (total, category) => total + category.athletes.length,
          0
        );

        return (
          <section
            key={division.key}
            aria-labelledby={`division-${division.key}`}
            className="overflow-hidden border border-white/12 bg-[#0b0b0b]"
          >
            <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.035] px-5 py-4 sm:px-6">
              <h3
                id={`division-${division.key}`}
                className="sivar-display text-4xl text-white"
              >
                {division.name}
              </h3>
              <span className="border border-[#ffd400]/30 bg-[#ffd400]/10 px-2.5 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#ffe45c]">
                {t("athleteCount", { count: divisionAthleteCount })}
              </span>
            </header>

            <div className="grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {division.categories.map((category) => {
                const categoryStateKey = `${division.key}-${category.key}`;
                const isExpandable =
                  initialLimit !== undefined &&
                  category.athletes.length > initialLimit;
                const isExpanded = expandedCategories.has(categoryStateKey);
                const visibleAthletes =
                  isExpandable && !isExpanded
                    ? category.athletes.slice(0, initialLimit)
                    : category.athletes;
                const listId = `athlete-list-${categoryStateKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

                return (
                  <section
                    key={category.key}
                    aria-labelledby={`category-${category.key}`}
                    className="min-w-0"
                  >
                  <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
                    <h4
                      id={`category-${category.key}`}
                      className="text-xs font-black uppercase tracking-[0.14em] text-white/65"
                    >
                      {t(`gender.${category.genderClassification}`)}
                    </h4>
                    <span className="text-xs font-bold text-white/35">
                      {category.athletes.length}
                    </span>
                  </header>

                  {category.athletes.length === 0 ? (
                    <p className="px-4 py-7 text-sm text-white/45 sm:px-5">
                      {t("categoryRosterPending")}
                    </p>
                  ) : (
                    <ul id={listId} className="divide-y divide-white/8">
                      {visibleAthletes.map((athlete) => (
                        <li
                          key={athlete.id}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.035] sm:px-5"
                        >
                          <div
                            role={athlete.profilePhotoUrl ? "img" : undefined}
                            aria-label={
                              athlete.profilePhotoUrl
                                ? t("profilePhoto", { name: athlete.fullName })
                                : undefined
                            }
                            style={
                              athlete.profilePhotoUrl
                                ? {
                                    backgroundImage: `url(${JSON.stringify(
                                      athlete.profilePhotoUrl
                                    )})`,
                                  }
                                : undefined
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 bg-[#171717] bg-cover bg-center text-xs font-black text-[#ffd400]"
                            aria-hidden={!athlete.profilePhotoUrl}
                          >
                            {!athlete.profilePhotoUrl &&
                              athleteInitials(athlete.fullName)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-white sm:text-base">
                              {athlete.fullName}
                            </p>
                            {athlete.gymName && (
                              <p className="mt-0.5 truncate text-xs text-white/45 sm:text-sm">
                                {athlete.gymName}
                              </p>
                            )}
                          </div>

                          {athlete.bibNumber && (
                            <span className="shrink-0 font-mono text-xs font-bold text-white/45">
                              #{athlete.bibNumber}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {isExpandable && (
                    <div className="border-t border-white/10 p-3 sm:p-4">
                      <button
                        type="button"
                        onClick={() => toggleCategory(categoryStateKey)}
                        aria-expanded={isExpanded}
                        aria-controls={listId}
                        className="flex min-h-11 w-full items-center justify-center gap-2 border border-[#ffd400]/35 bg-[#ffd400]/[0.07] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#ffe45c] transition hover:border-[#ffd400]/70 hover:bg-[#ffd400]/[0.12]"
                      >
                        {isExpanded
                          ? t("showFewerAthletes", { count: initialLimit })
                          : t("showAllAthletes", {
                              count: category.athletes.length,
                            })}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  )}
                </section>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
