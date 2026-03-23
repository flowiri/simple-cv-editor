import { InsertSectionRail } from "./InsertSectionRail.jsx";
import { SectionTemplatePicker } from "./SectionTemplatePicker.jsx";
import { SectionCard } from "./SectionCard.jsx";

export function SectionsPanel({
  sections,
  sectionCount,
  activeInspectorTarget,
  collapsedSections,
  collapsedItems,
  insertMenuIndex,
  setInsertMenuIndex,
  registerEditorTarget,
  toggleSectionCollapsed,
  toggleItemCollapsed,
  moveSection,
  moveItem,
  updateSection,
  updateItem,
  setCv,
  insertSectionAt,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Sections</h2>
          <p className="panel-caption">Reorder the narrative, expand details, and add custom blocks where needed.</p>
        </div>
        <button
          className="secondary small"
          onClick={() => setInsertMenuIndex(sections.length)}
        >
          Add Section
        </button>
      </div>

      <div className="sections-editor">
        <InsertSectionRail
          active={insertMenuIndex === 0}
          onClick={() => setInsertMenuIndex((current) => (current === 0 ? null : 0))}
        />
        {insertMenuIndex === 0 ? (
          <SectionTemplatePicker onSelect={(templateKey) => insertSectionAt(0, templateKey)} />
        ) : null}

        {sections.map((section, sectionIndex) => (
          <SectionCard
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            sectionCount={sectionCount}
            activeInspectorTarget={activeInspectorTarget}
            collapsedSections={collapsedSections}
            collapsedItems={collapsedItems}
            insertMenuIndex={insertMenuIndex}
            registerEditorTarget={registerEditorTarget}
            toggleSectionCollapsed={toggleSectionCollapsed}
            toggleItemCollapsed={toggleItemCollapsed}
            moveSection={moveSection}
            moveItem={moveItem}
            updateSection={updateSection}
            updateItem={updateItem}
            setCv={setCv}
            setInsertMenuIndex={setInsertMenuIndex}
            insertSectionAt={insertSectionAt}
          />
        ))}
      </div>
    </section>
  );
}
