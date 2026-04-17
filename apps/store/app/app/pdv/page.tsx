'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type Product = {
  id: string; name: string; sku: string; sale_price: number;
  cost_price: number; stock_qty: number; category_id: string;
};
type Customer = { id: string; name: string; phone: string; cpf_cnpj: string };
type CartItem = {
  product: Product; qty: number; unit_price: number;
  discount: number; is_gift: boolean;
};

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Dinheiro', icon: '💵' },
  { id: 'pix', label: 'Pix', icon: '📲' },
  { id: 'card', label: 'Cartão Débito', icon: '💳' },
  { id: 'credit', label: 'Cartão Crédito', icon: '💳' },
  { id: 'credit_store', label: 'Prazo (Fiado)', icon: '📋' },
];

export default function PDVPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCustomer, setCustomer] = useState<Customer | null>(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [installments, setInstallments] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const [p, c] = await Promise.all([
        supabase.from('products').select('*').eq('tenant_id', ud.tenant_id).eq('is_active', true).gt('stock_qty', 0),
        supabase.from('customers').select('id,name,phone,cpf_cnpj').eq('tenant_id', ud.tenant_id),
      ]);
      setProducts(p.data || []);
      setCustomers(c.data || []);
    }
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFilteredProducts([]); return; }
    const q = query.toLowerCase();
    setFilteredProducts(products.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    ).slice(0, 8));
  }, [query, products]);

  useEffect(() => {
    if (!customerQuery.trim()) { setFilteredCustomers([]); return; }
    const q = customerQuery.toLowerCase();
    setFilteredCustomers(customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.cpf_cnpj?.includes(q)
    ).slice(0, 5));
  }, [customerQuery, customers]);

  function addToCart(product: Product, asGift = false) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && !i.is_gift);
      if (existing && !asGift) {
        return prev.map(i => i.product.id === product.id && !i.is_gift
          ? { ...i, qty: i.qty + 1 }
          : i
        );
      }
      return [...prev, { product, qty: 1, unit_price: asGift ? 0 : product.sale_price, discount: 0, is_gift: asGift }];
    });
    setQuery('');
    setFilteredProducts([]);
    searchRef.current?.focus();
  }

  function removeFromCart(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index));
  }

  function updateCartItem(index: number, field: 'qty' | 'discount' | 'unit_price', value: number) {
    setCart(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: Math.max(0, value) } : item
    ));
  }

  const subtotal = cart.reduce((s, i) => s + (i.unit_price * i.qty) - i.discount, 0);
  const total = Math.max(0, subtotal - globalDiscount);

  async function finalizeSale() {
    if (!cart.length) return;
    if (!tenantId) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Insert sale
    const { data: sale, error: saleError } = await supabase.from('sales').insert({
      tenant_id: tenantId,
      customer_id: selectedCustomer?.id || null,
      seller_id: user!.id,
      subtotal,
      discount: globalDiscount,
      total,
      payment_method: paymentMethod,
      installments: paymentMethod === 'credit' ? installments : 1,
      status: 'completed',
      notes,
    }).select().single();

    if (saleError || !sale) { setLoading(false); return; }

    // Insert sale items
    await supabase.from('sale_items').insert(
      cart.map(i => ({
        sale_id: sale.id,
        product_id: i.product.id,
        qty: i.qty,
        unit_price: i.unit_price,
        discount: i.discount,
        is_gift: i.is_gift,
        subtotal: (i.unit_price * i.qty) - i.discount,
      }))
    );

    // Update stock
    for (const item of cart) {
      if (!item.is_gift) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product.id,
          p_qty: item.qty,
        });
      }
    }

    // Cash transaction
    await supabase.from('cash_transactions').insert({
      tenant_id: tenantId,
      type: 'in',
      amount: total,
      description: `Venda #${sale.id.slice(0, 8).toUpperCase()}`,
      reference_id: sale.id,
      reference_type: 'sale',
      user_id: user!.id,
    });

    // Accounts receivable (se prazo)
    if (paymentMethod === 'credit_store' && selectedCustomer) {
      const installmentAmount = total / (installments || 1);
      const installmentRows = Array.from({ length: installments || 1 }, (_, idx) => {
        const due = new Date();
        due.setMonth(due.getMonth() + idx + 1);
        return {
          tenant_id: tenantId,
          sale_id: sale.id,
          customer_id: selectedCustomer.id,
          installment_number: idx + 1,
          amount: installmentAmount,
          due_date: due.toISOString().split('T')[0],
          status: 'pending',
        };
      });
      await supabase.from('accounts_receivable').insert(installmentRows);
    }

    setSuccess(true);
    setLoading(false);

    // Reset
    setTimeout(() => {
      setCart([]);
      setCustomer(null);
      setGlobalDiscount(0);
      setPaymentMethod('cash');
      setInstallments(1);
      setNotes('');
      setSuccess(false);
    }, 2000);
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 60px - 3rem)', overflow: 'hidden' }}>

      {/* Left: Product search + cart */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem' }}>🛒 Ponto de Venda</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setCart([])}>Limpar carrinho</button>
          </div>
        </div>

        {/* Product search */}
        <div style={{ position: 'relative' }}>
          <input
            ref={searchRef}
            id="pdv-search"
            type="text"
            className="form-input"
            placeholder="🔍 Buscar produto por nome ou código..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
          />
          {filteredProducts.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)',
              borderRadius: 10, marginTop: 4, overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}>
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--kdl-border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--kdl-surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>
                      {p.sku && `SKU: ${p.sku} · `}Estoque: {p.stock_qty}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#00D4AA' }}>
                      {p.sale_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(p, true); }}
                      style={{ fontSize: '0.65rem', color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >+ Como brinde</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="card" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--kdl-border)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>
            Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
          </div>
          {!cart.length ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🛒</span>
              <p>Busque um produto acima para adicionar ao carrinho</p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 52px)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--kdl-surface-2)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Produto</th>
                    <th style={{ padding: '0.5rem 0.5rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Qtd</th>
                    <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Preço</th>
                    <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Desc.</th>
                    <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total</th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => {
                    const itemTotal = (item.unit_price * item.qty) - item.discount;
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--kdl-border)' }}>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.product.name}</p>
                          {item.is_gift && <span className="badge badge-warning" style={{ marginTop: 2 }}>🎁 Brinde</span>}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <input
                            type="number" min={1}
                            value={item.qty}
                            onChange={e => updateCartItem(i, 'qty', Number(e.target.value))}
                            style={{ width: 52, textAlign: 'center', padding: '0.25rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: 'var(--kdl-text)', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          <input
                            type="number" min={0} step={0.01}
                            value={item.unit_price}
                            onChange={e => updateCartItem(i, 'unit_price', Number(e.target.value))}
                            disabled={item.is_gift}
                            style={{ width: 80, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: 'var(--kdl-text)', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          <input
                            type="number" min={0} step={0.01}
                            value={item.discount}
                            onChange={e => updateCartItem(i, 'discount', Number(e.target.value))}
                            style={{ width: 70, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: '#F59E0B', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: item.is_gift ? '#F59E0B' : '#00D4AA' }}>
                          {item.is_gift ? 'BRINDE' : itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button onClick={() => removeFromCart(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kdl-danger)', fontSize: '1rem' }}>✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right: Checkout panel */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexShrink: 0 }}>

        {/* Customer */}
        <div className="card">
          <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem', fontSize: '0.9rem' }}>👤 Cliente</p>
          {selectedCustomer ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedCustomer.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{selectedCustomer.phone}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCustomer(null)}>✕</button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                id="pdv-customer-search"
                type="text"
                className="form-input"
                placeholder="Buscar cliente..."
                value={customerQuery}
                onChange={e => setCustomerQuery(e.target.value)}
              />
              {filteredCustomers.length > 0 && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 50, marginTop: 4,
                  background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)', borderRadius: 8,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                }}>
                  {filteredCustomers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { setCustomer(c); setCustomerQuery(''); setFilteredCustomers([]); }}
                      style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', borderBottom: '1px solid var(--kdl-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--kdl-surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{c.phone}</p>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>
                Opcional — obrigatório para vendas fiado
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card">
          <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.875rem', fontSize: '0.9rem' }}>💰 Resumo</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--kdl-text-muted)' }}>Subtotal</span>
              <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--kdl-text-muted)' }}>Desc. global (R$)</span>
              <input
                id="pdv-global-discount"
                type="number" min={0} step={0.01}
                value={globalDiscount}
                onChange={e => setGlobalDiscount(Number(e.target.value))}
                style={{ width: 90, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: '#F59E0B', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ height: 1, background: 'var(--kdl-border)', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
              <span>Total</span>
              <span style={{ color: '#00D4AA' }}>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.875rem', fontSize: '0.9rem' }}>💳 Pagamento</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PAYMENT_METHODS.map(m => (
              <label
                key={m.id}
                id={`pdv-pay-${m.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 0.75rem',
                  borderRadius: 8, cursor: 'pointer', border: '1px solid',
                  borderColor: paymentMethod === m.id ? 'var(--kdl-primary)' : 'var(--kdl-border)',
                  background: paymentMethod === m.id ? 'rgba(108,71,255,0.08)' : 'transparent',
                  transition: 'all 0.15s', fontSize: '0.875rem',
                }}
              >
                <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} style={{ display: 'none' }} />
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </label>
            ))}
          </div>

          {paymentMethod === 'credit' && (
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Parcelas</label>
              <select className="form-select" value={installments} onChange={e => setInstallments(Number(e.target.value))}>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                  <option key={n} value={n}>{n}x de {(total / n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card">
          <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.625rem', fontSize: '0.9rem' }}>📝 Observações</p>
          <textarea
            id="pdv-notes"
            className="form-input"
            placeholder="Observações da venda..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Finalize */}
        <button
          id="pdv-finalize"
          className="btn btn-primary btn-lg"
          onClick={finalizeSale}
          disabled={!cart.length || loading || success}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {success ? '✅ Venda realizada!' : loading ? (
            <><svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg> Processando...</>
          ) : `Finalizar — ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
        </button>
      </div>
    </div>
  );
}
