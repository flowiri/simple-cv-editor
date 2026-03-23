export const extractAchievementParts = (text) => {
  const match = String(text || "").match(/^(.*)\(([^()]+)\)\.?$/);
  if (!match) {
    return { body: String(text || ""), date: "" };
  }
  return {
    body: match[1].trim().replace(/[.:;-]\s*$/, ""),
    date: match[2].trim(),
  };
};

export const parseWorkDescription = (description) => {
  const lines = String(description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const result = { customers: "", responsibilities: "", technologies: [] };

  lines.forEach((line) => {
    if (line.startsWith("Customers:")) {
      result.customers = line.replace(/^Customers:\s*/, "").trim();
    } else if (line.startsWith("Responsibilities:")) {
      result.responsibilities = line.replace(/^Responsibilities:\s*/, "").trim();
    } else if (line.startsWith("Technologies:")) {
      result.technologies = line
        .replace(/^Technologies:\s*/, "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  });

  return result;
};

export const parseBulletLines = (text) =>
  String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

export const bulletsToContent = (items) =>
  (items || [])
    .map((item) => (item?.text || "").trim())
    .filter(Boolean)
    .map((text) => `- ${text}`)
    .join("\n");

export const parsePublicationCitation = (citation) => {
  const raw = String(citation || "").trim();
  if (!raw) {
    return { citation: "", title: "", authors: "", venue: "", meta: "", link: "", notes: "" };
  }

  const linkMatch = raw.match(/https?:\/\/\S+/);
  const link = linkMatch ? linkMatch[0].replace(/[.,;]+$/, "") : "";
  const withoutLink = link ? raw.replace(linkMatch[0], "").trim() : raw;

  const monthDateMatch = withoutLink.match(
    /\b(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*[,\s]+\d{4}\b/i
  );
  const yearMatch = withoutLink.match(/\b(19|20)\d{2}\b/);
  const meta = monthDateMatch ? monthDateMatch[0] : yearMatch ? yearMatch[0] : "";

  let authors = "";
  let title = "";
  let venue = "";

  const quotedTitleMatch = withoutLink.match(/[\u201C"]([^"\u201D]+)[\u201D"]/);
  if (quotedTitleMatch) {
    title = quotedTitleMatch[1].trim();
    authors = withoutLink.slice(0, quotedTitleMatch.index).replace(/[.,\s]+$/, "").trim();
    venue = withoutLink.slice(quotedTitleMatch.index + quotedTitleMatch[0].length).replace(/^[.,\s]+/, "").trim();
  } else {
    const yearTitleMatch = withoutLink.match(/^(.*?)\.\s*((?:19|20)\d{2})\.\s*(.*?)\.\s*(.*)$/);
    if (yearTitleMatch) {
      authors = yearTitleMatch[1].trim();
      title = yearTitleMatch[3].trim();
      venue = yearTitleMatch[4].trim();
    } else {
      const segments = withoutLink.split(".").map((part) => part.trim()).filter(Boolean);
      authors = segments[0] || "";
      title = segments[1] || "";
      venue = segments.slice(2).join(". ");
    }
  }

  if (meta && venue) {
    venue = venue.replace(meta, "").replace(/\s{2,}/g, " ").replace(/^[,.\s]+|[,.\s]+$/g, "");
  }

  return { citation: raw, title, authors, venue, meta, link, notes: "" };
};
