# Skill Primitives

Skill primitives are the atomic capability categories that all skills are built from. They represent the fundamental actions that can be composed into higher-level behaviors.

> **Status**: This document is based on research from spec [002-skill-primitives](../specs/002-skill-primitives/README.md).

## The 7 Primitive Categories

| Primitive | Purpose | Data Direction |
|-----------|---------|----------------|
| `read` | Acquire information from a source | Source → Skill |
| `write` | Persist information to a destination | Skill → Destination |
| `search` | Find matching items in a collection | Collection → Filtered Set |
| `execute` | Run external commands/processes | Command → Side Effects |
| `transform` | Convert data from one form to another | Input → Output |
| `observe` | Monitor state or changes over time | Source → Updates |
| `decide` | Make choices based on conditions | Inputs → Selection |

## Primitive Definitions

### read

**Purpose**: Acquire information from any source into the skill's working context.

**Characteristics**:
- Pulls data from external sources
- Does not modify the source
- Returns structured or unstructured data

**Examples**:
| Skill | Domain |
|-------|--------|
| `file-read` | Filesystem |
| `fetch-url` | Web |
| `git-log` | Version Control |
| `db-query` | Database |
| `get_file_contents` | GitHub |
| `issue_read` | GitHub |
| `view` (lean-spec) | Spec Management |

---

### write

**Purpose**: Persist information to a destination, creating or modifying state.

**Characteristics**:
- Pushes data to external destinations
- Creates or modifies state
- May return confirmation or created resource

**Examples**:
| Skill | Domain |
|-------|--------|
| `file-write` | Filesystem |
| `post-request` | Web |
| `db-insert` | Database |
| `push_files` | GitHub |
| `create_pull_request` | GitHub |
| `create` (lean-spec) | Spec Management |
| `update` (lean-spec) | Spec Management |

---

### search

**Purpose**: Find items matching specific criteria within a collection.

**Characteristics**:
- Works on a collection/index
- Applies filter criteria
- Returns matching subset

**Examples**:
| Skill | Domain |
|-------|--------|
| `grep` | Text Search |
| `semantic-search` | Vector Search |
| `file-glob` | Filesystem |
| `search_code` | GitHub |
| `search_issues` | GitHub |
| `search` (lean-spec) | Spec Management |
| `list` (lean-spec) | Spec Management |

---

### execute

**Purpose**: Run external commands or processes, typically with side effects.

**Characteristics**:
- Invokes external programs
- May produce side effects beyond data
- Returns exit status and/or output

**Examples**:
| Skill | Domain |
|-------|--------|
| `run-command` | Shell |
| `run-tests` | Testing |
| `run-lint` | Code Quality |
| `build` | Compilation |
| `merge_pull_request` | GitHub |

---

### transform

**Purpose**: Convert data from one form to another without external I/O.

**Characteristics**:
- Pure data transformation
- No external side effects
- Deterministic output for given input

**Examples**:
| Skill | Domain |
|-------|--------|
| `parse-html` | Parsing |
| `json-to-csv` | Format Conversion |
| `format-markdown` | Formatting |
| `validate` | Validation |
| `tokens` (lean-spec) | Token Counting |
| `analyze` (lean-spec) | Structure Analysis |

---

### observe

**Purpose**: Monitor state or changes over time, providing continuous updates.

**Characteristics**:
- Time-based monitoring
- Produces events or updates
- Often long-running or polling-based

**Examples**:
| Skill | Domain |
|-------|--------|
| `watch-file` | Filesystem |
| `poll-endpoint` | Web |
| `git-diff` | Version Control |
| `stream-logs` | Logging |

**Open Question**: Is `observe` a true primitive, or is it `read` + a polling/streaming modifier? See [Analysis](#open-questions) below.

---

### decide

**Purpose**: Make choices based on conditions, routing execution paths.

**Characteristics**:
- Evaluates conditions
- Selects from options
- Often used for control flow

**Examples**:
| Skill | Domain |
|-------|--------|
| `if-then` | Logic |
| `pattern-match` | Matching |
| `classify` | ML/Rules |
| `route` | Workflow |

**Open Question**: Is `decide` a primitive or a composition pattern? See [Analysis](#open-questions) below.

---

## Validation Against Real Skills

### LeanSpec CLI/MCP (17 operations)

| Operation | Primitive | Notes |
|-----------|-----------|-------|
| `list` | search | Lists/filters specs |
| `search` | search | Searches spec content |
| `view` | read | Reads spec content |
| `board` | read + transform | Reads specs, transforms to kanban view |
| `stats` | read + transform | Reads metrics, transforms to summary |
| `deps` | read + transform | Reads deps, transforms to graph |
| `create` | write | Creates new spec |
| `update` | write | Modifies spec metadata |
| `link` | write | Creates relationship |
| `unlink` | write | Removes relationship |
| `archive` | write | Moves spec to archive |
| `tokens` | transform | Counts tokens in content |
| `validate` | transform | Validates spec structure |
| `analyze` | transform | Analyzes structure for splitting |
| `check` | transform | Checks for conflicts |
| `split` | transform + write | Splits sections to files |
| `compact` | transform + write | Removes sections from main file |

**Result**: All 17 operations map to the 5 core primitives (read, write, search, transform, execute). No gaps found.

### GitHub MCP Tools (30+ operations)

| Tool Category | Primitive | Count |
|--------------|-----------|-------|
| `get_*` operations | read | 10+ |
| `create_*` operations | write | 8+ |
| `search_*` operations | search | 5+ |
| `list_*` operations | search | 7+ |
| `update_*` operations | write | 3+ |
| `merge_*` operations | execute | 2+ |

**Result**: All GitHub MCP tools map cleanly to read/write/search/execute.

### Combo Skill: extract-table-from-web

| Step | Skill | Primitive |
|------|-------|-----------|
| 1 | `fetch-webpage` | read |
| 2 | `parse-html` | transform |
| 3 | `extract-table` | transform |
| 4 | `convert-to-csv` | transform |

**Result**: Composition pattern: `read → transform → transform → transform`

---

## Open Questions

### 1. Is `observe` a primitive or a modifier?

**Argument for primitive**: Observing is fundamentally different from reading—it's time-aware and produces streams/events.

**Argument for modifier**: `observe` = `read` + polling behavior. The "watching" aspect could be a modifier applied to any read.

**Recommendation**: Defer to [003-skill-modifiers](../specs/003-skill-modifiers/README.md). If modifiers can express polling/streaming behavior, `observe` may not be needed as a primitive.

### 2. Is `decide` a primitive or a composition pattern?

**Argument for primitive**: Decision-making is a fundamental capability that appears in many skills.

**Argument for composition**: `decide` is control flow, not data transformation. It belongs in the composition model (branching, conditionals).

**Recommendation**: Move `decide` to the composition model in [004-composition-model](../specs/004-composition-model). Primitives should be about data operations, not control flow.

### 3. Should `communicate` be a primitive?

Missing from the original list: actions like "send email", "post to Slack", "publish notification".

**Analysis**: These are `write` operations to specific destinations (messaging systems). No new primitive needed—`write` covers this.

### 4. How do composite primitives work?

Some operations combine primitives (e.g., `board` = read + transform).

**Recommendation**: Allow skills to declare multiple primitives when they genuinely span categories.

---

## Refined Primitive Taxonomy

Based on the analysis, we propose **5 core primitives** with 2 as candidates for modifiers/composition:

### Core Primitives (Certain)

| Primitive | Description |
|-----------|-------------|
| `read` | Acquire information from a source |
| `write` | Persist information to a destination |
| `search` | Find matching items in a collection |
| `execute` | Run external commands/processes |
| `transform` | Convert data from one form to another |

### Deferred to Other Specs

| Candidate | Disposition |
|-----------|-------------|
| `observe` | Evaluate as modifier (polling/streaming) |
| `decide` | Move to composition model (control flow) |

---

## Schema Proposal

Add optional `primitives` field to combo-skill schema:

```yaml
# combo-skill with primitive annotations
name: extract-table-from-web
version: "0.1.0"
primitives:
  - read      # fetch-webpage
  - transform # parse-html, extract-table, convert-to-csv

skills:
  - name: fetch-webpage
    from: skills.sh
    primitives: [read]
  - name: parse-html
    from: skills.sh
    primitives: [transform]
  # ...
```

See [schema update](#next-steps) for implementation details.

---

## Properties of Good Primitives

The 5 core primitives satisfy these criteria:

1. **Orthogonal**: Each covers a distinct capability
   - read ≠ write (direction differs)
   - search ≠ read (filtering vs. fetching)
   - transform ≠ execute (pure vs. side-effecting)

2. **Complete**: All surveyed skills (50+) map to these primitives

3. **Minimal**: No primitive is derivable from others
   - `search` could be `read + transform`, but semantically distinct enough to warrant its own category

4. **Intuitive**: Developers can quickly classify actions
   - Unix philosophy alignment: stdin → transform → stdout

---

## Next Steps

1. Update [combo-skill.schema.json](../schemas/combo-skill.schema.json) with `primitives` field
2. Annotate example combo skill with primitives
3. Coordinate with [003-skill-modifiers](../specs/003-skill-modifiers/README.md) on `observe`
4. Coordinate with 004-composition-model on `decide`
