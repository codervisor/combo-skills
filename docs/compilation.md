# Compilation

## What does "compile" mean?

In combo-skills, compilation is the process of transforming a combo skill definition into a **standard skill artifact**—typically a SKILL.md directory compatible with skills.sh.

Compilation does NOT mean:
- Transpilation to another language
- Optimization of execution
- Bundling of skill code

It DOES mean:
- Resolving skill references
- Synthesizing a coherent skill definition
- Producing a reusable artifact

## Compilation modes

### LLM-driven synthesis (primary)

The default compilation mode uses an LLM to synthesize the output skill. The LLM receives:

1. The combo skill definition
2. Resolved skill metadata from registries
3. Synthesis instructions

The LLM produces:
- A SKILL.md file describing the combined capability
- Glue logic or orchestration hints (where applicable)
- Usage examples

**Tradeoff**: Non-deterministic output. Two compilations may differ, but should be semantically equivalent.

### Rule-based synthesis

For predictable scenarios, rule-based compilation uses templates:

```
IF combo has linear ordering
  AND all skills have compatible inputs/outputs
THEN generate sequential skill chain template
```

**Tradeoff**: Limited expressiveness, but deterministic.

### Hybrid

Combine rules for structure, LLM for content:
- Rules determine skill ordering and basic structure
- LLM fills in descriptions, examples, and edge case handling

## Compilation pipeline

```
┌─────────────────┐
│  Combo Skill    │
│  Definition     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate       │ ← JSON Schema validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Resolve Skills │ ← Fetch from registries
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Graph    │ ← Dependency ordering
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Synthesize     │ ← LLM or rules
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Output Skill   │ → SKILL.md + metadata
└─────────────────┘
```

## What compilation produces

A compiled combo skill is a **standard skill** that can be:
- Used directly by agent frameworks
- Published to skill registries
- Composed into other combo skills

Output structure:
```
output/
├── SKILL.md           # Main skill definition
├── metadata.json      # Source combo reference, version
└── examples/          # Generated usage examples
    └── basic.md
```

## Determinism and reproducibility

combo-skills explicitly does **not** guarantee deterministic output.

Why:
- LLM synthesis varies by model, temperature, and context
- Skill metadata may change between resolutions
- This is a feature, not a bug—flexibility enables adaptation

If you need reproducibility:
- Pin skill versions in combo definitions
- Use rule-based compilation
- Commit compiled output to version control

## Error handling

Compilation can fail at several stages:

| Stage | Error | Resolution |
|-------|-------|------------|
| Validation | Invalid combo schema | Fix definition syntax |
| Resolution | Skill not found | Check skill name/registry |
| Graph | Circular dependency | Revise ordering constraints |
| Synthesis | LLM failure | Retry or use fallback mode |

Errors are reported with context to enable debugging.

## Future considerations

- **Incremental compilation**: Only resynthesize changed portions
- **Compilation caching**: Store and reuse intermediate results
- **Multi-target output**: Generate for different skill formats
