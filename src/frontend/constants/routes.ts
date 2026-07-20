export const ROUTES = {
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  home: '/'
} as const

export type RouteKey = keyof typeof ROUTES

export const PUBLIC_PATHS = ["/signup", "/login"]
