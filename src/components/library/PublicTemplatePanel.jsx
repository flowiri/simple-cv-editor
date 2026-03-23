import { resolveCvTheme } from "../../utils/cvThemes.js";

function TemplateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l5 5v13H6zm7 1.5V9h4.5zM9 13h6v2H9zm0 4h6v2H9z" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5c5.7 0 9.86 5.39 10 5.62L22.32 11l-.32.38C21.86 11.61 17.7 17 12 17S2.14 11.61 2 11.38L1.68 11l.32-.38C2.14 10.39 6.3 5 12 5Zm0 2c-3.79 0-6.95 3.08-7.9 4 .95.92 4.11 4 7.9 4s6.95-3.08 7.9-4c-.95-.92-4.11-4-7.9-4Zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" fill="currentColor" />
    </svg>
  );
}

export function PublicTemplatePanel({
  templates,
  workspaceStatus,
  onPreviewTemplate,
  onCreateCvFromTemplate,
}) {
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const isBusy = workspaceStatus === "loading";

  return (
    <section className="workspace-card workspace-library-card">
      <div className="workspace-card-head workspace-card-head-library">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Public Templates</h1>
          <p className="workspace-copy">
            Browse shared templates from other users, preview them, and create your own CV from any public starting point.
          </p>
        </div>
      </div>

      <div className="cv-library-list">
        {safeTemplates.length === 0 ? (
          <article className="cv-library-empty">
            <strong>No public templates yet</strong>
            <p>Once users publish templates, they will appear here for everyone to preview and reuse.</p>
          </article>
        ) : (
          safeTemplates.map((template) => {
            const theme = resolveCvTheme(template.theme);

            return (
              <article
                key={template.id}
                className="cv-library-item-card public-template-card"
                role="button"
                tabIndex={0}
                onClick={() => onPreviewTemplate(template.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onPreviewTemplate(template.id);
                  }
                }}
              >
                <div className="cv-library-item-copy">
                  <strong className="public-template-author">@{template.ownerUsername || "anonymous"}</strong>
                  <div className="public-template-title-row">
                    <span className="cv-library-name-label">{template.name || "Untitled Template"}</span>
                    <span className="public-template-pill">Public</span>
                  </div>
                  <div className="template-library-meta">
                    <span>{template.previewName || "Reusable CV structure"}</span>
                    {template.previewHeadline ? <span>{template.previewHeadline}</span> : null}
                    <span>{template.sectionCount} sections</span>
                  </div>
                  <small>Updated {new Date(template.updatedAt).toLocaleString()}</small>
                </div>

                <div className="template-card-swatches" aria-hidden="true">
                  <span style={{ background: theme.accent }} />
                  <span style={{ background: theme.accentStrong }} />
                  <span style={{ background: theme.text }} />
                </div>

                <div className="cv-library-item-actions" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className="icon-btn secondary"
                    title="Preview template"
                    aria-label={`Preview ${template.name || "template"}`}
                    onClick={() => onPreviewTemplate(template.id)}
                    disabled={isBusy}
                  >
                    <EyeIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn secondary"
                    title="Create CV from template"
                    aria-label={`Create CV from ${template.name || "template"}`}
                    onClick={() => onCreateCvFromTemplate(template.id)}
                    disabled={isBusy}
                  >
                    <TemplateIcon />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
