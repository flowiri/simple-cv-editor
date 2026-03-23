const JSON_HEADERS = {
  "Content-Type": "application/json",
};

async function parseJsonResponse(response) {
  if (!response.ok) {
    const body = await response.text();

    try {
      const parsed = JSON.parse(body);
      throw new Error(parsed?.error || `Request failed with ${response.status}`);
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }

    throw new Error(body || `Request failed with ${response.status}`);
  }

  return response.json();
}

function createHeaders(token, extraHeaders = {}) {
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiJson(path, { method = "GET", token = "", body } = {}) {
  const response = await fetch(path, {
    method,
    headers: createHeaders(token, body === undefined ? {} : JSON_HEADERS),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseJsonResponse(response);
}

export function registerLocalAccount(username, password) {
  return apiJson("/api/auth/register", {
    method: "POST",
    body: { username, password },
  });
}

export function loginLocalAccount(username, password) {
  return apiJson("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function fetchSession(token) {
  return apiJson("/api/auth/session", { token });
}

export function logoutSession(token) {
  return apiJson("/api/auth/logout", {
    method: "POST",
    token,
  });
}

export function changePassword(token, currentPassword, nextPassword) {
  return apiJson("/api/auth/change-password", {
    method: "POST",
    token,
    body: { currentPassword, nextPassword },
  });
}

export function fetchCvList(token) {
  return apiJson("/api/cvs", { token });
}

export function fetchTemplateList(token) {
  return apiJson("/api/templates", { token });
}

export function fetchPublicTemplateList(token) {
  return apiJson("/api/templates/public", { token });
}

export function fetchTemplateById(token, templateId) {
  return apiJson(`/api/templates/${templateId}`, { token });
}

export function fetchCvById(token, cvId) {
  return apiJson(`/api/cvs/${cvId}`, { token });
}

export function fetchLatestCv(token) {
  return apiJson("/api/cvs/latest", { token });
}

export function createCv(token, template = "blank") {
  return apiJson("/api/cvs/new", {
    method: "POST",
    token,
    body: { template },
  });
}

export function deleteCvs(token, ids) {
  return apiJson("/api/cvs/delete", {
    method: "POST",
    token,
    body: { ids },
  });
}

export function renameCv(token, cvId, name) {
  return apiJson(`/api/cvs/${cvId}/rename`, {
    method: "POST",
    token,
    body: { name },
  });
}

export function renameTemplate(token, templateId, name) {
  return apiJson(`/api/templates/${templateId}/rename`, {
    method: "POST",
    token,
    body: { name },
  });
}

export function setTemplateVisibility(token, templateId, isPublic) {
  return apiJson(`/api/templates/${templateId}/visibility`, {
    method: "POST",
    token,
    body: { isPublic },
  });
}

export function saveCv(token, cv) {
  return apiJson("/api/cvs", {
    method: "POST",
    token,
    body: cv,
  });
}

export function saveTemplate(token, name, document, templateId = "") {
  return apiJson("/api/templates", {
    method: "POST",
    token,
    body: { name, document, templateId },
  });
}

export function deleteTemplates(token, ids) {
  return apiJson("/api/templates/delete", {
    method: "POST",
    token,
    body: { ids },
  });
}

export function createCvFromTemplate(token, templateId) {
  return apiJson(`/api/templates/${templateId}/create-cv`, {
    method: "POST",
    token,
  });
}

export async function exportCvPdf(token, cv) {
  const response = await fetch("/api/cvs/export-pdf", {
    method: "POST",
    headers: createHeaders(token, JSON_HEADERS),
    body: JSON.stringify(cv),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `PDF export failed with ${response.status}`);
  }

  return response.blob();
}
