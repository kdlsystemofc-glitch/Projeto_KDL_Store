import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); 

  const { planId, userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing user' }, { status: 401 });
  }

  // Usa Service Role para garantir leitura caso o cookie no client ainda não tenha propagado
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Busca o email do usuário real
  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const user = authData?.user;

  if (!user) {
    return NextResponse.json({ error: 'User not found in auth' }, { status: 401 });
  }

  // Busca dados do tenant
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('tenant_id, tenants(name, stripe_customer_id)')
    .eq('id', user.id)
    .single();

  const tenant = userData?.tenants as any;
  const tenantId = userData?.tenant_id;

  // Busca o price_id do plano no Stripe
  const { data: plan } = await supabase
    .from('plans')
    .select('stripe_price_id, display_name')
    .eq('name', planId)
    .single();

  if (!plan?.stripe_price_id) {
    return NextResponse.json({ error: 'Plano não configurado' }, { status: 400 });
  }

  // Cria ou reutiliza customer no Stripe
  let customerId = tenant?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: tenant?.name || 'Cliente KDL Store',
      metadata: { tenant_id: tenantId, user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from('tenants')
      .update({ stripe_customer_id: customerId })
      .eq('id', tenantId);
  }

  // Cria sessão de checkout
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/configuracoes/assinatura?cancelled=1`,
    locale: 'pt-BR',
    metadata: { user_id: user.id, tenant_id: tenantId, plan_id: planId },
  });

  return NextResponse.json({ url: session.url });
}
