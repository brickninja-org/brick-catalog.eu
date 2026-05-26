---
name: worker-data-refresh
description: Refresh LEGO catalog data via worker jobs with safe sequencing for base entities and relations.
---

# Worker Data Refresh Skill

Use this skill when catalog data needs a full or partial refresh before AI generation.

## Goal

Load base LEGO entities first, then relation jobs, and verify relation health.

## Sequencing

1. Base entities first:
- elements
- designs
- colors
- categories
- subcategories

2. Relation-sensitive passes after base load.

3. If versions are used (`CURRENT_VERSION`), align relation jobs intentionally and rerun.

## Validation

- Count checks for key tables (`Element`, `Design`, `Color`).
- Relation checks:
  - elements with design
  - elements with color
  - designs with subcategory
  - subcategories with category

## Troubleshooting

- If DB was reset, ensure migrations are applied before worker run.
- If queue appears stale, clear job rows only when user explicitly requests it.
