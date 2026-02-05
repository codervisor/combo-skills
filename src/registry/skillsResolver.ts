/**
 * Skills registry resolver.
 *
 * This module fetches skill metadata from external registries like skills.sh.
 * Skills are treated as opaque units—we only need their metadata for compilation.
 *
 * Design notes:
 * - Skills are resolved by name and registry
 * - We cache resolved skills to avoid redundant fetches
 * - Resolution failures are non-fatal; we can compile with partial metadata
 *
 * TODO: Implement actual `npx skills` integration
 */

import type { SkillReference, ResolvedSkill } from '../types.js';

/**
 * Options for skill resolution.
 */
export interface ResolverOptions {
  /**
   * Enable caching of resolved skills.
   */
  cache?: boolean;

  /**
   * Timeout for registry requests in milliseconds.
   */
  timeout?: number;

  /**
   * Enable verbose logging.
   */
  verbose?: boolean;
}

/**
 * In-memory cache for resolved skills.
 */
const skillCache = new Map<string, ResolvedSkill>();

/**
 * Resolves a single skill from its reference.
 *
 * @param ref - Skill reference from combo definition
 * @param options - Resolver options
 * @returns Resolved skill with metadata
 */
export async function resolveSkill(
  ref: SkillReference,
  options: ResolverOptions = {}
): Promise<ResolvedSkill> {
  const { cache = true, verbose = false } = options;

  const cacheKey = `${ref.from ?? 'skills.sh'}:${ref.name}:${ref.version ?? 'latest'}`;

  if (cache && skillCache.has(cacheKey)) {
    if (verbose) {
      console.log(`[skillsResolver] Cache hit: ${cacheKey}`);
    }
    return skillCache.get(cacheKey)!;
  }

  if (verbose) {
    console.log(`[skillsResolver] Resolving: ${ref.name} from ${ref.from ?? 'skills.sh'}`);
  }

  // TODO: Replace with actual registry lookup
  // This is where you would call `npx skills info <name>` or hit an API.
  //
  // Example integration point:
  //
  // const result = await exec(`npx skills info ${ref.name} --json`);
  // const skillData = JSON.parse(result.stdout);
  //
  // Or via HTTP:
  //
  // const response = await fetch(`https://skills.sh/api/skills/${ref.name}`);
  // const skillData = await response.json();

  // For now, return a placeholder
  const resolved: ResolvedSkill = {
    name: ref.name,
    from: ref.from ?? 'skills.sh',
    version: ref.version ?? 'latest',
    description: `Atomic skill: ${ref.name}`,
    resolved: true,
    metadata: {
      resolvedAt: new Date().toISOString(),
      source: 'placeholder',
    },
  };

  if (cache) {
    skillCache.set(cacheKey, resolved);
  }

  return resolved;
}

/**
 * Resolves multiple skills in parallel.
 *
 * @param refs - Array of skill references
 * @param options - Resolver options
 * @returns Array of resolved skills
 */
export async function resolveSkills(
  refs: SkillReference[],
  options: ResolverOptions = {}
): Promise<ResolvedSkill[]> {
  const { verbose = false } = options;

  if (verbose) {
    console.log(`[skillsResolver] Resolving ${refs.length} skills`);
  }

  // Resolve in parallel for efficiency
  const results = await Promise.allSettled(
    refs.map((ref) => resolveSkill(ref, options))
  );

  const resolved: ResolvedSkill[] = [];
  const failed: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      resolved.push(result.value);
    } else {
      failed.push(refs[i].name);
      // Add a placeholder for failed resolution
      resolved.push({
        name: refs[i].name,
        from: refs[i].from ?? 'skills.sh',
        version: refs[i].version ?? 'latest',
        description: `[Resolution failed] ${refs[i].name}`,
        resolved: false,
        metadata: {
          error: result.reason?.message ?? 'Unknown error',
        },
      });
    }
  }

  if (failed.length > 0 && verbose) {
    console.warn(`[skillsResolver] Failed to resolve: ${failed.join(', ')}`);
  }

  return resolved;
}

/**
 * Clears the skill cache.
 */
export function clearCache(): void {
  skillCache.clear();
}

/**
 * Gets the current cache size.
 */
export function getCacheSize(): number {
  return skillCache.size;
}

/**
 * Checks if a skill exists in a registry.
 *
 * @param name - Skill name
 * @param from - Registry name
 * @returns True if skill exists
 */
export async function skillExists(
  name: string,
  from: string = 'skills.sh'
): Promise<boolean> {
  // TODO: Implement actual registry check
  // For now, assume all skills exist
  console.log(`[skillsResolver] Checking existence: ${name} in ${from}`);
  return true;
}
