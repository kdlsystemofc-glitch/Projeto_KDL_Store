import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // --- Validação das env vars críticas ---
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[checkout] STRIPE_SECRET_KEY não definida');
      return NextResponse.json({ error: 'Configuração do servidor incompleta (Stripe Key)' }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[checkout] Supabase env vars não definidas');
      return NextResponse.json({ error: 'Configuração do servidor incompleta (Supabase)' }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('[checkout] NEXT_PUBLIC_APP_URL não definida');
      return NextResponse.json({ error: 'Configuração do servidor incompleta (APP_URL)' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- Lê o corpo da requisição ---
    const body = await req.json();
    const { planId, userId } = body;

    console.log('[checkout] planId:', planId, '| userId:', userId);

    if (!userId || !planId) {
      return NextResponse.json({ error: 'planId e userId são obrigatórios' }, { status: 400 });
    }

    // --- Verifica se o usuário existe no Auth ---
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError || !authData?.user) {
      console.error('[checkout] Usuário não encontrado no Auth:', authError);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }
    const user = authData.user;

    // --- Busca tenant do usuário ---
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('tenant_id, tenants(name, stripe_customer_id)')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.tenant_id) {
      console.error('[checkout] Tenant não encontrado para userId:', userId, userError);
      return NextResponse.json({ error: 'Loja não encontrada para este usuário' }, { status: 400 });
    }

    const tenant = userData.tenants as any;
    const tenantId = userData.tenant_id;

    // --- Busca o Price ID do plano no banco ---
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('stripe_price_id, display_name')
      .eq('name', planId)
      .single();

    console.log('[checkout] Plano encontrado:', plan, '| Erro:', planError);

    if (!plan?.stripe_price_id) {
      console.error('[checkout] stripe_price_id vazio para plano:', planId);
      return NextResponse.json({
        error: `O plano "${planId}" não tem um Price ID do Stripe configurado. Vá ao Supabase > Table Editor > plans e preencha a coluna stripe_price_id com o ID do preço do Stripe (começa com "price_...").`
      }, { status: 400 });
    }

    // --- Cria ou reutiliza customer no Stripe ---
    let customerId = tenant?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: tenant?.name || 'Cliente KDL Store',
        metadata: { tenant_id: tenantId, user_id: user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from('tenants').update({ stripe_customer_id: customerId }).eq('id', tenantId);
    }

    // --- Cria sessão de Checkout no Stripe ---
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cadastro?plano=${planId}&cancelled=1`,
      locale: 'pt-BR',
      metadata: { user_id: user.id, tenant_id: tenantId, plan_id: planId },
    });

    console.log('[checkout] Sessão Stripe criada:', session.id);
    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('[checkout] Erro inesperado:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Erro interno inesperado' }, { status: 500 });
  }
}
