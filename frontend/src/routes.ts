export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  design: '/design',
  ask: '/ask',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
