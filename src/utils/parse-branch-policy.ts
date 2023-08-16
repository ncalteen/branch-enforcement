import { Policy } from '../interfaces'
import { createRegex } from './create-regex'

/**
 * Parses the branch policy input or throws an error if the policy is invalid.
 */
export async function parseBranchPolicy(
  core: typeof import('@actions/core'),
  branchPolicy: string
): Promise<Policy> {
  const parsedPolicy = []

  // Split the policy into an array of head/base pairs.
  const policyLines = branchPolicy.split('\n')

  for (const policyLine of policyLines) {
    // Get the head and base from the policy line.
    const [head, base] = policyLine.split(':')

    try {
      // Generate regular expressions from the head and base patterns.
      const headRegExp: RegExp = await createRegex(core, head)
      const baseRegExp: RegExp = await createRegex(core, base)

      core.info(`Parsed policy line: ${headRegExp} : ${baseRegExp}`)
      parsedPolicy.push({ head: headRegExp, base: baseRegExp })
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        core.error(error.message)
        core.error(`Policy line: ${policyLine}`)
        core.setFailed('Policy contains invalid pattern(s)')
      }

      throw error
    }
  }

  core.info(`Parsed policy: ${JSON.stringify(parsedPolicy)}`)
  return parsedPolicy
}
