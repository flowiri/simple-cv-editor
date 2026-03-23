import { SECTION_TEMPLATES } from "../../constants/index.js";

export function SectionTemplatePicker({ onSelect }) {
  return (
    <div className="section-template-picker">
      {SECTION_TEMPLATES.map((template) => (
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
