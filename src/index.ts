/**
 * combo-skills library entry point.
 *
 * This module exports the public API for programmatic use of combo-skills.
 *
 * Core workflow:
 * 1. Load a combo skill definition (YAML/JSON)
 * 2. Validate against the schema
 * 3. Resolve referenced skills from registries
 * 4. Compile into a new skill artifact
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import YAML from 'yaml';

import { compileWithLLM, type LLMCompilerOptions } from './compiler/llmCompiler.js';
import { resolveDependencyGraph, validateConstraints } from './compiler/graphResolver.js';
import { resolveSkills } from './registry/skillsResolver.js';

import type {
  ComboSkillDefinition,
  ResolvedComboSkill,
  CompiledSkill,
  CompilationResult,
} from './types.js';

// Re-export types
export type * from './types.js';

// Re-export submodules
export { compileWithLLM } from './compiler/llmCompiler.js';
export { resolveDependencyGraph, validateConstraints } from './compiler/graphResolver.js';
export { resolveSkills, resolveSkill, clearCache } from './registry/skillsResolver.js';
export {
  validateModifiers,
  parseModifier,
  isModifierCompatible,
  getCompatibleModifiers,
  MODIFIER_TYPES,
  MODIFIER_PRIMITIVE_COMPATIBILITY,
} from './compiler/modifierValidator.js';

/**
 * Options for the compile function.
 */
export interface CompileOptions extends LLMCompilerOptions {
  /**
   * Output directory for the compiled skill.
   * If not specified, returns the result without writing to disk.
   */
  outputDir?: string;

  /**
   * Skip validation of the combo skill definition.
   */
  skipValidation?: boolean;
}

/**
 * Loads a combo skill definition from a file.
 *
 * @param filePath - Path to the .combo.yaml or .combo.json file
 * @returns Parsed combo skill definition
 */
export async function loadComboSkill(filePath: string): Promise<ComboSkillDefinition> {
  const content = await fs.readFile(filePath, 'utf-8');
  const ext = path.extname(filePath);

  if (ext === '.yaml' || ext === '.yml') {
    return YAML.parse(content) as ComboSkillDefinition;
  } else if (ext === '.json') {
    return JSON.parse(content) as ComboSkillDefinition;
  } else {
    // Try YAML first, then JSON
    try {
      return YAML.parse(content) as ComboSkillDefinition;
    } catch {
      return JSON.parse(content) as ComboSkillDefinition;
    }
  }
}

/**
 * Validates a combo skill definition.
 *
 * @param combo - The combo skill definition to validate
 * @returns Validation result
 */
export function validateComboSkill(
  combo: ComboSkillDefinition
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic required field validation
  if (!combo.name) {
    errors.push('Missing required field: name');
  }
  if (!combo.description) {
    errors.push('Missing required field: description');
  }
  if (!combo.skills || combo.skills.length === 0) {
    errors.push('Missing required field: skills (must have at least one)');
  }
  if (!combo.intent) {
    errors.push('Missing required field: intent');
  }

  // Validate constraints if present
  if (combo.constraints) {
    const constraintValidation = validateConstraints(combo);
    errors.push(...constraintValidation.errors);
  }

  // TODO: Add JSON Schema validation
  // const schemaValidator = new Ajv();
  // const validate = schemaValidator.compile(comboSkillSchema);
  // if (!validate(combo)) {
  //   errors.push(...validate.errors.map(e => e.message));
  // }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compiles a combo skill definition into a skill artifact.
 *
 * This is the main entry point for the combo-skills library.
 *
 * @param combo - The combo skill definition
 * @param options - Compilation options
 * @returns Compilation result
 */
export async function compile(
  combo: ComboSkillDefinition,
  options: CompileOptions = {}
): Promise<CompilationResult> {
  const { outputDir, skipValidation = false, verbose = false, ...llmOptions } = options;

  const warnings: string[] = [];

  // Step 1: Validate
  if (!skipValidation) {
    const validation = validateComboSkill(combo);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }
  }

  // Step 2: Resolve dependency graph
  const graph = resolveDependencyGraph(combo);
  if (graph.hasCycles) {
    return {
      success: false,
      errors: [`Circular dependencies detected: ${graph.cycles?.map(c => c.join(' -> ')).join('; ')}`],
    };
  }

  if (verbose) {
    console.log(`[compile] Execution order: ${graph.executionOrder.join(' -> ')}`);
  }

  // Step 3: Resolve skills from registries
  const resolvedSkills = await resolveSkills(combo.skills, { verbose });

  const failedResolutions = resolvedSkills.filter(s => !s.resolved);
  if (failedResolutions.length > 0) {
    warnings.push(
      `Some skills could not be resolved: ${failedResolutions.map(s => s.name).join(', ')}`
    );
  }

  // Step 4: Build resolved combo
  const resolvedCombo: ResolvedComboSkill = {
    ...combo,
    resolvedSkills,
  };

  // Step 5: Compile with LLM
  const compiled = await compileWithLLM(resolvedCombo, { verbose, ...llmOptions });

  // Step 6: Write output if directory specified
  if (outputDir) {
    await writeCompiledSkill(compiled, outputDir);
    if (verbose) {
      console.log(`[compile] Output written to: ${outputDir}`);
    }
  }

  return {
    success: true,
    skill: compiled,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Writes a compiled skill to disk.
 *
 * @param skill - The compiled skill
 * @param outputDir - Output directory
 */
async function writeCompiledSkill(
  skill: CompiledSkill,
  outputDir: string
): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });

  // Write SKILL.md
  await fs.writeFile(
    path.join(outputDir, 'SKILL.md'),
    skill.skillMd,
    'utf-8'
  );

  // Write metadata.json
  await fs.writeFile(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(skill.metadata, null, 2),
    'utf-8'
  );

  // Create examples directory
  const examplesDir = path.join(outputDir, 'examples');
  await fs.mkdir(examplesDir, { recursive: true });

  // Write a basic example
  await fs.writeFile(
    path.join(examplesDir, 'basic.md'),
    `# Basic Usage\n\nUse the \`${skill.name}\` skill for your task.\n`,
    'utf-8'
  );
}
