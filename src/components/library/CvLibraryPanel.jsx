import { useMemo, useState } from "react";
import { resolveCvTheme } from "../../utils/cvThemes.js";
import { LockClosedIcon } from "../icons/LockClosedIcon.jsx";
import { LockOpenIcon } from "../icons/LockOpenIcon.jsx";

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

function TemplateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l5 5v13H6zm7 1.5V9h4.5zM9 13h6v2H9zm0 4h6v2H9z" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5c5.7 0 9.86 5.39 10 5.62L22.32 11l-.32.38C21.86 11.61 17.7 17 12 17S2.14 11.61 2 11.38L1.68 11l.32-.38C2.14 10.39 6.3 5 12 5Zm0 2c-3.79 0-6.95 3.08-7.9 4 .95.92 4.11 4 7.9 4s6.95-3.08 7.9-4c-.95-.92-4.11-4-7.9-4Zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" fill="currentColor" />
    </svg>
  );
}

export function CvLibraryPanel({
  cvs,
  templates,
  selectedCvId,
  workspaceStatus,
  onSelectCv,
  onPreviewCv,
  onRenameCv,
  onRenameTemplate,
  onSetTemplateVisibility,
  onCreateCv,
  onPreviewTemplate,
  onCreateCvFromTemplate,
  onDeleteCvs,
  onDeleteTemplates,
}) {
  const [activeTab, setActiveTab] = useState("cvs");
  const [selectedCvIds, setSelectedCvIds] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [editingCvId, setEditingCvId] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState("");
  const [draftName, setDraftName] = useState("");
  const isBusy = workspaceStatus === "loading";
  const safeCvs = Array.isArray(cvs) ? cvs : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const isTemplateTab = activeTab === "templates";
  const selectedIds = isTemplateTab ? selectedTemplateIds : selectedCvIds;
  const selectedCount = selectedIds.length;
  const libraryItems = isTemplateTab ? safeTemplates : safeCvs;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelectedCv = (cvId) => {
    setSelectedCvIds((current) => (
      current.includes(cvId)
        ? current.filter((id) => id !== cvId)
        : [...current, cvId]
    ));
  };

  const toggleSelectedTemplate = (templateId) => {
    setSelectedTemplateIds((current) => (
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId]
    ));
  };

  const toggleAll = () => {
    const itemIds = libraryItems.map((item) => item.id);

    if (isTemplateTab) {
      setSelectedTemplateIds((current) => (
        current.length === itemIds.length ? [] : itemIds
      ));
      return;
    }

    setSelectedCvIds((current) => (
      current.length === itemIds.length ? [] : itemIds
    ));
  };

  const handleDelete = async (ids) => {
    const didDelete = isTemplateTab
      ? await onDeleteTemplates(ids)
      : await onDeleteCvs(ids);

    if (didDelete) {
      if (isTemplateTab) {
        setSelectedTemplateIds((current) => current.filter((id) => !ids.includes(id)));
      } else {
        setSelectedCvIds((current) => current.filter((id) => !ids.includes(id)));
      }
    }
  };

  const startRename = (item, type) => {
    if (type === "template") {
      setEditingTemplateId(item.id);
      setEditingCvId("");
      setDraftName(item.name || "Untitled Template");
      return;
    }

    setEditingCvId(item.id);
    setEditingTemplateId("");
    setDraftName(item.name || "Untitled CV");
  };

  const cancelRename = () => {
    setEditingCvId("");
    setEditingTemplateId("");
    setDraftName("");
  };

  const commitRename = async (itemId, type) => {
    const didRename = type === "template"
      ? await onRenameTemplate(itemId, draftName)
      : await onRenameCv(itemId, draftName);

    if (didRename) {
      cancelRename();
    }
  };

  return (
    <section className="workspace-card workspace-library-card">
      <div className="workspace-card-head workspace-card-head-library">
        <div>
          <p className="eyebrow">Library</p>
          <h1>{isTemplateTab ? "Templates" : "Your CVs"}</h1>
          <p className="workspace-copy">
            {isTemplateTab
              ? "Browse your saved templates, create a new CV from one, or remove old versions in bulk."
              : "Create a new CV, edit an existing one, or select multiple documents to remove them together."}
          </p>
        </div>
        <div className="library-head-actions">
          <div className="library-view-switch" role="tablist" aria-label="Library view">
            <button
              type="button"
              className={`secondary ${isTemplateTab ? "" : "is-active"}`}
              onClick={() => setActiveTab("cvs")}
            >
              CVs
            </button>
            <button
              type="button"
              className={`secondary ${isTemplateTab ? "is-active" : ""}`}
              onClick={() => setActiveTab("templates")}
            >
              Templates
            </button>
          </div>
          <div className="library-toolbar">
            {!isTemplateTab ? (
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
            ) : null}
            <button
              type="button"
              className="icon-btn secondary"
              title={selectedCount > 0 ? `Delete ${selectedCount} selected item${selectedCount === 1 ? "" : "s"}` : "Delete selected items"}
              aria-label="Delete selected items"
              disabled={isBusy || selectedCount === 0}
              onClick={() => handleDelete(selectedIds)}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="library-selection-row">
        <label className="library-select-all">
          <input
            type="checkbox"
            checked={libraryItems.length > 0 && selectedCount === libraryItems.length}
            onChange={toggleAll}
            disabled={isBusy || libraryItems.length === 0}
          />
          <span>Select all</span>
        </label>
        <small>{selectedCount > 0 ? `${selectedCount} selected` : `${libraryItems.length} total`}</small>
      </div>

      <div className="cv-library-list">
        {libraryItems.length === 0 ? (
          <article className="cv-library-empty">
            <strong>{isTemplateTab ? "No templates yet" : "No CVs yet"}</strong>
            <p>
              {isTemplateTab
                ? "Save the current CV as a template from the editor to build up a reusable template library."
                : "Create your first CV with the plus button to start from a blank document."}
            </p>
          </article>
        ) : (
          isTemplateTab
            ? safeTemplates.map((template) => {
                const theme = resolveCvTheme(template.theme);
                return (
                  <article
                    key={template.id}
                    className="cv-library-item-card template-library-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => onPreviewTemplate(template.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onPreviewTemplate(template.id);
                      }
                    }}
                  >
                    <label className="cv-library-checkbox" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedSet.has(template.id)}
                        onChange={() => toggleSelectedTemplate(template.id)}
                        disabled={isBusy}
                      />
                    </label>
                    <div className="cv-library-item-copy">
                      {editingTemplateId === template.id ? (
                        <input
                          className="cv-library-name-input"
                          value={draftName}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => setDraftName(event.target.value)}
                          onBlur={() => commitRename(template.id, "template")}
                          onKeyDown={(event) => {
                            event.stopPropagation();

                            if (event.key === "Enter") {
                              event.preventDefault();
                              commitRename(template.id, "template");
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
                            startRename(template, "template");
                          }}
                          title="Rename template"
                        >
                          {template.name || "Untitled Template"}
                        </button>
                      )}
                      <div className="template-library-meta">
                        <span>{template.previewName || "Reusable CV structure"}</span>
                        {template.previewHeadline ? <span>{template.previewHeadline}</span> : null}
                        <span>{template.sectionCount} sections</span>
                        <span>{template.isPublic ? "Public" : "Private"}</span>
                      </div>
                      <small>Updated {new Date(template.updatedAt).toLocaleString()}</small>
                    </div>
                    <div className="template-card-swatches" aria-hidden="true">
                      <span style={{ background: theme.accent }} />
                      <span style={{ background: theme.accentStrong }} />
                      <span style={{ background: theme.text }} />
                    </div>
                    <div className="cv-library-item-actions" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="icon-btn secondary library-visibility-button"
                        title={template.isPublic ? "Make template private" : "Make template public"}
                        aria-label={template.isPublic ? `Make ${template.name || "template"} private` : `Make ${template.name || "template"} public`}
                        onClick={() => onSetTemplateVisibility(template.id, !template.isPublic)}
                        disabled={isBusy}
                      >
                        {template.isPublic ? <LockOpenIcon /> : <LockClosedIcon />}
                      </button>
                      <button
                        type="button"
                        className="icon-btn secondary"
                        title="Preview template"
                        aria-label={`Preview ${template.name || "template"}`}
                        onClick={() => onPreviewTemplate(template.id)}
                        disabled={isBusy}
                      >
                        <EyeIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn secondary"
                        title="Create CV from template"
                        aria-label={`Create CV from ${template.name || "template"}`}
                        onClick={() => onCreateCvFromTemplate(template.id)}
                        disabled={isBusy}
                      >
                        <TemplateIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn secondary"
                        title="Delete template"
                        aria-label={`Delete ${template.name || "template"}`}
                        disabled={isBusy}
                        onClick={() => handleDelete([template.id])}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                );
              })
            : safeCvs.map((cv) => (
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
                      onChange={() => toggleSelectedCv(cv.id)}
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
                        onBlur={() => commitRename(cv.id, "cv")}
                        onKeyDown={(event) => {
                          event.stopPropagation();

                          if (event.key === "Enter") {
                            event.preventDefault();
                            commitRename(cv.id, "cv");
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
                          startRename(cv, "cv");
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
