import { createClient } from '@/lib/supabase/server';

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
  const tenantId = ud?.tenant_id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const [salesMonth, topProducts, salesByMethod, osStats] = await Promise.all([
    supabase.from('sales').select('total, created_at, payment_method').eq('tenant_id', tenantId).gte('created_at', startOfMonth).lte('created_at', endOfMonth).eq('status', 'completed'),
    supabase.from('sale_items').select('qty, unit_price, products(name)').eq('sale_items.tenant_id', tenantId).limit(100),
    supabase.from('sales').select('payment_method, total').eq('tenant_id', tenantId).gte('created_at', startOfMonth).eq('status', 'completed'),
    supabase.from('service_orders').select('status, price').eq('tenant_id', tenantId),
  ]);

  const monthRevenue  = salesMonth.data?.reduce((s, r) => s + Number(r.total), 0) || 0;
  const monthSales    = salesMonth.data?.length || 0;
  const avgTicket     = monthSales > 0 ? monthRevenue / monthSales : 0;
  const osDone        = osStats.data?.filter(o => o.status === 'completed').length || 0;
  const osRevenue     = osStats.data?.filter(o => o.status === 'billed').reduce((s, o) => s + Number(o.price), 0) || 0;

  // Vendas por método de pagamento
  const byMethod: Record<string, number> = {};
  for (const s of (salesByMethod.data || [])) {
    byMethod[s.payment_method] = (byMethod[s.payment_method] || 0) + Number(s.total);
  }

  const methodLabels: Record<string, string> = { cash: 'Dinheiro', pix: 'Pix', card: 'Débito', credit: 'Crédito', credit_store: 'Prazo' };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>📈 Relatórios</h1>
        <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>
          {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPIs do mês */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Vendas no Mês',    value: monthSales.toString(),  color: '#6C47FF', icon: '🛒' },
          { label: 'Faturamento',       value: monthRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#00D4AA', icon: '💰', raw: true },
          { label: 'Ticket Médio',      value: avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#F59E0B', icon: '📊', raw: true },
          { label: 'OS Concluídas',     value: osDone.toString(),      color: '#10B981', icon: '🔧' },
          { label: 'Receita OS',        value: osRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#B847FF', icon: '🔨', raw: true },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--kdl-text-muted)' }}>{s.label}</p>
              <span>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Vendas por método */}
        <div className="card">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>💳 Vendas por Forma de Pagamento</h2>
          {!Object.keys(byMethod).length ? (
            <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Sem dados no período</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([method, total]) => {
                const pct = monthRevenue > 0 ? (total / monthRevenue * 100) : 0;
                return (
                  <div key={method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                      <span>{methodLabels[method] || method}</span>
                      <span style={{ fontWeight: 700, color: '#00D4AA' }}>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--kdl-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6C47FF, #00D4AA)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--kdl-text-dim)', marginTop: 2 }}>{pct.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status de OS */}
        <div className="card">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>🔧 Resumo de Ordens de Serviço</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Total de OS',    value: osStats.data?.length || 0,            color: '#6C47FF' },
              { label: 'Em Andamento',   value: osStats.data?.filter(o => o.status === 'in_progress').length || 0, color: '#F59E0B' },
              { label: 'Concluídas',     value: osDone,                               color: '#10B981' },
              { label: 'Cobradas',       value: osStats.data?.filter(o => o.status === 'billed').length || 0,    color: '#00D4AA' },
              { label: 'Canceladas',     value: osStats.data?.filter(o => o.status === 'cancelled').length || 0, color: '#EF4444' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--kdl-text-muted)' }}>{s.label}</span>
                <span style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DRE simplificado */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>📋 DRE Simplificado — {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
        <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: '(+) Receita de Vendas', value: monthRevenue, color: '#10B981', bold: false },
            { label: '(+) Receita de Serviços', value: osRevenue, color: '#10B981', bold: false },
            { label: '(=) Receita Bruta', value: monthRevenue + osRevenue, color: '#00D4AA', bold: true },
            { label: '(=) Resultado do Período', value: monthRevenue + osRevenue, color: monthRevenue + osRevenue >= 0 ? '#00D4AA' : '#EF4444', bold: true },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: row.bold ? '0.625rem 0.75rem' : '0.375rem 0.75rem', borderRadius: row.bold ? 8 : 0, background: row.bold ? 'var(--kdl-surface-2)' : 'transparent', borderBottom: !row.bold ? '1px solid var(--kdl-border)' : 'none' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: row.bold ? 700 : 400, color: row.bold ? 'var(--kdl-text)' : 'var(--kdl-text-muted)' }}>{row.label}</span>
              <span style={{ fontWeight: row.bold ? 800 : 600, color: row.color, fontFamily: row.bold ? 'Outfit, sans-serif' : 'inherit' }}>{row.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>* Para DRE completo, inclua as contas a pagar do período no módulo Financeiro.</p>
      </div>
    </div>
  );
}
