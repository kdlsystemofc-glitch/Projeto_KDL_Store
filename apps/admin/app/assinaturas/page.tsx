import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AssinaturasPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tenants } = await supabaseAdmin
    .from('tenants')
    .select('id, name, slug, status, stripe_subscription_id, stripe_customer_id, created_at, plans(display_name, price_monthly)')
    .order('created_at', { ascending: false });

  const totals = {
    active:    tenants?.filter(t => t.status === 'active').length    || 0,
    suspended: tenants?.filter(t => t.status === 'suspended').length || 0,
    cancelled: tenants?.filter(t => t.status === 'cancelled').length || 0,
  };
  const mrr = tenants
    ?.filter(t => t.status === 'active')
    .reduce((s: number, t: any) => s + Number(t.plans?.price_monthly || 0), 0) || 0;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem' }}>💳 Assinaturas</h1>
        <p style={{ color: 'var(--adm-muted)', fontSize: '0.8rem' }}>Status de todas as assinaturas Stripe</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'MRR Total',  value: mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#00D4AA' },
          { label: 'Ativas',     value: totals.active.toString(),    color: '#10B981' },
          { label: 'Suspensas',  value: totals.suspended.toString(), color: '#F59E0B' },
          { label: 'Canceladas', value: totals.cancelled.toString(), color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Loja</th><th>Plano</th><th style={{ textAlign: 'right' }}>MRR</th>
            <th>Stripe Customer</th><th>Stripe Sub</th><th>Desde</th>
            <th style={{ textAlign: 'center' }}>Status</th>
          </tr></thead>
          <tbody>
            {!tenants?.length ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--adm-muted)' }}>Sem assinaturas</td></tr>
            ) : tenants.map((t: any) => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--adm-dim)', fontFamily: 'monospace' }}>{t.slug}</div>
                </td>
                <td>{t.plans ? <span className="badge badge-info">{t.plans.display_name}</span> : <span className="badge badge-gray">—</span>}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: t.status === 'active' ? '#00D4AA' : 'var(--adm-dim)' }}>
                  {t.plans && t.status === 'active' ? Number(t.plans.price_monthly).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                </td>
                <td>
                  {t.stripe_customer_id ? (
                    <a
                      href={`https://dashboard.stripe.com/customers/${t.stripe_customer_id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#8B6FFF', textDecoration: 'none' }}
                    >
                      {t.stripe_customer_id.slice(0, 20)}…
                    </a>
                  ) : (
                    <span style={{ color: 'var(--adm-dim)', fontSize: '0.75rem' }}>Não vinculado</span>
                  )}
                </td>
                <td>
                  {t.stripe_subscription_id ? (
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${t.stripe_subscription_id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#8B6FFF', textDecoration: 'none' }}
                    >
                      {t.stripe_subscription_id.slice(0, 20)}…
                    </a>
                  ) : (
                    <span style={{ color: 'var(--adm-dim)', fontSize: '0.75rem' }}>—</span>
                  )}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--adm-muted)' }}>
                  {new Date(t.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${
                    t.status === 'active' ? 'badge-success' :
                    t.status === 'suspended' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {t.status === 'active' ? '✓ Ativa' : t.status === 'suspended' ? '⚠ Suspensa' : '✕ Cancelada'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
