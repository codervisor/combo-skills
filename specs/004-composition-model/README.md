---
status: planned
created: 2026-02-05
priority: high
parent: 001-tailwind-style-skills-architecture
tags:
- architecture
- composition
- data-flow
created_at: 2026-02-05T06:51:45.026472381Z
updated_at: 2026-02-05T06:51:45.026472381Z
---

# Composition Model

## Overview

Define how skills combine and data flows between them. This is combo-skills' equivalent to Tailwind's `@apply`—the mechanism for grouping atomic units into coherent higher-level behaviors.

**Key question**: What's our composition model?

Just as Tailwind uses `@apply` to bundle utilities into components, we need clear rules for how skills connect, pass data, and coordinate execution.

## Design

### Composition Primitives

| Primitive | Description | Example |
|-----------|-------------|---------|
| `sequence` | Execute skills in order, passing output → input | skill-a → skill-b → skill-c |
| `parallel` | Execute skills concurrently, collect all outputs | [skill-a, skill-b, skill-c] → merge |
| `conditional` | Execute based on predicate | if condition then skill-a else skill-b |
| `pipe` | Transform output before passing to next skill | skill-a \| transform \| skill-b |
| `map` | Apply skill to each item in collection | items.map(skill) |

### Data Flow Model

```yaml
# Explicit data flow
composition:
  - skill: fetch-webpage
    output: html
  
  - skill: parse-html
    input: ${html}
    output: document
  
  - skill: extract-table
    input: ${document}
    selector: "table.data"
    output: rows
```

### Error Handling in Composition

- **Fail-fast**: Stop on first error (default)
- **Fail-safe**: Continue, collect errors
- **Fallback**: Use alternative skill on error

### Interface Contracts

Skills remain black boxes, but composition requires:
- **Input schema**: What does the skill accept?
- **Output schema**: What does the skill produce?
- **Error contract**: What errors can occur?

## Plan

- [ ] Define composition primitives (sequence, parallel, conditional)
- [ ] Design data flow syntax (explicit bindings vs implicit piping)
- [ ] Document error handling patterns
- [ ] Add `composition` field to combo-skill schema
- [ ] Implement composition validation in compiler
- [ ] Create examples showing common patterns

## Test

- [ ] Composition primitives are orthogonal
- [ ] Data flows correctly through compositions
- [ ] Error handling works as specified
- [ ] Compiler validates composition correctness
- [ ] Examples cover common real-world patterns

## Notes

### Open Questions

1. Should composition be declarative (YAML) or imperative (code)?
2. How do we handle skills with mismatched I/O schemas?
3. Should skills declare their I/O contracts or should we infer them?

### Relationship to Modifiers

Modifiers (003) affect individual skills. Composition affects how skills connect:
- `retry:` → modifier (wraps one skill)
- `parallel:` → composition (coordinates multiple skills)

Some overlap exists (e.g., `fallback` could be either)—need to clarify boundaries.