import { useEffect, useMemo, useState } from "react";
import { CV_COLOR_PRESETS, resolveCvTheme } from "../../utils/cvThemes.js";

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
  const [templateName, setTemplateName] = useState("");
  const suggestedTemplateName = `${String(cvName || "Untitled CV").trim() || "Untitled CV"} Template`;

  useEffect(() => {
    setTemplateName((current) => (current.trim() ? current : suggestedTemplateName));
  }, [suggestedTemplateName]);

  return (
    <section className="panel theme-panel">
      <div className="panel-head theme-panel-head">
        <div>
          <h2>Theme & Templates</h2>
          <p>Pick a palette, fine-tune your colors, and save this CV as a reusable template.</p>
        </div>
        <div className="theme-panel-summary">
          <span className="theme-panel-pill">{resolvedTheme.label}</span>
          <small>{templateCount} template{templateCount === 1 ? "" : "s"} saved</small>
        </div>
      </div>

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

      <div className="theme-template-row">
        <label className="input-group theme-template-name">
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
          className="secondary"
          onClick={() => onSaveTemplate(templateName || suggestedTemplateName)}
        >
          {templateSaveLabel}
        </button>
      </div>
    </section>
  );
}
