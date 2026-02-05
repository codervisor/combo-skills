---
status: planned
created: 2026-02-05
priority: high
tags:
- architecture
- skills
- composition
- design
- umbrella
created_at: 2026-02-05T06:00:03.692588087Z
updated_at: 2026-02-05T06:00:03.692588087Z
---

# Tailwind-Style Skills Architecture

## Overview

Adopt Tailwind's **architectural patterns** for combo-skills: a system where primitives, modifiers, and composition rules combine to create infinite higher-level capabilities from finite building blocks.

**Core insight**: Tailwind isn't powerful because it has thousands of utilities. It's powerful because it has:
- A small set of **primitives** (colors, spacing, typography)
- A consistent **modifier system** (`hover:`, `dark:`, `sm:`)
- A clear **composition model** (utilities → components → layouts)
- A **synthesis engine** (JIT compilation)

We apply this to skills.

## The Tailwind Mental Model for Skills

| Tailwind Concept | What It Really Is | Skills Equivalent |
|------------------|-------------------|-------------------|
| Design Tokens | Primitive values | **Capability primitives**: read, write, search, execute, transform |
| Utilities | Single-purpose composable units | Atomic skills |
| Variants | State/context modifiers | **Modifiers**: error-handling, retry, auth, caching |
| @apply | Grouping utilities | Skill composition |
| JIT | On-demand generation | LLM synthesis |

## Architecture Vision

```
┌─────────────────────────────────────────────────────────────┐
│  SYNTHESIS                                                  │
│  LLM-driven generation of new skills from composition rules │
├─────────────────────────────────────────────────────────────┤
│  LAYERING                                                   │
│  Tier 3: Abstract patterns (task-board, task-crud)         │
│  Tier 2: Domain patterns (extract-*, detect-*)             │
│  Tier 1: Universal primitives (git-*, file-*, run-*)       │
├─────────────────────────────────────────────────────────────┤
│  COMPOSITION                                                │
│  Data flow, ordering, conditional execution, error handling │
├─────────────────────────────────────────────────────────────┤
│  MODIFIERS                                                  │
│  Cross-cutting: retry, cache, auth, rate-limit, timeout    │
├─────────────────────────────────────────────────────────────┤
│  PRIMITIVES                                                 │
│  Atomic capabilities: read, write, search, execute, etc.   │
└─────────────────────────────────────────────────────────────┘
```

## Child Specs

This umbrella decomposes into 5 foundational specs:

| Spec | Focus | Key Question |
|------|-------|--------------|
| [002-skill-primitives](../002-skill-primitives) | Atomic capability categories | What are our "design tokens"? |
| [003-skill-modifiers](../003-skill-modifiers) | Cross-cutting behaviors | How do we handle errors, auth, caching universally? |
| 004-composition-model | Data flow and control | What's our `@apply`? |
| 005-layering-tiers | The 3-tier pattern | How do skills stack and reference? |
| 006-synthesis-engine | LLM generation rules | When/how do we JIT compile? |

## Success Criteria

- [ ] New skill can be defined using only primitives + modifiers + composition rules
- [ ] Modifiers apply consistently across any skill
- [ ] Tier structure enables progressive complexity
- [ ] Synthesis produces coherent skills from composition rules
- [ ] Developer mental model is clear and learnable

## What We're NOT Doing

- Not creating thousands of micro-skills
- Not standardizing skill interfaces (skills remain black boxes)
- Not providing runtime (we produce artifacts)

## Notes

### Why This Decomposition

The original spec mixed architectural vision with implementation details. This restructure separates:
- **Primitives**: What can skills fundamentally do?
- **Modifiers**: What cross-cutting concerns affect all skills?
- **Composition**: How do skills combine?
- **Layering**: How do skills stack?
- **Synthesis**: How do we generate new skills?

Each is independently designable and testable.

### Key Difference from README

The README says "This is not Tailwind for skills." This spec adopts Tailwind's *architectural patterns* while respecting that skills are black boxes. We embrace the mental model, not the quantity.

### References

- Tailwind presets: https://tailwindcss.com/docs/presets
- lean-spec skill ecosystem (6 templates → 27 atomic skills)
