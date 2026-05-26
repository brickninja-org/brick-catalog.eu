---
name: embedding-health
description: Verify and repair PostEmbedding consistency after AI post generation.
---

# Embedding Health Skill

Use this skill when embeddings fail or search quality drops.

## Checks

1. Every published post has a `PostEmbedding` row.
2. `id`, `postId`, `createdAt`, `updatedAt` are non-null.
3. Provider/model/dimensions/version fields are consistent.
4. Upsert SQL sets required insert-time fields.

## Repair Path

- Re-run embedding generation for missing rows.
- Update upsert statement when schema constraints change.
