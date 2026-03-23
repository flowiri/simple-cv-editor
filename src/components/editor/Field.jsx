import { useRef } from "react";

export function Field({ className = "", label, value, onChange }) {
  const inputRef = useRef(null);

  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      <input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
