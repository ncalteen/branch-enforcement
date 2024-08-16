import { jest } from '@jest/globals'

export const graphql = Object.assign(jest.fn(), {
  defaults: jest.fn().mockReturnThis(),
  endpoint: jest.fn().mockReturnThis()
})
