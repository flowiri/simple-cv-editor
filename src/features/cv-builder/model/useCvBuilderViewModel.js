import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  changePassword,
  createCv,
  deleteCvs,
  exportCvPdf,
  fetchCvById,
  fetchCvList,
  fetchSession,
  loginLocalAccount,
  logoutSession,
  renameCv,
  registerLocalAccount,
  saveCv,
} from "../../../utils/api.js";
import { applySeedDataToCv, createBlankCv } from "../../../utils/cvData.js";
import {
  clearCvDraft,
  clearSession,
  loadCvDraft,
  loadLastCvId,
  loadSession,
  saveCvDraft,
  saveLastCvId,
  saveSession,
} from "../../../utils/storage.js";
import { createCvBuilderState, cvBuilderReducer } from "./cvBuilderReducer.js";
import { useEditorNavigator } from "./useEditorNavigator.js";

function serializeCv(cv) {
  try {
    return JSON.stringify(cv || null);
  } catch {
    return "";
  }
}

function resolveWorkspaceCv(userId, cvId, serverCv) {
  if (!userId || !cvId) {
    return serverCv;
  }

  const draft = loadCvDraft(userId, cvId);
  return draft?.id === cvId ? draft : serverCv;
}

function mergeCvIntoList(list, cvDocument) {
  if (!cvDocument?.id) {
    return list;
  }

  const nextItem = {
    id: cvDocument.id,
    name: cvDocument.name || "Untitled CV",
    updatedAt: new Date().toISOString(),
  };

  const remaining = Array.isArray(list)
    ? list.filter((item) => item.id !== cvDocument.id)
    : [];

  return [nextItem, ...remaining];
}

async function loadWorkspaceData(token, userId, preferredCvId = "") {
  let cvs = await fetchCvList(token);

  if (!Array.isArray(cvs) || cvs.length === 0) {
    return {
      cvs,
      currentCv: createBlankCv(),
      persistedCv: createBlankCv(),
      selectedCvId: "",
    };
  }

  const rememberedCvId = preferredCvId || loadLastCvId(userId);
  const selectedCvId = cvs.some((cv) => cv.id === rememberedCvId)
    ? rememberedCvId
    : cvs[0].id;

  const serverCv = await fetchCvById(token, selectedCvId);
  const currentCv = resolveWorkspaceCv(userId, selectedCvId, serverCv);

  return {
    cvs,
    currentCv,
    persistedCv: serverCv,
    selectedCvId,
  };
}

export function useCvBuilderViewModel() {
  const [state, dispatch] = useReducer(
    cvBuilderReducer,
    undefined,
    () => createCvBuilderState(createBlankCv())
  );
  const [session, setSessionState] = useState(() => loadSession());
  const [workspaceStatus, setWorkspaceStatus] = useState(() => (session?.token ? "loading" : "idle"));
  const [authStatus, setAuthStatus] = useState("idle");
  const [authError, setAuthError] = useState("");
  const [cvList, setCvList] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [passwordLabel, setPasswordLabel] = useState("Change Password");
  const [passwordError, setPasswordError] = useState("");
  const [autoSaveLabel, setAutoSaveLabel] = useState("Saved");
  const autoSaveTimeoutRef = useRef(null);
  const autoSaveFlashTimeoutRef = useRef(null);
  const lastPersistedCvRef = useRef(serializeCv(createBlankCv()));

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const applySession = (nextSession) => {
    setSessionState(nextSession);
    if (!nextSession?.token) {
      clearSession();
    }
  };

  const markPersisted = (nextCv) => {
    lastPersistedCvRef.current = serializeCv(nextCv);
  };

  const flashAutoSaveLabel = (label) => {
    setAutoSaveLabel(label);

    if (autoSaveFlashTimeoutRef.current) {
      window.clearTimeout(autoSaveFlashTimeoutRef.current);
    }

    if (label === "Saved") {
      return;
    }

    autoSaveFlashTimeoutRef.current = window.setTimeout(() => {
      setAutoSaveLabel("Saved");
    }, 1600);
  };

  const loadWorkspace = async (activeSession, preferredCvId = "") => {
    if (!activeSession?.token || !activeSession?.user?.id) {
      setCvList([]);
      setSelectedCvId("");
      dispatch({ type: "set-cv", value: createBlankCv() });
      setWorkspaceStatus("idle");
      return;
    }

    setWorkspaceStatus("loading");
    const workspace = await loadWorkspaceData(
      activeSession.token,
      activeSession.user.id,
      preferredCvId
    );

    setCvList(workspace.cvs);
    setSelectedCvId(workspace.selectedCvId);
    saveLastCvId(activeSession.user.id, workspace.selectedCvId);
    dispatch({ type: "set-cv", value: workspace.currentCv });
    markPersisted(workspace.persistedCv || workspace.currentCv);
    setAutoSaveLabel("Saved");
    setWorkspaceStatus("ready");
  };

  useEffect(() => {
    let cancelled = false;

    if (!session?.token) {
      setWorkspaceStatus("idle");
      return undefined;
    }

    setWorkspaceStatus("loading");

    fetchSession(session.token)
      .then(({ user }) => {
        if (cancelled) return;
        const activeSession = {
          token: session.token,
          user,
        };
        applySession(activeSession);
        return loadWorkspace(activeSession);
      })
      .catch(() => {
        if (cancelled) return;
        applySession(null);
        setCvList([]);
        setSelectedCvId("");
        markPersisted(createBlankCv());
        setWorkspaceStatus("idle");
      });

    return () => {
      cancelled = true;
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

  useEffect(() => {
    if (!session?.user?.id || !selectedCvId) return undefined;
    saveCvDraft(session.user.id, selectedCvId, state.cv);
    return undefined;
  }, [session?.user?.id, selectedCvId, state.cv]);

  useEffect(() => {
    if (!session?.token || !session?.user?.id || !selectedCvId || workspaceStatus !== "ready") {
      return undefined;
    }

    const currentSerialized = serializeCv(state.cv);
    if (!currentSerialized || currentSerialized === lastPersistedCvRef.current) {
      return undefined;
    }

    setAutoSaveLabel("Autosaving...");

    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = window.setTimeout(async () => {
      try {
        const savedCv = await saveCv(session.token, state.cv);
        dispatch({ type: "set-cv", value: savedCv });
        markPersisted(savedCv);
        clearCvDraft(session.user.id, savedCv.id);
        setCvList((current) => mergeCvIntoList(current, savedCv));
        flashAutoSaveLabel("Autosaved");
      } catch {
        flashAutoSaveLabel("Autosave failed");
      }
    }, 1200);

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [session?.token, session?.user?.id, selectedCvId, state.cv, workspaceStatus]);

  useEffect(() => () => {
    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }

    if (autoSaveFlashTimeoutRef.current) {
      window.clearTimeout(autoSaveFlashTimeoutRef.current);
    }
  }, []);

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

  const authenticate = async (mode, username, password) => {
    setAuthStatus("loading");
    setAuthError("");

    try {
      const nextSession = mode === "register"
        ? await registerLocalAccount(username, password)
        : await loginLocalAccount(username, password);

      applySession(nextSession);
      await loadWorkspace(nextSession);
      setAuthStatus("ready");
    } catch (error) {
      setAuthStatus("idle");
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    }
  };

  const handleSave = async () => {
    if (!session?.token) return;

    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }

    dispatch({ type: "set-save-label", value: "Saving..." });
    setAutoSaveLabel("Saving...");

    try {
      const savedCv = await saveCv(session.token, state.cv);
      dispatch({ type: "set-cv", value: savedCv });
      markPersisted(savedCv);
      clearCvDraft(session.user.id, savedCv.id);
      dispatch({ type: "set-save-label", value: "Saved" });
      setCvList((current) => mergeCvIntoList(current, savedCv));
      setSelectedCvId(savedCv.id);
      saveLastCvId(session.user.id, savedCv.id);
      flashAutoSaveLabel("Saved");
    } catch {
      dispatch({ type: "set-save-label", value: "Save failed" });
      flashAutoSaveLabel("Save failed");
    }

    window.setTimeout(() => {
      dispatch({ type: "set-save-label", value: "Save" });
    }, 1400);
  };

  const handleExportPdf = async () => {
    if (!session?.token) return;

    dispatch({ type: "set-export-label", value: "Rendering..." });

    try {
      const pdfBlob = await exportCvPdf(session.token, state.cv);
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

  const handleSelectCv = async (cvId) => {
    if (!session?.token || !cvId) return false;
    if (cvId === selectedCvId) return true;

    setWorkspaceStatus("loading");

    try {
      const serverCv = await fetchCvById(session.token, cvId);
      const nextCv = resolveWorkspaceCv(session.user.id, cvId, serverCv);
      dispatch({ type: "set-cv", value: nextCv });
      markPersisted(serverCv);
      setAutoSaveLabel("Saved");
      setSelectedCvId(cvId);
      saveLastCvId(session.user.id, cvId);
      setWorkspaceStatus("ready");
      return true;
    } catch {
      setWorkspaceStatus("ready");
      return false;
    }
  };

  const handleCreateCv = async (template) => {
    if (!session?.token) return false;

    setWorkspaceStatus("loading");

    try {
      const createdCv = await createCv(session.token, template);
      const nextList = await fetchCvList(session.token);
      setCvList(nextList);
      setSelectedCvId(createdCv.id);
      saveLastCvId(session.user.id, createdCv.id);
      dispatch({ type: "set-cv", value: createdCv });
      markPersisted(createdCv);
      clearCvDraft(session.user.id, createdCv.id);
      setAutoSaveLabel("Saved");
      setWorkspaceStatus("ready");
      return true;
    } catch {
      setWorkspaceStatus("ready");
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      if (session?.token) {
        await logoutSession(session.token);
      }
    } catch {
      // Clear the local session even if the server revoke fails.
    }

    applySession(null);
    setCvList([]);
    setSelectedCvId("");
    setAuthStatus("idle");
    setAuthError("");
    setPasswordError("");
    setPasswordLabel("Change Password");
    dispatch({ type: "set-cv", value: createBlankCv() });
    dispatch({ type: "set-save-label", value: "Save" });
    dispatch({ type: "set-export-label", value: "Export PDF" });
    setAutoSaveLabel("Saved");
    markPersisted(createBlankCv());
  };

  const handleDeleteCvs = async (ids) => {
    if (!session?.token) return false;

    const safeIds = Array.isArray(ids)
      ? [...new Set(ids.map((value) => String(value || "").trim()).filter(Boolean))]
      : [];

    if (safeIds.length === 0) return false;

    setWorkspaceStatus("loading");

    try {
      await deleteCvs(session.token, safeIds);
      safeIds.forEach((cvId) => clearCvDraft(session.user.id, cvId));
      const nextList = await fetchCvList(session.token);
      setCvList(nextList);

      if (safeIds.includes(selectedCvId)) {
        const nextSelected = nextList[0]?.id || "";
        setSelectedCvId(nextSelected);
        saveLastCvId(session.user.id, nextSelected);

        if (nextSelected) {
          const serverCv = await fetchCvById(session.token, nextSelected);
          const nextCv = resolveWorkspaceCv(session.user.id, nextSelected, serverCv);
          dispatch({ type: "set-cv", value: nextCv });
          markPersisted(nextCv);
        } else {
          const blankCv = createBlankCv();
          dispatch({ type: "set-cv", value: blankCv });
          markPersisted(blankCv);
        }
      }

      setAutoSaveLabel("Saved");
      setWorkspaceStatus("ready");
      return true;
    } catch {
      setWorkspaceStatus("ready");
      return false;
    }
  };

  const handleLoadSampleData = () => {
    dispatch({
      type: "set-cv",
      updater: (current) => applySeedDataToCv(current),
    });
  };

  const handleRenameCvName = async (cvId, nextName) => {
    if (!session?.token || !cvId) return false;

    const safeName = String(nextName || "").trim() || "Untitled CV";

    try {
      const renamed = await renameCv(session.token, cvId, safeName);
      setCvList((current) =>
        current.map((item) => (item.id === cvId ? { ...item, ...renamed } : item))
      );

      if (selectedCvId === cvId) {
        dispatch({
          type: "set-cv",
          updater: (current) => ({ ...current, name: safeName }),
        });
      }

      return true;
    } catch {
      return false;
    }
  };

  const handleChangePassword = async (currentPassword, nextPassword) => {
    if (!session?.token) return;

    setPasswordLabel("Updating...");
    setPasswordError("");

    try {
      await changePassword(session.token, currentPassword, nextPassword);
      setPasswordLabel("Password updated");
    } catch (error) {
      setPasswordLabel("Change Password");
      setPasswordError(error instanceof Error ? error.message : "Password update failed.");
      return false;
    }

    window.setTimeout(() => {
      setPasswordLabel("Change Password");
    }, 1800);

    return true;
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
    session,
    isAuthenticated: Boolean(session?.token && session?.user?.id),
    workspaceStatus,
    authStatus,
    authError,
    cvList,
    selectedCvId,
    login: (username, password) => authenticate("login", username, password),
    register: (username, password) => authenticate("register", username, password),
    logout: handleLogout,
    createNewCv: handleCreateCv,
    selectCv: handleSelectCv,
    deleteManyCvs: handleDeleteCvs,
    renameCvName: handleRenameCvName,
    changePassword: handleChangePassword,
    loadSampleData: handleLoadSampleData,
    autoSaveLabel,
    passwordLabel,
    passwordError,
  };
}
