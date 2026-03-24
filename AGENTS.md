# CV Builder Project Guide

## Product Summary

This repository contains a CV/resume builder with a React frontend and an Express + PostgreSQL backend.

The core experience is:

- authenticated users manage their own CV library
- users edit CV data through structured forms
- the preview updates live and stays A4-friendly
- users can save personal templates, browse public templates, and export PDFs

The visual direction should stay close to the sample CV files in this project: clean, compact, professional, and ATS-friendly.

## Current Architecture

- `src/`: React client application
- `src/components/editor/`: inspector panels and editing controls
- `src/components/preview/`: live CV preview rendering
- `src/components/library/`: CV/template library screens
- `src/components/auth/` and `src/components/account/`: account flows
- `src/features/cv-builder/model/`: view-model and state orchestration
- `src/utils/`: shared CV schema, formatting, themes, API helpers, and storage helpers
- `server/`: Express API, PostgreSQL persistence, auth/session handling, and PDF rendering
- `docker/`: local Docker stack support

## Non-Negotiables

- Keep CV content structured as JSON, not raw HTML documents.
- The browser preview and PDF export must be generated from the same data model.
- Preserve compatibility with saved CV documents, templates, and server normalization.
- Favor reusable schema-driven section rendering over one-off hardcoded cases.
- Keep the default template professional, print-friendly, and close to the provided CV sample.
- Treat PDF/export regressions as high severity.

## Data Model Expectations

A CV document is expected to remain centered around:

- `name`
- `language`
- `theme`
- `basics`
- `sections`

When changing the schema:

- update client defaults and sample data
- update server normalization so persisted documents remain valid
- verify preview rendering and PDF export still match
- avoid introducing fields that only one rendering path understands

## Frontend Guidance

- Keep editing fast and form-based.
- Prefer small focused components over large conditional render blocks.
- Reuse shared helpers from `src/utils/` before adding new shaping logic.
- Maintain desktop editor/preview split and strong mobile usability.
- Treat theme controls as document styling inputs, not decorative website branding.

## Backend Guidance

- Keep auth and data ownership enforcement on the server.
- Normalize CV documents before storing or exporting them.
- API changes should preserve backward compatibility when practical.
- PDF output should stay visually close to the in-app preview.

## Testing And Verification

Before finishing meaningful changes, verify the most relevant paths you touched. Typical checks:

- client renders without runtime errors
- auth/session flows still work if touched
- CV save/load/template flows still work if touched
- preview layout remains readable in A4 mode
- PDF export still succeeds if preview or server rendering changed

## Submodule Notes

Additional scoped instructions live in:

- `src/AGENTS.md`
- `src/components/editor/AGENTS.md`
- `server/AGENTS.md`
