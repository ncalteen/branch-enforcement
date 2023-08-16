import { run } from '../index'
import * as core from '@actions/core'
import dedent from 'dedent-js'

const getInputMock = jest.spyOn(core, 'getInput')
const errorMock = jest.spyOn(core, 'error')
const infoMock = jest.spyOn(core, 'info')
const setFailedMock = jest.spyOn(core, 'setFailed')

const validPolicy = dedent`*:dev
dev:qa
qa:main`

const invalidPolicy = dedent`**/*/my-branch:dev`

beforeEach(() => {
  jest.clearAllMocks()
})

describe('run', () => {
  it('should fail if policy is not provided', async () => {
    expect(await run()).toBe('failure')

    try {
      expect(getInputMock).toHaveBeenCalledWith('policy', { required: true })
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Input required and not supplied: policy')
    }
  })

  it('should fail if head_ref is not provided', async () => {
    getInputMock.mockReturnValueOnce(validPolicy)

    expect(await run()).toBe('failure')

    try {
      expect(getInputMock).toHaveBeenCalledWith('policy', { required: true })
      expect(getInputMock).toHaveBeenCalledWith('head_ref', { required: true })
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Input required and not supplied: head_ref')
    }
  })

  it('should fail if base_ref is not provided', async () => {
    getInputMock.mockReturnValueOnce(validPolicy)
    getInputMock.mockReturnValueOnce('dev')

    expect(await run()).toBe('failure')

    try {
      expect(getInputMock).toHaveBeenCalledWith('policy', { required: true })
      expect(getInputMock).toHaveBeenCalledWith('head_ref', { required: true })
      expect(getInputMock).toHaveBeenCalledWith('base_ref', { required: true })
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Input required and not supplied: base_ref')
    }
  })

  it('should fail if policy is not valid', async () => {
    getInputMock.mockReturnValueOnce(invalidPolicy)
    getInputMock.mockReturnValueOnce('dev')
    getInputMock.mockReturnValueOnce('qa')

    expect(await run()).toBe('failure')

    try {
      expect(errorMock).toHaveBeenCalledWith('Invalid pattern: **/*/my-branch')
      expect(errorMock).toHaveBeenCalledWith(
        `Policy line: ${invalidPolicy.split('\n')[0]}`
      )
      expect(setFailedMock).toHaveBeenCalledWith(
        'Policy contains invalid pattern(s)'
      )
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Policy contains invalid pattern(s)')
    }
  })

  it('should fail if head and base do not follow valid policy', async () => {
    getInputMock.mockReturnValueOnce(validPolicy)
    getInputMock.mockReturnValueOnce('dev')
    getInputMock.mockReturnValueOnce('main')

    expect(await run()).toBe('failure')
    expect(setFailedMock).toHaveBeenCalledWith(
      'Branch merge order is invalid: dev -> main'
    )
  })

  it('should pass if head and base follow valid policy', async () => {
    getInputMock.mockReturnValueOnce(validPolicy)
    getInputMock.mockReturnValueOnce('dev')
    getInputMock.mockReturnValueOnce('qa')

    expect(await run()).toBe('success')
    expect(infoMock).toHaveBeenCalledWith(
      `Policy: ${validPolicy.replace(/\n/g, ' | ')}`
    )
    expect(infoMock).toHaveBeenCalledWith('Head: dev')
    expect(infoMock).toHaveBeenCalledWith('Base: qa')
    expect(infoMock).toHaveBeenCalledWith(
      'Branch merge order is valid: dev -> qa'
    )
  })
})
