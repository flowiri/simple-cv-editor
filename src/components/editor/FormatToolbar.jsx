function applyInlineFormat(inputRef, value, onChange, marker) {
  const input = inputRef.current;
  const currentValue = String(value || "");
  if (!input) {
    onChange(`${currentValue}${marker}${marker}`);
    return;
  }

  const start = input.selectionStart ?? currentValue.length;
  const end = input.selectionEnd ?? currentValue.length;
  const selected = currentValue.slice(start, end);
  const before = currentValue.slice(0, start);
  const after = currentValue.slice(end);
  const hasWrappedSelection =
    start >= marker.length &&
    currentValue.slice(start - marker.length, start) === marker &&
    currentValue.slice(end, end + marker.length) === marker;

  const nextValue = hasWrappedSelection
    ? `${currentValue.slice(0, start - marker.length)}${selected}${currentValue.slice(end + marker.length)}`
    : `${before}${marker}${selected}${marker}${after}`;
  onChange(nextValue);

  window.requestAnimationFrame(() => {
    input.focus();
    const cursorStart = hasWrappedSelection ? start - marker.length : start + marker.length;
    const cursorEnd = hasWrappedSelection ? end - marker.length : end + marker.length;
    input.setSelectionRange(cursorStart, cursorEnd);
  });
}

export function FormatToolbar({ inputRef, value, onChange }) {
  return (
    <div className="format-toolbar">
      <button
        type="button"
        className="secondary small format-btn"
        onClick={() => applyInlineFormat(inputRef, value, onChange, "**")}
      >
        B
      </button>
      <button
        type="button"
        className="secondary small format-btn format-btn-italic"
        onClick={() => applyInlineFormat(inputRef, value, onChange, "*")}
      >
        I
      </button>
      <button
        type="button"
        className="secondary small format-btn format-btn-underline"
        onClick={() => applyInlineFormat(inputRef, value, onChange, "__")}
      >
        U
      </button>
    </div>
  );
}
