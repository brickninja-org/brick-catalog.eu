---
name: post-render-sanity
description: Validate generated post markdown rendering quality on the blog detail page.
---

# Post Render Sanity Skill

Use this skill after generate/regenerate runs.

## Checks

1. Content is not one large paragraph.
2. H2/H3 hierarchy is present.
3. Markdown tables render with proper rows/columns.
4. No artifacts like escaped `\\n` or stray ` 10 ` newline markers.
5. Key highlights render correctly and count = 3.

## UX Verification

- Check hero, TOC, highlights, article body, and prev/next navigation.
