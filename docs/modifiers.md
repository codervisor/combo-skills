````markdown
# Skill Modifiers

Skill modifiers are cross-cutting behaviors that can wrap any skill. Like Tailwind's variants (`hover:`, `dark:`, `sm:`), modifiers apply consistently regardless of the underlying skill.

> **Status**: This document is based on spec [003-skill-modifiers](../specs/003-skill-modifiers/README.md).

## Overview

Modifiers are orthogonal to primitives—a `read` skill can have `retry:` or `cache:` applied. This separation powers composability.

**Mental model**: "this skill, with this modification"

| Tailwind | combo-skills |
|----------|--------------|
| `hover:bg-blue` | `retry:fetch-url` |
| `dark:text-white` | `auth:api-call` |
| `sm:hidden` | `timeout:30s:long-operation` |

## Modifier Syntax

combo-skills supports two syntax styles for flexibility:

### Prefix Syntax (Simple)

Use for common cases with single-value configuration:

```yaml
modifiers:
  - retry:3        # retry up to 3 times
  - cache:5m       # cache for 5 minutes
  - timeout:30s    # timeout after 30 seconds
```

### Structured Syntax (Detailed)

Use when you need fine-grained configuration:

```yaml
modifiers:
  - retry:
      attempts: 3
      backoff: exponential
      delay: 1s
  - cache:
      ttl: 5m
      key: "${input.url}"
```

Both syntaxes can be mixed in the same skill definition.

---

## Available Modifiers

### retry

Retry on failure with configurable backoff strategy.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `attempts` | integer | 3 | Maximum retry attempts (1-10) |
| `backoff` | string | exponential | Backoff strategy: `linear`, `exponential`, `fixed` |
| `delay` | string | 1s | Initial delay between retries |

**Prefix**: `retry:N` where N is the number of attempts.

```yaml
# Prefix
modifiers: [retry:3]

# Structured
modifiers:
  - retry:
      attempts: 5
      backoff: exponential
      delay: 500ms
```

---

### cache

Cache results to avoid redundant operations.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ttl` | string | - | Time-to-live: `5m`, `1h`, `1d` |
| `key` | string | - | Cache key template with `${input.*}` placeholders |

**Prefix**: `cache:TTL` where TTL is the expiration duration.

```yaml
# Prefix
modifiers: [cache:5m]

# Structured
modifiers:
  - cache:
      ttl: 1h
      key: "${input.url}:${input.options}"
```

---

### timeout

Fail after a specified duration.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | string | - | Timeout duration: `30s`, `5m` |

**Prefix**: `timeout:DURATION`

```yaml
# Prefix
modifiers: [timeout:30s]

# Structured
modifiers:
  - timeout:
      duration: 2m
```

---

### auth

Inject authentication context.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | - | Auth type: `bearer`, `basic`, `api-key`, `oauth2` |
| `source` | string | - | Environment variable or secret name |

**Prefix**: `auth:TYPE` where TYPE is the auth mechanism.

```yaml
# Prefix
modifiers: [auth:bearer]

# Structured
modifiers:
  - auth:
      type: api-key
      source: GITHUB_TOKEN
```

---

### rate-limit

Throttle execution frequency.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `requests` | integer | - | Maximum requests per window |
| `window` | string | - | Time window: `1s`, `1m`, `1h` |

**Prefix**: `rate-limit:N/WINDOW`

```yaml
# Prefix
modifiers: [rate-limit:10/m]

# Structured
modifiers:
  - rate-limit:
      requests: 100
      window: 1h
```

---

### log

Emit structured logs for debugging and observability.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `level` | string | info | Log level: `debug`, `info`, `warn`, `error` |
| `include` | array | - | What to log: `input`, `output`, `timing`, `errors` |

**Prefix**: `log` or `log:LEVEL`

```yaml
# Prefix
modifiers: [log:debug]

# Structured
modifiers:
  - log:
      level: info
      include: [input, timing, errors]
```

---

### fallback

Use an alternative on failure.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `skill` | string | - | Alternative skill to invoke on failure |
| `value` | any | - | Static fallback value on failure |

**Prefix**: `fallback:SKILL`

```yaml
# Prefix
modifiers: [fallback:cached-response]

# Structured
modifiers:
  - fallback:
      skill: local-cache-read
  # OR
  - fallback:
      value: { "status": "unavailable" }
```

---

### batch

Group multiple invocations for efficiency.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | integer | - | Batch size |
| `delay` | string | - | Delay between batches |

**Prefix**: `batch:N`

```yaml
# Prefix
modifiers: [batch:10]

# Structured
modifiers:
  - batch:
      size: 50
      delay: 100ms
```

---

### parallel

Execute concurrently (for batch operations).

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `concurrency` | integer | 5 | Maximum concurrent executions (1-100) |

**Prefix**: `parallel:N`

```yaml
# Prefix
modifiers: [parallel:10]

# Structured
modifiers:
  - parallel:
      concurrency: 20
```

---

### dry-run

Simulate execution without side effects.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `log` | boolean | true | Log simulated actions |

**Prefix**: `dry-run`

```yaml
# Prefix
modifiers: [dry-run]

# Structured
modifiers:
  - dry-run:
      log: true
```

---

## Modifier Stacking

Modifiers compose. Order matters for some combinations:

```yaml
# Recommended: retry first, then cache the success
modifiers:
  - retry:3
  - cache:5m

# Probably wrong: caches failures too
modifiers:
  - cache:5m
  - retry:3   # defeats retry purpose since cached failures are returned
```

### Stacking Order Guidelines

| First | Then | Effect |
|-------|------|--------|
| `retry` | `cache` | ✅ Cache successful results after retries |
| `timeout` | `retry` | ✅ Timeout applies to each retry attempt |
| `auth` | `cache` | ✅ Cache authenticated responses |
| `cache` | `retry` | ⚠️ May cache and return failures |
| `dry-run` | `cache` | ⚠️ May cache simulated results |

---

## Modifier/Primitive Compatibility

Not all modifiers make sense with all primitives:

| Modifier | read | write | search | execute | transform |
|----------|:----:|:-----:|:------:|:-------:|:---------:|
| `retry` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `cache` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `timeout` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `auth` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `rate-limit` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `log` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `fallback` | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |
| `batch` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `parallel` | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |
| `dry-run` | ❌ | ✅ | ❌ | ✅ | ❌ |

**Legend**:
- ✅ Fully compatible
- ⚠️ Compatible with caveats (may have side effects or unexpected behavior)
- ❌ Incompatible or meaningless

### Incompatibility Details

| Combination | Reason |
|------------|--------|
| `cache` + `write` | Caching write operations is dangerous |
| `cache` + `execute` | Side-effecting commands shouldn't be cached |
| `retry` + `transform` | Pure transformations don't fail in retry-able ways |
| `dry-run` + `read` | Reading doesn't have side effects to skip |
| `dry-run` + `search` | Searching doesn't have side effects to skip |
| `auth` + `transform` | Transforms are pure and don't need auth |
| `rate-limit` + `transform` | Local transforms aren't rate-limited |

---

## Application Levels

Modifiers can be applied at two levels:

### Combo-Level Modifiers

Apply to the entire composed skill:

```yaml
name: fetch-and-process
modifiers:
  - timeout:5m      # entire combo times out after 5 min
  - log:debug       # log all operations

skills:
  - name: fetch-url
  - name: parse-json
```

### Skill-Level Modifiers

Apply to specific skills within the composition:

```yaml
name: fetch-and-process
skills:
  - name: fetch-url
    modifiers:
      - retry:3       # only fetch-url retries
      - timeout:30s   # individual timeout
  - name: parse-json  # no modifiers
```

### Inheritance Rules

- Skill-level modifiers **override** combo-level modifiers of the same type
- Combo-level modifiers apply as defaults to all skills
- Explicit `modifiers: []` on a skill disables combo-level inheritance

---

## Examples

### Web API Client with Resilience

```yaml
name: resilient-api-fetch
primitives: [read]
modifiers:
  - retry:3
  - timeout:30s
  - cache:5m

skills:
  - name: fetch-url
    modifiers:
      - auth:bearer
      - rate-limit:100/m
```

### Batch Processing Pipeline

```yaml
name: batch-transform
primitives: [read, transform, write]

skills:
  - name: read-records
    modifiers: [batch:100]
  - name: transform-records
    modifiers: [parallel:10]
  - name: write-records
    modifiers:
      - batch:50
      - retry:3
```

### Safe Deployment Preview

```yaml
name: deploy-preview
primitives: [execute]
modifiers:
  - dry-run
  - log:info

skills:
  - name: run-deploy-script
```

---

## Schema Reference

See [combo-skill.schema.json](../schemas/combo-skill.schema.json) for the complete JSON Schema definition.

Type definitions are available in [src/types.ts](../src/types.ts).
````
