import * as core from '@actions/core'
import { parseBranchPolicy } from './utils/parse-branch-policy'
import { Policy } from './interfaces'

/**
 * Fails if the branch merge order is not being followed
 */
export async function run(): Promise<string> {
  let isValid: boolean = false

  try {
    // Get the inputs.
    const inputPolicy: string = core.getInput('policy', { required: true })
    const headRef: string = core.getInput('head_ref', { required: true })
    const baseRef: string = core.getInput('base_ref', { required: true })

    // Log the inputs.
    core.info(`Policy: ${inputPolicy.replace(/\n/g, ' | ')}`)
    core.info(`Head: ${headRef}`)
    core.info(`Base: ${baseRef}`)

    // Parse and validate the policy.
    const parsedPolicy: Policy = await parseBranchPolicy(core, inputPolicy)

    // Check if the head/base pair is valid.
    isValid = parsedPolicy.some((policyEntry) => {
      return policyEntry.head.test(headRef) && policyEntry.base.test(baseRef)
    })

    if (isValid) {
      core.info(`Branch merge order is valid: ${headRef} -> ${baseRef}`)
      return 'success'
    } else {
      core.setFailed(`Branch merge order is invalid: ${headRef} -> ${baseRef}`)
      return 'failure'
    }
  } catch (error: any) {
    core.setFailed(JSON.stringify(error))
    return 'failure'
  }
}

run()
