import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: ud } = await supabase.from('users').select('tenant_id, tenants(name)').eq('id', user?.id).single();
  const tenantId = ud?.tenant_id;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const in2days = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

  const [todaySales, yestSales, allProducts, urgentOS, dueBills, lastSales] = await Promise.all([
    supabase.from('sales').select('total').eq('tenant_id', tenantId).gte('created_at', `${today}T00:00:00`).eq('status', 'completed'),
    supabase.from('sales').select('total').eq('tenant_id', tenantId).gte('created_at', `${yesterday}T00:00:00`).lt('created_at', `${today}T00:00:00`).eq('status', 'completed'),
    supabase.from('products').select('id,name,stock_qty,min_stock').eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('service_orders').select('id,customer_id,status,estimated_date,customers(name)').eq('tenant_id', tenantId).lte('estimated_date', today).not('status', 'in', '("completed","cancelled","billed")').limit(5),
    supabase.from('accounts_payable').select('id,description,amount,due_date').eq('tenant_id', tenantId).eq('status', 'pending').lte('due_date', in2days).order('due_date').limit(5),
    supabase.from('sales').select('id,total,payment_method,created_at,customers(name)').eq('tenant_id', tenantId).gte('created_at', `${today}T00:00:00`).eq('status', 'completed').order('created_at', { ascending: false }).limit(5),
  ]);
  const stockAlerts = { data: (allProducts.data || []).filter((p: any) => p.stock_qty <= p.min_stock).slice(0, 8) };

  const rev = (todaySales.data || []).reduce((s: number, r: any) => s + Number(r.total), 0);
  const yRev = (yestSales.data || []).reduce((s: number, r: any) => s + Number(r.total), 0);
  const cnt = todaySales.data?.length || 0;
  const yCnt = yestSales.data?.length || 0;
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pct = (a: number, b: number) => b === 0 ? null : ((a - b) / b * 100).toFixed(0);

  function Delta({ a, b, isMoney }: { a: number; b: number; isMoney?: boolean }) {
    const p = pct(a, b);
    if (p === null) return null;
    const up = Number(p) >= 0;
    return <span style={{ fontSize: '0.75rem', color: up ? '#10B981' : '#EF4444', fontWeight: 700 }}>{up ? '▲' : '▼'} {Math.abs(Number(p))}% vs ontem</span>;
  }

  const PM: Record<string, string> = { cash: 'Dinheiro', pix: 'Pix', card: 'Débito', credit: 'Crédito', credit_store: 'Fiado' };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Vendas Hoje', value: String(cnt), sub: <Delta a={cnt} b={yCnt} />, icon: '🛒', color: '#6C47FF' },
          { label: 'Faturamento', value: fmt(rev), sub: <Delta a={rev} b={yRev} isMoney />, icon: '💰', color: '#00D4AA' },
          { label: 'Ticket Médio', value: cnt > 0 ? fmt(rev / cnt) : '—', icon: '📊', color: '#F59E0B' },
          { label: 'Alertas Estoque', value: String(stockAlerts.data?.length || 0), icon: '⚠️', color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--kdl-text-muted)' }}>{s.label}</p>
              <span style={{ width: 36, height: 36, borderRadius: 9, fontSize: '1rem', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
            {s.sub}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Estoque baixo */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>⚠️ Estoque Crítico</h2>
            <a href="/app/estoque" className="btn btn-ghost btn-sm">Ver todos →</a>
          </div>
          {!stockAlerts.data?.length
            ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>✅ Tudo bem estocado.</p>
            : stockAlerts.data.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                <span style={{ fontSize: '0.875rem' }}>{p.name}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="badge badge-danger">{p.stock_qty} un</span>
                  <a href="/app/fornecedores" className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Pedir</a>
                </div>
              </div>
            ))}
        </div>

        {/* OS urgentes */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>🔧 OS Urgentes</h2>
            <a href="/app/os" className="btn btn-ghost btn-sm">Ver todas →</a>
          </div>
          {!urgentOS.data?.length
            ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>✅ Nenhuma OS com prazo vencido.</p>
            : urgentOS.data.map((os: any) => (
              <a key={os.id} href={`/app/os`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)', textDecoration: 'none', color: 'inherit' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{os.customers?.name || '—'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{os.status}</p>
                </div>
                <span className="badge badge-danger">{new Date(os.estimated_date).toLocaleDateString('pt-BR')}</span>
              </a>
            ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Contas vencendo */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>📤 Contas Vencendo</h2>
            <a href="/app/financeiro" className="btn btn-ghost btn-sm">Ver todas →</a>
          </div>
          {!dueBills.data?.length
            ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>✅ Nenhuma conta vencendo em 2 dias.</p>
            : dueBills.data.map((b: any) => {
              const overdue = b.due_date < today;
              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{b.description}</p>
                    <p style={{ fontSize: '0.75rem', color: overdue ? '#EF4444' : '#F59E0B' }}>{overdue ? 'VENCIDA' : new Date(b.due_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: '#EF4444', fontSize: '0.875rem' }}>{fmt(b.amount)}</span>
                </div>
              );
            })}
        </div>

        {/* Últimas vendas */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>🛒 Últimas Vendas</h2>
            <a href="/app/pdv" className="btn btn-ghost btn-sm">PDV →</a>
          </div>
          {!lastSales.data?.length
            ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Nenhuma venda hoje ainda.</p>
            : lastSales.data.map((s: any) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.customers?.name || 'Sem cliente'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {PM[s.payment_method] || s.payment_method}</p>
                </div>
                <span style={{ fontWeight: 700, color: '#00D4AA', fontSize: '0.875rem' }}>{fmt(s.total)}</span>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1rem' }}>Ações rápidas</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[{ href: '/app/pdv', label: '🛒 Nova Venda', primary: true }, { href: '/app/os', label: '🔧 Nova OS' }, { href: '/app/clientes', label: '👤 Novo Cliente' }, { href: '/app/estoque', label: '📦 Entrada de Estoque' }].map(a => (
            <a key={a.href} href={a.href} className={`btn ${a.primary ? 'btn-primary' : 'btn-secondary'}`}>{a.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
