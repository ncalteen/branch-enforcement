import { Policy } from '../interfaces'

/**
 * Parses the branch policy input or throws an error if the policy is invalid.
 */
export async function parseBranchPolicy(
  core: typeof import('@actions/core'),
  branchPolicy: string
): Promise<Policy> {
  // Split the policy into an array of head/base pairs.
  const parsedPolicy: Policy = branchPolicy.split('\n').map((policyLine) => {
    // Returns empty regexes if the policy is invalid.
    let headRegExp = new RegExp('')
    let baseRegExp = new RegExp('')

    const [head, base] = policyLine.split(':')

    try {
      // Validate the regular expressions can be compiled.
      headRegExp = new RegExp(head)
      baseRegExp = new RegExp(base)

      core.info(`Parsed policy line: ${headRegExp} : ${baseRegExp}`)
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        core.error(error.message)
        core.error(`Policy line: ${policyLine}`)
        core.setFailed('Policy contains invalid regular expression(s)')
      }

      throw error
    }

    return { head: headRegExp, base: baseRegExp }
  })

  core.info(`Parsed policy: ${JSON.stringify(parsedPolicy)}`)
  return parsedPolicy
}
