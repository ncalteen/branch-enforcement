import { createRegex } from '../src/utils/create-regex'
import * as core from '@actions/core'

describe('createRegex', () => {
  it('"*" should match alphanumeric, dash, and underscore', async () => {
    const regex = await createRegex(core, '*')
    expect(regex.test('abc')).toBe(true)
    expect(regex.test('123')).toBe(true)
    expect(regex.test('-_')).toBe(true)
    expect(regex.test('!')).toBe(false)
    expect(regex.test('foo/bar')).toBe(false)
  })

  it('"**/*" should match alphanumeric, dash, underscore, and slash', async () => {
    const regex = await createRegex(core, '**/*')
    expect(regex.test('abc')).toBe(true)
    expect(regex.test('123')).toBe(true)
    expect(regex.test('-_/')).toBe(true)
    expect(regex.test('!')).toBe(false)
    expect(regex.test('foo/bar')).toBe(true)
    expect(regex.test('foo/bar/baz')).toBe(true)
  })

  it('"foo1/*" should match "foo/" followed by alphanumeric, dash, and underscore', async () => {
    const regex = await createRegex(core, 'foo1/*')
    expect(regex.test('foo1/bar')).toBe(true)
    expect(regex.test('foo1/bar/baz')).toBe(false)
    expect(regex.test('bar/foo1')).toBe(false)
    expect(regex.test('foo1')).toBe(false)
    expect(regex.test('fo o1')).toBe(false)
    expect(regex.test('foo1!')).toBe(false)
  })

  it('"foo2/**/*" should match "foo/" followed by alphanumeric, dash, underscore, and slash', async () => {
    const regex = await createRegex(core, 'foo2/**/*')
    expect(regex.test('foo2/bar')).toBe(true)
    expect(regex.test('foo2/bar/baz')).toBe(true)
    expect(regex.test('bar/foo2')).toBe(false)
    expect(regex.test('foo2')).toBe(false)
    expect(regex.test('fo o2')).toBe(false)
    expect(regex.test('foo2!')).toBe(false)
  })

  it('"foo/**/invalid/*" should match "foo" only', async () => {
    const regex = await createRegex(core, 'foo/**/invalid/*')
    expect(regex.test('foo')).toBe(true)
    expect(regex.test('foo/bar')).toBe(false)
    expect(regex.test('foo/bar/baz')).toBe(false)
    expect(regex.test('bar/foo')).toBe(false)
    expect(regex.test('fo o')).toBe(false)
    expect(regex.test('foo!')).toBe(false)
  })

  it('should throw a SyntaxError for invalid patterns', async () => {
    await expect(createRegex(core, '')).rejects.toThrow(SyntaxError)
    await expect(createRegex(core, '**/*/foo')).rejects.toThrow(SyntaxError)
    await expect(createRegex(core, '*/*/*/foo')).rejects.toThrow(SyntaxError)
    await expect(createRegex(core, '!foo')).rejects.toThrow(SyntaxError)
  })
})
