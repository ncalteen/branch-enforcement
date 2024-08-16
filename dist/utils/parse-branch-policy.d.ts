import { PolicyEntry } from '../interfaces.js';
/**
 * Parses the branch policy input or throws an error if the policy is invalid.
 */
export declare function parseBranchPolicy(branchPolicy: string): Promise<Array<PolicyEntry>>;
