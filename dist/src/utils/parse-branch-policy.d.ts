import { Policy } from '../interfaces';
/**
 * Parses the branch policy input or throws an error if the policy is invalid.
 */
export declare function parseBranchPolicy(core: typeof import('@actions/core'), branchPolicy: string): Promise<Policy>;
