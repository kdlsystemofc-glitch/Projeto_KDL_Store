import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Busca dados do tenant
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenants(name)')
    .eq('id', user?.id)
    .single();

  const tenantId = userData?.tenant_id;

  // Totais do dia
  const today = new Date().toISOString().split('T')[0];

  const [salesData, stockAlerts, warrantyExpiring] = await Promise.all([
    supabase
      .from('sales')
      .select('total, id')
      .eq('tenant_id', tenantId)
      .gte('created_at', `${today}T00:00:00`)
      .eq('status', 'completed'),
    supabase
      .from('products')
      .select('id, name, stock_qty, min_stock')
      .eq('tenant_id', tenantId)
      .filter('stock_qty', 'lte', 'min_stock')
      .eq('is_active', true)
      .limit(5),
    supabase
      .from('warranties')
      .select('id, expiry_date, products(name), customers(name)')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .limit(5),
  ]);

  const totalSales = salesData.data?.length || 0;
  const totalRevenue = salesData.data?.reduce((s, r) => s + Number(r.total), 0) || 0;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const STATS = [
    { label: 'Vendas Hoje', value: totalSales, icon: '🛒', color: '#6C47FF', suffix: '' },
    { label: 'Faturamento Hoje', value: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: '💰', color: '#00D4AA', suffix: '', raw: true },
    { label: 'Ticket Médio', value: avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: '📊', color: '#F59E0B', suffix: '', raw: true },
    { label: 'Alertas de Estoque', value: stockAlerts.data?.length || 0, icon: '⚠️', color: '#EF4444', suffix: '' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--kdl-text-muted)' }}>
                {s.label}
              </p>
              <span style={{
                width: 36, height: 36, borderRadius: 9, fontSize: '1rem',
                background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: s.color }}>
              {s.raw ? s.value : `${s.value}${s.suffix}`}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Estoque baixo */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>⚠️ Estoque Baixo</h2>
            <a href="/app/estoque" className="btn btn-ghost btn-sm">Ver todos →</a>
          </div>
          {!stockAlerts.data?.length ? (
            <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>✅ Todos os produtos estão bem estocados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stockAlerts.data.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                  <span style={{ fontSize: '0.875rem' }}>{p.name}</span>
                  <span className="badge badge-danger">{p.stock_qty} un</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Garantias vencendo */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>🛡️ Garantias Vencendo</h2>
            <a href="/app/garantias" className="btn btn-ghost btn-sm">Ver todas →</a>
          </div>
          {!warrantyExpiring.data?.length ? (
            <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>✅ Nenhuma garantia vencendo nos próximos 30 dias.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {warrantyExpiring.data.map((w: any) => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{(w.products as any)?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{(w.customers as any)?.name}</p>
                  </div>
                  <span className="badge badge-warning">
                    {new Date(w.expiry_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1rem' }}>Ações rápidas</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/app/pdv', label: '🛒 Nova Venda', primary: true },
            { href: '/app/os/nova', label: '🔧 Nova OS' },
            { href: '/app/clientes/novo', label: '👤 Novo Cliente' },
            { href: '/app/estoque/entrada', label: '📦 Entrada de Estoque' },
          ].map((a) => (
            <a key={a.href} href={a.href} className={`btn ${a.primary ? 'btn-primary' : 'btn-secondary'}`}>
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
