import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function TenantsPage() {
  const { data: tenants } = await supabaseAdmin
    .from('tenants')
    .select('*, plans(display_name, price_monthly)')
    .order('created_at', { ascending: false });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem' }}>🏪 Lojas (Tenants)</h1>
          <p style={{ color: 'var(--adm-muted)', fontSize: '0.8rem' }}>{tenants?.length || 0} lojas cadastradas</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Loja</th><th>Slug</th><th>Plano</th><th style={{ textAlign: 'right' }}>MRR</th>
            <th>Stripe ID</th><th>Cadastrada em</th><th style={{ textAlign: 'center' }}>Status</th><th style={{ textAlign: 'center' }}>Ações</th>
          </tr></thead>
          <tbody>
            {!tenants?.length ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--adm-muted)' }}>Nenhuma loja cadastrada</td></tr>
            ) : tenants.map((t: any) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--adm-muted)' }}>{t.slug}</td>
                <td>{t.plans ? <span className="badge badge-info">{t.plans.display_name}</span> : <span className="badge badge-gray">—</span>}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#00D4AA' }}>
                  {t.plans ? Number(t.plans.price_monthly).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--adm-dim)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.stripe_customer_id || <span style={{ color: 'var(--adm-dim)' }}>Não configurado</span>}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--adm-muted)' }}>{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${t.status === 'active' ? 'badge-success' : t.status === 'suspended' ? 'badge-warning' : 'badge-danger'}`}>
                    {t.status === 'active' ? 'Ativa' : t.status === 'suspended' ? 'Suspensa' : 'Cancelada'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a href={`/tenants/${t.id}`} className="btn btn-ghost btn-sm">🔍 Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
