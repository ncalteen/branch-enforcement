import type { PolicyEntry } from '../types.js';
/**
 * Parses the branch policy input or throws an error if the policy is invalid.
 *
 * @param branchPolicy The branch policy to parse.
 * @returns An array of policy entries.
 */
export declare function parseBranchPolicy(branchPolicy: string): Promise<Array<PolicyEntry>>;
