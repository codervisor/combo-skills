#!/usr/bin/env node

/**
 * combo-skills CLI
 *
 * Command-line interface for compiling combo skills into skill artifacts.
 *
 * Usage:
 *   combo-skills compile <combo-file> [options]
 *
 * Examples:
 *   combo-skills compile examples/extract-table-from-web.combo.yaml
 *   combo-skills compile my-skill.combo.yaml --output ./output
 *   combo-skills compile my-skill.combo.yaml --verbose
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { loadComboSkill, compile, validateComboSkill } from '../src/index.js';

interface CLIOptions {
  output?: string;
  verbose?: boolean;
  validate?: boolean;
}

/**
 * Parses command line arguments.
 */
function parseArgs(args: string[]): { command: string; file?: string; options: CLIOptions } {
  const options: CLIOptions = {};
  let command = '';
  let file: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--validate') {
      options.validate = true;
    } else if (arg === '--help' || arg === '-h') {
      command = 'help';
    } else if (arg === '--version') {
      command = 'version';
    } else if (!command && !arg.startsWith('-')) {
      command = arg;
    } else if (command && !file && !arg.startsWith('-')) {
      file = arg;
    }
  }

  return { command, file, options };
}

/**
 * Prints usage information.
 */
function printHelp(): void {
  console.log(`
combo-skills - Compose agent skills into higher-level capabilities

USAGE
  combo-skills <command> [options]

COMMANDS
  compile <file>    Compile a combo skill definition into a skill artifact
  validate <file>   Validate a combo skill definition without compiling

OPTIONS
  -o, --output <dir>   Output directory for compiled skill (default: ./output/<skill-name>)
  -v, --verbose        Enable verbose logging
  -h, --help           Show this help message
  --version            Show version number

EXAMPLES
  combo-skills compile examples/extract-table-from-web.combo.yaml
  combo-skills compile my-skill.combo.yaml --output ./dist
  combo-skills validate my-skill.combo.yaml
`);
}

/**
 * Prints version information.
 */
async function printVersion(): Promise<void> {
  try {
    const pkgPath = new URL('../../package.json', import.meta.url);
    const content = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    console.log(`combo-skills v${pkg.version}`);
  } catch {
    console.log('combo-skills v0.1.0');
  }
}

/**
 * Compiles a combo skill file.
 */
async function runCompile(file: string, options: CLIOptions): Promise<void> {
  const { output, verbose } = options;

  // Resolve file path
  const filePath = path.resolve(file);

  if (verbose) {
    console.log(`Loading combo skill from: ${filePath}`);
  }

  // Check file exists
  try {
    await fs.access(filePath);
  } catch {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Load combo skill definition
  const combo = await loadComboSkill(filePath);

  if (verbose) {
    console.log(`Loaded combo skill: ${combo.name}`);
    console.log(`  Skills: ${combo.skills.map(s => s.name).join(', ')}`);
  }

  // Determine output directory
  const outputDir = output ?? path.join(process.cwd(), 'output', combo.name);

  console.log(`Compiling ${combo.name}...`);

  // Compile
  const result = await compile(combo, {
    outputDir,
    verbose,
  });

  if (!result.success) {
    console.error('Compilation failed:');
    for (const error of result.errors ?? []) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  if (result.warnings && result.warnings.length > 0) {
    console.warn('Warnings:');
    for (const warning of result.warnings) {
      console.warn(`  - ${warning}`);
    }
  }

  console.log(`✓ Compiled successfully to: ${outputDir}`);
  console.log(`  - SKILL.md`);
  console.log(`  - metadata.json`);
  console.log(`  - examples/basic.md`);
}

/**
 * Validates a combo skill file.
 */
async function runValidate(file: string, options: CLIOptions): Promise<void> {
  const { verbose } = options;

  // Resolve file path
  const filePath = path.resolve(file);

  if (verbose) {
    console.log(`Validating: ${filePath}`);
  }

  // Check file exists
  try {
    await fs.access(filePath);
  } catch {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Load and validate
  const combo = await loadComboSkill(filePath);
  const result = validateComboSkill(combo);

  if (!result.valid) {
    console.error('Validation failed:');
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log(`✓ ${combo.name} is valid`);

  if (verbose) {
    console.log(`  Skills: ${combo.skills.length}`);
    console.log(`  Constraints: ${combo.constraints?.ordering?.length ?? 0} ordering rules`);
  }
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { command, file, options } = parseArgs(args);

  if (!command || command === 'help') {
    printHelp();
    return;
  }

  if (command === 'version') {
    await printVersion();
    return;
  }

  if (command === 'compile') {
    if (!file) {
      console.error('Error: Missing combo skill file');
      console.error('Usage: combo-skills compile <file>');
      process.exit(1);
    }
    await runCompile(file, options);
    return;
  }

  if (command === 'validate') {
    if (!file) {
      console.error('Error: Missing combo skill file');
      console.error('Usage: combo-skills validate <file>');
      process.exit(1);
    }
    await runValidate(file, options);
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error('Run "combo-skills --help" for usage');
  process.exit(1);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
