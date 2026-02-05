You are initializing a new open-source GitHub repository.

Project name: combo-skills

Goal:
Build a composition layer on top of existing Agent Skills ecosystems (e.g. skills.sh / agentskills.io) that allows developers to declaratively combine multiple existing skills into higher-level “combo skills”, and then synthesize them into a new executable Skill artifact via a compilation process (LLM-driven or rule-based).

This project is NOT a skill itself.
It is a meta-tooling library and CLI for composing, compiling, and materializing skills.

High-level concepts:
- A combo skill is defined by intent + composition rules, not by atomic capabilities.
- Combo skills reuse existing skills as black boxes.
- Compilation does not have to be hard/static; LLM-based synthesis is a first-class mode.
- The output of compilation is a standard Agent Skill (e.g. a SKILL.md directory compatible with skills.sh).

Primary users:
- Agent framework developers
- Tooling authors building agent runtimes
- Power users of skills.sh who want reusable higher-level skills

---

Repository bootstrap requirements:

1. Project structure

Generate a clean, minimal, but extensible structure:

- /docs
  - vision.md              (design philosophy and non-goals)
  - combo-skills.md        (what a combo skill is)
  - compilation.md         (what “compile” means in this project)

- /schemas
  - combo-skill.schema.json
    (JSON Schema for validating combo skill definitions)

- /examples
  - extract-table-from-web.combo.yaml
    (a realistic combo skill example using existing skills)

- /src
  - compiler/
    - llmCompiler.ts       (LLM-driven synthesis entry point, stubbed)
    - graphResolver.ts     (resolves skill dependencies and order)
  - registry/
    - skillsResolver.ts   (fetches skills via `npx skills`)
  - index.ts              (library entry point)

- /cli
  - combo-skills.ts       (CLI entry: `combo-skills compile`)

- README.md
- LICENSE (MIT)
- package.json
- tsconfig.json

Use TypeScript for all source code.

---

2. README.md requirements

The README should explain:

- What problem combo-skills solves (skill composition gap)
- Why this is NOT “atomic skills like Tailwind”
- How combo skills differ from normal skills
- A simple end-to-end example:
  - define combo skill
  - compile it
  - get a new SKILL.md

Tone:
- Technical
- Opinionated
- Clear about tradeoffs
Avoid hype and marketing language.

---

3. Combo skill definition format

Assume combo skills are defined in YAML or JSON and include:
- name
- description
- used skills (by name)
- composition intent
- constraints (ordering, data flow, assumptions)

Do NOT invent atomic skill taxonomies.
Treat existing skills as opaque units with metadata only.

---

4. Compilation philosophy

Document and reflect in code comments that:
- Compilation may be LLM-driven
- Determinism is not guaranteed
- The goal is coherence and reusability, not perfect reproducibility

Stub LLM calls clearly and leave TODOs where model integration would happen.

---

5. CLI behavior (initial)

Implement a minimal CLI that supports:

- `combo-skills compile <combo-file>`
  - validates combo spec
  - resolves referenced skills
  - runs a placeholder compile step
  - outputs a synthesized skill directory

CLI output can be mocked or simplified for now.

---

6. Style and constraints

- Keep the initial implementation intentionally minimal
- Prefer clarity over completeness
- Add comments explaining design intent
- Do not over-engineer
- No external services required at bootstrap time

---

Output:

Generate all files with reasonable initial content.
Code does not need to be fully functional, but structure and intent must be clear.
Assume this is the first commit of a serious open-source project.

