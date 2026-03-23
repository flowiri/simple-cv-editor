const JSON_HEADERS = {
  "Content-Type": "application/json",
};

async function parseJsonResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json();
}

export async function fetchLatestCv() {
  const response = await fetch("/api/cvs/latest");
  return parseJsonResponse(response);
}

export async function saveCv(cv) {
  const response = await fetch("/api/cvs", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(cv),
  });

  return parseJsonResponse(response);
}

export async function exportCvPdf(cv) {
  const response = await fetch("/api/cvs/export-pdf", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(cv),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `PDF export failed with ${response.status}`);
  }

  return response.blob();
}
