import { jest } from '@jest/globals'

export const graphql = jest.fn()
export const paginate = jest.fn()
export const rest = {
  issues: {
    createComment: jest.fn()
  },
  pulls: {
    listReviews: jest.fn(),
    requestReviewers: jest.fn()
  },
  repos: {
    getContent: jest.fn()
  },
  teams: {
    getMembershipForUserInOrg: jest.fn()
  }
}
