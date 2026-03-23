import { createBlankCv } from "../src/utils/cvData.js";
import { parseBulletLines, parseWorkDescription } from "../src/utils/parsers.js";
import { getSectionKind, normalizeSection } from "../src/utils/sections.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderParagraph(value = "") {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function renderLink(value = "") {
  if (!value) return "";
  const safe = escapeHtml(value);
  return `<a href="${safe}">${safe}</a>`;
}

function renderBulletList(items) {
  if (!items.length) return "";
  return `<ul class="bullet-list">${items.map((item) => `<li>${renderParagraph(item)}</li>`).join("")}</ul>`;
}

function renderGenericEntry(item) {
  return `
    <article class="cv-entry">
      <div class="entry-topline">
        <h3>${renderParagraph(item.title)}</h3>
        ${item.meta ? `<p class="entry-meta cv-date">${escapeHtml(item.meta)}</p>` : ""}
      </div>
      ${item.subtitle || item.tags
        ? `<p class="entry-subtitle">${renderParagraph([item.subtitle, item.tags].filter(Boolean).join(" | "))}</p>`
        : ""}
      ${item.description ? `<p class="entry-description">${renderParagraph(item.description)}</p>` : ""}
    </article>
  `;
}

function renderEducationEntry(item) {
  return `
    <article class="cv-entry education-card">
      <div class="entry-topline">
        <h3>${renderParagraph(item.title)}</h3>
        ${item.meta ? `<p class="entry-meta cv-date">${escapeHtml(item.meta)}</p>` : ""}
      </div>
      ${item.subtitle ? `<p class="entry-subtitle">${renderParagraph(item.subtitle)}</p>` : ""}
      ${item.description ? `<p class="entry-description education-copy">${renderParagraph(item.description)}</p>` : ""}
    </article>
  `;
}

function renderPublicationEntry(item) {
  return `
    <article class="cv-entry publication-card">
      <div class="entry-topline">
        <h3>${renderParagraph(item.title)}</h3>
        ${item.meta ? `<p class="entry-meta cv-date">${escapeHtml(item.meta)}</p>` : ""}
      </div>
      ${item.authors ? `<p class="publication-authors">${renderParagraph(item.authors)}</p>` : ""}
      ${item.venue ? `<p class="publication-venue">${renderParagraph(item.venue)}</p>` : ""}
      ${item.link ? `<p class="publication-link">${renderLink(item.link)}</p>` : ""}
      ${item.notes ? `<p class="publication-notes">${renderParagraph(item.notes)}</p>` : ""}
    </article>
  `;
}

function renderAchievementEntry(item) {
  return `
    <article class="achievement-row">
      <span class="achievement-dot">&#8226;</span>
      <p class="achievement-copy">${renderParagraph(item.text || "")}</p>
      ${item.meta ? `<span class="cv-date">${escapeHtml(item.meta)}</span>` : ""}
    </article>
  `;
}

function renderCertificateEntry(item) {
  return `
    <article class="achievement-row certificate-row">
      <span class="achievement-dot">&#8226;</span>
      <div class="certificate-main">
        <p class="achievement-copy certificate-copy">${renderParagraph(item.title)}</p>
        ${item.subtitle ? `<p class="entry-subtitle">${renderParagraph(item.subtitle)}</p>` : ""}
      </div>
      ${item.meta ? `<span class="cv-date">${escapeHtml(item.meta)}</span>` : ""}
    </article>
  `;
}

function renderWorkEntry(item) {
  const parsed = parseWorkDescription(item.description);
  const customers = item.customers || parsed.customers;
  const responsibilities = item.responsibilities || parsed.responsibilities;
  const technologies = item.technologies
    ? item.technologies.split(",").map((value) => value.trim()).filter(Boolean)
    : parsed.technologies;
  const bullets = parseBulletLines(responsibilities);

  return `
    <article class="cv-entry cv-entry-work">
      <div class="entry-topline">
        <h3>${renderParagraph(item.title)}</h3>
        ${item.meta ? `<p class="entry-meta cv-date">${escapeHtml(item.meta)}</p>` : ""}
      </div>
      ${item.subtitle || item.tags
        ? `<p class="entry-subtitle">${renderParagraph([item.subtitle, item.tags].filter(Boolean).join(" | "))}</p>`
        : ""}
      <div class="work-detail-grid">
        ${customers ? `<p class="work-detail-line"><span>Customers</span>${renderParagraph(customers)}</p>` : ""}
        ${responsibilities
          ? `
            <div class="work-detail-block">
              <div class="work-detail-label">Responsibilities</div>
              ${bullets.length > 1 || /^\s*[-*]\s*/.test(String(responsibilities || ""))
                ? `<ul class="responsibility-list">${bullets.map((bullet) => `<li>${renderParagraph(bullet)}</li>`).join("")}</ul>`
                : `<div class="responsibility-copy">${renderParagraph(responsibilities)}</div>`}
            </div>
          `
          : ""}
      </div>
      ${technologies.length
        ? `<div class="tech-stack">${technologies.map((technology) => `<span class="tech-pill">${escapeHtml(technology)}</span>`).join("")}</div>`
        : ""}
    </article>
  `;
}

function renderProjectEntry(item) {
  const bullets = parseBulletLines(item.description);
  const asBullets = bullets.length > 1 || /^\s*[-*]\s*/.test(String(item.description || ""));

  return `
    <article class="cv-entry">
      <div class="entry-topline">
        <h3>${renderParagraph(item.title)}</h3>
        ${item.meta ? `<p class="entry-meta cv-date">${escapeHtml(item.meta)}</p>` : ""}
      </div>
      ${item.subtitle || item.tags
        ? `<p class="entry-subtitle">${renderParagraph([item.subtitle, item.tags].filter(Boolean).join(" | "))}</p>`
        : ""}
      ${item.description
        ? (asBullets
          ? renderBulletList(bullets)
          : `<p class="entry-description">${renderParagraph(item.description)}</p>`)
        : ""}
      ${item.link ? `<p class="publication-link">${renderLink(item.link)}</p>` : ""}
    </article>
  `;
}

function renderSection(section) {
  const kind = getSectionKind(section.title, section.type, section.sectionTemplate);

  if (kind === "professional-summary") {
    const bullets = parseBulletLines(section.content);
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        ${renderBulletList(bullets)}
      </section>
    `;
  }

  if (kind === "education") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="entry-list education-list">
          ${(section.items || []).map(renderEducationEntry).join("")}
        </div>
      </section>
    `;
  }

  if (kind === "publications") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="entry-list publication-list">
          ${(section.items || []).map(renderPublicationEntry).join("")}
        </div>
      </section>
    `;
  }

  if (kind === "certificates") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="achievement-list certificate-list">
          ${(section.items || []).map(renderCertificateEntry).join("")}
        </div>
      </section>
    `;
  }

  if (kind === "achievements") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="achievement-list">
          ${(section.items || []).filter((item) => (item.text || "").trim()).map(renderAchievementEntry).join("")}
        </div>
      </section>
    `;
  }

  if (kind === "work-experience") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="work-list">
          ${(section.items || []).map(renderWorkEntry).join("")}
        </div>
      </section>
    `;
  }

  if (kind === "projects") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="work-list">
          ${(section.items || []).map(renderProjectEntry).join("")}
        </div>
      </section>
    `;
  }

  if (section.type === "paragraph") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        <p>${renderParagraph(section.content || "")}</p>
      </section>
    `;
  }

  if (section.type === "bullet-list") {
    return `
      <section class="cv-section">
        <h2>${escapeHtml(section.title)}</h2>
        ${renderBulletList((section.items || []).map((item) => item.text || "").filter(Boolean))}
      </section>
    `;
  }

  return `
    <section class="cv-section">
      <h2>${escapeHtml(section.title)}</h2>
      <div class="entry-list">
        ${(section.items || []).map(renderGenericEntry).join("")}
      </div>
    </section>
  `;
}

function buildCss() {
  return `
    @page { size: A4; margin: 15mm 16mm 16mm 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Aptos, "Segoe UI", sans-serif; color: #11212d; background: white; }
    .cv-document { background: white; }
    .cv-header { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1rem; padding-bottom: 0.8rem; border-bottom: 2px solid #d7dee7; }
    .cv-header h1 { margin: 0; font-size: 1.9rem; letter-spacing: 0.02em; }
    .cv-headline { margin: 0.3rem 0 0; color: #0b4f46; font-weight: 700; }
    .contact-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.28rem; font-size: 0.73rem; }
    .contact-list span { font-weight: 700; }
    .contact-list a { color: inherit; text-decoration: none; }
    .cv-section { margin-top: 0.8rem; break-inside: auto; page-break-inside: auto; }
    .cv-section h2 { margin: 0 0 0.45rem; font-size: 0.83rem; letter-spacing: 0.16em; text-transform: uppercase; color: #0f766e; }
    .cv-section p, .cv-section li, .entry-subtitle, .entry-meta, .entry-description, .education-copy, .publication-authors, .publication-venue, .publication-link, .publication-notes, .achievement-copy, .certificate-copy, .work-detail-line, .work-detail-label, .responsibility-list li, .responsibility-copy { font-size: 0.77rem; line-height: 1.5; }
    .bullet-list { margin: 0; padding-left: 1rem; }
    .bullet-list li + li { margin-top: 0.32rem; }
    .entry-list { display: grid; gap: 0.7rem; }
    .work-list { display: grid; gap: 0.5rem; }
    .education-list, .publication-list { gap: 0.7rem; }
    .cv-entry { padding: 0.22rem 0.35rem; break-inside: avoid; page-break-inside: avoid; }
    .entry-topline { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.8rem; }
    .cv-entry h3 { margin: 0; font-size: 0.92rem; }
    .entry-meta, .entry-subtitle { margin: 0; color: #5b6b7d; }
    .entry-description { margin: 0.22rem 0 0; }
    .cv-date { align-self: start; padding: 0; border-radius: 0; background: transparent; color: #0b4f46; font-size: 0.71rem; font-weight: 700; white-space: nowrap; }
    .publication-authors, .publication-venue, .publication-link, .publication-notes { margin: 0.1rem 0 0; }
    .publication-authors { color: #102a43; line-height: 1.45; }
    .publication-venue { color: #486581; font-style: italic; line-height: 1.45; }
    .publication-link a { color: #0b4f46; text-decoration: none; word-break: break-all; font-size: 0.77rem; }
    .publication-notes { color: #243b53; line-height: 1.45; }
    .achievement-list { display: grid; gap: 0.45rem; }
    .achievement-row { display: grid; grid-template-columns: 14px 1fr auto; align-items: start; gap: 0.7rem; padding: 0.28rem 0.45rem; border-radius: 10px; break-inside: avoid; page-break-inside: avoid; }
    .achievement-dot { display: inline-block; width: 14px; color: #0f766e; font-size: 1.1rem; line-height: 1; font-weight: 700; text-align: center; margin-top: 0.05rem; }
    .achievement-copy, .certificate-copy { margin: 0; }
    .publication-card { padding: 0.22rem 0.35rem; margin: 0 -0.35rem; border: 0; border-radius: 10px; background: transparent; }
    .education-card { padding: 0.22rem 0.35rem; margin: 0 -0.35rem; border-radius: 10px; border: 0; background: transparent; }
    .education-copy { color: #243b53; line-height: 1.55; }
    .certificate-list { gap: 0.45rem; }
    .certificate-row { padding: 0.28rem 0.45rem; border-radius: 10px; border: 0; background: transparent; }
    .certificate-main { min-width: 0; }
    .certificate-copy { font-weight: 700; }
    .cv-entry-work { padding: 0.45rem 0.2rem 0.35rem; border-radius: 0; border: 0; border-bottom: 1px solid rgba(15, 118, 110, 0.14); background: transparent; }
    .work-detail-grid { display: grid; gap: 0.32rem; margin-top: 0.45rem; }
    .work-detail-line { margin: 0; }
    .work-detail-line span, .work-detail-label { color: #0b4f46; font-weight: 700; }
    .work-detail-line span { display: inline-block; min-width: 92px; margin-right: 0.4rem; }
    .work-detail-block { display: grid; gap: 0.18rem; margin-top: 0.15rem; }
    .responsibility-list { margin: 0; padding-left: 1.05rem; display: grid; gap: 0.22rem; }
    .responsibility-copy { min-width: 0; line-height: 1.5; }
    .tech-stack { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.55rem; }
    .tech-pill { padding: 0.14rem 0.45rem; border: 1px solid rgba(15, 118, 110, 0.18); border-radius: 999px; background: rgba(15, 118, 110, 0.06); color: #0b4f46; font-size: 0.66rem; line-height: 1.2; }
    .education-card .entry-topline h3, .certificate-copy { color: #102a43; letter-spacing: 0.01em; }
    .publication-card .entry-topline h3 { color: #102a43; letter-spacing: 0.01em; font-size: 0.9rem; font-weight: 700; line-height: 1.35; max-width: 82%; }
    .education-card .entry-topline, .publication-card .entry-topline { align-items: flex-start; }
    .education-card .entry-topline h3 { line-height: 1.35; max-width: 82%; }
    .education-card .entry-subtitle, .certificate-row .entry-subtitle { color: #486581; }
    .education-card .entry-subtitle, .publication-card .entry-subtitle, .education-copy, .publication-authors, .publication-venue, .publication-link, .publication-notes { padding-right: 1.8rem; }
    .education-card .cv-date, .publication-card .cv-date { margin-top: 0.06rem; font-size: 0.78rem; }
    .cv-section h2 { break-after: avoid; page-break-after: avoid; }
  `;
}

export function normalizeCvDocument(inputCv) {
  const seed = createBlankCv();

  return {
    ...seed,
    ...(inputCv && typeof inputCv === "object" ? inputCv : {}),
    id: inputCv?.id || seed.id,
    name: inputCv?.name || seed.name,
    basics: {
      ...seed.basics,
      ...(inputCv?.basics && typeof inputCv.basics === "object" ? inputCv.basics : {}),
    },
    sections: Array.isArray(inputCv?.sections)
      ? inputCv.sections.map(normalizeSection)
      : seed.sections,
  };
}

export function renderCvHtml(inputCv) {
  const cv = normalizeCvDocument(inputCv);
  const visibleSections = (cv.sections || []).filter((section) => section.visible !== false);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(cv.name)}</title>
        <style>${buildCss()}</style>
      </head>
      <body>
        <article class="cv-document">
          <header class="cv-header">
            <div>
              <h1>${escapeHtml(cv.basics.fullName || "")}</h1>
              <p class="cv-headline">${escapeHtml(cv.basics.headline || "")}</p>
            </div>
            <ul class="contact-list">
              ${cv.basics.email ? `<li><span>Email</span> ${escapeHtml(cv.basics.email)}</li>` : ""}
              ${cv.basics.phone ? `<li><span>Phone</span> ${escapeHtml(cv.basics.phone)}</li>` : ""}
              ${cv.basics.website ? `<li><span>Website</span> ${renderLink(cv.basics.website)}</li>` : ""}
              ${cv.basics.linkedin ? `<li><span>LinkedIn</span> ${renderLink(cv.basics.linkedin)}</li>` : ""}
              ${cv.basics.nationality ? `<li><span>Nationality</span> ${escapeHtml(cv.basics.nationality)}</li>` : ""}
              ${cv.basics.dateOfBirth ? `<li><span>Date of Birth</span> ${escapeHtml(cv.basics.dateOfBirth)}</li>` : ""}
            </ul>
          </header>
          ${cv.basics.summary
            ? `<section class="cv-section"><h2>Objective</h2><p>${renderParagraph(cv.basics.summary)}</p></section>`
            : ""}
          ${visibleSections.map(renderSection).join("")}
        </article>
      </body>
    </html>
  `;
}
