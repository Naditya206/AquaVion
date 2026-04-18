import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const uid = request.cookies.get("av_uid")?.value

  if (pathname.startsWith("/dashboard") && !uid) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((pathname === "/login" || pathname === "/register") && uid) {
    const requestedNext = request.nextUrl.searchParams.get("next")
    const nextPath = requestedNext?.startsWith("/") ? requestedNext : "/dashboard"
    return NextResponse.redirect(new URL(nextPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
