import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, tenant_id } = body;

    if (!email || !password || !name || !tenant_id) {
      return NextResponse.json({ error: 'Campos obrigatórios: email, password, name, tenant_id' }, { status: 400 });
    }

    const cookieStore = await cookies();

    // Cliente normal para verificar autenticação do usuário atual
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(c => cookieStore.set(c.name, c.value, c.options)),
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verifica que o usuário atual pertence ao tenant e tem permissão
    const { data: currentUser } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!currentUser || currentUser.tenant_id !== tenant_id) {
      return NextResponse.json({ error: 'Sem permissão para este tenant' }, { status: 403 });
    }
    if (!['owner', 'manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Apenas donos e gerentes podem criar usuários' }, { status: 403 });
    }

    // Cliente admin com service role para criar o usuário
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    // Cria o usuário com metadata de convite — o trigger handle_new_user
    // detecta is_invite: true e vincula ao tenant existente
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        is_invite: true,
        tenant_id,
        role: role || 'seller',
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    if (!newAuthUser.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
    }

    // Retorna o user row recém-criado
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', newAuthUser.user.id)
      .single();

    return NextResponse.json({
      user: userRow || {
        id: newAuthUser.user.id,
        name,
        email,
        role: role || 'seller',
        is_active: true,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 });
  }
}
