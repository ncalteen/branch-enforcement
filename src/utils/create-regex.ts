import * as core from '@actions/core'
import _ from 'lodash'

/**
 * Creates a regex from a string.
 *
 * @param ref The string to create a regex from.
 * @returns A regex created from the string.
 */
export async function createRegex(ref: string): Promise<RegExp> {
  core.info(`Create regex from: ${ref}`)

  // Empty string.
  if (ref.trim() === '') throw new SyntaxError(`Empty pattern: ${ref}`)

  // If the ref doesn't start with a letter, digit, or asterisk it's invalid.
  if (!/[\w\d\*]/.test(ref[0])) throw new SyntaxError(`Invalid pattern: ${ref}`)

  // If the ref matches it's lodash representation, then it's an attempt to
  // match a branch name exactly. In that case, just return the ref as a regex
  // (after escaping it). Periods have to be double escaped because
  // `_.escapeRegExp` escapes them as `\\.` and the regex constructor expects
  // them to be escaped as `\.`.
  if (
    ref.replaceAll('.', '\\.') === _.escapeRegExp(ref) &&
    /^[\w\d\-_/\.]+$/.test(ref)
  ) {
    core.info(`Exact match: ${ref}`)
    return new RegExp(_.escapeRegExp(ref))
  }

  // Otherwise, its one of the other supported patterns.
  switch (ref) {
    case '*':
      // Match letters, digits, dashes, underscores, or periods.
      core.info(`Match letters, digits, dashes, underscores: ${ref}`)
      return /^[\w\d\-_\.]+$/
    case '**/*':
      // Match letters, digits, dashes, underscores, slashes, and periods.
      core.info(`Match letters, digits, dashes, underscores, slashes: ${ref}`)
      return /^[\w\d\-_/\.]+$/
    default: {
      // Get the part of the ref before the first asterisk.
      const lead: string = /^[\w\d\-_/]+/.exec(_.escapeRegExp(ref))?.[0] ?? ''
      core.info(`Lead: ${lead}`)

      // If this returns an empty string, then the format is invalid
      // (e.g. `**/*/foo`).
      if (lead === '') throw new SyntaxError(`Invalid pattern: ${ref}`)

      // Get the part of the ref after the lead.
      const tail: string = ref.replace(lead, '')
      core.info(`Tail: ${tail}`)

      switch (tail) {
        case '*':
          core.info(`Match any character except a slash: ${ref}`)
          return new RegExp(`^${lead}[\\w\\d\\-\\_\\.]+$`)
        case '**/*':
          core.info(`Match any character: ${ref}`)
          return new RegExp(`^${lead}[\\w\\d\\-\\_\\/\\.]+$`)
        default:
          core.info(`Fall back to just the lead: ${ref}`)
          return new RegExp(`^${lead.replace('/', '')}$`)
      }
    }
  }
}
