import { useRef } from "react";
import { FormatToolbar } from "./FormatToolbar.jsx";

export function FormatField({ label, value, onChange }) {
  const inputRef = useRef(null);

  return (
    <label className="field">
      <div className="field-label-row">
        <span>{label}</span>
        <FormatToolbar inputRef={inputRef} value={value} onChange={onChange} />
      </div>
      <input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
