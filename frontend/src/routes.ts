export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  design: '/design',
  ask: '/ask',
  change: '/change',
  cloud: '/cloud',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
