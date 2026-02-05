/**
 * combo-skills type definitions.
 *
 * This module defines the core types used throughout the library:
 * - Combo skill definitions (input)
 * - Resolved skills (intermediate)
 * - Compiled skills (output)
 * - Modifiers (cross-cutting behaviors)
 */

/**
 * Primitive capability categories for skills.
 * These are the fundamental actions that skills can perform.
 */
export type SkillPrimitive = 'read' | 'write' | 'search' | 'execute' | 'transform';

/**
 * Available modifier types for cross-cutting behaviors.
 */
export type ModifierType =
  | 'retry'
  | 'cache'
  | 'timeout'
  | 'auth'
  | 'rate-limit'
  | 'log'
  | 'fallback'
  | 'batch'
  | 'parallel'
  | 'dry-run';

/**
 * Retry modifier configuration.
 */
export interface RetryModifierConfig {
  attempts?: number;
  backoff?: 'linear' | 'exponential' | 'fixed';
  delay?: string;
}

/**
 * Cache modifier configuration.
 */
export interface CacheModifierConfig {
  ttl?: string;
  key?: string;
}

/**
 * Timeout modifier configuration.
 */
export interface TimeoutModifierConfig {
  duration?: string;
}

/**
 * Auth modifier configuration.
 */
export interface AuthModifierConfig {
  type?: 'bearer' | 'basic' | 'api-key' | 'oauth2';
  source?: string;
}

/**
 * Rate limit modifier configuration.
 */
export interface RateLimitModifierConfig {
  requests?: number;
  window?: string;
}

/**
 * Log modifier configuration.
 */
export interface LogModifierConfig {
  level?: 'debug' | 'info' | 'warn' | 'error';
  include?: Array<'input' | 'output' | 'timing' | 'errors'>;
}

/**
 * Fallback modifier configuration.
 */
export interface FallbackModifierConfig {
  skill?: string;
  value?: unknown;
}

/**
 * Batch modifier configuration.
 */
export interface BatchModifierConfig {
  size?: number;
  delay?: string;
}

/**
 * Parallel modifier configuration.
 */
export interface ParallelModifierConfig {
  concurrency?: number;
}

/**
 * Dry-run modifier configuration.
 */
export interface DryRunModifierConfig {
  log?: boolean;
}

/**
 * Structured modifier with detailed configuration.
 */
export interface StructuredModifier {
  retry?: RetryModifierConfig;
  cache?: CacheModifierConfig;
  timeout?: TimeoutModifierConfig;
  auth?: AuthModifierConfig;
  'rate-limit'?: RateLimitModifierConfig;
  log?: LogModifierConfig;
  fallback?: FallbackModifierConfig;
  batch?: BatchModifierConfig;
  parallel?: ParallelModifierConfig;
  'dry-run'?: DryRunModifierConfig;
}

/**
 * Prefix-style modifier string (e.g., 'retry:3', 'cache:5m').
 */
export type PrefixModifier = string;

/**
 * A modifier can be either prefix-style or structured.
 */
export type Modifier = PrefixModifier | StructuredModifier;

/**
 * Parsed modifier after normalization.
 */
export interface ParsedModifier {
  type: ModifierType;
  config: Record<string, unknown>;
  raw: string | StructuredModifier;
}

/**
 * Reference to a skill in a combo skill definition.
 */
export interface SkillReference {
  /**
   * Name of the skill as it appears in the registry.
   */
  name: string;

  /**
   * Registry or source of the skill.
   * @default "skills.sh"
   */
  from?: string;

  /**
   * Optional version constraint.
   */
  version?: string;

  /**
   * Local alias for referencing in constraints.
   */
  alias?: string;

  /**
   * Primitive capability categories for this skill.
   */
  primitives?: SkillPrimitive[];

  /**
   * Modifiers applied to this specific skill.
   */
  modifiers?: Modifier[];
}

/**
 * Constraints on skill composition.
 */
export interface ComboConstraints {
  /**
   * Explicit ordering relationships.
   * Format: "skill-a -> skill-b"
   */
  ordering?: string[];

  /**
   * Domain assumptions the combo relies on.
   */
  assumptions?: string[];

  /**
   * Explicit data flow between skills.
   */
  data_flow?: DataFlowMapping[];
}

/**
 * Mapping of data flow between skills.
 */
export interface DataFlowMapping {
  from: string;
  to: string;
  mapping?: Record<string, string>;
}

/**
 * Metadata for a combo skill.
 */
export interface ComboMetadata {
  author?: string;
  tags?: string[];
  license?: string;
}

/**
 * A combo skill definition as authored by the user.
 */
export interface ComboSkillDefinition {
  /**
   * Unique name for the combo skill.
   */
  name: string;

  /**
   * Human-readable description.
   */
  description: string;

  /**
   * Semantic version.
   */
  version?: string;

  /**
   * Primitive capability categories used by this combo skill.
   */
  primitives?: SkillPrimitive[];

  /**
   * Cross-cutting behavior modifiers applied to the entire combo skill.
   */
  modifiers?: Modifier[];

  /**
   * List of skills that compose this combo.
   */
  skills: SkillReference[];

  /**
   * Natural language description of the composition intent.
   */
  intent: string;

  /**
   * Composition constraints.
   */
  constraints?: ComboConstraints;

  /**
   * Additional metadata.
   */
  metadata?: ComboMetadata;
}

/**
 * A skill after resolution from a registry.
 */
export interface ResolvedSkill {
  /**
   * Skill name.
   */
  name: string;

  /**
   * Source registry.
   */
  from: string;

  /**
   * Resolved version.
   */
  version: string;

  /**
   * Skill description from registry.
   */
  description: string;

  /**
   * Whether resolution succeeded.
   */
  resolved: boolean;

  /**
   * Additional metadata from resolution.
   */
  metadata?: Record<string, unknown>;
}

/**
 * A combo skill with all skills resolved.
 */
export interface ResolvedComboSkill extends ComboSkillDefinition {
  /**
   * Resolved skill data.
   */
  resolvedSkills: ResolvedSkill[];
}

/**
 * The output of compilation.
 */
export interface CompiledSkill {
  /**
   * Skill name (from combo).
   */
  name: string;

  /**
   * Skill version.
   */
  version: string;

  /**
   * Generated SKILL.md content.
   */
  skillMd: string;

  /**
   * Compilation metadata.
   */
  metadata: {
    generatedAt: string;
    sourceCombo: string;
    compilationMode: string;
    skills: string[];
  };
}

/**
 * Result of a compilation operation.
 */
export interface CompilationResult {
  success: boolean;
  skill?: CompiledSkill;
  errors?: string[];
  warnings?: string[];
}
