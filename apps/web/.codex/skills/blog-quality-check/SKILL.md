---
name: blog-quality-check
description: Run fast quality checks on generated blog posts for structure, data integrity, and UX readability.
---

# Blog Quality Check Skill

Use this skill after generating/regenerating posts.

## Checklist

1. Content integrity
- No escaped newlines or formatting artifacts.
- H2/H3 hierarchy is readable.
- Tables render with consistent columns.

2. Data integrity
- Highlight values match computed metrics.
- No contradictory percentages.
- Month-over-month sections only when underlying snapshot includes trend data.

3. UX consistency
- Hero + highlights + TOC remain intact.
- Post navigation resolves previous/next links.
- Blog list includes newly published posts.

4. Embedding/indexing
- `PostEmbedding` row exists and has updated timestamps.

## Output format

Return:
- Pass/Fail per category
- Blocking issues
- Quick remediation steps
