import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/admin-auth'

const PUBLIC_ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isPublicAdmin = PUBLIC_ADMIN_PATHS.includes(pathname)
  const isLoginApi = pathname === '/api/admin/login'

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  if (isPublicAdmin || isLoginApi) {
    return NextResponse.next()
  }

  const session = await getSessionFromRequest(request)
  if (session?.authenticated) {
    return NextResponse.next()
  }

  if (isAdminApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/admin', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
