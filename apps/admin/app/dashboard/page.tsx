import { createClient } from '@supabase/supabase-js';

// Admin usa service_role para leitura total sem RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminDashboard() {
  const [tenantsData, plansData, recentTenants] = await Promise.all([
    supabaseAdmin.from('tenants').select('id, status'),
    supabaseAdmin.from('plans').select('name, display_name, price_monthly, id'),
    supabaseAdmin.from('tenants').select('id, name, slug, status, created_at, plans(display_name, price_monthly)').order('created_at', { ascending: false }).limit(10),
  ]);

  const tenants = tenantsData.data || [];
  const plans   = plansData.data || [];

  const total     = tenants.length;
  const active    = tenants.filter(t => t.status === 'active').length;
  const suspended = tenants.filter(t => t.status === 'suspended').length;
  const cancelled = tenants.filter(t => t.status === 'cancelled').length;

  // MRR estimado: cada loja ativa pagando o plano dela
  // Simplificado: busca planos com contagem
  const { data: tenantPlans } = await supabaseAdmin
    .from('tenants')
    .select('plan_id, plans(price_monthly)')
    .eq('status', 'active');

  const mrr = tenantPlans?.reduce((s: number, t: any) => s + Number(t.plans?.price_monthly || 0), 0) || 0;
  const arr  = mrr * 12;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem' }}>📊 Dashboard</h1>
        <p style={{ color: 'var(--adm-muted)', fontSize: '0.8rem' }}>Visão geral do KDL Store SaaS</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'MRR',           value: mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#00D4AA', icon: '💰' },
          { label: 'ARR',           value: arr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#6C47FF', icon: '📈' },
          { label: 'Lojas Ativas',  value: active.toString(),    color: '#10B981', icon: '🏪' },
          { label: 'Total Lojas',   value: total.toString(),     color: '#8B6FFF', icon: '🏬' },
          { label: 'Suspensas',     value: suspended.toString(), color: '#F59E0B', icon: '⚠️' },
          { label: 'Canceladas',    value: cancelled.toString(), color: '#EF4444', icon: '❌' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-muted)' }}>{s.label}</p>
              <span style={{ fontSize: '1rem' }}>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Distribuição por plano */}
        <div className="card">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', marginBottom: '1rem' }}>📋 Lojas por Plano</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plans.map((plan: any) => {
              const count = tenantPlans?.filter((t: any) => t.plan_id === plan.id).length || 0;
              const revenue = count * plan.price_monthly;
              const pct = active > 0 ? (count / active * 100) : 0;
              return (
                <div key={plan.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
                    <span>{plan.display_name} <span style={{ color: 'var(--adm-muted)' }}>({count} lojas)</span></span>
                    <span style={{ fontWeight: 700, color: '#00D4AA' }}>{revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--adm-s3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6C47FF, #00D4AA)', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimas lojas */}
        <div className="card">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', marginBottom: '1rem' }}>🆕 Últimas Lojas Cadastradas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(recentTenants.data || []).slice(0, 6).map((t: any) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--adm-border)' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>{t.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--adm-muted)' }}>{t.slug}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${t.status === 'active' ? 'badge-success' : t.status === 'suspended' ? 'badge-warning' : 'badge-danger'}`}>{t.status}</span>
                  <p style={{ fontSize: '0.65rem', color: 'var(--adm-dim)', marginTop: 2 }}>{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="/tenants" className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>Ver todas as lojas →</a>
        </div>
      </div>
    </div>
  );
}
