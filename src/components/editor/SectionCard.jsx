import React from "react";
import { getSectionTemplates } from "../../constants/index.js";
import {
  getSectionKind,
  buildSectionFromTemplate,
  normalizeForType,
  defaultItemForType,
} from "../../utils/sections.js";
import { createPublicationItem } from "../../utils/cvData.js";
import { EyeOpenIcon } from "../icons/EyeOpenIcon.jsx";
import { EyeClosedIcon } from "../icons/EyeClosedIcon.jsx";
import { TextAreaField } from "./TextAreaField.jsx";
import { ItemEditor } from "./ItemEditor.jsx";
import { InsertSectionRail } from "./InsertSectionRail.jsx";
import { SectionTemplatePicker } from "./SectionTemplatePicker.jsx";

export function SectionCard({
  section,
  language,
  sectionIndex,
  sectionCount,
  activeInspectorTarget,
  collapsedSections,
  collapsedItems,
  insertMenuIndex,
  registerEditorTarget,
  toggleSectionCollapsed,
  toggleItemCollapsed,
  moveSection,
  moveItem,
  updateSection,
  updateItem,
  setCv,
  setInsertMenuIndex,
  insertSectionAt,
}) {
  const sectionTemplates = getSectionTemplates(language);
  const isInspectorTarget = activeInspectorTarget === `section:${section.id}`;
  const isHidden = section.visible === false;
  const isCollapsed = collapsedSections[section.id];
  const sectionKind = getSectionKind(section.title, section.type, section.sectionTemplate);
  const sectionLabel = (section.sectionTemplate || section.type || "custom")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const itemCount = section.type === "paragraph"
    ? ((section.content || "").trim() ? "Paragraph" : "Empty paragraph")
    : `${(section.items || []).length} ${(section.items || []).length === 1 ? "item" : "items"}`;

  return (
    <React.Fragment>
      <article
        className={`section-card ${isInspectorTarget ? "is-inspector-target" : ""} ${isHidden ? "is-section-hidden" : ""}`}
        ref={(node) => registerEditorTarget(`section:${section.id}`, node)}
      >
        <div className="section-card-head">
          <div className="section-card-main">
            <div className="section-card-topline">
              <div className="section-meta">
                <button
                  type="button"
                  className="secondary small icon-btn collapse-btn"
                  onClick={() => toggleSectionCollapsed(section.id)}
                  title={isCollapsed ? "Expand section" : "Collapse section"}
                >
                  {isCollapsed ? "+" : "-"}
                </button>
                <div className="section-heading-group">
                  <div className="section-chip-row">
                    <span className="section-kind-chip">{sectionLabel}</span>
                    <span className="section-item-count">{itemCount}</span>
                  </div>
                  <input
                    className="section-title-input"
                    value={section.title}
                    onChange={(event) =>
                      updateSection(section.id, (current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="row-controls">
                <button
                  className="secondary small icon-btn"
                  onClick={() =>
                    updateSection(section.id, (current) => ({
                      ...current,
                      visible: current.visible === false,
                    }))
                  }
                  title={isHidden ? "Show in preview and PDF" : "Hide from preview and PDF"}
                >
                  {isHidden ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
                <button
                  className="secondary small icon-btn"
                  disabled={sectionIndex === 0}
                  onClick={() => moveSection(section.id, -1)}
                  title="Move section up"
                >
                  ^
                </button>
                <button
                  className="secondary small icon-btn"
                  disabled={sectionIndex === sectionCount - 1}
                  onClick={() => moveSection(section.id, 1)}
                  title="Move section down"
                >
                  v
                </button>
                <button
                  className="secondary small icon-btn icon-btn-danger"
                  onClick={() =>
                    setCv((current) => ({
                      ...current,
                      sections: current.sections.filter(
                        (candidate) => candidate.id !== section.id
                      ),
                    }))
                  }
                  title="Delete section"
                >
                  x
                </button>
              </div>
            </div>

            <div className="section-card-settings">
              <label className="section-select-field">
                <span className="section-select-label">Section Type</span>
                <select
                  className="section-template-select"
                  value={section.sectionTemplate || getSectionKind(section.title, section.type)}
                  onChange={(event) =>
                    updateSection(section.id, (current) => {
                      const template = buildSectionFromTemplate(event.target.value, language);
                      return normalizeForType(
                        {
                      ...template,
                      id: current.id,
                      title: current.title || template.title,
                          visible: current.visible,
                          items:
                            current.sectionTemplate === event.target.value
                              ? current.items
                              : template.items,
                          content:
                            current.sectionTemplate === event.target.value
                              ? current.content
                              : template.content || "",
                        },
                        template.type
                      );
                    })
                  }
                >
                  {sectionTemplates.map((template) => (
                    <option key={template.key} value={template.key}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {isCollapsed ? null : sectionKind === "professional-summary" ? (
          <TextAreaField
            label="Summary bullets"
            value={section.content || ""}
            formattable
            onChange={(value) =>
              updateSection(section.id, (current) => ({ ...current, content: value }))
            }
          />
        ) : section.type === "paragraph" ? (
          <TextAreaField
            label="Paragraph content"
            value={section.content || ""}
            formattable
            onChange={(value) =>
              updateSection(section.id, (current) => ({ ...current, content: value }))
            }
          />
        ) : (
          <>
            <div className="section-items">
              {(section.items || []).map((item, itemIndex) => (
                <ItemEditor
                  key={item.id}
                  item={item}
                  type={section.type}
                  sectionTitle={section.title}
                  sectionTemplate={section.sectionTemplate}
                  index={itemIndex}
                  lastIndex={(section.items || []).length - 1}
                  isActive={activeInspectorTarget === `item:${item.id}`}
                  collapsed={Boolean(collapsedItems[item.id])}
                  registerTarget={(node) => registerEditorTarget(`item:${item.id}`, node)}
                  onToggleCollapse={() => toggleItemCollapsed(item.id)}
                  onMove={(delta) => moveItem(section.id, item.id, delta)}
                  onDelete={() =>
                    updateSection(section.id, (current) => ({
                      ...current,
                      items: (current.items || []).filter(
                        (candidate) => candidate.id !== item.id
                      ),
                    }))
                  }
                  onChange={(field, value) =>
                    updateItem(section.id, item.id, (current) => ({
                      ...current,
                      [field]: value,
                    }))
                  }
                />
              ))}
            </div>
            <button
              className="secondary small add-item"
              onClick={() =>
                updateSection(section.id, (current) => ({
                  ...current,
                  items: [
                    ...(current.items || []),
                    getSectionKind(section.title, section.type) === "publications"
                      ? createPublicationItem()
                      : defaultItemForType(section.type),
                  ],
                }))
              }
            >
              Add Item
            </button>
          </>
        )}
      </article>

      <InsertSectionRail
        active={insertMenuIndex === sectionIndex + 1}
        onClick={() =>
          setInsertMenuIndex((current) =>
            current === sectionIndex + 1 ? null : sectionIndex + 1
          )
        }
      />
      {insertMenuIndex === sectionIndex + 1 ? (
        <SectionTemplatePicker
          language={language}
          onSelect={(templateKey) => insertSectionAt(sectionIndex + 1, templateKey)}
        />
      ) : null}
    </React.Fragment>
  );
}
