/**
 * combo-skills type definitions.
 *
 * This module defines the core types used throughout the library:
 * - Combo skill definitions (input)
 * - Resolved skills (intermediate)
 * - Compiled skills (output)
 */

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
