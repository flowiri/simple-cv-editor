import { getSectionKind } from "../../utils/sections.js";
import { extractAchievementParts, parseBulletLines, parseWorkDescription } from "../../utils/parsers.js";
import { renderFormattedInline, renderFormattedParagraph } from "../../utils/formatting.jsx";

export function PreviewSection({
  section,
  onSectionClick,
  onItemClick,
  itemsOverride,
  showTitle = true,
}) {
  const sectionKind = getSectionKind(section.title, section.type, section.sectionTemplate);
  const sectionItems = itemsOverride || section.items || [];
  const titleNode = showTitle
    ? <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
    : null;

  const renderEducationItem = (item) => (
    <article
      key={item.id}
      className="cv-entry education-card preview-clickable"
      onClick={() => onItemClick(item.id)}
    >
      <div className="entry-topline">
        <h3>{renderFormattedInline(item.title, `${item.id}-title`)}</h3>
        {item.meta ? <p className="entry-meta cv-date">{item.meta}</p> : null}
      </div>
      {item.subtitle ? (
        <p className="entry-subtitle">{renderFormattedInline(item.subtitle, `${item.id}-subtitle`)}</p>
      ) : null}
      {item.description ? (
        <p className="entry-description education-copy">{renderFormattedParagraph(item.description, `${item.id}-desc`)}</p>
      ) : null}
    </article>
  );

  const renderCertificateItem = (item) => (
    <article
      key={item.id}
      className="achievement-row certificate-row preview-clickable"
      onClick={() => onItemClick(item.id)}
    >
      <span className="achievement-dot" aria-hidden="true" />
      <div className="certificate-main">
        <p className="achievement-copy certificate-copy">
          {renderFormattedInline(item.title, `${item.id}-title`)}
        </p>
        {item.subtitle ? (
          <p className="entry-subtitle">{renderFormattedInline(item.subtitle, `${item.id}-subtitle`)}</p>
        ) : null}
      </div>
      {item.meta ? <span className="cv-date">{item.meta}</span> : null}
    </article>
  );

  const renderPublicationItem = (item) => (
    <article
      key={item.id}
      className="cv-entry publication-card preview-clickable"
      onClick={() => onItemClick(item.id)}
    >
      <div className="entry-topline">
        <h3>{renderFormattedInline(item.title, `${item.id}-title`)}</h3>
        {item.meta ? <span className="cv-date">{item.meta}</span> : null}
      </div>
      {item.authors ? (
        <p className="publication-authors">
          {renderFormattedInline(item.authors, `${item.id}-authors`)}
        </p>
      ) : null}
      {item.venue ? (
        <p className="publication-venue">
          {renderFormattedParagraph(item.venue, `${item.id}-venue`)}
        </p>
      ) : null}
      {item.link ? (
        <p className="publication-link">
          <a href={item.link} target="_blank" rel="noreferrer">
            {item.link}
          </a>
        </p>
      ) : null}
      {item.notes ? (
        <p className="publication-notes">
          {renderFormattedParagraph(item.notes, `${item.id}-notes`)}
        </p>
      ) : null}
    </article>
  );

  const renderAchievementItem = (item) => {
    const body = item.text || "";
    const date = item.meta || extractAchievementParts(item.text).date;
    return (
      <article
        key={item.id}
        className="achievement-row preview-clickable"
        onClick={() => onItemClick(item.id)}
      >
        <span className="achievement-dot" aria-hidden="true" />
        <p className="achievement-copy">
          {renderFormattedInline(body, `${item.id}-achievement`)}
        </p>
        {date ? <span className="cv-date">{date}</span> : null}
      </article>
    );
  };

  const renderWorkItem = (item) => {
    const parsed = parseWorkDescription(item.description);
    const customers = item.customers || parsed.customers;
    const responsibilities = item.responsibilities || parsed.responsibilities;
    const technologies = item.technologies
      ? item.technologies.split(",").map((v) => v.trim()).filter(Boolean)
      : parsed.technologies;
    const bullets = parseBulletLines(responsibilities);

    return (
      <article
        key={item.id}
        className="cv-entry cv-entry-work preview-clickable"
        onClick={() => onItemClick(item.id)}
      >
        <div className="entry-topline">
          <h3>{item.title}</h3>
          {item.meta ? <p className="entry-meta cv-date">{item.meta}</p> : null}
        </div>
        {item.subtitle || item.tags ? (
          <p className="entry-subtitle">
            {renderFormattedInline(
              [item.subtitle, item.tags].filter(Boolean).join(" | "),
              `${item.id}-subtitle`
            )}
          </p>
        ) : null}

        <div className="work-detail-grid">
          {customers ? (
            <p className="work-detail-line">
              <span>Customers</span>
              {renderFormattedInline(customers, `${item.id}-customers`)}
            </p>
          ) : null}
          {responsibilities ? (
            <div className="work-detail-block">
              <div className="work-detail-label">Responsibilities</div>
              {bullets.length > 1 || /^\s*[-*]\s*/.test(String(responsibilities || "")) ? (
                <ul className="responsibility-list">
                  {bullets.map((bullet, bulletIndex) => (
                    <li key={`${item.id}-bullet-${bulletIndex}`}>
                      {renderFormattedInline(bullet, `${item.id}-responsibility-${bulletIndex}`)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="responsibility-copy">
                  {renderFormattedInline(responsibilities, `${item.id}-responsibilities`)}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {technologies.length > 0 ? (
          <div className="tech-stack">
            {technologies.map((technology) => (
              <span key={`${item.id}-${technology}`} className="tech-pill">
                {technology}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    );
  };

  const renderProjectItem = (item) => {
    const bullets = parseBulletLines(item.description);
    const asBullets = bullets.length > 1 || /^\s*[-*]\s*/.test(String(item.description || ""));
    return (
      <article
        key={item.id}
        className="cv-entry preview-clickable"
        onClick={() => onItemClick(item.id)}
      >
        <div className="entry-topline">
          <h3>{renderFormattedInline(item.title, `${item.id}-title`)}</h3>
          {item.meta ? <p className="entry-meta cv-date">{item.meta}</p> : null}
        </div>
        {item.subtitle || item.tags ? (
          <p className="entry-subtitle">
            {renderFormattedInline(
              [item.subtitle, item.tags].filter(Boolean).join(" | "),
              `${item.id}-subtitle`
            )}
          </p>
        ) : null}
        {item.description ? (
          asBullets ? (
            <ul className="bullet-list">
              {bullets.map((bullet, i) => (
                <li key={`${item.id}-desc-${i}`}>
                  {renderFormattedInline(bullet, `${item.id}-desc-${i}`)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="entry-description">
              {renderFormattedParagraph(item.description, `${item.id}-desc`)}
            </p>
          )
        ) : null}
        {item.link ? (
          <p className="publication-link">
            <a href={item.link} target="_blank" rel="noreferrer">{item.link}</a>
          </p>
        ) : null}
      </article>
    );
  };

  const renderGenericItem = (item) => (
    <article
      key={item.id}
      className="cv-entry preview-clickable"
      onClick={() => onItemClick(item.id)}
    >
      <div className="entry-topline">
        <h3>{renderFormattedInline(item.title, `${item.id}-title`)}</h3>
        {item.meta ? <p className="entry-meta cv-date">{item.meta}</p> : null}
      </div>
      {item.subtitle || item.tags ? (
        <p className="entry-subtitle">
          {renderFormattedInline(
            [item.subtitle, item.tags].filter(Boolean).join(" | "),
            `${item.id}-subtitle`
          )}
        </p>
      ) : null}
      {item.description ? (
        <p className="entry-description">
          {renderFormattedParagraph(item.description, `${item.id}-description`)}
        </p>
      ) : null}
    </article>
  );

  if (sectionKind === "professional-summary") {
    const bullets = parseBulletLines(section.content);
    return (
      <section className="cv-section">
        {titleNode}
        <ul className="bullet-list">
          {bullets.map((bullet, index) => (
            <li
              key={`${section.id}-summary-${index}`}
              className="preview-clickable"
              onClick={() => onSectionClick()}
            >
              {renderFormattedInline(bullet, `${section.id}-summary-${index}`)}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (sectionKind === "education") {
    if (!showTitle && sectionItems.length === 1) return renderEducationItem(sectionItems[0]);
    return (
      <section className="cv-section">
        {titleNode}
        <div className="entry-list education-list">
          {sectionItems.map(renderEducationItem)}
        </div>
      </section>
    );
  }

  if (sectionKind === "certificates") {
    if (!showTitle && sectionItems.length === 1) return renderCertificateItem(sectionItems[0]);
    return (
      <section className="cv-section">
        {titleNode}
        <div className="achievement-list certificate-list">
          {sectionItems.map(renderCertificateItem)}
        </div>
      </section>
    );
  }

  if (sectionKind === "publications") {
    if (!showTitle && sectionItems.length === 1) return renderPublicationItem(sectionItems[0]);
    return (
      <section className="cv-section">
        {titleNode}
        <div className="entry-list publication-list">
          {sectionItems.map(renderPublicationItem)}
        </div>
      </section>
    );
  }

  if (sectionKind === "achievements") {
    if (!showTitle && sectionItems.length === 1) return renderAchievementItem(sectionItems[0]);
    return (
      <section className="cv-section">
        {titleNode}
        <div className="achievement-list">
          {sectionItems
            .filter((item) => (item.text || "").trim())
            .map(renderAchievementItem)}
        </div>
      </section>
    );
  }

  if (sectionKind === "work-experience") {
    if (!showTitle && sectionItems.length === 1) return renderWorkItem(sectionItems[0]);
    return (
      <section className="cv-section">
        {titleNode}
        <div className="work-list">
          {sectionItems.map(renderWorkItem)}
        </div>
      </section>
    );
  }

  if (sectionKind === "projects") {
    if (!showTitle && sectionItems.length === 1) return renderProjectItem(sectionItems[0]);
    return (
      <section className="cv-section">
        {titleNode}
        <div className="work-list">
          {sectionItems.map(renderProjectItem)}
        </div>
      </section>
    );
  }

  if (section.type === "paragraph") {
    return (
      <section className="cv-section preview-clickable" onClick={onSectionClick}>
        {showTitle ? <h2>{section.title}</h2> : null}
        <p>{renderFormattedParagraph(section.content, `${section.id}-paragraph`)}</p>
      </section>
    );
  }

  if (section.type === "bullet-list") {
    return (
      <section className="cv-section">
        {titleNode}
        <ul className="bullet-list">
          {sectionItems
            .filter((item) => (item.text || "").trim())
            .map((item) => (
              <li
                key={item.id}
                className="preview-clickable"
                onClick={() => onItemClick(item.id)}
              >
                {renderFormattedInline(item.text, `${item.id}-bullet`)}
              </li>
            ))}
        </ul>
      </section>
    );
  }

  if (!showTitle && sectionItems.length === 1) return renderGenericItem(sectionItems[0]);

  return (
    <section className="cv-section">
      {titleNode}
      <div className="entry-list">
        {sectionItems.map(renderGenericItem)}
      </div>
    </section>
  );
}
