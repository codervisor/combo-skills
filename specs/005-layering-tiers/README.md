---
status: planned
created: 2026-02-05
priority: high
parent: 001-tailwind-style-skills-architecture
tags:
- architecture
- layering
- tiers
- organization
created_at: 2026-02-05T06:52:09.449268043Z
updated_at: 2026-02-05T06:52:09.449268043Z
---

# Layering Tiers

## Overview

Define the 3-tier skill hierarchy that enables progressive complexity. Like CSS's cascade, skills at each tier can reference and extend skills from lower tiers.

**Key question**: How do skills stack and reference?

The tier system prevents circular dependencies, enables skill discovery by abstraction level, and provides a mental model for skill organization.

## Design

### The Three Tiers

```
┌─────────────────────────────────────────────────────┐
│  Tier 3: Abstract Patterns                          │
│  task-board, task-crud, project-scaffold            │
│  Domain-agnostic workflows                          │
├─────────────────────────────────────────────────────┤
│  Tier 2: Domain Patterns                            │
│  extract-*, detect-*, analyze-*, generate-*         │
│  Common cross-domain patterns                       │
├─────────────────────────────────────────────────────┤
│  Tier 1: Universal Primitives                       │
│  git-*, file-*, run-*, http-*, parse-*              │
│  Infrastructure capabilities                        │
└─────────────────────────────────────────────────────┘
```

### Tier Definitions

| Tier | Name | Description | Can Reference |
|------|------|-------------|---------------|
| 1 | Universal | Infrastructure and tool access | MCP/CLI tools only |
| 2 | Domain | Reusable patterns across domains | Tier 1 + other Tier 2 |
| 3 | Abstract | High-level workflows | Tier 1 + Tier 2 |

### Tier Discovery Rules

1. Skills declare their tier explicitly: `tier: 2`
2. Or inferred from dependencies: max(dependency tiers) + 1
3. Circular tier references are compilation errors

### Examples by Tier

**Tier 1 - Universal**
- `git-commit` - commits files to git
- `file-read` - reads file contents
- `http-fetch` - makes HTTP requests

**Tier 2 - Domain**
- `extract-table` - extracts tables from HTML (uses `http-fetch`, `parse-html`)
- `detect-language` - detects programming language (uses `file-read`)

**Tier 3 - Abstract**
- `task-crud` - creates/reads/updates/deletes tasks (uses tier 2 patterns)
- `project-scaffold` - scaffolds new projects (uses many tier 1/2 skills)

### Schema Extension

```yaml
name: extract-table-from-web
tier: 2  # Domain pattern

skills:
  - name: fetch-webpage      # tier 1
  - name: parse-html         # tier 1
  - name: extract-table      # tier 2 (this skill)
```

## Plan

- [ ] Define tier boundaries and rules
- [ ] Add `tier` field to combo-skill schema
- [ ] Implement tier validation in compiler
- [ ] Create tier discovery algorithm
- [ ] Document tier organization guidelines
- [ ] Categorize existing skills by tier

## Test

- [ ] Skills can declare tier explicitly
- [ ] Tier inference works correctly
- [ ] Circular tier references fail validation
- [ ] Tier 2 cannot reference Tier 3
- [ ] Documentation provides clear tier guidance

## Notes

### Open Questions

1. Should tier be mandatory or optional with inference?
2. How do modifiers affect tier calculation?
3. Should we support custom tier naming (e.g., `platform`, `application`)?

### Relationship to Tailwind Presets

Tailwind presets are similar—they layer design tokens and utilities:
- Base preset: spacing, colors, fonts (Tier 1)
- Component preset: buttons, cards (Tier 2)
- Theme preset: brand-specific (Tier 3)

Our tiers formalize this pattern for skills.