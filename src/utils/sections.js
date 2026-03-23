import { createId, createEntryItem, createBulletItem, createPublicationItem, defaultItemForType } from "./cvData.js";
import { extractAchievementParts, parsePublicationCitation } from "./parsers.js";

export { defaultItemForType };

export const getSectionKind = (title, type, sectionTemplate = "") => {
  const explicit = String(sectionTemplate || "").trim().toLowerCase();
  if (explicit) return explicit;

  const normalized = String(title || "").trim().toLowerCase();

  if (type === "bullet-list" && normalized === "professional summary") return "professional-summary";

  if (
    type === "entry-list" &&
    (normalized.includes("academic achievements") ||
      normalized.includes("publications") ||
      normalized.includes("publication") ||
      normalized.includes("research") ||
      normalized.includes("papers"))
  ) {
    return "publications";
  }

  if (
    type === "entry-list" &&
    (normalized.includes("work experience") ||
      normalized.includes("experience") ||
      normalized.includes("employment"))
  ) {
    return "work-experience";
  }

  if (
    type === "entry-list" &&
    (normalized === "education" || normalized.includes("academic background"))
  ) {
    return "education";
  }

  if (
    type === "entry-list" &&
    (normalized.includes("certificate") || normalized.includes("certification"))
  ) {
    return "certificates";
  }

  if (
    type === "bullet-list" &&
    (normalized.includes("achievement") ||
      normalized.includes("award") ||
      normalized.includes("honor"))
  ) {
    return "achievements";
  }

  return "default";
};

export const buildSectionFromTemplate = (templateKey) => {
  if (templateKey === "publications") {
    return {
      id: createId(),
      sectionTemplate: "publications",
      type: "entry-list",
      title: "Academic Publications",
      items: [createPublicationItem()],
    };
  }

  if (templateKey === "certificates") {
    return {
      id: createId(),
      sectionTemplate: "certificates",
      type: "entry-list",
      title: "Certifications",
      items: [
        createEntryItem({
          title: "Certification name",
          meta: "",
        }),
      ],
    };
  }

  if (templateKey === "achievements") {
    return {
      id: createId(),
      sectionTemplate: "achievements",
      type: "bullet-list",
      title: "Achievements",
      items: [{ ...createBulletItem("New achievement"), meta: "MM/YYYY" }],
    };
  }

  if (templateKey === "work-experience") {
    return {
      id: createId(),
      sectionTemplate: "work-experience",
      type: "entry-list",
      title: "Work Experience",
      items: [
        createEntryItem({
          title: "Company name",
          subtitle: "Role title",
          meta: "Start - End",
          tags: "Team / Department",
          customers: "",
          responsibilities: "- First responsibility",
          technologies: "",
        }),
      ],
    };
  }

  if (templateKey === "projects") {
    return {
      id: createId(),
      sectionTemplate: "projects",
      type: "entry-list",
      title: "Projects",
      items: [
        createEntryItem({
          title: "Project name",
          subtitle: "Role or project subtitle",
          meta: "Year or duration",
          tags: "Stack / domain",
          description: "Short project summary, impact, or responsibilities.",
          link: "",
        }),
      ],
    };
  }

  if (templateKey === "custom") {
    return {
      id: createId(),
      sectionTemplate: "custom",
      type: "paragraph",
      title: "Custom",
      content: "",
      items: [],
    };
  }

  return {
    id: createId(),
    sectionTemplate: "custom-section",
    type: "entry-list",
    title: "Custom Section",
    items: [createEntryItem()],
  };
};

export const normalizeSection = (section) => {
  const safeSection =
    section && typeof section === "object"
      ? section
      : { id: createId(), type: "entry-list", title: "Untitled Section", items: [] };

  return {
    id: safeSection.id || createId(),
    type: safeSection.type || "entry-list",
    title: safeSection.title || "Untitled Section",
    sectionTemplate:
      safeSection.sectionTemplate ||
      getSectionKind(safeSection.title || "", safeSection.type || "entry-list"),
    visible: safeSection.visible !== false,
    content: safeSection.content || "",
    items: Array.isArray(safeSection.items) ? safeSection.items : [],
  };
};

export const normalizeAchievementItem = (item) => {
  if (item.meta) return item;
  const parts = extractAchievementParts(item.text || "");
  return { ...item, text: parts.body || item.text || "", meta: parts.date || "" };
};

export const normalizePublicationItem = (item) => {
  if (item.citation) {
    const parsed = parsePublicationCitation(item.citation);
    return {
      ...item,
      title: item.title || parsed.title,
      authors: item.authors || parsed.authors,
      venue: item.venue || parsed.venue,
      meta: item.meta || parsed.meta,
      link: item.link || parsed.link,
      notes: item.notes || parsed.notes,
      citation: item.citation,
    };
  }

  return {
    ...item,
    citation: item.citation || "",
    authors: item.authors || item.subtitle || "",
    venue: item.venue || item.tags || "",
    notes: item.notes || item.description || "",
  };
};

export const normalizeForType = (section, nextType) => {
  if (nextType === "paragraph") {
    return {
      ...section,
      type: nextType,
      content:
        section.content ||
        (section.items || [])
          .map((item) => item.text || item.description || item.title)
          .filter(Boolean)
          .join("\n"),
    };
  }

  return {
    ...section,
    type: nextType,
    items:
      section.items && section.items.length > 0
        ? section.items
        : [defaultItemForType(nextType)],
  };
};
