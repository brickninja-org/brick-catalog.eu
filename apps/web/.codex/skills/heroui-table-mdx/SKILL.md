---
name: heroui-table-mdx
description: Decide when to use HeroUI Table vs native table wrappers for MDX content.
---

# HeroUI Table for MDX Skill

Use this skill when rendering tabular markdown content from AI/MDX.

## Key Decision

- Use native HTML table wrappers for arbitrary MDX tables.
- Use HeroUI `Table` only when schema is controlled and column/cell counts are guaranteed.

## Why

HeroUI Table enforces strict structure. Generic MDX tables can break with runtime errors like:
- cell count does not match column count
- row key/shape mismatch

## Safe Pattern

1. In MDX renderer:
- map markdown table tags to styled native table elements.
2. In app UI (non-MDX):
- use HeroUI Table for typed, known datasets.

## Validation

- No runtime table-structure errors.
- Horizontal overflow handled on mobile.
- Header + row spacing stays readable.
