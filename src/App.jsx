import { useEffect, useMemo, useRef, useState } from "react";
import { useCvBuilderViewModel } from "./features/cv-builder/model/useCvBuilderViewModel.js";
import { AuthScreen } from "./components/auth/AuthScreen.jsx";
import { AccountPanel } from "./components/account/AccountPanel.jsx";
import { BasicsPanel } from "./components/editor/BasicsPanel.jsx";
import { SectionsPanel } from "./components/editor/SectionsPanel.jsx";
import { CvLibraryPanel } from "./components/library/CvLibraryPanel.jsx";
import { ContactRow } from "./components/preview/ContactRow.jsx";
import { PreviewSection } from "./components/preview/PreviewSection.jsx";
import { renderFormattedParagraph } from "./utils/formatting.jsx";
import { getSectionKind } from "./utils/sections.js";
import { loadSession, loadWorkspaceScreen, saveWorkspaceScreen } from "./utils/storage.js";

const A4_PAGE_HEIGHT_MM = 297;
const A4_PAGE_PADDING_TOP_MM = 15;
const A4_PAGE_PADDING_BOTTOM_MM = 16;
const A4_PAGE_BOTTOM_BUFFER_MM = 12;

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h11l3 3v13H5zm2 2v4h8V6zm0 12h10v-6H7zm2-2v-2h6v2z" fill="currentColor" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9l5 5v13H6zm8 1.5V9h4.5zM12 11l4 4h-2.5v4h-3v-4H8zm-3 9h8v1H9z" fill="currentColor" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 16.75 9.88-9.88 3.25 3.25L7.25 20H4zM14.59 6.16l1.77-1.77a1.5 1.5 0 0 1 2.12 0l1.13 1.13a1.5 1.5 0 0 1 0 2.12l-1.77 1.77z" fill="currentColor" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m11 6-6 6 6 6 1.4-1.4-3.6-3.6H20v-2H8.8l3.6-3.6z" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const [previewMode, setPreviewMode] = useState("print");
  const [workspaceScreen, setWorkspaceScreen] = useState(() => {
    const bootstrapSession = loadSession();
    return bootstrapSession?.user?.id
      ? loadWorkspaceScreen(bootstrapSession.user.id)
      : "library";
  });
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [isEditorScrolled, setIsEditorScrolled] = useState(false);
  const [isEditorTopbarVisible, setIsEditorTopbarVisible] = useState(true);
  const [isEditingCvName, setIsEditingCvName] = useState(false);
  const [draftCvName, setDraftCvName] = useState("");
  const [editorTopbarHeight, setEditorTopbarHeight] = useState(92);
  const [pages, setPages] = useState([]);
  const measureRefs = useRef([]);
  const workspaceMenuRef = useRef(null);
  const editorTopbarRef = useRef(null);
  const cvNameInputRef = useRef(null);
  const lastEditorScrollTopRef = useRef(0);
  const lastPreviewScrollTopRef = useRef(0);
  const lastWorkspaceUserRef = useRef("");
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
    session,
    isAuthenticated,
    workspaceStatus,
    authStatus,
    authError,
    cvList,
    selectedCvId,
    login,
    register,
    logout,
    createNewCv,
    selectCv,
    deleteManyCvs,
    renameCvName,
    changePassword,
    loadSampleData,
    autoSaveLabel,
    passwordLabel,
    passwordError,
  } = useCvBuilderViewModel();

  const previewBlocks = useMemo(() => {
    const isEditorWorkspace = workspaceScreen === "editor";
    const blocks = [
      {
        id: "header",
        spacingBefore: 0,
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
        spacingBefore: 0,
        render: () => (
          <section
            className={`cv-section ${isEditorWorkspace ? "preview-clickable" : ""}`}
            onClick={isEditorWorkspace ? () => focusEditorTarget("basics-summary") : undefined}
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
        const sectionKind = getSectionKind(section.title, section.type, section.sectionTemplate);
        const items = Array.isArray(section.items) ? section.items.filter(Boolean) : [];
        const isSplittableListSection =
          items.length > 0 &&
          (section.type === "entry-list" || sectionKind === "achievements");

        if (!isSplittableListSection) {
          blocks.push({
            id: section.id,
            spacingBefore: 0,
            render: () => (
              <PreviewSection
                section={section}
                onSectionClick={isEditorWorkspace ? () => focusEditorTarget(`section:${section.id}`) : undefined}
                onItemClick={isEditorWorkspace ? (itemId) => focusEditorTarget(`item:${itemId}`) : undefined}
              />
            ),
          });
          return;
        }

        items.forEach((item, index) => {
          const spacingBefore = sectionKind === "work-experience"
            ? 0.5
            : sectionKind === "achievements" || sectionKind === "certificates"
              ? 0.45
              : 0.7;
          const keepBottomClearance = sectionKind === "publications"
            ? A4_PAGE_BOTTOM_BUFFER_MM
            : 0;

          blocks.push({
            id: `${section.id}:${item.id}`,
            spacingBefore: index === 0 ? 0 : spacingBefore,
            keepBottomClearance,
            render: () => (
              <PreviewSection
                section={section}
                itemsOverride={[item]}
                showTitle={index === 0}
                onSectionClick={isEditorWorkspace ? () => focusEditorTarget(`section:${section.id}`) : undefined}
                onItemClick={isEditorWorkspace ? (itemId) => focusEditorTarget(`item:${itemId}`) : undefined}
              />
            ),
          });
        });
      });

    return blocks;
  }, [cv, focusEditorTarget, workspaceScreen]);

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
        const blockSpacing = currentPage.length > 0 ? (block.spacingBefore || 0) * 16 : 0;
        const keepBottomClearancePx = ((block.keepBottomClearance || 0) / 178) * firstBlock.offsetWidth;
        const nextHeight = currentHeight + blockSpacing + blockHeight;
        const shouldPushToNextPage =
          currentPage.length > 0 &&
          nextHeight <= pageContentHeight &&
          pageContentHeight - nextHeight < keepBottomClearancePx;

        if (
          currentPage.length > 0 &&
          (nextHeight > pageContentHeight || shouldPushToNextPage)
        ) {
          nextPages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
        }

        currentPage.push(block);
        currentHeight += (currentPage.length > 1 ? (block.spacingBefore || 0) * 16 : 0) + blockHeight;
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
  const previewStatusLabel = workspaceStatus === "loading"
    ? "Loading CV..."
    : previewMode === "print"
      ? `${renderedPages.length} ${renderedPages.length === 1 ? "page" : "pages"}`
      : "Responsive preview";

  const selectedCvMeta = useMemo(
    () => cvList.find((item) => item.id === selectedCvId) || null,
    [cvList, selectedCvId]
  );
  const isViewerScreen = workspaceScreen === "viewer";
  const isEditorScreen = workspaceScreen === "editor";
  const displayCvName = cv.name || selectedCvMeta?.name || "Untitled CV";

  useEffect(() => {
    const userId = session?.user?.id || "";

    if (!userId) {
      lastWorkspaceUserRef.current = "";
      setWorkspaceScreen("library");
      return;
    }

    if (lastWorkspaceUserRef.current !== userId) {
      lastWorkspaceUserRef.current = userId;
      setWorkspaceScreen(loadWorkspaceScreen(userId));
      setWorkspaceMenuOpen(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    saveWorkspaceScreen(session.user.id, workspaceScreen);
  }, [session?.user?.id, workspaceScreen]);

  useEffect(() => {
    if (!workspaceMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!workspaceMenuRef.current?.contains(event.target)) {
        setWorkspaceMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [workspaceMenuOpen]);

  useEffect(() => {
    setDraftCvName(displayCvName);
    setIsEditingCvName(false);
  }, [displayCvName, selectedCvId]);

  useEffect(() => {
    if (!isEditingCvName) return undefined;

    const rafId = window.requestAnimationFrame(() => {
      cvNameInputRef.current?.focus();
      cvNameInputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [isEditingCvName]);

  useEffect(() => {
    if (workspaceScreen !== "editor" && workspaceScreen !== "viewer") return undefined;

    const updateTopbarHeight = () => {
      setEditorTopbarHeight(editorTopbarRef.current?.offsetHeight || 92);
    };

    updateTopbarHeight();
    window.addEventListener("resize", updateTopbarHeight);

    return () => {
      window.removeEventListener("resize", updateTopbarHeight);
    };
  }, [workspaceScreen, displayCvName, isEditingCvName]);

  useEffect(() => {
    if (workspaceMenuOpen || isEditingCvName) {
      setIsEditorTopbarVisible(true);
    }
  }, [workspaceMenuOpen, isEditingCvName]);

  useEffect(() => {
    if (workspaceScreen === "editor" || workspaceScreen === "viewer") {
      setIsEditorTopbarVisible(true);
      lastEditorScrollTopRef.current = 0;
      lastPreviewScrollTopRef.current = 0;
    }
  }, [workspaceScreen, selectedCvId]);

  useEffect(() => {
    if (
      (workspaceScreen === "editor" || workspaceScreen === "viewer")
      && !selectedCvId
      && workspaceStatus === "ready"
    ) {
      setWorkspaceScreen("library");
    }
  }, [workspaceScreen, selectedCvId, workspaceStatus]);

  if (!isAuthenticated) {
    return (
      <AuthScreen
        authStatus={authStatus}
        authError={authError}
        onLogin={login}
        onRegister={register}
      />
    );
  }

  const handleOpenCv = async (cvId) => {
    const didOpen = await selectCv(cvId);
    if (didOpen) {
      setWorkspaceScreen("editor");
      setWorkspaceMenuOpen(false);
    }
  };

  const handlePreviewCv = async (cvId) => {
    const didOpen = await selectCv(cvId);
    if (didOpen) {
      setWorkspaceScreen("viewer");
      setWorkspaceMenuOpen(false);
    }
  };

  const handleCreateCvAndOpen = async (template) => {
    const didCreate = await createNewCv(template);
    if (didCreate) {
      setWorkspaceScreen("editor");
      setWorkspaceMenuOpen(false);
    }
  };

  const goToScreen = (nextScreen) => {
    setWorkspaceScreen(nextScreen);
    setWorkspaceMenuOpen(false);
  };

  const commitCvNameChange = () => {
    const nextName = String(draftCvName || "").trim() || "Untitled CV";
    updateCvName(nextName);
    setDraftCvName(nextName);
    setIsEditingCvName(false);
  };

  const handleCvNameKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitCvNameChange();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setDraftCvName(displayCvName);
      setIsEditingCvName(false);
    }
  };

  const syncTopbarVisibility = (scrollTop, previousScrollTop) => {
    setIsEditorScrolled(scrollTop > 18);
    setIsEditorTopbarVisible(true);
  };

  const handleEditorScroll = (event) => {
    const scrollTop = event.currentTarget.scrollTop;
    const previousScrollTop = lastEditorScrollTopRef.current;

    syncTopbarVisibility(scrollTop, previousScrollTop);
    lastEditorScrollTopRef.current = scrollTop;
  };

  const handlePreviewScroll = (event) => {
    const scrollTop = event.currentTarget.scrollTop;
    const previousScrollTop = lastPreviewScrollTopRef.current;

    syncTopbarVisibility(scrollTop, previousScrollTop);
    lastPreviewScrollTopRef.current = scrollTop;
  };

  const renderWorkspaceNav = () => (
    <nav className="workspace-nav" aria-label="Workspace">
      <button
        type="button"
        className={`workspace-nav-button ${workspaceScreen === "library" ? "is-active" : "secondary"}`}
        onClick={() => goToScreen("library")}
      >
        My CVs
      </button>
      <button
        type="button"
        className={`workspace-nav-button ${workspaceScreen === "profile" ? "is-active" : "secondary"}`}
        onClick={() => goToScreen("profile")}
      >
        Profile
      </button>
    </nav>
  );

  const renderWorkspaceMenu = () => (
    <div className="workspace-user-menu" ref={workspaceMenuRef}>
      <button
        type="button"
        className="secondary workspace-user-trigger"
        aria-haspopup="menu"
        aria-expanded={workspaceMenuOpen}
        onClick={() => setWorkspaceMenuOpen((current) => !current)}
      >
        <span className="workspace-user-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </button>

      {workspaceMenuOpen ? (
        <div className="workspace-menu-dropdown" role="menu">
          <div className="workspace-menu-copy">
            <strong>{session.user.username}</strong>
            <small>{cvList.length} CV{cvList.length === 1 ? "" : "s"} in account</small>
          </div>
          <button type="button" className="workspace-menu-item" onClick={() => goToScreen("library")}>
            My CVs
          </button>
          <button type="button" className="workspace-menu-item" onClick={() => goToScreen("profile")}>
            Profile
          </button>
          <button
            type="button"
            className="workspace-menu-item workspace-menu-item-danger"
            onClick={() => {
              setWorkspaceMenuOpen(false);
              logout();
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );

  if (workspaceScreen === "library" || workspaceScreen === "profile") {
    return (
      <div className="workspace-shell">
        <div className="app-backdrop" aria-hidden="true">
          <div className="backdrop-orb backdrop-orb-left" />
          <div className="backdrop-orb backdrop-orb-right" />
          <div className="backdrop-grid" />
        </div>

        <header className="workspace-header">
          <div className="workspace-header-copy">
            <p className="eyebrow">CV Builder</p>
          </div>

          <div className="workspace-header-actions">
            {renderWorkspaceNav()}
            {renderWorkspaceMenu()}
          </div>
        </header>

        <main className="workspace-main">
          {workspaceScreen === "library" ? (
            <CvLibraryPanel
              cvs={cvList}
              selectedCvId={selectedCvId}
              workspaceStatus={workspaceStatus}
              onSelectCv={handleOpenCv}
              onPreviewCv={handlePreviewCv}
              onRenameCv={renameCvName}
              onCreateCv={handleCreateCvAndOpen}
              onDeleteCvs={deleteManyCvs}
            />
          ) : (
            <AccountPanel
              username={session.user.username}
              userId={session.user.id}
              cvCount={cvList.length}
              activeCvName={selectedCvMeta?.name || (selectedCvId ? cv.name : "")}
              passwordLabel={passwordLabel}
              passwordError={passwordError}
              onChangePassword={changePassword}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div
      className="editor-shell"
      style={{ "--editor-topbar-height": `${editorTopbarHeight}px` }}
    >
      <div className="app-backdrop" aria-hidden="true">
        <div className="backdrop-orb backdrop-orb-left" />
        <div className="backdrop-orb backdrop-orb-right" />
        <div className="backdrop-grid" />
      </div>

      <header
        ref={editorTopbarRef}
        className={`topbar editor-topbar ${isEditorScrolled ? "is-compact" : ""} ${isEditorTopbarVisible ? "" : "is-hidden"}`}
        onFocusCapture={() => setIsEditorTopbarVisible(true)}
        onMouseEnter={() => setIsEditorTopbarVisible(true)}
      >
        <div className="editor-topbar-row">
          <div className="topbar-copy">
            <p className="eyebrow">CV Builder</p>
            <div className="editor-title-row">
              {(isViewerScreen || isEditorScreen) ? (
                <button
                  type="button"
                  className="icon-btn secondary toolbar-icon-button editor-back-button"
                  title="Back to My CVs"
                  aria-label="Back to My CVs"
                  onClick={() => goToScreen("library")}
                >
                  <BackIcon />
                </button>
              ) : (
                null
              )}

              {(isEditorScreen || isViewerScreen) && isEditingCvName ? (
                <input
                  ref={cvNameInputRef}
                  className="editor-title-input"
                  value={draftCvName}
                  onChange={(event) => setDraftCvName(event.target.value)}
                  onBlur={commitCvNameChange}
                  onKeyDown={handleCvNameKeyDown}
                  aria-label="CV name"
                />
              ) : isEditorScreen || isViewerScreen ? (
                <button
                  type="button"
                  className="editor-title-button"
                  onClick={() => {
                    setDraftCvName(displayCvName);
                    setIsEditingCvName(true);
                    setIsEditorTopbarVisible(true);
                  }}
                  title="Rename CV"
                >
                  {displayCvName}
                </button>
              ) : (
                <h1 className="viewer-title">{displayCvName}</h1>
              )}
            </div>
          </div>
          <div className="topbar-tools">
            <div className="toolbar-group toolbar-group-preview">
              <div className="topbar-status-block">
                <span className="topbar-status-label">Preview</span>
                <small>{previewStatusLabel}</small>
              </div>
              <div className="preview-mode-toggle">
                <button
                  className={previewMode === "print" ? "" : "secondary"}
                  onClick={() => setPreviewMode("print")}
                >
                  A4
                </button>
                <button
                  className={previewMode === "website" ? "" : "secondary"}
                  onClick={() => setPreviewMode("website")}
                >
                  Web
                </button>
              </div>
            </div>

            {isEditorScreen ? (
              <div className="toolbar-group toolbar-group-status">
                <div className="topbar-status-block">
                  <span className="topbar-status-label">Autosave</span>
                  <small>{autoSaveLabel}</small>
                </div>
              </div>
            ) : null}

            <div className="toolbar-group toolbar-group-actions">
              {isViewerScreen ? (
                <button
                  type="button"
                  className="icon-btn secondary toolbar-icon-button"
                  title="Edit CV"
                  aria-label="Edit CV"
                  onClick={() => setWorkspaceScreen("editor")}
                >
                  <EditIcon />
                </button>
              ) : isEditorScreen ? (
                <button className="secondary small" onClick={loadSampleData}>Feed Sample</button>
              ) : null}

              {isEditorScreen ? (
                <button
                  type="button"
                  className="icon-btn secondary toolbar-icon-button"
                  title={saveLabel}
                  aria-label={saveLabel}
                  onClick={handleSave}
                >
                  <SaveIcon />
                </button>
              ) : null}

              <button
                type="button"
                className="icon-btn toolbar-icon-button"
                title={exportLabel}
                aria-label={exportLabel}
                onClick={handleExportPdf}
              >
                <ExportIcon />
              </button>
            </div>

            {renderWorkspaceMenu()}
          </div>
        </div>
      </header>

      <div className={`app-shell editor-app-shell ${isViewerScreen ? "viewer-app-shell" : ""}`}>
        {isEditorScreen ? (
          <aside className="editor-pane">
            <main
              className="editor-scroll"
              ref={editorScrollRef}
              onScroll={handleEditorScroll}
              onFocusCapture={() => setIsEditorTopbarVisible(true)}
            >
              <div className="editor-content">
                <BasicsPanel
                  basics={cv.basics}
                  activeInspectorTarget={activeInspectorTarget}
                  registerEditorTarget={registerEditorTarget}
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
        ) : null}

        <section className={`preview-pane ${isViewerScreen ? "preview-pane-full" : ""}`}>
          <div
            className={`preview-scroll preview-mode-${previewMode} ${isViewerScreen ? "viewer-preview-scroll" : ""}`}
            onScroll={handlePreviewScroll}
            onFocusCapture={() => setIsEditorTopbarVisible(true)}
          >
            {renderedPages.map((pageBlocks, pageIndex) => (
              <article className="cv-page" key={`page-${pageIndex}`}>
                {pageBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="cv-page-block"
                    style={{ marginTop: block.spacingBefore && pageBlocks[0] !== block ? `${block.spacingBefore}rem` : 0 }}
                  >
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
    </div>
  );
}
