import { describe, expect, it } from 'vitest'
import { ROUTES } from './routes'

describe('routes', () => {
  it('exposes auth, home, and job paths', () => {
    expect(ROUTES.home).toBe('/')
    expect(ROUTES.signIn).toBe('/sign-in')
    expect(ROUTES.signUp).toBe('/sign-up')
    expect(ROUTES.design).toBe('/design')
    expect(ROUTES.ask).toBe('/ask')
    expect(ROUTES.change).toBe('/change')
    expect(ROUTES.cloud).toBe('/cloud')
  })
})
