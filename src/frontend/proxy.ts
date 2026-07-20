import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PUBLIC_PATHS } from "./constants/routes"
import { AUTH_TOKEN_COOKIE } from "./constants/auth"
  

export function proxy(request: NextRequest) {
  const isAuthed = request.cookies.has(AUTH_TOKEN_COOKIE)
  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname)

  if (isAuthed && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!isAuthed && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
