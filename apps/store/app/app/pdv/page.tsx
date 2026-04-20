'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type Product = { id: string; name: string; sku: string; sale_price: number; cost_price: number; stock_qty: number; warranty_months?: number };
type Customer = { id: string; name: string; phone: string; cpf_cnpj: string };
type CartItem = { product: Product; qty: number; unit_price: number; discount: number; is_gift: boolean };
type Sale = { id: string; total: number; payment_method: string; created_at: string; customer?: { name: string } | null };

const PM = [
  { id: 'cash', label: 'Dinheiro', icon: '💵' },
  { id: 'pix', label: 'Pix', icon: '📲' },
  { id: 'card', label: 'Débito', icon: '💳' },
  { id: 'credit', label: 'Crédito', icon: '💳' },
  { id: 'credit_store', label: 'Fiado', icon: '📋' },
];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PDVPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cQuery, setCQuery] = useState('');
  const [cFiltered, setCFiltered] = useState<Customer[]>([]);
  const [globalDisc, setGlobalDisc] = useState(0);
  const [pm, setPm] = useState('cash');
  const [installments, setInstallments] = useState(1);
  const [cashReceived, setCashReceived] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [doneSale, setDoneSale] = useState<Sale | null>(null);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [tab, setTab] = useState<'pdv' | 'historico'>('pdv');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const today = new Date().toISOString().split('T')[0];
      const [p, c, s] = await Promise.all([
        supabase.from('products').select('*').eq('tenant_id', ud.tenant_id).eq('is_active', true),
        supabase.from('customers').select('id,name,phone,cpf_cnpj').eq('tenant_id', ud.tenant_id),
        supabase.from('sales').select('id,total,payment_method,created_at,customers(name)').eq('tenant_id', ud.tenant_id).gte('created_at', `${today}T00:00:00`).eq('status', 'completed').order('created_at', { ascending: false }).limit(20),
      ]);
      setProducts(p.data || []);
      setCustomers(c.data || []);
      setTodaySales((s.data || []) as Sale[]);
    }
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered([]); return; }
    const q = query.toLowerCase();
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)).slice(0, 8));
  }, [query, products]);

  useEffect(() => {
    if (!cQuery.trim()) { setCFiltered([]); return; }
    const q = cQuery.toLowerCase();
    setCFiltered(customers.filter(c => c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.cpf_cnpj?.replace(/\D/g, '').includes(q.replace(/\D/g, ''))).slice(0, 5));
  }, [cQuery, customers]);

  function addToCart(p: Product, gift = false) {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id && !i.is_gift && !gift);
      if (ex) return prev.map(i => i.product.id === p.id && !i.is_gift && !gift ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product: p, qty: 1, unit_price: gift ? 0 : p.sale_price, discount: 0, is_gift: gift }];
    });
    setQuery(''); setFiltered([]); ref.current?.focus();
  }

  function upd(i: number, f: 'qty' | 'discount' | 'unit_price', v: number) {
    setCart(prev => prev.map((item, idx) => idx === i ? { ...item, [f]: Math.max(0, v) } : item));
  }

  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.qty - i.discount, 0);
  const total = Math.max(0, subtotal - globalDisc);
  const change = pm === 'cash' ? Math.max(0, cashReceived - total) : 0;

  async function finalize() {
    if (!cart.length || !tenantId) return;
    if (pm === 'credit_store' && !customer) { alert('Selecione um cliente para venda fiado.'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: sale } = await supabase.from('sales').insert({
      tenant_id: tenantId, customer_id: customer?.id || null, seller_id: user!.id,
      subtotal, discount: globalDisc, total, payment_method: pm,
      installments: pm === 'credit' ? installments : 1, status: 'completed', notes,
    }).select('*, customers(name)').single();
    if (!sale) { setLoading(false); return; }
    await supabase.from('sale_items').insert(cart.map(i => ({
      sale_id: sale.id, product_id: i.product.id, qty: i.qty,
      unit_price: i.unit_price, discount: i.discount, is_gift: i.is_gift,
      subtotal: i.unit_price * i.qty - i.discount,
    })));
    for (const item of cart) {
      if (!item.is_gift) await supabase.rpc('decrement_stock', { p_product_id: item.product.id, p_qty: item.qty });
    }
    await supabase.from('cash_transactions').insert({
      tenant_id: tenantId, type: 'in', amount: total,
      description: `Venda #${sale.id.slice(0, 8).toUpperCase()}`,
      reference_id: sale.id, reference_type: 'sale', user_id: user!.id,
    });
    if (pm === 'credit_store' && customer) {
      const n = installments || 1;
      await supabase.from('accounts_receivable').insert(
        Array.from({ length: n }, (_, idx) => {
          const due = new Date(); due.setMonth(due.getMonth() + idx + 1);
          return { tenant_id: tenantId, sale_id: sale.id, customer_id: customer.id, installment_number: idx + 1, amount: total / n, due_date: due.toISOString().split('T')[0], status: 'pending' };
        })
      );
    }
    setTodaySales(prev => [sale as Sale, ...prev]);
    setDoneSale(sale as Sale);
    setLoading(false);
  }

  function newSale() {
    setCart([]); setCustomer(null); setGlobalDisc(0); setPm('cash');
    setInstallments(1); setCashReceived(0); setNotes(''); setDoneSale(null);
    setTab('pdv'); setTimeout(() => ref.current?.focus(), 100);
  }

  if (doneSale) return (
    <div className="animate-fade-in" style={{ maxWidth: 520, margin: '4rem auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Venda realizada!</h2>
        <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '0.25rem' }}>#{doneSale.id.slice(0, 8).toUpperCase()}</p>
        <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#00D4AA', marginBottom: pm === 'cash' && change > 0 ? '0.5rem' : '2rem' }}>{fmt(doneSale.total)}</p>
        {pm === 'cash' && change > 0 && <div className="alert alert-success" style={{ marginBottom: '2rem', justifyContent: 'center' }}>💵 Troco: <strong>{fmt(change)}</strong></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} onClick={newSale}>🛒 Nova Venda</button>
          {customer?.phone && (
            <a className="btn btn-secondary" style={{ justifyContent: 'center' }} href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(customer.name)}%2C%20obrigado%20pela%20compra!%20Total%3A%20${encodeURIComponent(fmt(doneSale.total))}`} target="_blank" rel="noreferrer">📲 Enviar comprovante WhatsApp</a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {(['pdv', 'historico'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            {t === 'pdv' ? '🛒 PDV' : `📋 Hoje (${todaySales.length})`}
          </button>
        ))}
      </div>

      {tab === 'historico' ? (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Hora</th><th>Cliente</th><th>Forma</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
            <tbody>
              {!todaySales.length ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhuma venda hoje ainda.</td></tr>
                : todaySales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>{new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{(s.customer as any)?.name || '—'}</td>
                    <td><span className="badge badge-info">{PM.find(p => p.id === s.payment_method)?.label || s.payment_method}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#00D4AA' }}>{fmt(s.total)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <input ref={ref} id="pdv-search" type="text" className="form-input" placeholder="🔍 Buscar produto por nome ou código..." value={query} onChange={e => setQuery(e.target.value)} autoFocus style={{ fontSize: '1rem', padding: '0.75rem 1rem' }} onKeyDown={e => { if (e.key === 'Enter' && filtered.length > 0) addToCart(filtered[0]); }} />
              {filtered.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)', borderRadius: 10, marginTop: 4, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                  {filtered.map(p => (
                    <div key={p.id} onClick={() => addToCart(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--kdl-border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--kdl-surface-2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{p.sku && `SKU: ${p.sku} · `}Estoque: {p.stock_qty}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: '#00D4AA' }}>{fmt(p.sale_price)}</p>
                        <button onClick={e => { e.stopPropagation(); addToCart(p, true); }} style={{ fontSize: '0.65rem', color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Brinde</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--kdl-border)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Carrinho ({cart.length})</span>
                {cart.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setCart([])}>Limpar</button>}
              </div>
              {!cart.length ? <div className="empty-state" style={{ padding: '2rem' }}><span style={{ fontSize: '2.5rem' }}>🛒</span><p>Busque um produto para adicionar</p></div>
                : <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 52px)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: 'var(--kdl-surface-2)' }}><th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Produto</th><th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Qtd</th><th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Preço</th><th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Desc.</th><th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total</th><th style={{ width: 36 }}></th></tr></thead>
                    <tbody>
                      {cart.map((item, i) => {
                        const tot = item.unit_price * item.qty - item.discount;
                        return (
                          <tr key={i} style={{ borderTop: '1px solid var(--kdl-border)' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}><p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.product.name}</p>{item.is_gift && <span className="badge badge-warning" style={{ marginTop: 2 }}>🎁 Brinde</span>}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}><input type="number" min={1} value={item.qty} onChange={e => upd(i, 'qty', Number(e.target.value))} style={{ width: 52, textAlign: 'center', padding: '0.25rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: 'var(--kdl-text)', fontSize: '0.85rem' }} /></td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}><input type="number" min={0} step={0.01} value={item.unit_price} onChange={e => upd(i, 'unit_price', Number(e.target.value))} disabled={item.is_gift} style={{ width: 80, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: 'var(--kdl-text)', fontSize: '0.85rem' }} /></td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}><input type="number" min={0} step={0.01} value={item.discount} onChange={e => upd(i, 'discount', Number(e.target.value))} style={{ width: 70, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: '#F59E0B', fontSize: '0.85rem' }} /></td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: item.is_gift ? '#F59E0B' : '#00D4AA' }}>{item.is_gift ? 'BRINDE' : fmt(tot)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}><button onClick={() => setCart(prev => prev.filter((_, x) => x !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kdl-danger)', fontSize: '1rem' }}>✕</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>}
            </div>
          </div>

          <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexShrink: 0 }}>
            <div className="card">
              <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem', fontSize: '0.9rem' }}>👤 Cliente</p>
              {customer ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{customer.name}</p><p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{customer.phone}</p></div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setCustomer(null)}>✕</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input id="pdv-customer-search" type="text" className="form-input" placeholder="Buscar cliente..." value={cQuery} onChange={e => setCQuery(e.target.value)} />
                  {cFiltered.length > 0 && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 50, marginTop: 4, background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
                      {cFiltered.map(c => (
                        <div key={c.id} onClick={() => { setCustomer(c); setCQuery(''); setCFiltered([]); }} style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', borderBottom: '1px solid var(--kdl-border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--kdl-surface-2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{c.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>Obrigatório para venda fiado</p>
                </div>
              )}
            </div>

            <div className="card">
              <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.875rem', fontSize: '0.9rem' }}>💰 Resumo</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span style={{ color: 'var(--kdl-text-muted)' }}>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--kdl-text-muted)' }}>Desc. global (R$)</span>
                  <input id="pdv-global-discount" type="number" min={0} step={0.01} value={globalDisc} onChange={e => setGlobalDisc(Number(e.target.value))} style={{ width: 90, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: '#F59E0B', fontSize: '0.85rem' }} />
                </div>
                <div style={{ height: 1, background: 'var(--kdl-border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}><span>Total</span><span style={{ color: '#00D4AA' }}>{fmt(total)}</span></div>
              </div>
            </div>

            <div className="card">
              <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.875rem', fontSize: '0.9rem' }}>💳 Pagamento</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PM.map(m => (
                  <label key={m.id} id={`pdv-pay-${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 0.75rem', borderRadius: 8, cursor: 'pointer', border: '1px solid', borderColor: pm === m.id ? 'var(--kdl-primary)' : 'var(--kdl-border)', background: pm === m.id ? 'rgba(108,71,255,0.08)' : 'transparent', fontSize: '0.875rem' }}>
                    <input type="radio" name="payment" value={m.id} checked={pm === m.id} onChange={() => setPm(m.id)} style={{ display: 'none' }} />{m.icon} {m.label}
                  </label>
                ))}
              </div>
              {pm === 'cash' && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="form-group"><label className="form-label">Valor Recebido (R$)</label><input type="number" min={0} step={0.01} className="form-input" value={cashReceived} onChange={e => setCashReceived(Number(e.target.value))} /></div>
                  {cashReceived > 0 && <div className="alert alert-success">💵 Troco: <strong>{fmt(change)}</strong></div>}
                </div>
              )}
              {pm === 'credit' && (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">Parcelas</label>
                  <select className="form-select" value={installments} onChange={e => setInstallments(Number(e.target.value))}>
                    {[2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x de {fmt(total / n)}</option>)}
                  </select>
                </div>
              )}
            </div>

            <button id="pdv-finalize" className="btn btn-primary btn-lg" onClick={finalize} disabled={!cart.length || loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg> Processando...</> : `Finalizar — ${fmt(total)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
