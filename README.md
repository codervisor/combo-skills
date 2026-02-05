# combo-skills

A composition layer for combining agent skills into higher-level capabilities.

## The Problem

Skill ecosystems like [skills.sh](https://skills.sh) provide atomic, reusable capabilities for AI agents: fetch a URL, parse HTML, extract data. But real-world tasks rarely map to single skills.

You don't just "fetch a webpage"—you fetch, parse, extract, and transform. Every time.

Today, this composition happens in one of three ways:

1. **Hardcoded in prompts** — Brittle, not reusable
2. **Embedded in agent code** — Opaque, hard to share
3. **Repeated across projects** — Wasteful, inconsistent

combo-skills makes composition explicit, declarative, and reusable.

## What combo-skills is NOT

This is not "Tailwind for skills." We're not creating thousands of atomic utility skills.

combo-skills works with existing skill ecosystems. It does not replace them. Skills remain black boxes—we don't inspect their internals or standardize their interfaces.

We also don't provide a runtime. combo-skills produces artifacts. Execution is your agent framework's responsibility.

## How It Works

### 1. Define a combo skill

```yaml
# extract-table-from-web.combo.yaml
name: extract-table-from-web
description: Extract table data from a web page as CSV

skills:
  - name: fetch-webpage
    from: skills.sh
  - name: parse-html
    from: skills.sh
  - name: extract-table
    from: skills.sh
  - name: convert-to-csv
    from: skills.sh

intent: |
  Fetch a web page, locate table elements, extract their data,
  and produce CSV output. Handle pagination if present.

constraints:
  ordering:
    - fetch-webpage -> parse-html -> extract-table -> convert-to-csv
```

### 2. Compile it

```bash
pnpm combo-skills compile extract-table-from-web.combo.yaml
```

### 3. Get a new skill

```
output/extract-table-from-web/
├── SKILL.md           # Complete skill definition
├── metadata.json      # Compilation info
└── examples/
    └── basic.md       # Usage examples
```

The output is a standard skill artifact, compatible with skills.sh and similar ecosystems.

## Installation

```bash
pnpm add combo-skills
```

Or use directly with pnpm:

```bash
pnpm dlx combo-skills compile my-skill.combo.yaml
```

## CLI Usage

```bash
# Compile a combo skill
combo-skills compile examples/extract-table-from-web.combo.yaml

# Compile with custom output directory
combo-skills compile my-skill.combo.yaml --output ./dist

# Validate without compiling
combo-skills validate my-skill.combo.yaml

# Verbose output
combo-skills compile my-skill.combo.yaml --verbose
```

## Programmatic API

```typescript
import { loadComboSkill, compile } from 'combo-skills';

const combo = await loadComboSkill('my-skill.combo.yaml');

const result = await compile(combo, {
  outputDir: './output',
  verbose: true,
});

if (result.success) {
  console.log(`Compiled: ${result.skill.name}`);
}
```

## How Compilation Works

Compilation is **synthesis**, not transformation.

When you compile a combo skill:

1. **Validate** — Check the definition against the schema
2. **Resolve** — Fetch skill metadata from registries
3. **Graph** — Build and validate the dependency graph
4. **Synthesize** — Generate a coherent skill artifact

The synthesis step is **LLM-driven by default**. This means:

- Output is non-deterministic
- Two compilations may produce different (but equivalent) skills
- The goal is coherence and usability, not byte-for-byte reproducibility

If you need determinism, commit your compiled artifacts to version control.

## Combo Skill Format

Combo skills are defined in YAML or JSON:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique skill identifier |
| `description` | Yes | Human-readable description |
| `skills` | Yes | List of skills to compose |
| `intent` | Yes | Natural language composition goal |
| `constraints` | No | Ordering and data flow rules |
| `metadata` | No | Author, tags, license |

See [docs/combo-skills.md](docs/combo-skills.md) for the complete specification.

## Design Philosophy

1. **Skills are black boxes** — We don't require understanding skill internals
2. **Intent over implementation** — Describe what, not how
3. **Compilation is synthesis** — LLM-driven by design
4. **Determinism is opt-in** — Embrace non-determinism, version outputs

Read [docs/vision.md](docs/vision.md) for the full design philosophy.

## Project Structure

```
combo-skills/
├── cli/                    # CLI entry point
├── docs/                   # Documentation
│   ├── vision.md           # Design philosophy
│   ├── combo-skills.md     # Combo skill specification
│   └── compilation.md      # Compilation process
├── examples/               # Example combo skills
├── schemas/                # JSON Schema for validation
└── src/
    ├── compiler/           # Compilation logic
    │   ├── llmCompiler.ts  # LLM-driven synthesis
    │   └── graphResolver.ts # Dependency resolution
    ├── registry/           # Skill resolution
    │   └── skillsResolver.ts
    ├── types.ts            # TypeScript types
    └── index.ts            # Library entry point
```

## Current Status

This is an early release. The following features are stubbed:

- LLM integration (uses placeholder generation)
- Registry resolution (returns placeholder metadata)
- Schema validation (basic field checking only)

Contributions welcome.

## License

MIT
