import { NextRequest, NextResponse } from 'next/server'

// In development, skip Clerk entirely
const isDev = process.env.NODE_ENV === 'development'

async function adminMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }
  const cookie = req.cookies.get('vynk_admin')
  if (!cookie?.value) return NextResponse.redirect(new URL('/admin/login', req.url))
  try {
    const s = JSON.parse(Buffer.from(cookie.value, 'base64').toString())
    if (!s.verified || Date.now() > s.expiresAt) {
      const r = NextResponse.redirect(new URL('/admin/login', req.url))
      r.cookies.delete('vynk_admin')
      return r
    }
  } catch { return NextResponse.redirect(new URL('/admin/login', req.url)) }
  return NextResponse.next()
}

async function devMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin')) return adminMiddleware(req)
  return NextResponse.next()
}

// Production middleware uses Clerk
async function prodMiddleware(req: NextRequest) {
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server')
  const isAdmin   = createRouteMatcher(['/admin(.*)'])
  const isBuilder = createRouteMatcher(['/builder(.*)', '/checkout(.*)'])
  const isPublic  = createRouteMatcher([
    '/', '/sign-in(.*)', '/sign-up(.*)', '/c/(.*)', '/legal/(.*)',
    '/api/webhooks/(.*)', '/api/promos/validate', '/api/admin/(.*)', '/admin/login',
  ])
  return clerkMiddleware(async (auth, r: NextRequest) => {
    const { userId } = await auth()
    const { pathname } = r.nextUrl
    if (isAdmin(r) && pathname !== '/admin/login') return adminMiddleware(r)
    if (isBuilder(r) && !userId)
      return NextResponse.redirect(new URL(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`, r.url))
    if (!isPublic(r) && !userId)
      return NextResponse.redirect(new URL('/sign-in', r.url))
    return NextResponse.next()
  })(req, {} as any)
}

export function middleware(req: NextRequest) {
  if (isDev) return devMiddleware(req)
  return prodMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
