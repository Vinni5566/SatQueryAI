import { describe, expect, it } from 'vitest'
import { ROUTES } from './routes'

describe('routes', () => {
  it('exposes auth and home paths', () => {
    expect(ROUTES.home).toBe('/')
    expect(ROUTES.signIn).toBe('/sign-in')
    expect(ROUTES.signUp).toBe('/sign-up')
    expect(ROUTES.design).toBe('/design')
  })
})
