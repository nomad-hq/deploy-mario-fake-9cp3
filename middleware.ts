import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Canonical domain: Nomad sets NOMAD_PRIMARY_DOMAIN when the creator picks a
  // primary domain in their dashboard. Redirect every OTHER host (including the
  // <slug>.nomad.red subdomain and any extra custom domains) to it.
  const primary = process.env.NOMAD_PRIMARY_DOMAIN
  const host = request.headers.get("host")
  if (primary && host && host !== primary) {
    const url = request.nextUrl.clone()
    url.host = primary
    url.protocol = "https"
    url.port = ""
    return NextResponse.redirect(url, 308)
  }

  // Auth gate for protected routes.
  const path = request.nextUrl.pathname
  if (path.startsWith("/app") || path.startsWith("/verify-email")) {
    const token = request.cookies.get("nomad_token")?.value
    if (!token) return NextResponse.redirect(new URL("/sign-in", request.url))
  }
  return NextResponse.next()
}

// Run site-wide (except Next internals + static files) so the canonical-domain
// redirect applies to every page, not just protected ones.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
