import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const OLD_HOSTS = ['inchirieri.vercel.app']
const CANONICAL_HOST = 'autoalba.ro'

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  // 301 redirect from internal Vercel domain to production domain
  if (OLD_HOSTS.includes(host)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = CANONICAL_HOST
    url.port = ''
    return NextResponse.redirect(url, { status: 301 })
  }

  // Only run Supabase auth guard for admin routes
  const pathname = request.nextUrl.pathname
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = pathname === '/admin/login'

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Run on all routes except static assets so the host redirect fires on every page
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)).*)',
  ],
}
