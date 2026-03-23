export function InsertSectionRail({ active = false, onClick }) {
  return (
    <div className={`insert-rail ${active ? "is-active" : ""}`} aria-hidden="true">
      <div className="insert-rail-line" />
      <button
        type="button"
        className="insert-rail-button"
        onClick={onClick}
        title="Insert custom section here"
      >
        +
      </button>
      <div className="insert-rail-line" />
    </div>
  );
}
