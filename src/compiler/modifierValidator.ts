/**
 * Modifier validation for combo skills.
 *
 * This module handles:
 * - Parsing prefix and structured modifiers
 * - Validating modifier/primitive compatibility
 * - Detecting incompatible modifier combinations
 * - Analyzing modifier stacking order
 */

import type {
  Modifier,
  ModifierType,
  ParsedModifier,
  SkillPrimitive,
  StructuredModifier,
} from '../types.js';

/**
 * All valid modifier types.
 */
export const MODIFIER_TYPES: ModifierType[] = [
  'retry',
  'cache',
  'timeout',
  'auth',
  'rate-limit',
  'log',
  'fallback',
  'batch',
  'parallel',
  'dry-run',
];

/**
 * Modifier/Primitive compatibility matrix.
 *
 * - true: fully compatible
 * - 'warn': compatible with caveats
 * - false: incompatible
 */
export const MODIFIER_PRIMITIVE_COMPATIBILITY: Record<
  ModifierType,
  Record<SkillPrimitive, boolean | 'warn'>
> = {
  retry: { read: true, write: true, search: true, execute: true, transform: false },
  cache: { read: true, write: false, search: true, execute: false, transform: true },
  timeout: { read: true, write: true, search: true, execute: true, transform: true },
  auth: { read: true, write: true, search: true, execute: true, transform: false },
  'rate-limit': { read: true, write: true, search: true, execute: true, transform: false },
  log: { read: true, write: true, search: true, execute: true, transform: true },
  fallback: { read: true, write: 'warn', search: true, execute: 'warn', transform: true },
  batch: { read: true, write: true, search: true, execute: false, transform: true },
  parallel: { read: true, write: 'warn', search: true, execute: 'warn', transform: true },
  'dry-run': { read: false, write: true, search: false, execute: true, transform: false },
};

/**
 * Incompatible modifier pairs that should not be used together.
 */
export const INCOMPATIBLE_MODIFIER_PAIRS: Array<[ModifierType, ModifierType, string]> = [
  ['cache', 'dry-run', 'Caching simulated results may cause confusion'],
  ['batch', 'parallel', 'Use one or the other for collection processing'],
];

/**
 * Stacking order warnings.
 * [first, second, warning message]
 */
export const STACKING_ORDER_WARNINGS: Array<[ModifierType, ModifierType, string]> = [
  ['cache', 'retry', 'Cache before retry may cache failures; prefer retry → cache'],
  ['dry-run', 'cache', 'Dry-run before cache may cache simulated results'],
];

/**
 * Regex for parsing prefix modifiers.
 */
const PREFIX_MODIFIER_REGEX =
  /^(retry|cache|timeout|auth|rate-limit|log|fallback|batch|parallel|dry-run)(?::(.+))?$/;

/**
 * Parse a modifier (prefix or structured) into a normalized form.
 */
export function parseModifier(modifier: Modifier): ParsedModifier {
  if (typeof modifier === 'string') {
    return parsePrefixModifier(modifier);
  }
  return parseStructuredModifier(modifier);
}

/**
 * Parse a prefix-style modifier string.
 */
function parsePrefixModifier(modifier: string): ParsedModifier {
  const match = modifier.match(PREFIX_MODIFIER_REGEX);
  if (!match) {
    throw new Error(`Invalid modifier format: ${modifier}`);
  }

  const type = match[1] as ModifierType;
  const value = match[2];

  const config = parsePrefixValue(type, value);

  return { type, config, raw: modifier };
}

/**
 * Parse the value portion of a prefix modifier.
 */
function parsePrefixValue(type: ModifierType, value: string | undefined): Record<string, unknown> {
  if (!value) {
    return {};
  }

  switch (type) {
    case 'retry':
      return { attempts: parseInt(value, 10) };
    case 'cache':
      return { ttl: value };
    case 'timeout':
      return { duration: value };
    case 'auth':
      return { type: value };
    case 'rate-limit': {
      // Format: "10/m" or "100/h"
      const rateMatch = value.match(/^(\d+)\/([smh])$/);
      if (rateMatch) {
        return { requests: parseInt(rateMatch[1], 10), window: `1${rateMatch[2]}` };
      }
      return { requests: parseInt(value, 10) };
    }
    case 'log':
      return { level: value };
    case 'fallback':
      return { skill: value };
    case 'batch':
      return { size: parseInt(value, 10) };
    case 'parallel':
      return { concurrency: parseInt(value, 10) };
    case 'dry-run':
      return { log: value !== 'false' };
    default:
      return {};
  }
}

/**
 * Parse a structured modifier object.
 */
function parseStructuredModifier(modifier: StructuredModifier): ParsedModifier {
  const keys = Object.keys(modifier) as ModifierType[];
  if (keys.length === 0) {
    throw new Error('Structured modifier must have at least one key');
  }
  if (keys.length > 1) {
    throw new Error(`Structured modifier should have only one key, got: ${keys.join(', ')}`);
  }

  const type = keys[0];
  const config = (modifier as Record<ModifierType, Record<string, unknown>>)[type] ?? {};

  return { type, config, raw: modifier };
}

/**
 * Validation result for modifiers.
 */
export interface ModifierValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parsed: ParsedModifier[];
}

/**
 * Validate an array of modifiers against primitives.
 */
export function validateModifiers(
  modifiers: Modifier[],
  primitives?: SkillPrimitive[]
): ModifierValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsed: ParsedModifier[] = [];

  // Parse all modifiers
  for (const modifier of modifiers) {
    try {
      const p = parseModifier(modifier);
      parsed.push(p);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  // Check primitive compatibility
  if (primitives && primitives.length > 0) {
    for (const p of parsed) {
      for (const primitive of primitives) {
        const compat = MODIFIER_PRIMITIVE_COMPATIBILITY[p.type][primitive];
        if (compat === false) {
          errors.push(
            `Modifier '${p.type}' is incompatible with primitive '${primitive}'`
          );
        } else if (compat === 'warn') {
          warnings.push(
            `Modifier '${p.type}' with primitive '${primitive}' may have unexpected behavior`
          );
        }
      }
    }
  }

  // Check incompatible pairs
  const types = parsed.map((p) => p.type);
  for (const [a, b, message] of INCOMPATIBLE_MODIFIER_PAIRS) {
    if (types.includes(a) && types.includes(b)) {
      errors.push(`Incompatible modifiers: '${a}' and '${b}' - ${message}`);
    }
  }

  // Check stacking order
  for (let i = 0; i < parsed.length - 1; i++) {
    const current = parsed[i].type;
    const next = parsed[i + 1].type;
    for (const [first, second, message] of STACKING_ORDER_WARNINGS) {
      if (current === first && next === second) {
        warnings.push(`Stacking order: ${message}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsed,
  };
}

/**
 * Check if a single modifier is compatible with given primitives.
 */
export function isModifierCompatible(
  modifierType: ModifierType,
  primitives: SkillPrimitive[]
): { compatible: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let compatible = true;

  for (const primitive of primitives) {
    const compat = MODIFIER_PRIMITIVE_COMPATIBILITY[modifierType][primitive];
    if (compat === false) {
      compatible = false;
    } else if (compat === 'warn') {
      warnings.push(`'${modifierType}' with '${primitive}' may have unexpected behavior`);
    }
  }

  return { compatible, warnings };
}

/**
 * Get all compatible modifiers for a set of primitives.
 */
export function getCompatibleModifiers(primitives: SkillPrimitive[]): ModifierType[] {
  return MODIFIER_TYPES.filter((modifier) => {
    const { compatible } = isModifierCompatible(modifier, primitives);
    return compatible;
  });
}
