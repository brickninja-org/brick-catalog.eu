---
name: heroui-component-usage
description: Use HeroUI components safely and consistently with v3 patterns in this project.
---

# HeroUI Component Usage Skill

Use this skill when building or refactoring UI with HeroUI.

## Goals

- Use correct HeroUI v3 APIs and composition patterns.
- Avoid unstable/incorrect prop usage.
- Keep accessibility and interaction behavior consistent.

## Rules

1. Prefer verified HeroUI docs for component API before coding.
2. Use `onPress` for interactive controls when HeroUI expects it.
3. Respect compound component structure (e.g. nested subcomponents).
4. Keep component choices aligned with the existing app visual language.
5. Avoid custom hacks when HeroUI provides built-in semantics.

## Validation

- Keyboard navigation works.
- Focus states are visible.
- ARIA labels/roles make sense for inputs, tabs, and nav controls.
