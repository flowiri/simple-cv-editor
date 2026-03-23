import { useRef } from "react";
import { FormatToolbar } from "./FormatToolbar.jsx";

export function TextAreaField({ className = "", label, value, onChange, formattable = false }) {
  const textareaRef = useRef(null);

  return (
    <label className={`field ${className}`.trim()}>
      <div className="field-label-row">
        <span>{label}</span>
        {formattable ? (
          <FormatToolbar inputRef={textareaRef} value={value} onChange={onChange} />
        ) : null}
      </div>
      <textarea ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
