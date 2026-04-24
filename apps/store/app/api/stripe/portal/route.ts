import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

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

    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id, tenants(stripe_customer_id)')
      .eq('id', user.id)
      .single();

    const stripeCustomerId = (userData?.tenants as any)?.stripe_customer_id;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada. Conclua o pagamento primeiro.' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/configuracoes`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/portal]', err?.message);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
