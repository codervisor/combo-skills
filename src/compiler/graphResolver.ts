/**
 * Dependency graph resolution for combo skills.
 *
 * This module handles:
 * - Parsing ordering constraints from combo definitions
 * - Building a directed graph of skill dependencies
 * - Topological sorting to determine execution order
 * - Detecting circular dependencies
 *
 * Design notes:
 * - We treat skills as nodes and ordering constraints as edges
 * - The graph is used during compilation to ensure coherent synthesis
 * - Circular dependencies are errors, not warnings
 */

import type { ComboSkillDefinition } from '../types.js';

/**
 * Represents a node in the skill dependency graph.
 */
export interface SkillNode {
  name: string;
  alias?: string;
  dependencies: string[];
  dependents: string[];
}

/**
 * The resolved dependency graph.
 */
export interface DependencyGraph {
  nodes: Map<string, SkillNode>;
  executionOrder: string[];
  hasCycles: boolean;
  cycles?: string[][];
}

/**
 * Resolves the dependency graph from a combo skill definition.
 *
 * @param combo - The combo skill definition
 * @returns Resolved dependency graph with execution order
 */
export function resolveDependencyGraph(
  combo: ComboSkillDefinition
): DependencyGraph {
  const nodes = new Map<string, SkillNode>();

  // Initialize nodes from skills list
  for (const skill of combo.skills) {
    const key = skill.alias ?? skill.name;
    nodes.set(key, {
      name: skill.name,
      alias: skill.alias,
      dependencies: [],
      dependents: [],
    });
  }

  // Parse ordering constraints and build edges
  if (combo.constraints?.ordering) {
    for (const constraint of combo.constraints.ordering) {
      parseOrderingConstraint(constraint, nodes);
    }
  }

  // Detect cycles
  const cycleResult = detectCycles(nodes);

  // Compute topological order if no cycles
  const executionOrder = cycleResult.hasCycles
    ? []
    : topologicalSort(nodes);

  return {
    nodes,
    executionOrder,
    hasCycles: cycleResult.hasCycles,
    cycles: cycleResult.cycles,
  };
}

/**
 * Parses an ordering constraint string and updates the graph.
 *
 * Supported formats:
 * - "a -> b" (a must come before b)
 * - "a -> b -> c" (chained ordering)
 *
 * @param constraint - Ordering constraint string
 * @param nodes - The node map to update
 */
function parseOrderingConstraint(
  constraint: string,
  nodes: Map<string, SkillNode>
): void {
  // Split on arrow, handling spaces
  const parts = constraint.split(/\s*->\s*/);

  if (parts.length < 2) {
    console.warn(`[graphResolver] Invalid ordering constraint: ${constraint}`);
    return;
  }

  // Create edges for each consecutive pair
  for (let i = 0; i < parts.length - 1; i++) {
    const from = parts[i].trim();
    const to = parts[i + 1].trim();

    const fromNode = nodes.get(from);
    const toNode = nodes.get(to);

    if (!fromNode) {
      console.warn(`[graphResolver] Unknown skill in constraint: ${from}`);
      continue;
    }

    if (!toNode) {
      console.warn(`[graphResolver] Unknown skill in constraint: ${to}`);
      continue;
    }

    // Add edge: from -> to means 'to' depends on 'from'
    if (!toNode.dependencies.includes(from)) {
      toNode.dependencies.push(from);
    }
    if (!fromNode.dependents.includes(to)) {
      fromNode.dependents.push(to);
    }
  }
}

/**
 * Detects cycles in the dependency graph using DFS.
 *
 * @param nodes - The node map
 * @returns Cycle detection result
 */
function detectCycles(
  nodes: Map<string, SkillNode>
): { hasCycles: boolean; cycles?: string[][] } {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(nodeKey: string, path: string[]): boolean {
    visited.add(nodeKey);
    recursionStack.add(nodeKey);
    path.push(nodeKey);

    const node = nodes.get(nodeKey);
    if (!node) return false;

    for (const dependent of node.dependents) {
      if (!visited.has(dependent)) {
        if (dfs(dependent, [...path])) {
          return true;
        }
      } else if (recursionStack.has(dependent)) {
        // Found a cycle
        const cycleStart = path.indexOf(dependent);
        const cycle = path.slice(cycleStart);
        cycle.push(dependent);
        cycles.push(cycle);
        return true;
      }
    }

    recursionStack.delete(nodeKey);
    return false;
  }

  for (const nodeKey of nodes.keys()) {
    if (!visited.has(nodeKey)) {
      dfs(nodeKey, []);
    }
  }

  return {
    hasCycles: cycles.length > 0,
    cycles: cycles.length > 0 ? cycles : undefined,
  };
}

/**
 * Computes a topological ordering of skills.
 *
 * Uses Kahn's algorithm for topological sorting.
 *
 * @param nodes - The node map
 * @returns Array of skill names in execution order
 */
function topologicalSort(nodes: Map<string, SkillNode>): string[] {
  // Count incoming edges for each node
  const inDegree = new Map<string, number>();
  for (const [key, node] of nodes) {
    inDegree.set(key, node.dependencies.length);
  }

  // Start with nodes that have no dependencies
  const queue: string[] = [];
  for (const [key, degree] of inDegree) {
    if (degree === 0) {
      queue.push(key);
    }
  }

  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const node = nodes.get(current);
    if (!node) continue;

    for (const dependent of node.dependents) {
      const newDegree = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, newDegree);

      if (newDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  return result;
}

/**
 * Validates that a combo skill's constraints are satisfiable.
 *
 * @param combo - The combo skill definition
 * @returns Validation result with any errors
 */
export function validateConstraints(
  combo: ComboSkillDefinition
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const graph = resolveDependencyGraph(combo);

  if (graph.hasCycles) {
    for (const cycle of graph.cycles ?? []) {
      errors.push(`Circular dependency detected: ${cycle.join(' -> ')}`);
    }
  }

  // Check that all skills in constraints are defined
  if (combo.constraints?.ordering) {
    const skillNames = new Set(
      combo.skills.flatMap((s) => [s.name, s.alias].filter(Boolean))
    );

    for (const constraint of combo.constraints.ordering) {
      const parts = constraint.split(/\s*->\s*/);
      for (const part of parts) {
        const name = part.trim();
        if (!skillNames.has(name)) {
          errors.push(`Unknown skill in ordering constraint: ${name}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
