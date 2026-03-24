# Frontend Module Guide

This directory contains the React client for the CV builder.

## Responsibilities

- render authenticated workspace flows
- provide editor, viewer, library, template, and account screens
- keep the live preview in sync with structured CV data
- handle client-side workspace state, local persistence, and API calls
- expose theme and language controls without breaking print fidelity

## Module Boundaries

- `components/`: UI building blocks and screens
- `features/cv-builder/model/`: shared view-model and action orchestration
- `utils/`: document defaults, parsing, formatting, themes, storage, and API helpers
- `constants/`: frontend constants only

## Expectations

- Keep business logic close to the model layer or shared utilities, not scattered across leaf components.
- Reuse existing helpers for section type handling, formatting, themes, and storage before adding new abstractions.
- Preserve the editor-preview workflow on desktop and mobile.
- When adding document fields, thread them through defaults, preview rendering, editor inputs, and server normalization.
- Avoid introducing preview-only state that cannot be persisted or exported.

## UI Priorities

- editing speed over visual flourish
- clear section hierarchy and dense but readable controls
- print-safe preview output
- compatibility with current workspace screens: library, public templates, editor, viewer, and profile

## Coordination

More specific editor guidance lives in `src/components/editor/AGENTS.md`.
