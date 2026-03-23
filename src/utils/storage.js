import { STORAGE_KEY } from "../constants/index.js";
import { createSeedCv } from "./cvData.js";
import { bulletsToContent, parseWorkDescription } from "./parsers.js";
import {
  normalizeSection,
  normalizeAchievementItem,
  normalizePublicationItem,
  getSectionKind,
} from "./sections.js";

export { STORAGE_KEY };

export function loadInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedCv();

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return createSeedCv();

    const seed = createSeedCv();
    return {
      id: parsed.id || seed.id,
      name: parsed.name || seed.name,
      basics: {
        ...seed.basics,
        ...(parsed.basics && typeof parsed.basics === "object" ? parsed.basics : {}),
      },
      sections: Array.isArray(parsed.sections)
        ? parsed.sections.map((section) => {
            const normalized = normalizeSection(section);
            const kind = getSectionKind(normalized.title, normalized.type);

            if (kind === "achievements") {
              return { ...normalized, items: normalized.items.map(normalizeAchievementItem) };
            }

            if (kind === "publications") {
              return { ...normalized, items: normalized.items.map(normalizePublicationItem) };
            }

            if (kind === "professional-summary") {
              return {
                ...normalized,
                content: normalized.content || bulletsToContent(normalized.items),
                items: [],
              };
            }

            if (kind === "work-experience") {
              return {
                ...normalized,
                items: normalized.items.map((item) => {
                  const parsedWork = parseWorkDescription(item.description);
                  return {
                    ...item,
                    customers: item.customers || parsedWork.customers,
                    responsibilities: item.responsibilities || parsedWork.responsibilities,
                    technologies:
                      item.technologies ||
                      (parsedWork.technologies.length > 0
                        ? parsedWork.technologies.join(", ")
                        : ""),
                  };
                }),
              };
            }

            return normalized;
          })
        : seed.sections,
    };
  } catch {
    return createSeedCv();
  }
}
