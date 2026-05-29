---
name: release-backup
description: Safely checkpoint work to remote using push, PR, and backup tag/release.
---

# Release Backup Skill

Use this skill when the goal is code safety before further work.

## Flow

1. Ensure local commits are complete.
2. Push branch to remote.
3. Open PR for visibility/review.
4. Create backup tag or release tag snapshot.
5. Report URLs for PR + backup tag.

## Notes

- If local tag lock fails, use remote release-tag fallback.
