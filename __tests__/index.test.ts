/* eslint-disable jest/no-conditional-expect */
import { jest } from '@jest/globals'
import dedent from 'dedent-js'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const { run } = await import('../src/index.js')

const validPolicy = dedent`*:dev
dev:qa
qa:main`

const invalidPolicy = dedent`**/*/my-branch:dev`

describe('run', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should fail if a policy is not provided', async () => {
    try {
      expect(await run()).toBe('failure')
      expect(core.getInput).toHaveBeenCalledWith('policy', { required: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Input required and not supplied: policy')
    }
  })

  it('Should fail if head_ref is not provided', async () => {
    core.getInput.mockReturnValueOnce(validPolicy)

    expect(await run()).toBe('failure')

    try {
      expect(core.getInput).toHaveBeenCalledWith('policy', { required: true })
      expect(core.getInput).toHaveBeenCalledWith('head_ref', { required: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Input required and not supplied: head_ref')
    }
  })

  it('Should fail if base_ref is not provided', async () => {
    core.getInput.mockReturnValueOnce(validPolicy).mockReturnValueOnce('dev')

    expect(await run()).toBe('failure')

    try {
      expect(core.getInput).toHaveBeenCalledWith('policy', { required: true })
      expect(core.getInput).toHaveBeenCalledWith('head_ref', { required: true })
      expect(core.getInput).toHaveBeenCalledWith('base_ref', { required: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Input required and not supplied: base_ref')
    }
  })

  it('Should fail if policy is not valid', async () => {
    core.getInput
      .mockReturnValueOnce(invalidPolicy)
      .mockReturnValueOnce('dev')
      .mockReturnValueOnce('qa')

    expect(await run()).toBe('failure')

    expect(core.error).toHaveBeenCalledWith('Invalid pattern: **/*/my-branch')
    expect(core.error).toHaveBeenCalledWith(
      `Policy line: ${invalidPolicy.split('\n')[0]}`
    )
    expect(core.setFailed).toHaveBeenCalledWith(
      'Policy contains invalid pattern(s)'
    )
  })

  it('Should fail if head and base do not follow valid policy', async () => {
    core.getInput
      .mockReturnValueOnce(validPolicy)
      .mockReturnValueOnce('dev')
      .mockReturnValueOnce('main')

    expect(await run()).toBe('failure')
    expect(core.setFailed).toHaveBeenCalledWith(
      'Branch merge order is invalid: dev -> main'
    )
  })

  it('Should pass if head and base follow valid policy', async () => {
    core.getInput
      .mockReturnValueOnce(validPolicy)
      .mockReturnValueOnce('dev')
      .mockReturnValueOnce('qa')

    expect(await run()).toBe('success')
    expect(core.info).toHaveBeenCalledWith(
      `Policy: ${validPolicy.replace(/\n/g, ' | ')}`
    )
    expect(core.info).toHaveBeenCalledWith('Head: dev')
    expect(core.info).toHaveBeenCalledWith('Base: qa')
    expect(core.info).toHaveBeenCalledWith(
      'Branch merge order is valid: dev -> qa'
    )
  })
})
