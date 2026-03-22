import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isPublic = createRouteMatcher([
  '/', '/sign-in(.*)', '/sign-up(.*)',
  '/c/(.*)', '/legal/(.*)',
  '/api/webhooks/(.*)', '/api/promos/validate',
  '/admin/login',
])
const isAdmin   = createRouteMatcher(['/admin(.*)'])
const isBuilder = createRouteMatcher(['/builder(.*)', '/checkout(.*)'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // Admin routes — require vault session (PIN + 2FA)
  if (isAdmin(req) && pathname !== '/admin/login') {
    const cookie = req.cookies.get('vynk_admin')
    if (!cookie?.value) return NextResponse.redirect(new URL('/admin/login', req.url))
    try {
      const s = JSON.parse(Buffer.from(cookie.value,'base64').toString())
      if (!s.verified || Date.now() > s.expiresAt) {
        const r = NextResponse.redirect(new URL('/admin/login', req.url))
        r.cookies.delete('vynk_admin'); return r
      }
    } catch { return NextResponse.redirect(new URL('/admin/login', req.url)) }
    return NextResponse.next()
  }

  // Builder / checkout — require Clerk auth
  if (isBuilder(req) && !userId)
    return NextResponse.redirect(new URL(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`, req.url))

  // All other non-public routes — require Clerk auth
  if (!isPublic(req) && !userId)
    return NextResponse.redirect(new URL('/sign-in', req.url))

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|webmanifest)).*)','/(api|trpc)(.*)'],
}
