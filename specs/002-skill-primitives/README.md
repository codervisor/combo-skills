---
status: complete
created: 2026-02-05
priority: high
tags:
- architecture
- primitives
- foundation
created_at: 2026-02-05T06:21:18.360941296Z
updated_at: 2026-02-05T06:45:32.317090733Z
completed_at: 2026-02-05T06:45:32.317090733Z
transitions:
- status: in-progress
  at: 2026-02-05T06:40:44.828137655Z
- status: complete
  at: 2026-02-05T06:45:32.317090733Z
parent: 001-tailwind-style-skills-architecture
---

# Skill Primitives

> **Status**: in-progress · **Priority**: high · **Created**: 2026-02-05

## Overview

Define the atomic capability categories that all skills are built from. These are combo-skills' "design tokens"—the fundamental actions that can be composed into any higher-level skill.

**Key question**: What can a skill fundamentally *do*?

Just as Tailwind has ~10 primitive categories (color, spacing, typography, etc.) that generate thousands of utilities, we need a small set of capability primitives that span all possible skill behaviors.

## Design

### Final Primitives (5 Core)

Based on research validating 50+ skills across LeanSpec and GitHub MCP:

| Primitive | Description | Examples |
|-----------|-------------|----------|
| `read` | Acquire information from a source | file-read, fetch-url, git-log, db-query, issue_read |
| `write` | Persist information to a destination | file-write, post-request, db-insert, push_files |
| `search` | Find matching items in a collection | grep, semantic-search, file-glob, search_code |
| `execute` | Run external commands/processes | run-command, run-tests, run-lint, merge_pr |
| `transform` | Convert data from one form to another | parse-html, json-to-csv, format-markdown, validate |

### Deferred to Other Specs

| Candidate | Decision | Spec |
|-----------|----------|------|
| `observe` | Modifier (polling/streaming behavior) | 003-skill-modifiers |
| `decide` | Composition model (control flow) | 004-composition-model |

### Properties of Good Primitives

1. **Orthogonal**: Each primitive covers a distinct capability
2. **Complete**: Any skill action fits at least one primitive
3. **Minimal**: No primitive is derivable from others
4. **Intuitive**: Developers can quickly classify actions

### Primitive Composition

Skills typically combine multiple primitives:
- `extract-table-from-web` = read → transform → transform → transform
- `test-and-report` = execute → read → transform → write
- `watch-and-deploy` = observe → decide → execute (uses modifiers)

### Schema Extension

```yaml
# combo-skill with primitive annotations
name: extract-table-from-web
primitives:
  - read      # fetch-webpage
  - transform # parse-html, extract-table, convert-to-csv

skills:
  - name: fetch-webpage
    from: skills.sh
    primitives: [read]
  - name: parse-html
    from: skills.sh
    primitives: [transform]
```

## Plan

- [x] Validate primitives against 50+ existing skills (skills.sh, lean-spec)
- [x] Identify gaps—skills that don't fit cleanly
- [x] Refine primitive categories based on findings
- [x] Add optional `primitives` field to combo-skill schema
- [x] Document primitive taxonomy in docs/primitives.md

## Test

- [x] Every skill in lean-spec maps to 1+ primitives (17/17 validated)
- [x] No skill requires a primitive not in the taxonomy
- [x] Primitives are orthogonal (no overlapping definitions)
- [x] Schema validates `primitives` field correctly

## Research Findings

### LeanSpec CLI/MCP (17 operations)

| Operation | Primitive | Notes |
|-----------|-----------|-------|
| `list` | search | Lists/filters specs |
| `search` | search | Searches spec content |
| `view` | read | Reads spec content |
| `board` | read + transform | Reads specs, transforms to kanban |
| `stats` | read + transform | Reads metrics, transforms to summary |
| `deps` | read + transform | Reads deps, transforms to graph |
| `create` | write | Creates new spec |
| `update` | write | Modifies spec metadata |
| `link` | write | Creates relationship |
| `unlink` | write | Removes relationship |
| `archive` | write | Moves spec to archive |
| `tokens` | transform | Counts tokens |
| `validate` | transform | Validates structure |
| `analyze` | transform | Analyzes for splitting |
| `check` | transform | Checks for conflicts |
| `split` | transform + write | Splits sections |
| `compact` | transform + write | Removes sections |

### GitHub MCP Tools (30+ operations)

All tools mapped cleanly:
- `get_*` → read
- `create_*` → write
- `search_*` → search
- `list_*` → search
- `update_*` → write
- `merge_*` → execute

## Notes

### Resolved Questions

1. **Is `decide` a primitive or modifier?** → Neither. It's control flow, belongs in composition model.
2. **Should `auth` be a primitive?** → No, it's a modifier (cross-cutting concern).
3. **How do we handle composite primitives?** → Skills can declare multiple primitives.

### Implementation Complete

- Schema updated: [combo-skill.schema.json](../../schemas/combo-skill.schema.json)
- Types updated: [src/types.ts](../../src/types.ts)
- Documentation: [docs/primitives.md](../../docs/primitives.md)
- Example updated: [extract-table-from-web.combo.yaml](../../examples/extract-table-from-web.combo.yaml)
