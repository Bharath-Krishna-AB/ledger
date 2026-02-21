import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with cross-site tracking.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')

    if (isAuthRoute) {
        if (user) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return supabaseResponse;
    }

    // Define protected routes mapping
    const isProtectedRoute =
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/ledger') ||
        request.nextUrl.pathname.startsWith('/analytics') ||
        request.nextUrl.pathname.startsWith('/budgets') ||
        request.nextUrl.pathname.startsWith('/accounts')

    // Temporarily disable protected routes to allow dynamic data building without login
    /*
    if (isProtectedRoute && !user) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }
    */

    return supabaseResponse
}
