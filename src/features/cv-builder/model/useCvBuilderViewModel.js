import { useEffect, useMemo, useReducer } from "react";
import { STORAGE_KEY, loadInitialState } from "../../../utils/storage.js";
import { exportCvPdf, fetchLatestCv, saveCv } from "../../../utils/api.js";
import { createCvBuilderState, cvBuilderReducer } from "./cvBuilderReducer.js";
import { useEditorNavigator } from "./useEditorNavigator.js";

export function useCvBuilderViewModel() {
  const [state, dispatch] = useReducer(
    cvBuilderReducer,
    undefined,
    () => createCvBuilderState(loadInitialState())
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cv));
  }, [state.cv]);

  useEffect(() => {
    let isActive = true;

    fetchLatestCv()
      .then((remoteCv) => {
        if (!isActive || !remoteCv || typeof remoteCv !== "object") return;
        dispatch({ type: "set-cv", value: remoteCv });
      })
      .catch(() => {
        // Keep the locally seeded state when the API is unavailable.
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!state.activeInspectorTarget) return undefined;
    const timeoutId = window.setTimeout(
      () => dispatch({ type: "set-active-inspector-target", value: "" }),
      1800
    );
    return () => window.clearTimeout(timeoutId);
  }, [state.activeInspectorTarget]);

  const {
    editorScrollRef,
    registerEditorTarget,
    focusEditorTarget,
  } = useEditorNavigator({
    onActivateTarget: (targetId) =>
      dispatch({ type: "set-active-inspector-target", value: targetId }),
    onExpandSection: (sectionId) =>
      dispatch({ type: "expand-section", sectionId }),
    onExpandItem: (itemId) =>
      dispatch({ type: "expand-item", itemId }),
  });

  const sectionCount = useMemo(
    () => (Array.isArray(state.cv.sections) ? state.cv.sections.length : 0),
    [state.cv.sections]
  );

  const setCv = (updater) => {
    if (typeof updater === "function") {
      dispatch({ type: "set-cv", updater });
      return;
    }

    dispatch({ type: "set-cv", value: updater });
  };

  const handleSave = async () => {
    dispatch({ type: "set-save-label", value: "Saving..." });

    try {
      const savedCv = await saveCv(state.cv);
      dispatch({ type: "set-cv", value: savedCv });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCv));
      dispatch({ type: "set-save-label", value: "Saved" });
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cv));
      dispatch({ type: "set-save-label", value: "Saved locally" });
    }

    window.setTimeout(() => {
      dispatch({ type: "set-save-label", value: "Save" });
    }, 1400);
  };

  const handleExportPdf = async () => {
    dispatch({ type: "set-export-label", value: "Rendering..." });

    try {
      const pdfBlob = await exportCvPdf(state.cv);
      const fileUrl = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = `${(state.cv.name || "cv").trim() || "cv"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(fileUrl);
      dispatch({ type: "set-export-label", value: "Downloaded" });
    } catch {
      dispatch({ type: "set-export-label", value: "Export failed" });
    }

    window.setTimeout(() => {
      dispatch({ type: "set-export-label", value: "Export PDF" });
    }, 1600);
  };

  return {
    cv: state.cv,
    setCv,
    saveLabel: state.saveLabel,
    exportLabel: state.exportLabel,
    activeInspectorTarget: state.activeInspectorTarget,
    collapsedSections: state.collapsedSections,
    collapsedItems: state.collapsedItems,
    insertMenuIndex: state.insertMenuIndex,
    setInsertMenuIndex: (value) =>
      dispatch({
        type: "set-insert-menu-index",
        value: typeof value === "function" ? value(state.insertMenuIndex) : value,
      }),
    sectionCount,
    editorScrollRef,
    handleSave,
    handleExportPdf,
    updateCvName: (value) =>
      dispatch({
        type: "set-cv",
        updater: (current) => ({ ...current, name: value }),
      }),
    updateBasics: (key, value) => dispatch({ type: "update-basics", key, value }),
    updateSection: (sectionId, updater) =>
      dispatch({ type: "update-section", sectionId, updater }),
    updateItem: (sectionId, itemId, updater) =>
      dispatch({ type: "update-item", sectionId, itemId, updater }),
    moveSection: (sectionId, delta) =>
      dispatch({ type: "move-section", sectionId, delta }),
    moveItem: (sectionId, itemId, delta) =>
      dispatch({ type: "move-item", sectionId, itemId, delta }),
    insertSectionAt: (index, templateKey) =>
      dispatch({ type: "insert-section-at", index, templateKey }),
    registerEditorTarget,
    focusEditorTarget,
    toggleSectionCollapsed: (sectionId) =>
      dispatch({ type: "toggle-section-collapsed", sectionId }),
    toggleItemCollapsed: (itemId) =>
      dispatch({ type: "toggle-item-collapsed", itemId }),
    resetCv: () => dispatch({ type: "reset-cv" }),
  };
}
