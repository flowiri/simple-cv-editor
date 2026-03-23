import { getSectionKind } from "../../utils/sections.js";
import { extractAchievementParts, parseBulletLines, parseWorkDescription } from "../../utils/parsers.js";
import { renderFormattedInline, renderFormattedParagraph } from "../../utils/formatting.jsx";

export function PreviewSection({ section, onSectionClick, onItemClick }) {
  const sectionKind = getSectionKind(section.title, section.type, section.sectionTemplate);

  if (sectionKind === "professional-summary") {
    const bullets = parseBulletLines(section.content);
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
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
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
        <div className="entry-list education-list">
          {(section.items || []).map((item) => (
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
          ))}
        </div>
      </section>
    );
  }

  if (sectionKind === "certificates") {
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
        <div className="achievement-list certificate-list">
          {(section.items || []).map((item) => (
            <article
              key={item.id}
              className="achievement-row certificate-row preview-clickable"
              onClick={() => onItemClick(item.id)}
            >
              <span className="achievement-dot" aria-hidden="true">•</span>
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
          ))}
        </div>
      </section>
    );
  }

  if (sectionKind === "publications") {
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
        <div className="entry-list publication-list">
          {(section.items || []).map((item) => (
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
          ))}
        </div>
      </section>
    );
  }

  if (sectionKind === "achievements") {
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
        <div className="achievement-list">
          {(section.items || [])
            .filter((item) => (item.text || "").trim())
            .map((item) => {
              const body = item.text || "";
              const date = item.meta || extractAchievementParts(item.text).date;
              return (
                <article
                  key={item.id}
                  className="achievement-row preview-clickable"
                  onClick={() => onItemClick(item.id)}
                >
                  <span className="achievement-dot" aria-hidden="true">•</span>
                  <p className="achievement-copy">
                    {renderFormattedInline(body, `${item.id}-achievement`)}
                  </p>
                  {date ? <span className="cv-date">{date}</span> : null}
                </article>
              );
            })}
        </div>
      </section>
    );
  }

  if (sectionKind === "work-experience") {
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
        <div className="work-list">
          {(section.items || []).map((item) => {
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
          })}
        </div>
      </section>
    );
  }

  if (sectionKind === "projects") {
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
        <div className="work-list">
          {(section.items || []).map((item) => {
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
          })}
        </div>
      </section>
    );
  }

  if (section.type === "paragraph") {
    return (
      <section className="cv-section preview-clickable" onClick={onSectionClick}>
        <h2>{section.title}</h2>
        <p>{renderFormattedParagraph(section.content, `${section.id}-paragraph`)}</p>
      </section>
    );
  }

  if (section.type === "bullet-list") {
    return (
      <section className="cv-section">
        <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
        <ul className="bullet-list">
          {(section.items || [])
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

  return (
    <section className="cv-section">
      <h2 className="preview-clickable" onClick={onSectionClick}>{section.title}</h2>
      <div className="entry-list">
        {(section.items || []).map((item) => (
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
        ))}
      </div>
    </section>
  );
}
