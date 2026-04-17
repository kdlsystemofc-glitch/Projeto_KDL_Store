import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    // ✅ Assinatura ativa (checkout concluído)
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const status = sub.status === 'active' ? 'active' : 'suspended';

      await supabase
        .from('tenants')
        .update({
          stripe_subscription_id: sub.id,
          status,
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    // ❌ Assinatura cancelada/inadimplente
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId = (obj as any).customer as string;

      await supabase
        .from('tenants')
        .update({ status: 'suspended' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    // 💳 Checkout concluído: vincula stripe_customer_id ao tenant
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;

      if (userId) {
        // Busca tenant do usuário
        const { data: userData } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', userId)
          .single();

        if (userData?.tenant_id) {
          // Busca plano pelo nome
          const { data: plan } = await supabase
            .from('plans')
            .select('id')
            .eq('name', planId || 'starter')
            .single();

          await supabase
            .from('tenants')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: session.subscription as string,
              plan_id: plan?.id,
              status: 'active',
            })
            .eq('id', userData.tenant_id);
        }
      }
      break;
    }

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
