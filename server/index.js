import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import puppeteer from "puppeteer-core";
import { createSeedCv } from "../src/utils/cvData.js";
import { getLatestCv, saveCvDocument } from "./db.js";
import { normalizeCvDocument, renderCvHtml } from "./pdfTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 3000);

const app = express();

app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/cvs/latest", async (_request, response) => {
  try {
    const latest = await getLatestCv();
    response.json(normalizeCvDocument(latest || createSeedCv()));
  } catch (error) {
    response.status(500).send(error instanceof Error ? error.message : "Failed to load CV");
  }
});

app.post("/api/cvs", async (request, response) => {
  try {
    const normalized = normalizeCvDocument(request.body);
    const saved = await saveCvDocument(normalized);
    response.json(normalizeCvDocument(saved));
  } catch (error) {
    response.status(500).send(error instanceof Error ? error.message : "Failed to save CV");
  }
});

app.post("/api/cvs/export-pdf", async (request, response) => {
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
    response.status(500).send(error instanceof Error ? error.message : "Failed to render PDF");
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

app.listen(port, () => {
  console.log(`CV Builder server listening on port ${port}`);
});
