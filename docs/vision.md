# Vision

## What combo-skills is

combo-skills is a **composition layer** for agent skills. It enables developers to define higher-level behaviors by combining existing atomic skills into cohesive, reusable units.

This project exists because the gap between atomic skills and real-world agent workflows is significant. A single skill like "fetch webpage" or "parse table" is rarely sufficient on its own. Developers repeatedly compose the same sets of skills in similar patterns—combo-skills makes that composition explicit and reproducible.

## Design philosophy

### Skills are black boxes

combo-skills does **not** require understanding skill internals. Skills are treated as opaque units with:
- A name
- A description
- Metadata about inputs/outputs (when available)

We deliberately avoid creating a skill taxonomy or dependency graph standard. That complexity belongs elsewhere.

### Compilation is synthesis, not transformation

When you "compile" a combo skill, you're not transpiling code. You're **synthesizing** a new skill artifact that captures the composition intent. This may be:
- LLM-driven generation of a SKILL.md
- Template-based assembly
- Rule-based generation

Determinism is **not guaranteed**. Two compilations of the same combo skill may produce different (but equivalent) outputs. The goal is coherence and usability, not byte-for-byte reproducibility.

### Intent over implementation

Combo skill definitions express **what** should happen, not **how**. The "how" is resolved during compilation based on:
- Available skills
- Composition constraints
- Synthesis strategy (LLM, rules, templates)

## Non-goals

combo-skills does **not** aim to:

1. **Replace atomic skills** — We build on top of existing ecosystems like skills.sh
2. **Standardize skill interfaces** — Each skill ecosystem defines its own contracts
3. **Provide a runtime** — combo-skills produces artifacts; execution is the agent's responsibility
4. **Guarantee compatibility** — Skill ecosystems evolve; combo-skills tracks them
5. **Be a package manager** — We consume skills; we don't host them

## Target audience

- **Agent framework developers** building tooling on top of skills
- **Tooling authors** who need reusable, higher-level skill units
- **Power users** of skills.sh who want to share composed workflows

## Why now?

Skill ecosystems are maturing. skills.sh and similar projects have established patterns for atomic skill definition. But composition remains ad-hoc—embedded in prompts, hardcoded in agents, or repeated across projects.

combo-skills makes composition a first-class concern.
