'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const PM: Record<string, string> = { cash: 'Dinheiro', pix: 'Pix', card: 'Débito', credit: 'Crédito', credit_store: 'Fiado' };
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function RelatoriosPage() {
  const supabase = createClient();
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; });
  const [tab, setTab] = useState<'vendas'|'estoque'|'os'|'dre'>('vendas');

  const [sales, setSales] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [osData, setOsData] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);

  useEffect(() => {
    async function loadTenant() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (ud) setTenantId(ud.tenant_id);
    }
    loadTenant();
  }, []);

  useEffect(() => {
    if (!tenantId || !period) return;
    async function load() {
      setLoading(true);
      const [y, m] = period.split('-').map(Number);
      const start = new Date(y, m - 1, 1).toISOString();
      const end   = new Date(y, m, 0, 23, 59, 59).toISOString();
      const [s, si, p, c, os, pay] = await Promise.all([
        supabase.from('sales').select('id,total,payment_method,created_at,customers(name)').eq('tenant_id', tenantId).gte('created_at', start).lte('created_at', end).eq('status', 'completed').order('created_at', { ascending: false }),
        supabase.from('sale_items').select('qty,unit_price,discount,products(name,category_id)').eq('tenant_id', tenantId).gte('created_at', start).lte('created_at', end).limit(500),
        supabase.from('products').select('id,name,stock_qty,min_stock,cost_price,sale_price,category_id,is_active').eq('tenant_id', tenantId),
        supabase.from('categories').select('id,name').eq('tenant_id', tenantId),
        supabase.from('service_orders').select('id,status,price,created_at,completed_at,customers(name)').eq('tenant_id', tenantId),
        supabase.from('accounts_payable').select('amount,status,category,due_date').eq('tenant_id', tenantId).gte('due_date', start.split('T')[0]).lte('due_date', end.split('T')[0]),
      ]);
      setSales(s.data || []); setSaleItems(si.data || []);
      setProducts(p.data || []); setCategories(c.data || []);
      setOsData(os.data || []); setPayables(pay.data || []);
      setLoading(false);
    }
    load();
  }, [tenantId, period]);

  const totalRev = sales.reduce((s, r) => s + Number(r.total), 0);
  const totalSales = sales.length;
  const avgTicket = totalSales > 0 ? totalRev / totalSales : 0;

  // Por dia
  const byDay: Record<string, number> = {};
  for (const s of sales) {
    const d = s.created_at.split('T')[0].split('-')[2];
    byDay[d] = (byDay[d] || 0) + Number(s.total);
  }
  const maxDay = Math.max(...Object.values(byDay), 1);

  // Por método
  const byMethod: Record<string, number> = {};
  for (const s of sales) byMethod[s.payment_method] = (byMethod[s.payment_method] || 0) + Number(s.total);

  // Top produtos
  const itemTotals: Record<string, { name: string; qty: number; rev: number }> = {};
  for (const i of saleItems) {
    const name = (i.products as any)?.name || '?';
    if (!itemTotals[name]) itemTotals[name] = { name, qty: 0, rev: 0 };
    itemTotals[name].qty += i.qty;
    itemTotals[name].rev += (i.unit_price * i.qty) - i.discount;
  }
  const topProducts = Object.values(itemTotals).sort((a, b) => b.rev - a.rev).slice(0, 10);

  // Estoque
  const lowStock = products.filter(p => p.stock_qty <= p.min_stock && p.is_active);
  const totalStockValue = products.filter(p => p.is_active).reduce((s, p) => s + p.cost_price * p.stock_qty, 0);
  const totalSaleValue = products.filter(p => p.is_active).reduce((s, p) => s + p.sale_price * p.stock_qty, 0);

  // OS
  const [y2, m2] = period.split('-').map(Number);
  const monthStart = new Date(y2, m2 - 1, 1);
  const monthEnd = new Date(y2, m2, 0);
  const osMonth = osData.filter(o => {
    const d = new Date(o.created_at);
    return d >= monthStart && d <= monthEnd;
  });
  const osRevMonth = osData.filter(o => o.status === 'billed' && o.completed_at).reduce((s, o) => s + Number(o.price), 0);

  // DRE
  const totalPay = payables.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const pendPay = payables.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const osRev = osData.filter(o => o.status === 'billed').reduce((s, o) => s + Number(o.price), 0);
  const grossRev = totalRev + osRev;
  const result = grossRev - totalPay;

  const TABS = [
    { key: 'vendas', label: '🛒 Vendas' },
    { key: 'estoque', label: '📦 Estoque' },
    { key: 'os', label: '🔧 OS' },
    { key: 'dre', label: '📋 DRE' },
  ] as const;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>📈 Relatórios</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{MONTHS[Number(period.split('-')[1]) - 1]} de {period.split('-')[0]}</p>
        </div>
        <input type="month" className="form-input" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {loading ? <p style={{ color: 'var(--kdl-text-muted)', textAlign: 'center', padding: '3rem' }}>Carregando...</p> : (
        <>
          {tab === 'vendas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[{ label: 'Nº de Vendas', v: String(totalSales), color: '#6C47FF' }, { label: 'Faturamento', v: fmt(totalRev), color: '#00D4AA' }, { label: 'Ticket Médio', v: fmt(avgTicket), color: '#F59E0B' }].map(s => (
                  <div key={s.label} className="stat-card">
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--kdl-text-muted)', marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.v}</p>
                  </div>
                ))}
              </div>

              {/* Gráfico de barras por dia */}
              <div className="card">
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>Faturamento Diário</h3>
                {!Object.keys(byDay).length ? <p style={{ color: 'var(--kdl-text-muted)' }}>Sem vendas no período.</p>
                  : <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto', padding: '0 2px' }}>
                    {Array.from({ length: new Date(Number(period.split('-')[0]), Number(period.split('-')[1]), 0).getDate() }, (_, i) => {
                      const day = String(i + 1).padStart(2, '0');
                      const v = byDay[day] || 0;
                      const h = v > 0 ? Math.max(8, Math.round((v / maxDay) * 100)) : 2;
                      return (
                        <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '1 0 20px', minWidth: 20 }} title={v > 0 ? `Dia ${i+1}: ${fmt(v)}` : `Dia ${i+1}: sem vendas`}>
                          <div style={{ width: '100%', height: h, background: v > 0 ? 'linear-gradient(to top, #6C47FF, #00D4AA)' : 'var(--kdl-surface-3)', borderRadius: 3 }} />
                          {(i + 1) % 5 === 0 && <span style={{ fontSize: '0.6rem', color: 'var(--kdl-text-dim)' }}>{i+1}</span>}
                        </div>
                      );
                    })}
                  </div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Por método */}
                <div className="card">
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>Forma de Pagamento</h3>
                  {Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([method, v]) => {
                    const pct = totalRev > 0 ? v / totalRev * 100 : 0;
                    return (
                      <div key={method} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                          <span>{PM[method] || method}</span><span style={{ fontWeight: 700, color: '#00D4AA' }}>{fmt(v)}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--kdl-surface-2)', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6C47FF,#00D4AA)', borderRadius: 3 }} />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--kdl-text-dim)', marginTop: 2 }}>{pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>

                {/* Top produtos */}
                <div className="card">
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>Mais Vendidos</h3>
                  {!topProducts.length ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Sem dados.</p>
                    : topProducts.map((p, i) => (
                      <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--kdl-text-dim)', minWidth: 16 }}>#{i+1}</span>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700, color: '#00D4AA' }}>{fmt(p.rev)}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-muted)' }}>{p.qty} un</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'estoque' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total Produtos', v: String(products.filter(p => p.is_active).length), color: '#6C47FF' },
                  { label: 'Valor em Custo', v: fmt(totalStockValue), color: '#F59E0B' },
                  { label: 'Valor de Venda', v: fmt(totalSaleValue), color: '#00D4AA' },
                  { label: 'Abaixo do Mínimo', v: String(lowStock.length), color: '#EF4444' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--kdl-text-muted)', marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.v}</p>
                  </div>
                ))}
              </div>
              {lowStock.length > 0 && (
                <div className="card">
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1rem' }}>⚠️ Produtos Abaixo do Mínimo</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead><tr><th>Produto</th><th style={{ textAlign: 'center' }}>Estoque</th><th style={{ textAlign: 'center' }}>Mínimo</th><th style={{ textAlign: 'center' }}>Déficit</th><th style={{ textAlign: 'right' }}>Custo repor</th></tr></thead>
                      <tbody>
                        {lowStock.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.name}</td>
                            <td style={{ textAlign: 'center' }}><span className="badge badge-danger">{p.stock_qty}</span></td>
                            <td style={{ textAlign: 'center' }}>{p.min_stock}</td>
                            <td style={{ textAlign: 'center', color: '#EF4444', fontWeight: 700 }}>-{p.min_stock - p.stock_qty}</td>
                            <td style={{ textAlign: 'right', color: '#F59E0B' }}>{fmt(p.cost_price * (p.min_stock - p.stock_qty))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'os' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total OS (mês)', v: String(osMonth.length), color: '#6C47FF' },
                  { label: 'Concluídas', v: String(osMonth.filter(o => o.status === 'completed').length), color: '#10B981' },
                  { label: 'Em Andamento', v: String(osData.filter(o => o.status === 'in_progress').length), color: '#F59E0B' },
                  { label: 'Receita OS', v: fmt(osRevMonth), color: '#00D4AA' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--kdl-text-muted)', marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1rem' }}>Status de todas as OS</h3>
                {[
                  { label: 'Em Orçamento', key: 'quote', color: '#888' },
                  { label: 'Aprovadas', key: 'approved', color: '#6C47FF' },
                  { label: 'Em Andamento', key: 'in_progress', color: '#F59E0B' },
                  { label: 'Concluídas', key: 'completed', color: '#10B981' },
                  { label: 'Cobradas', key: 'billed', color: '#00D4AA' },
                  { label: 'Canceladas', key: 'cancelled', color: '#EF4444' },
                ].map(s => (
                  <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--kdl-text-muted)' }}>{s.label}</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', color: s.color }}>{osData.filter(o => o.status === s.key).length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'dre' && (
            <div className="card" style={{ maxWidth: 560 }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '1.5rem' }}>DRE Simplificado — {MONTHS[Number(period.split('-')[1]) - 1]} / {period.split('-')[0]}</h3>
              {[
                { label: '(+) Receita de Vendas', v: totalRev, color: '#10B981', bold: false },
                { label: '(+) Receita de Serviços (OS cobradas)', v: osRev, color: '#10B981', bold: false },
                { label: '(=) Receita Bruta', v: grossRev, color: '#00D4AA', bold: true },
                { label: '(−) Despesas Pagas no Mês', v: -totalPay, color: '#EF4444', bold: false },
                { label: '(!) Despesas Pendentes', v: pendPay, color: '#F59E0B', bold: false },
                { label: '(=) Resultado do Período', v: result, color: result >= 0 ? '#00D4AA' : '#EF4444', bold: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: row.bold ? '0.75rem 0.875rem' : '0.5rem 0.875rem', background: row.bold ? 'var(--kdl-surface-2)' : 'transparent', borderRadius: row.bold ? 8 : 0, borderBottom: !row.bold ? '1px solid var(--kdl-border)' : 'none', marginBottom: row.bold ? 8 : 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: row.bold ? 700 : 400, color: row.bold ? 'var(--kdl-text)' : 'var(--kdl-text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: row.bold ? 800 : 600, color: row.color, fontFamily: row.bold ? 'Outfit,sans-serif' : 'inherit' }}>{fmt(Math.abs(row.v))}</span>
                </div>
              ))}
              <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>* Despesas do mês selecionado pelo vencimento. Para maior precisão, registre todas as contas no módulo Financeiro.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
