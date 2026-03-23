import { useMemo, useState } from "react";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5h2v14h-2zM5 11h14v2H5z" fill="currentColor" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 16.75 9.88-9.88 3.25 3.25L7.25 20H4zM14.59 6.16l1.77-1.77a1.5 1.5 0 0 1 2.12 0l1.13 1.13a1.5 1.5 0 0 1 0 2.12l-1.77 1.77z" fill="currentColor" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4h6l1 2h4v2H4V6h4zm1 6h2v8h-2zm4 0h2v8h-2zM7 10h2v8H7zm-1 10V9h12v11z" fill="currentColor" />
    </svg>
  );
}

export function CvLibraryPanel({
  cvs,
  selectedCvId,
  workspaceStatus,
  onSelectCv,
  onPreviewCv,
  onRenameCv,
  onCreateCv,
  onDeleteCvs,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingCvId, setEditingCvId] = useState("");
  const [draftName, setDraftName] = useState("");
  const isBusy = workspaceStatus === "loading";
  const selectedCount = selectedIds.length;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelected = (cvId) => {
    setSelectedIds((current) => (
      current.includes(cvId)
        ? current.filter((id) => id !== cvId)
        : [...current, cvId]
    ));
  };

  const toggleAll = () => {
    setSelectedIds((current) => (
      current.length === cvs.length ? [] : cvs.map((cv) => cv.id)
    ));
  };

  const handleDelete = async (ids) => {
    const didDelete = await onDeleteCvs(ids);
    if (didDelete) {
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    }
  };

  const startRename = (cv) => {
    setEditingCvId(cv.id);
    setDraftName(cv.name || "Untitled CV");
  };

  const cancelRename = () => {
    setEditingCvId("");
    setDraftName("");
  };

  const commitRename = async (cvId) => {
    const didRename = await onRenameCv(cvId, draftName);
    if (didRename) {
      cancelRename();
    }
  };

  return (
    <section className="workspace-card workspace-library-card">
      <div className="workspace-card-head workspace-card-head-library">
        <div>
          <p className="eyebrow">CV Library</p>
          <h1>Your CVs</h1>
          <p className="workspace-copy">
            Create a new CV, edit an existing one, or select multiple documents to remove them together.
          </p>
        </div>
        <div className="library-toolbar">
          <button
            type="button"
            className="icon-btn secondary"
            title="Create new CV"
            aria-label="Create new CV"
            disabled={isBusy}
            onClick={() => onCreateCv("blank")}
          >
            <PlusIcon />
          </button>
          <button
            type="button"
            className="icon-btn secondary"
            title={selectedCount > 0 ? `Delete ${selectedCount} selected CVs` : "Delete selected CVs"}
            aria-label="Delete selected CVs"
            disabled={isBusy || selectedCount === 0}
            onClick={() => handleDelete(selectedIds)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="library-selection-row">
        <label className="library-select-all">
          <input
            type="checkbox"
            checked={cvs.length > 0 && selectedCount === cvs.length}
            onChange={toggleAll}
            disabled={isBusy || cvs.length === 0}
          />
          <span>Select all</span>
        </label>
        <small>{selectedCount > 0 ? `${selectedCount} selected` : `${cvs.length} total`}</small>
      </div>

      <div className="cv-library-list">
        {cvs.length === 0 ? (
          <article className="cv-library-empty">
            <strong>No CVs yet</strong>
            <p>Create your first CV with the plus button to start from a blank document.</p>
          </article>
        ) : (
          cvs.map((cv) => (
            <article
              key={cv.id}
              className={`cv-library-item-card ${cv.id === selectedCvId ? "is-active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => onPreviewCv(cv.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onPreviewCv(cv.id);
                }
              }}
            >
              <label className="cv-library-checkbox" onClick={(event) => event.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedSet.has(cv.id)}
                  onChange={() => toggleSelected(cv.id)}
                  disabled={isBusy}
                />
              </label>
              <div className="cv-library-item-copy">
                {editingCvId === cv.id ? (
                  <input
                    className="cv-library-name-input"
                    value={draftName}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setDraftName(event.target.value)}
                    onBlur={() => commitRename(cv.id)}
                    onKeyDown={(event) => {
                      event.stopPropagation();

                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitRename(cv.id);
                      }

                      if (event.key === "Escape") {
                        event.preventDefault();
                        cancelRename();
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="cv-library-name-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      startRename(cv);
                    }}
                    title="Rename CV"
                  >
                    {cv.name || "Untitled CV"}
                  </button>
                )}
                <small>Updated {new Date(cv.updatedAt).toLocaleString()}</small>
              </div>
              <div className="cv-library-item-actions" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="icon-btn secondary"
                  title="Edit CV"
                  aria-label={`Edit ${cv.name || "CV"}`}
                  onClick={() => onSelectCv(cv.id)}
                  disabled={isBusy && cv.id !== selectedCvId}
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  className="icon-btn secondary"
                  title="Delete CV"
                  aria-label={`Delete ${cv.name || "CV"}`}
                  disabled={isBusy}
                  onClick={() => handleDelete([cv.id])}
                >
                  <TrashIcon />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
