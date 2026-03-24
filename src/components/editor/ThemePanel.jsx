import { useEffect, useMemo, useState } from "react";
import { CV_COLOR_PRESETS, resolveCvTheme } from "../../utils/cvThemes.js";
import { LockClosedIcon } from "../icons/LockClosedIcon.jsx";
import { LockOpenIcon } from "../icons/LockOpenIcon.jsx";

const COLOR_FIELDS = [
  { key: "accent", label: "Section" },
  { key: "accentStrong", label: "Highlight" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted" },
];

export function ThemePanel({
  cvName,
  theme,
  templateCount,
  templateSaveLabel,
  onSelectPreset,
  onUpdateThemeColor,
  onSaveTemplate,
}) {
  const resolvedTheme = useMemo(() => resolveCvTheme(theme), [theme]);
  const [activeTab, setActiveTab] = useState("colors");
  const [templateName, setTemplateName] = useState("");
  const [templateIsPublic, setTemplateIsPublic] = useState(false);
  const suggestedTemplateName = `${String(cvName || "Untitled CV").trim() || "Untitled CV"} Template`;

  useEffect(() => {
    setTemplateName((current) => (current.trim() ? current : suggestedTemplateName));
  }, [suggestedTemplateName]);

  return (
    <section className="panel theme-panel">
      <div className="theme-panel-tabs" role="tablist" aria-label="Theme drawer sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "colors"}
          className={`secondary theme-panel-tab ${activeTab === "colors" ? "is-active" : ""}`}
          onClick={() => setActiveTab("colors")}
        >
          Colors
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "template"}
          className={`secondary theme-panel-tab ${activeTab === "template" ? "is-active" : ""}`}
          onClick={() => setActiveTab("template")}
        >
          Template
        </button>
      </div>

      <div className="panel-head theme-panel-head">
        <div className="theme-panel-head-actions">
          <div className="theme-panel-summary">
            <span className="theme-panel-pill">{resolvedTheme.label}</span>
            <small>{templateCount} template{templateCount === 1 ? "" : "s"} saved</small>
          </div>
        </div>
      </div>

      {activeTab === "colors" ? (
        <div className="theme-panel-section">
          <div className="theme-preset-grid">
            {CV_COLOR_PRESETS.map((preset) => {
              const isActive = theme?.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`theme-preset-card secondary ${isActive ? "is-active" : ""}`}
                  onClick={() => onSelectPreset(preset.id)}
                >
                  <span className="theme-preset-swatches" aria-hidden="true">
                    <span style={{ background: preset.colors.accent }} />
                    <span style={{ background: preset.colors.accentStrong }} />
                    <span style={{ background: preset.colors.text }} />
                  </span>
                  <span className="theme-preset-copy">
                    <strong>{preset.label}</strong>
                    <small>{preset.colors.accent}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="theme-custom-grid">
            {COLOR_FIELDS.map((field) => (
              <label key={field.key} className="theme-color-field">
                <span>{field.label}</span>
                <div className="theme-color-input-row">
                  <input
                    type="color"
                    value={resolvedTheme[field.key]}
                    onChange={(event) => onUpdateThemeColor(field.key, event.target.value)}
                  />
                  <code>{resolvedTheme[field.key]}</code>
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="theme-panel-section theme-panel-section-template">
          <div className="theme-template-grid">
            <label className="theme-template-card theme-template-name-card theme-template-card-full">
              <span>Template name</span>
              <input
                type="text"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Template name"
              />
            </label>

            <button
              type="button"
              className={`secondary theme-template-card theme-template-visibility-card ${templateIsPublic ? "is-public" : ""}`}
              title={templateIsPublic ? "Set template visibility to public" : "Set template visibility to private"}
              aria-label={templateIsPublic ? "Set template visibility to public" : "Set template visibility to private"}
              onClick={() => setTemplateIsPublic((current) => !current)}
            >
                <span className="theme-template-visibility-header">
                  <span className="theme-template-visibility-trigger">
                    <span className={`icon-btn secondary theme-template-visibility ${templateIsPublic ? "is-public" : ""}`} aria-hidden="true">
                      {templateIsPublic ? <LockOpenIcon /> : <LockClosedIcon />}
                    </span>
                  <span className="theme-template-visibility-tooltip" role="tooltip">
                    {templateIsPublic ? "Visible in the shared template gallery." : "Only visible in your own library."}
                  </span>
                </span>
                <strong>{templateIsPublic ? "Public" : "Private"}</strong>
              </span>
            </button>

            <button
              type="button"
              className="secondary theme-template-card theme-template-save-card"
              onClick={() => onSaveTemplate(templateName || suggestedTemplateName, templateIsPublic)}
            >
              <strong>{templateSaveLabel}</strong>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
