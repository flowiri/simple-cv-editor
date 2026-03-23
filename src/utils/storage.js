const SESSION_KEY = "cv-builder-session-v1";
const LAST_CV_KEY_PREFIX = "cv-builder-last-cv";
const CV_DRAFT_KEY_PREFIX = "cv-builder-draft";
const WORKSPACE_SCREEN_KEY_PREFIX = "cv-builder-workspace-screen";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export function loadSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const parsed = safeParse(raw);

  if (!parsed?.token || !parsed?.user?.id) {
    return null;
  }

  return parsed;
}

export function saveSession(session) {
  if (typeof window === "undefined") return;

  if (!session?.token || !session?.user?.id) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function loadLastCvId(userId) {
  if (typeof window === "undefined" || !userId) return "";
  return window.localStorage.getItem(`${LAST_CV_KEY_PREFIX}:${userId}`) || "";
}

export function saveLastCvId(userId, cvId) {
  if (typeof window === "undefined" || !userId) return;

  if (!cvId) {
    window.localStorage.removeItem(`${LAST_CV_KEY_PREFIX}:${userId}`);
    return;
  }

  window.localStorage.setItem(`${LAST_CV_KEY_PREFIX}:${userId}`, cvId);
}

export function loadWorkspaceScreen(userId) {
  if (typeof window === "undefined" || !userId) return "library";
  return window.localStorage.getItem(`${WORKSPACE_SCREEN_KEY_PREFIX}:${userId}`) || "library";
}

export function saveWorkspaceScreen(userId, screen) {
  if (typeof window === "undefined" || !userId) return;

  if (!screen) {
    window.localStorage.removeItem(`${WORKSPACE_SCREEN_KEY_PREFIX}:${userId}`);
    return;
  }

  window.localStorage.setItem(`${WORKSPACE_SCREEN_KEY_PREFIX}:${userId}`, screen);
}

function getDraftKey(userId, cvId) {
  return `${CV_DRAFT_KEY_PREFIX}:${userId}:${cvId}`;
}

export function loadCvDraft(userId, cvId) {
  if (typeof window === "undefined" || !userId || !cvId) return null;
  const raw = window.localStorage.getItem(getDraftKey(userId, cvId));
  if (!raw) return null;
  return safeParse(raw);
}

export function saveCvDraft(userId, cvId, cv) {
  if (typeof window === "undefined" || !userId || !cvId || !cv) return;
  window.localStorage.setItem(getDraftKey(userId, cvId), JSON.stringify(cv));
}

export function clearCvDraft(userId, cvId) {
  if (typeof window === "undefined" || !userId || !cvId) return;
  window.localStorage.removeItem(getDraftKey(userId, cvId));
}
