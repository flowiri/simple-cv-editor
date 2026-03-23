import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import puppeteer from "puppeteer-core";
import {
  changeUserPassword,
  createUserCvDocument,
  deleteUserCvs,
  deleteSession,
  ensureSchema,
  getLatestUserCv,
  getUserCvById,
  getUserFromToken,
  listUserCvs,
  loginUser,
  renameUserCv,
  registerUser,
  saveUserCvDocument,
} from "./db.js";
import { normalizeCvDocument, renderCvHtml } from "./pdfTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 3000);

const app = express();

app.use(express.json({ limit: "5mb" }));

function getBearerToken(request) {
  const header = request.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

async function requireAuth(request, response, next) {
  try {
    const token = getBearerToken(request);
    const user = await getUserFromToken(token);

    if (!user) {
      response.status(401).json({ error: "Authentication required." });
      return;
    }

    request.authToken = token;
    request.authUser = user;
    next();
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Authentication failed." });
  }
}

function sendError(response, error, status = 400) {
  response.status(status).json({
    error: error instanceof Error ? error.message : "Request failed.",
  });
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/register", async (request, response) => {
  try {
    const session = await registerUser(request.body?.username, request.body?.password);
    response.status(201).json(session);
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    const session = await loginUser(request.body?.username, request.body?.password);
    response.json(session);
  } catch (error) {
    sendError(response, error, 401);
  }
});

app.get("/api/auth/session", requireAuth, async (request, response) => {
  response.json({
    user: request.authUser,
  });
});

app.post("/api/auth/logout", requireAuth, async (request, response) => {
  try {
    await deleteSession(request.authToken);
    response.json({ ok: true });
  } catch (error) {
    sendError(response, error, 500);
  }
});

app.post("/api/auth/change-password", requireAuth, async (request, response) => {
  try {
    await changeUserPassword(
      request.authUser.id,
      request.body?.currentPassword,
      request.body?.nextPassword
    );
    response.json({ ok: true });
  } catch (error) {
    sendError(response, error);
  }
});

app.get("/api/cvs", requireAuth, async (request, response) => {
  try {
    const cvs = await listUserCvs(request.authUser.id);
    response.json(cvs);
  } catch (error) {
    sendError(response, error, 500);
  }
});

app.get("/api/cvs/latest", requireAuth, async (request, response) => {
  try {
    const latest = await getLatestUserCv(request.authUser.id);
    response.json(latest?.document ? normalizeCvDocument(latest.document) : null);
  } catch (error) {
    sendError(response, error, 500);
  }
});

app.get("/api/cvs/:id", requireAuth, async (request, response) => {
  try {
    const cv = await getUserCvById(request.authUser.id, request.params.id);
    if (!cv?.document) {
      response.status(404).json({ error: "CV not found." });
      return;
    }

    response.json(normalizeCvDocument(cv.document));
  } catch (error) {
    sendError(response, error, 500);
  }
});

app.post("/api/cvs/new", requireAuth, async (request, response) => {
  try {
    const created = await createUserCvDocument(request.authUser.id, request.body?.template);
    response.status(201).json(normalizeCvDocument(created?.document));
  } catch (error) {
    sendError(response, error, 500);
  }
});

app.post("/api/cvs", requireAuth, async (request, response) => {
  try {
    const normalized = normalizeCvDocument(request.body);
    const saved = await saveUserCvDocument(request.authUser.id, normalized);
    response.json(normalizeCvDocument(saved.document));
  } catch (error) {
    sendError(response, error, 403);
  }
});

app.post("/api/cvs/:id/rename", requireAuth, async (request, response) => {
  try {
    const renamed = await renameUserCv(
      request.authUser.id,
      request.params.id,
      request.body?.name
    );

    if (!renamed) {
      response.status(404).json({ error: "CV not found." });
      return;
    }

    response.json({
      id: renamed.id,
      name: renamed.name,
      createdAt: renamed.createdAt,
      updatedAt: renamed.updatedAt,
    });
  } catch (error) {
    sendError(response, error, 500);
  }
});

app.post("/api/cvs/delete", requireAuth, async (request, response) => {
  try {
    const deletedIds = await deleteUserCvs(request.authUser.id, request.body?.ids);
    response.json({ deletedIds });
  } catch (error) {
    sendError(response, error, 500);
  }
});

app.post("/api/cvs/export-pdf", requireAuth, async (request, response) => {
  let browser;

  try {
    const cv = normalizeCvDocument(request.body);
    const html = renderCvHtml(cv);
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";

    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "16mm", bottom: "16mm", left: "16mm" },
    });
    const pdfBuffer = Buffer.from(pdfBytes);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Length", String(pdfBuffer.length));
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${(cv.name || "cv").replace(/"/g, "")}.pdf"`
    );
    response.send(pdfBuffer);
  } catch (error) {
    sendError(response, error, 500);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get("*", (_request, response) => {
    response.sendFile(path.join(distDir, "index.html"));
  });
}

async function startServer() {
  await ensureSchema();

  app.listen(port, () => {
    console.log(`CV Builder server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start CV Builder server", error);
  process.exit(1);
});
