---
status: planned
created: 2026-02-05
priority: high
parent: 001-tailwind-style-skills-architecture
tags:
- architecture
- synthesis
- llm
- compilation
created_at: 2026-02-05T06:52:39.134727637Z
updated_at: 2026-02-05T06:52:39.134727637Z
---

# Synthesis Engine

## Overview

Define when and how the LLM synthesizes new skills from composition rules. This is combo-skills' JIT compilation—generating coherent skill artifacts on-demand from declarative specifications.

**Key question**: When and how do we generate new skills?

Like Tailwind's JIT that generates only used utilities, our synthesis engine produces skill artifacts when needed, guided by composition rules and context.

## Design

### Synthesis Triggers

| Trigger | Description | Example |
|---------|-------------|---------|
| **On-demand** | User requests skill execution | "Run extract-table on this page" |
| **Compile-time** | Build step generates artifacts | `combo-skills compile` |
| **Discovery** | Agent explores new compositions | "I need a skill that..." |

### Synthesis Inputs

```yaml
# What the synthesizer receives
input:
  skill_definition:     # The combo-skill YAML
  available_skills:     # Registry of component skills
  context:              # Current environment, auth, etc.
  constraints:          # Budget, latency, security limits
```

### Synthesis Outputs

```yaml
# What the synthesizer produces
output:
  skill_artifact:       # Generated SKILL.md or executable
  dependency_graph:     # Resolved skill dependencies
  validation_report:    # Any warnings or errors
  execution_plan:       # How to invoke this skill
```

### Synthesis Phases

1. **Parse**: Read combo-skill definition
2. **Resolve**: Find all component skills in registry
3. **Validate**: Check primitives, modifiers, tier constraints
4. **Synthesize**: Generate coherent skill artifact
5. **Optimize**: Apply modifiers, cache hints, parallelization
6. **Emit**: Produce output artifact

### Synthesis Rules

The LLM follows rules derived from:
- Primitive taxonomy (002) - what actions are valid
- Modifier semantics (003) - how to weave in behaviors
- Composition model (004) - how to connect skills
- Tier constraints (005) - what can reference what

### Example Synthesis

```yaml
# Input: combo-skill definition
name: extract-tables-from-urls
description: Fetches multiple URLs and extracts all tables
skills:
  - fetch-webpage
  - parse-html
  - extract-table
composition:
  - parallel: ${urls}
    do:
      - fetch-webpage → parse-html → extract-table
  - merge: tables
modifiers:
  - retry:3
  - cache:1h
```

```markdown
# Output: synthesized SKILL.md
---
name: extract-tables-from-urls
primitives: [read, transform]
tier: 2
---

## Purpose
Fetches multiple URLs in parallel and extracts all HTML tables...

## Steps
1. For each URL (in parallel, up to 5 concurrent):
   a. Fetch the webpage (retry 3x on failure)
   b. Parse HTML to document
   c. Extract all <table> elements
   d. Cache results for 1 hour
2. Merge all extracted tables into single collection
...
```

## Plan

- [ ] Define synthesis trigger points
- [ ] Design artifact format (SKILL.md? Executable?)
- [ ] Document synthesis phases
- [ ] Create synthesis prompt templates
- [ ] Implement basic synthesis in compiler
- [ ] Add caching and incremental synthesis

## Test

- [ ] Synthesis produces valid skill artifacts
- [ ] Artifacts include all modifiers correctly
- [ ] Tier constraints are respected
- [ ] Synthesis is deterministic (same input → same output)
- [ ] Cache invalidation works correctly

## Notes

### Open Questions

1. Should synthesis produce SKILL.md or executable code?
2. How do we handle synthesis failures gracefully?
3. Should users be able to edit synthesized artifacts?

### JIT vs AOT

Like Tailwind:
- **JIT (Just-in-Time)**: Synthesize on first use, cache result
- **AOT (Ahead-of-Time)**: Synthesize all declared skills at build time

We support both: JIT for development, AOT for production/distribution.

### Relationship to LLM Compiler

This spec describes *what* to synthesize. The `llmCompiler.ts` in `src/compiler/` handles *how* to invoke the LLM for synthesis.