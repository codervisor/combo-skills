---
status: planned
created: 2026-02-05
priority: high
parent: 001-tailwind-style-skills-architecture
tags:
- architecture
- primitives
- foundation
created_at: 2026-02-05T06:21:18.360941296Z
updated_at: 2026-02-05T06:21:18.360941296Z
---

# Skill Primitives

> **Status**: planned · **Priority**: high · **Created**: 2026-02-05

## Overview

Define the atomic capability categories that all skills are built from. These are combo-skills' "design tokens"—the fundamental actions that can be composed into any higher-level skill.

**Key question**: What can a skill fundamentally *do*?

Just as Tailwind has ~10 primitive categories (color, spacing, typography, etc.) that generate thousands of utilities, we need a small set of capability primitives that span all possible skill behaviors.

## Design

### Proposed Primitives

| Primitive | Description | Examples |
|-----------|-------------|----------|
| `read` | Acquire information from a source | file-read, fetch-url, git-log, db-query |
| `write` | Persist information to a destination | file-write, post-request, db-insert |
| `search` | Find matching items in a collection | grep, semantic-search, file-glob |
| `execute` | Run external commands/processes | run-command, run-tests, run-lint |
| `transform` | Convert data from one form to another | parse-html, json-to-csv, format-markdown |
| `observe` | Monitor state or changes over time | watch-file, poll-endpoint, git-diff |
| `decide` | Make choices based on conditions | if-then, pattern-match, classify |

### Properties of Good Primitives

1. **Orthogonal**: Each primitive covers a distinct capability
2. **Complete**: Any skill action fits at least one primitive
3. **Minimal**: No primitive is derivable from others
4. **Intuitive**: Developers can quickly classify actions

### Primitive Composition

Skills typically combine multiple primitives:
- `extract-table-from-web` = read → transform → transform
- `test-and-report` = execute → read → transform → write
- `watch-and-deploy` = observe → decide → execute

### Schema Extension

```yaml
# combo-skill with primitive annotations
name: extract-table-from-web
primitives:
  - read      # fetch-webpage
  - transform # parse-html, extract-table
  - write     # output-csv
```

## Plan

- [ ] Validate primitives against 50+ existing skills (skills.sh, lean-spec)
- [ ] Identify gaps—skills that don't fit cleanly
- [ ] Refine primitive categories based on findings
- [ ] Add optional `primitives` field to combo-skill schema
- [ ] Document primitive taxonomy in docs/primitives.md

## Test

- [ ] Every skill in lean-spec maps to 1+ primitives
- [ ] No skill requires a primitive not in the taxonomy
- [ ] Primitives are orthogonal (no overlapping definitions)
- [ ] Schema validates `primitives` field correctly

## Notes

### Open Questions

1. Is `decide` a primitive or a modifier? (Could be cross-cutting)
2. Should `auth` be a primitive or modifier? (Leaning modifier)
3. How do we handle composite primitives (read+write in single operation)?

### Research Needed

- Survey skills.sh registry for action patterns
- Analyze lean-spec's 27 atomic skills through this lens
- Compare to Unix philosophy: small tools, clear purpose
