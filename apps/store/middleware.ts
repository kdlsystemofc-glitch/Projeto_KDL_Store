import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/cadastro');
  const isDashboard = url.pathname.startsWith('/app');

  // Redireciona usuário não autenticado que tenta acessar /app
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redireciona usuário autenticado que acessa login/cadastro
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  // Redireciona raiz para /app/dashboard se autenticado, senão /login
  if (url.pathname === '/') {
    return NextResponse.redirect(
      new URL(user ? '/app/dashboard' : '/login', request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/', '/login', '/cadastro', '/app/:path*'],
};
