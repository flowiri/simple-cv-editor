# Server Module Guide

This directory contains the Express backend for auth, persistence, templates, and PDF export.

## Responsibilities

- authenticate users and manage sessions
- enforce per-user ownership for CVs and templates
- normalize CV documents before storage and export
- provide template browsing and template-to-CV creation flows
- generate PDF files from the normalized document model

## Expectations

- Treat authorization and ownership checks as mandatory.
- Keep route handlers thin when possible and push reusable data logic into `db.js` or focused helpers.
- Schema or persistence changes must preserve existing saved documents when practical.
- Any change to exported HTML/CSS should be compared against the frontend preview behavior.

## Important Files

- `index.js`: API routes and server startup
- `db.js`: schema setup, auth persistence, CV/template queries, and seed behavior
- `pdfTemplate.js`: document normalization and server-side HTML rendering
- `security.js`: password hashing, username normalization, and session token helpers

## Data Safety

- Never trust client ownership claims; always derive access from the authenticated user.
- Normalize request documents before saving or exporting.
- Keep response shapes stable unless the frontend is updated in the same change.
- Be careful with seed-account logic so startup remains idempotent.

## Verification

After backend changes, verify the relevant combination of:

- auth flows
- CV/template CRUD
- public template access rules
- PDF export success
- database boot/ensureSchema behavior
