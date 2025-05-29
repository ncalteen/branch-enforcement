import * as core from '@actions/core'
import { createRegex } from './create-regex.js'

export interface PolicyEntry {
  head: RegExp
  base: RegExp
}

/**
 * Parses the branch policy input or throws an error if the policy is invalid.
 *
 * @param branchPolicy The branch policy to parse.
 * @returns An array of policy entries.
 */
export async function parseBranchPolicy(
  branchPolicy: string
): Promise<Array<PolicyEntry>> {
  const parsedPolicy = []

  // Split the policy into an array of head/base pairs.
  const policyLines = branchPolicy.split('\n')

  for (const policyLine of policyLines) {
    // If the line is empty, skip it.
    if (policyLine.trim() === '') {
      core.info('Skipping empty policy line')
      continue
    }

    // Get the head and base from the policy line.
    const [head, base] = policyLine.split(':')

    try {
      // Generate regular expressions from the head and base patterns.
      const headRegExp: RegExp = await createRegex(head)
      const baseRegExp: RegExp = await createRegex(base)

      core.info(`Parsed policy line: ${headRegExp} : ${baseRegExp}`)
      parsedPolicy.push({ head: headRegExp, base: baseRegExp })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      /* istanbul ignore next */
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
