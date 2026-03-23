import { useEffect, useMemo, useRef, useState } from "react";
import { useCvBuilderViewModel } from "./features/cv-builder/model/useCvBuilderViewModel.js";
import { BasicsPanel } from "./components/editor/BasicsPanel.jsx";
import { SectionsPanel } from "./components/editor/SectionsPanel.jsx";
import { ContactRow } from "./components/preview/ContactRow.jsx";
import { PreviewSection } from "./components/preview/PreviewSection.jsx";
import { renderFormattedParagraph } from "./utils/formatting.jsx";

const A4_PAGE_HEIGHT_MM = 297;
const A4_PAGE_PADDING_TOP_MM = 15;
const A4_PAGE_PADDING_BOTTOM_MM = 16;

export default function App() {
  const [previewMode, setPreviewMode] = useState("print");
  const [isEditorScrolled, setIsEditorScrolled] = useState(false);
  const [pages, setPages] = useState([]);
  const measureRefs = useRef([]);
  const {
    cv,
    setCv,
    saveLabel,
    exportLabel,
    activeInspectorTarget,
    collapsedSections,
    collapsedItems,
    insertMenuIndex,
    setInsertMenuIndex,
    sectionCount,
    editorScrollRef,
    handleSave,
    handleExportPdf,
    updateCvName,
    updateBasics,
    updateSection,
    updateItem,
    moveSection,
    moveItem,
    insertSectionAt,
    registerEditorTarget,
    focusEditorTarget,
    toggleSectionCollapsed,
    toggleItemCollapsed,
    resetCv,
  } = useCvBuilderViewModel();

  const previewBlocks = useMemo(() => {
    const blocks = [
      {
        id: "header",
        render: () => (
          <header className="cv-header">
            <div>
              <h1>{cv.basics.fullName}</h1>
              <p className="cv-headline">{cv.basics.headline}</p>
            </div>
            <ul className="contact-list">
              <ContactRow label="Email" value={cv.basics.email} />
              <ContactRow label="Phone" value={cv.basics.phone} />
              <ContactRow label="Website" value={cv.basics.website} link />
              <ContactRow label="LinkedIn" value={cv.basics.linkedin} link />
              <ContactRow label="Nationality" value={cv.basics.nationality} />
              <ContactRow label="Date of Birth" value={cv.basics.dateOfBirth} />
            </ul>
          </header>
        ),
      },
    ];

    if (cv.basics.summary) {
      blocks.push({
        id: "summary",
        render: () => (
          <section
            className="cv-section preview-clickable"
            onClick={() => focusEditorTarget("basics-summary")}
          >
            <h2>Objective</h2>
            <p>{renderFormattedParagraph(cv.basics.summary, "basics-summary-para")}</p>
          </section>
        ),
      });
    }

    (cv.sections || [])
      .filter((section) => section.visible !== false)
      .forEach((section) => {
        blocks.push({
          id: section.id,
          render: () => (
            <PreviewSection
              section={section}
              onSectionClick={() => focusEditorTarget(`section:${section.id}`)}
              onItemClick={(itemId) => focusEditorTarget(`item:${itemId}`)}
            />
          ),
        });
      });

    return blocks;
  }, [cv, focusEditorTarget]);

  useEffect(() => {
    measureRefs.current = measureRefs.current.slice(0, previewBlocks.length);

    if (previewMode !== "print") {
      setPages([previewBlocks]);
      return;
    }

    const calculatePages = () => {
      const firstBlock = measureRefs.current[0];
      if (!firstBlock) {
        setPages([previewBlocks]);
        return;
      }

      const mmToPx = firstBlock.offsetWidth / 178;
      const pageContentHeight = (A4_PAGE_HEIGHT_MM - A4_PAGE_PADDING_TOP_MM - A4_PAGE_PADDING_BOTTOM_MM) * mmToPx;

      const nextPages = [];
      let currentPage = [];
      let currentHeight = 0;

      previewBlocks.forEach((block, index) => {
        const node = measureRefs.current[index];
        const blockHeight = node?.offsetHeight || 0;

        if (currentPage.length > 0 && currentHeight + blockHeight > pageContentHeight) {
          nextPages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
        }

        currentPage.push(block);
        currentHeight += blockHeight;
      });

      if (currentPage.length > 0) {
        nextPages.push(currentPage);
      }

      setPages(nextPages.length > 0 ? nextPages : [previewBlocks]);
    };

    const rafId = window.requestAnimationFrame(calculatePages);
    window.addEventListener("resize", calculatePages);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", calculatePages);
    };
  }, [previewBlocks, previewMode]);

  const renderedPages = previewMode === "print"
    ? (pages.length > 0 ? pages : [previewBlocks])
    : [previewBlocks];

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true">
        <div className="backdrop-orb backdrop-orb-left" />
        <div className="backdrop-orb backdrop-orb-right" />
        <div className="backdrop-grid" />
      </div>
      <aside className="editor-pane">
        <header className={`topbar ${isEditorScrolled ? "is-compact" : ""}`}>
          <div className="topbar-copy">
            <p className="eyebrow">CV Builder</p>
            <h1>Editable CV Website</h1>
            <p className="lede">
              Update your CV in the browser, add custom sections, and export it as a polished PDF.
            </p>
          </div>
          <div className="actions">
            <button className="secondary" onClick={resetCv}>Reset Sample</button>
            <button className="secondary" onClick={handleSave}>{saveLabel}</button>
            <button onClick={handleExportPdf}>{exportLabel}</button>
          </div>
        </header>

        <main
          className="editor-scroll"
          ref={editorScrollRef}
          onScroll={(event) => setIsEditorScrolled(event.currentTarget.scrollTop > 28)}
        >
          <div className="editor-content">
            <BasicsPanel
              cvName={cv.name}
              basics={cv.basics}
              activeInspectorTarget={activeInspectorTarget}
              registerEditorTarget={registerEditorTarget}
              updateCvName={updateCvName}
              updateBasics={updateBasics}
            />

            <SectionsPanel
              sections={cv.sections || []}
              sectionCount={sectionCount}
              activeInspectorTarget={activeInspectorTarget}
              collapsedSections={collapsedSections}
              collapsedItems={collapsedItems}
              insertMenuIndex={insertMenuIndex}
              setInsertMenuIndex={setInsertMenuIndex}
              registerEditorTarget={registerEditorTarget}
              toggleSectionCollapsed={toggleSectionCollapsed}
              toggleItemCollapsed={toggleItemCollapsed}
              moveSection={moveSection}
              moveItem={moveItem}
              updateSection={updateSection}
              updateItem={updateItem}
              setCv={setCv}
              insertSectionAt={insertSectionAt}
            />
          </div>
        </main>
      </aside>

      <section className="preview-pane">
        <div className="preview-toolbar">
          <div className="preview-toolbar-copy">
            <span>Live Preview</span>
            <small>
              {previewMode === "print"
                ? `${renderedPages.length} ${renderedPages.length === 1 ? "page" : "pages"}`
                : "Responsive website view"}
            </small>
          </div>
          <div className="preview-mode-toggle">
            <button
              className={previewMode === "print" ? "" : "secondary"}
              onClick={() => setPreviewMode("print")}
            >A4</button>
            <button
              className={previewMode === "website" ? "" : "secondary"}
              onClick={() => setPreviewMode("website")}
            >Web</button>
          </div>
        </div>
        <div className={`preview-scroll preview-mode-${previewMode}`}>
          {renderedPages.map((pageBlocks, pageIndex) => (
            <article className="cv-page" key={`page-${pageIndex}`}>
              {pageBlocks.map((block) => (
                <div key={block.id} className="cv-page-block">
                  {block.render()}
                </div>
              ))}
            </article>
          ))}
          <div className="cv-measure-layer" aria-hidden="true">
            <article className="cv-page cv-page-measure">
              {previewBlocks.map((block, index) => (
                <div
                  key={`measure-${block.id}`}
                  className="cv-page-block"
                  ref={(node) => {
                    measureRefs.current[index] = node;
                  }}
                >
                  {block.render()}
                </div>
              ))}
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
