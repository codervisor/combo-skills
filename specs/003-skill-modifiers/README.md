---
status: complete
created: 2026-02-05
priority: high
tags:
- architecture
- modifiers
- cross-cutting
created_at: 2026-02-05T06:21:58.913129997Z
updated_at: 2026-02-05T06:57:47.361587942Z
completed_at: 2026-02-05T06:57:47.361587942Z
transitions:
- status: in-progress
  at: 2026-02-05T06:51:42.797400565Z
- status: complete
  at: 2026-02-05T06:57:47.361587942Z
parent: 001-tailwind-style-skills-architecture
---

# Skill Modifiers

> **Status**: planned · **Priority**: high · **Created**: 2026-02-05

## Overview

Define cross-cutting behaviors that can wrap any skill. Like Tailwind's variants (`hover:`, `dark:`, `sm:`), modifiers apply consistently regardless of the underlying skill.

**Key question**: What behaviors should work identically across all skills?

Modifiers are orthogonal to primitives—a `read` skill can have `retry:` or `cache:` applied. This separation powers the composability explosion.

## Design

### Proposed Modifiers

| Modifier | Description | Tailwind Analog |
|----------|-------------|-----------------|
| `retry` | Retry on failure with backoff | – |
| `cache` | Cache results for duration/key | – |
| `timeout` | Fail after duration | – |
| `auth` | Inject authentication context | – |
| `rate-limit` | Throttle execution frequency | – |
| `log` | Emit structured logs | `debug:` (dev tools) |
| `fallback` | Use alternative on failure | – |
| `batch` | Group multiple invocations | – |
| `parallel` | Execute concurrently | – |
| `dry-run` | Simulate without side effects | – |

### Modifier Syntax Options

**Option A: Prefix syntax (like Tailwind)**
```yaml
modifiers:
  - retry:3        # retry up to 3 times
  - cache:5m       # cache for 5 minutes
  - timeout:30s    # timeout after 30 seconds
```

**Option B: Structured syntax**
```yaml
modifiers:
  retry:
    attempts: 3
    backoff: exponential
  cache:
    ttl: 5m
    key: "${input.url}"
```

**Recommendation**: Support both—prefix for simple cases, structured for configuration.

### Modifier Stacking

Modifiers compose. Order matters for some combinations:
```yaml
# cache the result of a retried operation
modifiers: [retry:3, cache:5m]  # retry first, then cache success

# vs

# cache failures too (probably wrong)
modifiers: [cache:5m, retry:3]  # cache first, defeats retry purpose
```

### Modifier Resolution

At synthesis time:
1. Modifiers are validated against the skill's primitives
2. Incompatible combinations are flagged (e.g., `cache` + `dry-run`)
3. Modifier behavior is woven into the synthesized skill

## Plan

- [x] Define modifier schema with both prefix and structured forms
- [x] Document modifier semantics and stacking rules
- [x] Identify modifier/primitive compatibility matrix
- [x] Add `modifiers` field to combo-skill schema
- [x] Implement modifier validation in compiler
- [x] Create examples showing modifier composition

## Test

- [x] Modifiers parse correctly (prefix and structured)
- [x] Stacking order is preserved
- [x] Incompatible modifiers are detected
- [x] Synthesized skills include modifier behavior
- [x] All proposed modifiers have clear, testable semantics

## Notes

### Open Questions

1. Should modifiers be inherited by child skills in composition?
2. How do modifiers interact with skill-level error handling?
3. Should some modifiers be "always on" by default (e.g., `timeout`)?

### Comparison to Tailwind Variants

Tailwind variants modify *appearance* based on state. Our modifiers modify *behavior* based on execution context:

| Tailwind | Ours |
|----------|------|
| `hover:bg-blue` | `retry:fetch-url` |
| `dark:text-white` | `auth:api-call` |
| `sm:hidden` | `timeout:30s` |

The mental model transfers: "this behavior, with this modification"

### Implementation Complete

- Schema updated: [combo-skill.schema.json](../../schemas/combo-skill.schema.json)
- Types updated: [src/types.ts](../../src/types.ts)
- Modifier validator: [src/compiler/modifierValidator.ts](../../src/compiler/modifierValidator.ts)
- Documentation: [docs/modifiers.md](../../docs/modifiers.md)
- Example updated: [extract-table-from-web.combo.yaml](../../examples/extract-table-from-web.combo.yaml)
