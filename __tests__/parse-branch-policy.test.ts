import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const { parseBranchPolicy } = await import(
  '../src/utils/parse-branch-policy.js'
)

describe('parseBranchPolicy', () => {
  it('should parse a single policy line correctly', async () => {
    const policy = 'feature/*:main'
    const result = await parseBranchPolicy(policy)

    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('head')
    expect(result[0]).toHaveProperty('base')
    expect(result[0].head).toBeInstanceOf(RegExp)
    expect(result[0].base).toBeInstanceOf(RegExp)
    expect(result[0].head.test('feature/test')).toBe(true)
    expect(result[0].base.test('main')).toBe(true)
  })

  it('should parse multiple policy lines correctly', async () => {
    const policy = 'feature/*:main\nhotfix/*:release/*'
    const result = await parseBranchPolicy(policy)

    expect(result).toHaveLength(2)

    // First policy entry
    expect(result[0].head.test('feature/test')).toBe(true)
    expect(result[0].base.test('main')).toBe(true)

    // Second policy entry
    expect(result[1].head.test('hotfix/fix')).toBe(true)
    expect(result[1].base.test('release/v1.0')).toBe(true)
  })

  it('should handle wildcard patterns correctly', async () => {
    const policy = '*:main\n**/*:release/*'
    const result = await parseBranchPolicy(policy)

    expect(result).toHaveLength(2)

    // First policy entry - any branch name
    expect(result[0].head.test('feature')).toBe(true)
    expect(result[0].head.test('bugfix')).toBe(true)
    expect(result[0].base.test('main')).toBe(true)

    // Second policy entry - any nested branch
    expect(result[1].head.test('feature/test')).toBe(true)
    expect(result[1].head.test('team/feature/test')).toBe(true)
    expect(result[1].base.test('release/v1.0')).toBe(true)
  })

  it('should log parsed policy information', async () => {
    const policy = 'feature/*:main'
    await parseBranchPolicy(policy)

    expect(core.info).toHaveBeenCalledWith(
      expect.stringMatching(/^Parsed policy line:/)
    )
    expect(core.info).toHaveBeenCalledWith(
      expect.stringMatching(/^Parsed policy:/)
    )
  })

  it('should throw SyntaxError for invalid head pattern', async () => {
    const policy = '!invalid:main'

    await expect(parseBranchPolicy(policy)).rejects.toThrow(SyntaxError)
    expect(core.error).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith(
      'Policy contains invalid pattern(s)'
    )
  })

  it('should throw SyntaxError for invalid base pattern', async () => {
    const policy = 'feature/*:!invalid'

    await expect(parseBranchPolicy(policy)).rejects.toThrow(SyntaxError)
    expect(core.error).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith(
      'Policy contains invalid pattern(s)'
    )
  })

  it('should throw SyntaxError for empty pattern', async () => {
    const policy = ':main'

    await expect(parseBranchPolicy(policy)).rejects.toThrow(SyntaxError)
    expect(core.error).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith(
      'Policy contains invalid pattern(s)'
    )
  })

  it('should handle empty policy string', async () => {
    const policy = ''
    const result = await parseBranchPolicy(policy)

    expect(result).toHaveLength(0)
  })

  it('should handle policy with spaces and special characters in branch names', async () => {
    const policy = 'feature/user-story:release/v1.2.3'
    const result = await parseBranchPolicy(policy)

    expect(result).toHaveLength(1)
    expect(result[0].head.test('feature/user-story')).toBe(true)
    expect(result[0].base.test('release/v1.2.3')).toBe(true)
  })
})
