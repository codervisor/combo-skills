# Combo Skills

## What is a combo skill?

A **combo skill** is a declarative composition of existing skills into a higher-level capability. It describes:

1. **Intent** — What the combined skill should accomplish
2. **Components** — Which existing skills are used
3. **Constraints** — Ordering, data flow, and assumptions

A combo skill is NOT:
- A new atomic skill written from scratch
- A simple alias or shortcut
- A runtime execution plan

## Anatomy of a combo skill definition

```yaml
name: extract-table-from-web
description: |
  Extract structured table data from a web page and convert to CSV format.
  Handles pagination if multiple pages contain table data.

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
  and produce a CSV output. If the page has pagination controls,
  follow them to collect all table rows.

constraints:
  ordering:
    - fetch-webpage -> parse-html -> extract-table -> convert-to-csv
  assumptions:
    - Tables use standard HTML <table> elements
    - Pagination uses recognizable patterns (next, page numbers)
```

## Key concepts

### Skills are references, not definitions

Combo skills reference skills by name and source. The actual skill definitions are fetched during compilation from registries like skills.sh.

```yaml
skills:
  - name: fetch-webpage
    from: skills.sh
```

This intentionally keeps combo skills lightweight and focused on composition.

### Intent is natural language

The `intent` field describes the high-level goal in natural language. During LLM-driven compilation, this intent guides how skills are woven together.

### Constraints are explicit

Rather than inferring everything, combo skills allow explicit constraints:

| Constraint Type | Purpose |
|----------------|---------|
| `ordering` | Explicit sequencing of skill execution |
| `assumptions` | Domain assumptions the combo relies on |
| `data_flow` | How outputs connect to inputs (optional) |

## Combo vs atomic skills

| Aspect | Atomic Skill | Combo Skill |
|--------|-------------|-------------|
| Definition | Self-contained capability | Composition of existing skills |
| Dependencies | None (typically) | References other skills |
| Granularity | Single operation | Multi-step workflow |
| Example | "Fetch a URL" | "Extract and transform web data" |

## File format

Combo skills use YAML (`.combo.yaml`) or JSON (`.combo.json`).

YAML is preferred for human authoring due to:
- Multi-line string support for intent
- Cleaner syntax for constraints
- Comments for documentation

## Validation

Combo skill definitions are validated against a JSON Schema before compilation. See [schemas/combo-skill.schema.json](../schemas/combo-skill.schema.json).
