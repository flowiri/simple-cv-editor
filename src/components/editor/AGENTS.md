# Editor Module Guide

This directory owns the form-driven CV editing experience.

## Responsibilities

- edit `basics`, sections, and section items
- support add, update, delete, collapse, and reorder flows
- keep editor interactions aligned with preview click-to-focus behavior
- expose theme/template actions that are relevant while editing

## Editing Rules

- Keep inputs schema-driven where practical.
- Prefer extending shared field/editor patterns over creating one-off bespoke forms.
- Preserve item and section identity keys so reordering and focus management stay stable.
- Keep the editor usable with long CVs and many sections.
- Do not move persistence or API logic into these components.

## UX Guardrails

- Optimize for fast form entry.
- Avoid cluttered formatting controls.
- Mobile behavior should remain workable when panes stack or drawers collapse.
- Changes here should not silently break preview targeting, autosave cues, or template save flows.

## When Adding Section Capabilities

If you add a new section type or editing pattern, also verify:

- section defaults/data creation
- preview rendering
- PDF rendering compatibility
- language copy or labels if needed
- theme/layout behavior if the new content affects spacing
