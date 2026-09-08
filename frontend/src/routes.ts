export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  design: '/design',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
