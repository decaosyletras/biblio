import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name, value }) => {
    if (!value || !name.startsWith("sb-")) return false

    return /-auth-token(?:\.\d+)?$/.test(name)
  })
}

export async function proxy(request: NextRequest) {
  // La mayor parte del tráfico público no tiene sesión que renovar. Evitar
  // crear el cliente y consultar Auth reduce el CPU sin cambiar la protección
  // de las rutas, que continúan validando al usuario dentro de cada página/API.
  if (!hasSupabaseAuthCookie(request)) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            })

            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|woff|woff2|ttf|otf)$).*)",
  ],
}
