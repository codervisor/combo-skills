/**
 * LLM-driven synthesis for combo skills.
 *
 * This module is responsible for taking a resolved combo skill (with all
 * skill metadata fetched) and synthesizing a new skill artifact.
 *
 * Design notes:
 * - Compilation is non-deterministic by design
 * - The LLM receives the combo definition + resolved skill metadata
 * - Output is a SKILL.md-compatible artifact
 *
 * TODO: Integrate actual LLM provider (OpenAI, Anthropic, etc.)
 */

import type { ResolvedComboSkill, CompiledSkill, Modifier } from '../types.js';
import { validateModifiers, type ModifierValidationResult } from './modifierValidator.js';

/**
 * Options for LLM-driven compilation.
 */
export interface LLMCompilerOptions {
  /**
   * LLM provider to use. Currently a placeholder.
   */
  provider?: 'openai' | 'anthropic' | 'local';

  /**
   * Model identifier (e.g., 'gpt-4', 'claude-3').
   */
  model?: string;

  /**
   * Temperature for generation. Higher = more creative.
   * Default: 0.3 (prefer consistency over creativity)
   */
  temperature?: number;

  /**
   * Enable verbose logging of LLM interactions.
   */
  verbose?: boolean;

  /**
   * Whether to validate modifiers before compilation.
   * Default: true
   */
  validateModifiers?: boolean;
}

/**
 * Result of modifier validation during compilation.
 */
export interface CompilationValidation {
  modifiers: ModifierValidationResult | null;
}

/**
 * Compiles a resolved combo skill into a skill artifact using LLM synthesis.
 *
 * The compilation process:
 * 1. Validate modifiers against primitives
 * 2. Build a prompt from the combo definition and resolved skills
 * 3. Send to LLM for synthesis
 * 4. Parse LLM response into skill artifact structure
 * 5. Validate output format
 *
 * @param combo - Resolved combo skill with all skill metadata
 * @param options - Compiler options
 * @returns Compiled skill artifact
 */
export async function compileWithLLM(
  combo: ResolvedComboSkill,
  options: LLMCompilerOptions = {}
): Promise<CompiledSkill> {
  const { verbose = false, validateModifiers: shouldValidate = true } = options;

  if (verbose) {
    console.log(`[llmCompiler] Starting synthesis for: ${combo.name}`);
    console.log(`[llmCompiler] Using ${combo.resolvedSkills.length} skills`);
  }

  // Validate modifiers if present
  if (shouldValidate && combo.modifiers && combo.modifiers.length > 0) {
    const validation = validateModifiers(combo.modifiers, combo.primitives);
    if (!validation.valid) {
      throw new Error(
        `Modifier validation failed:\n${validation.errors.join('\n')}`
      );
    }
    if (verbose && validation.warnings.length > 0) {
      console.log(`[llmCompiler] Modifier warnings:\n${validation.warnings.join('\n')}`);
    }
  }

  // Build the synthesis prompt
  const prompt = buildSynthesisPrompt(combo);

  if (verbose) {
    console.log(`[llmCompiler] Generated prompt (${prompt.length} chars)`);
  }

  // TODO: Replace with actual LLM call
  // This is where you would integrate with OpenAI, Anthropic, or another provider.
  //
  // Example integration point:
  //
  // const response = await llmClient.complete({
  //   prompt,
  //   model: options.model ?? 'gpt-4',
  //   temperature: options.temperature ?? 0.3,
  // });
  //
  // const skillContent = parseLLMResponse(response);

  // For now, generate a placeholder skill
  const skillContent = generatePlaceholderSkill(combo);

  if (verbose) {
    console.log(`[llmCompiler] Synthesis complete`);
  }

  return {
    name: combo.name,
    version: combo.version ?? '0.1.0',
    skillMd: skillContent,
    metadata: {
      generatedAt: new Date().toISOString(),
      sourceCombo: combo.name,
      compilationMode: 'llm-placeholder',
      skills: combo.resolvedSkills.map((s) => s.name),
    },
  };
}

/**
 * Builds the synthesis prompt for the LLM.
 *
 * The prompt structure:
 * 1. System context about skill synthesis
 * 2. The combo skill definition
 * 3. Resolved skill metadata
 * 4. Modifier behaviors
 * 5. Output format instructions
 */
function buildSynthesisPrompt(combo: ResolvedComboSkill): string {
  const skillsSection = combo.resolvedSkills
    .map(
      (skill) => `
### ${skill.name}
${skill.description ?? 'No description available'}
Source: ${skill.from}
`
    )
    .join('\n');

  const constraintsSection = combo.constraints
    ? `
## Constraints

Ordering: ${combo.constraints.ordering?.join(', ') ?? 'None specified'}
Assumptions: ${combo.constraints.assumptions?.join('; ') ?? 'None specified'}
`
    : '';

  const modifiersSection = combo.modifiers && combo.modifiers.length > 0
    ? `
## Modifiers

The following cross-cutting behaviors are applied:
${combo.modifiers.map((m) => `- ${formatModifier(m)}`).join('\n')}

These modifiers affect how the skill executes (e.g., retry on failure, caching, timeouts).
`
    : '';

  return `
You are synthesizing a new agent skill by composing existing skills.

## Combo Skill Definition

Name: ${combo.name}
Description: ${combo.description}

## Intent

${combo.intent}

## Component Skills

${skillsSection}

${constraintsSection}
${modifiersSection}

## Instructions

Generate a SKILL.md file that:
1. Describes the combined capability clearly
2. Explains how the component skills work together
3. Provides usage examples
4. Documents any limitations or edge cases
5. Describes the behavior modifications applied by modifiers

The output should be a complete, standalone skill that an agent can use
without needing to understand the underlying composition.

Output the SKILL.md content directly, starting with a heading.
`.trim();
}

/**
 * Format a modifier for display in prompts or documentation.
 */
function formatModifier(modifier: Modifier): string {
  if (typeof modifier === 'string') {
    return modifier;
  }
  const keys = Object.keys(modifier);
  if (keys.length === 0) return '(empty modifier)';
  const type = keys[0];
  const config = (modifier as Record<string, unknown>)[type];
  if (!config || Object.keys(config as object).length === 0) {
    return type;
  }
  return `${type}: ${JSON.stringify(config)}`;
}

/**
 * Generates a placeholder skill when LLM is not available.
 * This is used for testing and development.
 */
function generatePlaceholderSkill(combo: ResolvedComboSkill): string {
  const skillsList = combo.resolvedSkills.map((s) => `- ${s.name}`).join('\n');

  const orderingSection = combo.constraints?.ordering
    ? `
## Workflow

The skill executes in this order:
${combo.constraints.ordering.map((o) => `1. ${o}`).join('\n')}
`
    : '';

  const modifiersSection = combo.modifiers && combo.modifiers.length > 0
    ? `
## Behavior Modifiers

The following cross-cutting behaviors are applied to this skill:
${combo.modifiers.map((m) => `- ${formatModifier(m)}`).join('\n')}
`
    : '';

  return `# ${combo.name}

${combo.description}

## Overview

This is a composed skill that combines multiple atomic skills to accomplish
a higher-level goal.

## Component Skills

${skillsList}

${orderingSection}
${modifiersSection}

## Intent

${combo.intent}

## Usage

\`\`\`
Use the ${combo.name} skill to ${combo.description.split('.')[0].toLowerCase()}.
\`\`\`

## Limitations

- This skill was generated by combo-skills
- It relies on the availability of all component skills
- Behavior may vary based on compilation options

---

*Generated by combo-skills*
`;
}
