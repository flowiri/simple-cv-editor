import { getSectionTemplates } from "../../constants/index.js";

export function SectionTemplatePicker({ language, onSelect }) {
  const sectionTemplates = getSectionTemplates(language);

  return (
    <div className="section-template-picker">
      {sectionTemplates.map((template) => (
        <button
          key={template.key}
          type="button"
          className="section-template-option"
          onClick={() => onSelect(template.key)}
          title={template.hint}
        >
          <span className="section-template-badge">{template.symbol}</span>
          <span className="section-template-title">{template.shortLabel || template.label}</span>
        </button>
      ))}
    </div>
  );
}
