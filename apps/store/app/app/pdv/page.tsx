'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '../context';

type Product  = { id: string; name: string; sku: string; sale_price: number; cost_price: number; stock_qty: number; warranty_months?: number; warranty_unit?: string; product_type?: string };
type Variant  = { id: string; product_id: string; name: string; sku: string | null; stock_qty: number; sale_price: number | null; cost_price: number | null };
type Customer = { id: string; name: string; phone: string; cpf_cnpj: string; loyalty_points?: number };
type CartItem = { product: Product; qty: number; unit_price: number; discount: number; is_gift: boolean; variantId?: string | null; variantName?: string | null };
type DiscountRule = { id: string; name: string; min_qty: number | null; min_amount: number | null; discount_pct: number; is_active: boolean };
type Sale     = { id: string; sale_number?: number; total: number; payment_method: string; created_at: string; status: string; customer?: { name: string } | null };

const PM = [
  { id: 'cash',         label: 'Dinheiro', icon: '💵' },
  { id: 'pix',          label: 'Pix',      icon: '📲' },
  { id: 'card',         label: 'Débito',   icon: '💳' },
  { id: 'credit',       label: 'Crédito',  icon: '💳' },
  { id: 'credit_store', label: 'Fiado',    icon: '📋' },
];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const saleLabel = (s: Sale) => s.sale_number ? `#${String(s.sale_number).padStart(4, '0')}` : `#${s.id.slice(0,6).toUpperCase()}`;

export default function PDVPage() {
  const supabase = createClient();
  const { tenantId, userId, storeName } = useTenant();
  const ref = useRef<HTMLInputElement>(null);

  const [products,    setProducts]    = useState<Product[]>([]);
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [query,       setQuery]       = useState('');
  const [filtered,    setFiltered]    = useState<Product[]>([]);
  const [customer,    setCustomer]    = useState<Customer | null>(null);
  const [cQuery,      setCQuery]      = useState('');
  const [cFiltered,   setCFiltered]   = useState<Customer[]>([]);
  const [globalDisc,  setGlobalDisc]  = useState(0);
  const [pm,          setPm]          = useState('cash');
  const [installments, setInstallments] = useState(1);
  const [cashReceived, setCashReceived] = useState(0);
  const [notes,       setNotes]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [doneSale,    setDoneSale]    = useState<Sale | null>(null);
  const [todaySales,  setTodaySales]  = useState<Sale[]>([]);
  const [tab,         setTab]         = useState<'pdv' | 'historico'>('pdv');

  // Modal de cadastro rápido de cliente
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickForm, setQuickForm]   = useState({ name: '', phone: '', cpf_cnpj: '' });
  const [savingCust, setSavingCust] = useState(false);

  // Modal de cancelamento
  const [cancelTarget, setCancelTarget] = useState<Sale | null>(null);
  const [cancelling,   setCancelling]   = useState(false);

  // Dados para comprovante e pós-venda
  const [doneSaleItems,   setDoneSaleItems]   = useState<CartItem[]>([]);
  const [warrantiesIssued, setWarrantiesIssued] = useState(0);
  const [pointsEarned,    setPointsEarned]    = useState(0);

  // Fase 8: variantes, desconto progressivo, fidelidade
  const [variantsMap,    setVariantsMap]    = useState<Record<string, Variant[]>>({});
  const [discountRules,  setDiscountRules]  = useState<DiscountRule[]>([]);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [usePoints,      setUsePoints]      = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const [p, c, s, v, dr] = await Promise.all([
        supabase.from('products').select('id,name,sku,sale_price,cost_price,stock_qty,warranty_months,warranty_unit,product_type').eq('tenant_id', tenantId).eq('is_active', true),
        supabase.from('customers').select('id,name,phone,cpf_cnpj,loyalty_points').eq('tenant_id', tenantId),
        supabase.from('sales')
          .select('id,sale_number,total,payment_method,created_at,status,customers(name)')
          .eq('tenant_id', tenantId)
          .gte('created_at', `${today}T00:00:00`)
          .in('status', ['completed'])
          .order('created_at', { ascending: false })
          .limit(30),
        supabase.from('product_variants').select('*').eq('tenant_id', tenantId).eq('is_active', true),
        supabase.from('discount_rules').select('*').eq('tenant_id', tenantId).eq('is_active', true),
      ]);
      setProducts(p.data || []);
      setCustomers(c.data || []);
      setTodaySales((s.data || []) as Sale[]);
      // Build variants map grouped by product_id
      const vmap: Record<string, Variant[]> = {};
      for (const variant of (v.data || [])) {
        (vmap[variant.product_id] ||= []).push(variant);
      }
      setVariantsMap(vmap);
      setDiscountRules(dr.data || []);
    }
    load();
  }, [tenantId]);

  useEffect(() => {
    if (!query.trim()) { setFiltered([]); return; }
    const q = query.toLowerCase();
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    ).slice(0, 8));
  }, [query, products]);

  useEffect(() => {
    if (!cQuery.trim()) { setCFiltered([]); return; }
    const q = cQuery.toLowerCase();
    setCFiltered(customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.cpf_cnpj?.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    ).slice(0, 5));
  }, [cQuery, customers]);

  function addToCart(p: Product, gift = false, variant?: Variant | null) {
    setCart(prev => {
      const key = variant ? `${p.id}::${variant.id}` : p.id;
      const ex = prev.find(i => {
        const iKey = i.variantId ? `${i.product.id}::${i.variantId}` : i.product.id;
        return iKey === key && !i.is_gift && !gift;
      });
      const price = gift ? 0 : (variant?.sale_price ?? p.sale_price);
      if (ex) return prev.map(i => {
        const iKey = i.variantId ? `${i.product.id}::${i.variantId}` : i.product.id;
        return iKey === key && !i.is_gift && !gift ? { ...i, qty: i.qty + 1 } : i;
      });
      return [...prev, { product: p, qty: 1, unit_price: price, discount: 0, is_gift: gift, variantId: variant?.id || null, variantName: variant?.name || null }];
    });
    setPendingProduct(null);
    setQuery(''); setFiltered([]); ref.current?.focus();
  }

  function handleProductSelect(p: Product, gift = false) {
    const pvariants = variantsMap[p.id] || [];
    if (!gift && pvariants.length > 0) {
      setPendingProduct(p);
    } else {
      addToCart(p, gift);
    }
  }

  function upd(i: number, f: 'qty' | 'discount' | 'unit_price', v: number) {
    setCart(prev => prev.map((item, idx) => idx === i ? { ...item, [f]: Math.max(0, v) } : item));
  }

  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.qty - i.discount, 0);

  // Auto-desconto progressivo
  const { autoDiscount, activeRuleName } = useMemo(() => {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const matching = discountRules.filter(r =>
      (r.min_amount != null && subtotal >= r.min_amount) ||
      (r.min_qty != null && totalQty >= r.min_qty)
    );
    if (!matching.length) return { autoDiscount: 0, activeRuleName: '' };
    const best = matching.reduce((a, b) => a.discount_pct >= b.discount_pct ? a : b);
    return { autoDiscount: subtotal * (best.discount_pct / 100), activeRuleName: best.name };
  }, [discountRules, subtotal, cart]);

  // Desconto por pontos (100 pts = R$1)
  const loyaltyAvailable = customer?.loyalty_points ?? 0;
  const loyaltyDiscount  = usePoints ? Math.min(loyaltyAvailable * 0.01, Math.max(0, subtotal - globalDisc - autoDiscount)) : 0;

  const total  = Math.max(0, subtotal - globalDisc - autoDiscount - loyaltyDiscount);
  const change = pm === 'cash' ? Math.max(0, cashReceived - total) : 0;

  async function quickAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!quickForm.name.trim()) return;
    setSavingCust(true);

    const payload: any = { tenant_id: tenantId, name: quickForm.name.trim(), phone: quickForm.phone || null, cpf_cnpj: quickForm.cpf_cnpj || null };
    let finalData: any = null;
    let attempts = 0;
    while (!finalData && attempts < 5) {
      attempts++;
      const res = await supabase.from('customers').insert(payload).select('id,name,phone,cpf_cnpj').single();
      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match?.[1]) { delete payload[match[1]]; continue; }
        alert('Erro: ' + res.error.message);
        setSavingCust(false);
        return;
      }
      finalData = res.data;
    }

    if (finalData) {
      setCustomers(prev => [...prev, finalData]);
      setCustomer(finalData);
      setCQuery('');
      setCFiltered([]);
      setShowQuickCustomer(false);
      setQuickForm({ name: '', phone: '', cpf_cnpj: '' });
    }
    setSavingCust(false);
  }

  async function finalize() {
    if (!cart.length || !tenantId) return;
    if (pm === 'credit_store' && !customer) { alert('Selecione um cliente para venda fiado.'); return; }
    setLoading(true);

    // Número sequencial de venda (thread-safe via RPC)
    const { data: saleNumData } = await supabase.rpc('get_next_sale_number', { p_tenant_id: tenantId });
    const saleNum = saleNumData as number | null;

    const salePayload: any = {
      tenant_id: tenantId,
      customer_id: customer?.id || null,
      seller_id: userId || null,
      subtotal,
      discount: globalDisc + autoDiscount + loyaltyDiscount,
      total,
      payment_method: pm,
      installments: pm === 'credit' ? installments : 1,
      status: 'completed',
      notes: notes || null,
      sale_number: saleNum,
    };

    let saleData: any = null;
    let attempts = 0;
    while (!saleData && attempts < 10) {
      attempts++;
      const res = await supabase.from('sales').insert(salePayload).select('*, customers(name)').single();
      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match?.[1]) { delete salePayload[match[1]]; continue; }
        alert('Erro ao finalizar: ' + res.error.message);
        setLoading(false);
        return;
      }
      saleData = res.data;
    }
    if (!saleData) { setLoading(false); return; }

    // Itens da venda
    await supabase.from('sale_items').insert(cart.map(i => ({
      sale_id:    saleData.id,
      product_id: i.product.id,
      qty:        i.qty,
      unit_price: i.unit_price,
      discount:   i.discount,
      is_gift:    i.is_gift,
      subtotal:   i.unit_price * i.qty - i.discount,
      variant_id: i.variantId || null,
    })));

    // Decrementa estoque (produto pai ou variante) — serviços não têm estoque
    for (const item of cart) {
      if (!item.is_gift && item.product.product_type !== 'service') {
        if (item.variantId) {
          await supabase.rpc('decrement_variant_stock', { p_variant_id: item.variantId, p_qty: item.qty });
        } else {
          await supabase.rpc('decrement_stock', { p_product_id: item.product.id, p_qty: item.qty });
        }
      }
    }

    // Lançamento no caixa
    await supabase.from('cash_transactions').insert({
      tenant_id:      tenantId,
      type:           'in',
      amount:         total,
      description:    `Venda ${saleLabel(saleData)}`,
      reference_id:   saleData.id,
      reference_type: 'sale',
      user_id:        userId || null,
    });

    // A receber (fiado)
    if (pm === 'credit_store' && customer) {
      const n = Math.max(1, installments);
      await supabase.from('accounts_receivable').insert(
        Array.from({ length: n }, (_, idx) => {
          const due = new Date();
          due.setMonth(due.getMonth() + idx + 1);
          return {
            tenant_id:          tenantId,
            sale_id:            saleData.id,
            customer_id:        customer.id,
            installment_number: idx + 1,
            amount:             total / n,
            due_date:           due.toISOString().split('T')[0],
            status:             'pending',
          };
        })
      );
    }

    // Emite garantias automaticamente para produtos com warranty_months > 0
    const warrantyItems = cart.filter(i => !i.is_gift && (i.product.warranty_months ?? 0) > 0);
    let issued = 0;
    if (customer && warrantyItems.length > 0) {
      for (const item of warrantyItems) {
        const code = `KDL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        const wPayload: any = {
          tenant_id: tenantId, sale_id: saleData.id, customer_id: customer.id,
          product_id: item.product.id, warranty_months: item.product.warranty_months!,
          warranty_unit: item.product.warranty_unit || 'months',
          issue_date: new Date().toISOString().split('T')[0], status: 'active', warranty_code: code,
        };
        let wOk = false; let wA = 0;
        while (!wOk && wA < 5) {
          wA++;
          const r = await supabase.from('warranties').insert(wPayload);
          if (r.error) { const c = r.error.message.match(/'([^']+)' column/)?.[1]; if (c) { delete wPayload[c]; continue; } break; }
          wOk = true; issued++;
        }
      }
    }

    // Pontos de fidelidade: resgate (se usou) + acúmulo
    let pts = 0;
    if (customer) {
      if (usePoints && loyaltyDiscount > 0) {
        const pointsUsed = Math.ceil(loyaltyDiscount * 100);
        await supabase.rpc('deduct_loyalty_points', { p_customer_id: customer.id, p_points: pointsUsed });
      }
      if (total > 0) {
        pts = Math.floor(total);
        await supabase.rpc('add_loyalty_points', { p_customer_id: customer.id, p_points: pts });
      }
    }

    // Atualiza estoque local — serviços ignorados
    setProducts(prev => prev.map(p => {
      if (p.product_type === 'service') return p;
      const cartItem = cart.find(i => i.product.id === p.id && !i.is_gift);
      return cartItem ? { ...p, stock_qty: Math.max(0, p.stock_qty - cartItem.qty) } : p;
    }));

    setDoneSaleItems([...cart]);
    setWarrantiesIssued(issued);
    setPointsEarned(pts);
    setTodaySales(prev => [saleData as Sale, ...prev]);
    setDoneSale(saleData as Sale);
    setLoading(false);
  }

  async function cancelSale(sale: Sale) {
    setCancelling(true);
    // Busca itens da venda para estornar estoque
    const { data: items } = await supabase.from('sale_items').select('product_id,qty,is_gift').eq('sale_id', sale.id);

    // Estorna estoque (busca valor atual + incrementa)
    if (items) {
      for (const item of items) {
        if (!item.is_gift) {
          const { data: prod } = await supabase.from('products').select('stock_qty').eq('id', item.product_id).single();
          if (prod) await supabase.from('products').update({ stock_qty: prod.stock_qty + item.qty }).eq('id', item.product_id);
        }
      }
      setProducts(prev => prev.map(p => {
        const item = items.find(i => i.product_id === p.id && !i.is_gift);
        return item ? { ...p, stock_qty: p.stock_qty + item.qty } : p;
      }));
    }

    await supabase.from('sales').update({ status: 'cancelled' }).eq('id', sale.id);
    await supabase.from('cash_transactions').delete().eq('reference_id', sale.id).eq('reference_type', 'sale');
    await supabase.from('accounts_receivable').delete().eq('sale_id', sale.id);

    setTodaySales(prev => prev.filter(s => s.id !== sale.id));
    setCancelTarget(null);
    setCancelling(false);
  }

  function newSale() {
    setCart([]); setCustomer(null); setGlobalDisc(0); setPm('cash');
    setInstallments(1); setCashReceived(0); setNotes(''); setDoneSale(null);
    setUsePoints(false); setPendingProduct(null);
    setTab('pdv'); setTimeout(() => ref.current?.focus(), 100);
  }

  function printReceipt() {
    if (!doneSale) return;
    const date = new Date(doneSale.created_at).toLocaleString('pt-BR');
    const lines = doneSaleItems.map(i =>
      `${i.product.name.slice(0, 24).padEnd(24)} ${String(i.qty).padStart(2)}x ${fmt(i.unit_price).padStart(10)} ${i.is_gift ? '  BRINDE' : fmt(i.unit_price * i.qty - i.discount).padStart(10)}`
    ).join('\n');
    const wLines = doneSaleItems
      .filter(i => !i.is_gift && (i.product.warranty_months ?? 0) > 0)
      .map(i => { const u = i.product.warranty_unit || 'months'; const s = u === 'days' ? 'd' : u === 'years' ? 'a' : 'm'; return `  ${i.product.name.slice(0, 28)} — ${i.product.warranty_months}${s}`; })
      .join('\n');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comprovante ${saleLabel(doneSale)}</title>
    <style>body{font-family:'Courier New',monospace;width:80mm;padding:12px;font-size:12px;color:#000}
    .c{text-align:center}.b{font-weight:bold}.d{border-top:1px dashed #000;margin:6px 0}
    .r{display:flex;justify-content:space-between}pre{font-family:inherit;font-size:11px;white-space:pre-wrap;margin:4px 0}</style>
    </head><body>
    <div class="c b" style="font-size:15px">${storeName}</div>
    <div class="c" style="font-size:10px">COMPROVANTE DE VENDA</div>
    <div class="d"></div>
    <div class="r"><span>Nº</span><span>${saleLabel(doneSale)}</span></div>
    <div class="r"><span>Data</span><span>${date}</span></div>
    ${customer ? `<div class="r"><span>Cliente</span><span>${customer.name}</span></div>` : ''}
    <div class="d"></div>
    <pre>${lines}</pre>
    <div class="d"></div>
    <div class="r"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    ${globalDisc > 0 ? `<div class="r"><span>Desconto</span><span>- ${fmt(globalDisc)}</span></div>` : ''}
    <div class="r b"><span>TOTAL</span><span>${fmt(doneSale.total)}</span></div>
    <div class="r"><span>Pagamento</span><span>${PM.find(m => m.id === pm)?.label || pm}</span></div>
    ${pm === 'cash' && change > 0 ? `<div class="r"><span>Troco</span><span>${fmt(change)}</span></div>` : ''}
    ${wLines ? `<div class="d"></div><div class="b" style="font-size:11px">GARANTIAS EMITIDAS</div><pre style="font-size:10px">${wLines}</pre>` : ''}
    <div class="d"></div>
    <div class="c" style="font-size:10px">Obrigado pela preferência!</div>
    </body></html>`;
    const w = window.open('', '_blank', 'width=420,height=640');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  }

  if (doneSale) return (
    <div className="animate-fade-in" style={{ maxWidth: 520, margin: '4rem auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Venda realizada!</h2>
        <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '0.25rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>
          {saleLabel(doneSale)}
        </p>
        <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#00D4AA', marginBottom: '0.5rem' }}>
          {fmt(doneSale.total)}
        </p>
        {pm === 'cash' && change > 0 && (
          <div className="alert alert-success" style={{ marginBottom: '0.75rem', justifyContent: 'center' }}>
            💵 Troco: <strong>{fmt(change)}</strong>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {warrantiesIssued > 0 && (
            <span className="badge badge-success">🛡️ {warrantiesIssued} garantia{warrantiesIssued > 1 ? 's' : ''} emitida{warrantiesIssued > 1 ? 's' : ''}</span>
          )}
          {pointsEarned > 0 && customer && (
            <span className="badge badge-info">⭐ +{pointsEarned} pontos KDL</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} onClick={newSale}>
            🛒 Nova Venda
          </button>
          <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={printReceipt}>
            🖨️ Imprimir Comprovante
          </button>
          {customer?.phone && (
            <a
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
              href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(customer.name)}%2C%20obrigado%20pela%20compra!%20Venda%20${encodeURIComponent(saleLabel(doneSale))}%20-%20Total%3A%20${encodeURIComponent(fmt(doneSale.total))}`}
              target="_blank"
              rel="noreferrer"
            >📲 Enviar comprovante WhatsApp</a>
          )}
          {customer && (
            <a
              className="btn btn-ghost"
              style={{ justifyContent: 'center' }}
              href={`/app/os?sale_id=${doneSale.id}&sale_label=${encodeURIComponent(saleLabel(doneSale))}&customer=${encodeURIComponent(customer.name)}`}
            >🔧 Criar OS de Instalação</a>
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

      {/* Histórico do dia */}
      {tab === 'historico' ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Forma</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {!todaySales.length
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhuma venda hoje ainda.</td></tr>
                : todaySales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--kdl-primary-light)' }}>{saleLabel(s)}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>
                      {new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{(s.customer as any)?.name || '—'}</td>
                    <td><span className="badge badge-info">{PM.find(p => p.id === s.payment_method)?.label || s.payment_method}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#00D4AA' }}>{fmt(s.total)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Cancelar esta venda"
                        onClick={() => setCancelTarget(s)}
                      >✕ Cancelar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {todaySales.length > 0 && (
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--kdl-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--kdl-text-muted)' }}>{todaySales.length} vendas hoje</span>
              <span style={{ fontWeight: 700, color: '#00D4AA' }}>
                Total: {fmt(todaySales.reduce((s, v) => s + Number(v.total), 0))}
              </span>
            </div>
          )}
        </div>
      ) : (
        // PDV principal
        <div style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
          {/* Coluna esquerda: busca + carrinho */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={ref}
                id="pdv-search"
                type="text"
                className="form-input"
                placeholder="🔍 Buscar produto por nome ou código..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
                onKeyDown={e => { if (e.key === 'Enter' && filtered.length > 0) addToCart(filtered[0]); }}
              />
              {filtered.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)', borderRadius: 10, marginTop: 4, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                  {filtered.map(p => {
                    const pvars = variantsMap[p.id] || [];
                    return (
                    <div
                      key={p.id}
                      onClick={() => handleProductSelect(p)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--kdl-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--kdl-surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>
                          {p.sku && `SKU: ${p.sku} · `}
                          {pvars.length > 0 ? `🎨 ${pvars.length} variações` : `Estoque: ${p.stock_qty}`}
                          {(p.warranty_months ?? 0) > 0 && ` · 🛡️ ${p.warranty_months}${p.warranty_unit === 'days' ? 'd' : p.warranty_unit === 'years' ? 'a' : 'm'}`}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: '#00D4AA' }}>{fmt(p.sale_price)}</p>
                        <button
                          onClick={e => { e.stopPropagation(); addToCart(p, true); }}
                          style={{ fontSize: '0.65rem', color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                        >+ Brinde</button>
                      </div>
                    </div>
                  );})}
                </div>
              )}
            </div>

            {/* Carrinho */}
            <div className="card" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--kdl-border)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Carrinho ({cart.length})</span>
                {cart.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setCart([])}>Limpar</button>}
              </div>
              {!cart.length
                ? <div className="empty-state" style={{ padding: '2rem' }}><span style={{ fontSize: '2.5rem' }}>🛒</span><p>Busque um produto para adicionar</p></div>
                : (
                  <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 52px)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--kdl-surface-2)' }}>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Produto</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Qtd</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Preço</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Desc.</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--kdl-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total</th>
                          <th style={{ width: 36 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, i) => {
                          const tot = item.unit_price * item.qty - item.discount;
                          return (
                            <tr key={i} style={{ borderTop: '1px solid var(--kdl-border)' }}>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.product.name}</p>
                                {item.variantName && <p style={{ fontSize: '0.72rem', color: 'var(--kdl-primary-light)' }}>🎨 {item.variantName}</p>}
                                {item.is_gift && <span className="badge badge-warning" style={{ marginTop: 2 }}>🎁 Brinde</span>}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                <input type="number" min={1} value={item.qty} onChange={e => upd(i, 'qty', Number(e.target.value))} style={{ width: 52, textAlign: 'center', padding: '0.25rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: 'var(--kdl-text)', fontSize: '0.85rem' }} />
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                <input type="number" min={0} step={0.01} value={item.unit_price} onChange={e => upd(i, 'unit_price', Number(e.target.value))} disabled={item.is_gift} style={{ width: 80, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: 'var(--kdl-text)', fontSize: '0.85rem' }} />
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                <input type="number" min={0} step={0.01} value={item.discount} onChange={e => upd(i, 'discount', Number(e.target.value))} style={{ width: 70, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: '#F59E0B', fontSize: '0.85rem' }} />
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: item.is_gift ? '#F59E0B' : '#00D4AA' }}>
                                {item.is_gift ? 'BRINDE' : fmt(tot)}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                <button onClick={() => setCart(prev => prev.filter((_, x) => x !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kdl-danger)', fontSize: '1rem' }}>✕</button>
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

          {/* Coluna direita: cliente + resumo + pagamento */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexShrink: 0 }}>
            {/* Cliente */}
            <div className="card">
              <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem', fontSize: '0.9rem' }}>👤 Cliente</p>
              {customer ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{customer.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{customer.phone}</p>
                    {loyaltyAvailable > 0 && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer', fontSize: '0.78rem' }}>
                        <input type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} />
                        <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                          ⭐ {loyaltyAvailable} pts {usePoints ? `(−${fmt(loyaltyDiscount)})` : `= ${fmt(loyaltyAvailable * 0.01)} disponíveis`}
                        </span>
                      </label>
                    )}
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
                    value={cQuery}
                    onChange={e => setCQuery(e.target.value)}
                  />
                  {cQuery.length > 0 && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 50, marginTop: 4, background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
                      {cFiltered.map(c => (
                        <div
                          key={c.id}
                          onClick={() => { setCustomer(c); setCQuery(''); setCFiltered([]); }}
                          style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', borderBottom: '1px solid var(--kdl-border)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--kdl-surface-2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{c.phone}</p>
                        </div>
                      ))}
                      <div
                        onClick={() => { setShowQuickCustomer(true); setQuickForm({ name: cQuery, phone: '', cpf_cnpj: '' }); }}
                        style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', color: 'var(--kdl-primary-light)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--kdl-surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        + Cadastrar &quot;{cQuery}&quot; agora
                      </div>
                    </div>
                  )}
                  <p style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>Obrigatório para venda fiado</p>
                </div>
              )}
            </div>

            {/* Resumo */}
            <div className="card">
              <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.875rem', fontSize: '0.9rem' }}>💰 Resumo</p>
              {activeRuleName && (
                <div className="alert alert-success" style={{ marginBottom: '0.75rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                  🏷️ <strong>{activeRuleName}</strong> — −{fmt(autoDiscount)}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--kdl-text-muted)' }}>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--kdl-text-muted)' }}>Desc. manual (R$)</span>
                  <input
                    id="pdv-global-discount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={globalDisc}
                    onChange={e => setGlobalDisc(Number(e.target.value))}
                    style={{ width: 90, textAlign: 'right', padding: '0.25rem 0.5rem', background: 'var(--kdl-surface-2)', border: '1px solid var(--kdl-border)', borderRadius: 6, color: '#F59E0B', fontSize: '0.85rem' }}
                  />
                </div>
                {autoDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#10B981' }}>
                    <span>🏷️ Desc. automático</span><span>−{fmt(autoDiscount)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#F59E0B' }}>
                    <span>⭐ Pontos KDL</span><span>−{fmt(loyaltyDiscount)}</span>
                  </div>
                )}
                <div style={{ height: 1, background: 'var(--kdl-border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
                  <span>Total</span><span style={{ color: '#00D4AA' }}>{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="card">
              <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.875rem', fontSize: '0.9rem' }}>💳 Pagamento</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PM.map(m => (
                  <label
                    key={m.id}
                    id={`pdv-pay-${m.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 0.75rem', borderRadius: 8, cursor: 'pointer', border: '1px solid', borderColor: pm === m.id ? 'var(--kdl-primary)' : 'var(--kdl-border)', background: pm === m.id ? 'rgba(108,71,255,0.08)' : 'transparent', fontSize: '0.875rem' }}
                  >
                    <input type="radio" name="payment" value={m.id} checked={pm === m.id} onChange={() => setPm(m.id)} style={{ display: 'none' }} />
                    {m.icon} {m.label}
                  </label>
                ))}
              </div>
              {pm === 'cash' && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="form-group">
                    <label className="form-label">Valor Recebido (R$)</label>
                    <input type="number" min={0} step={0.01} className="form-input" value={cashReceived} onChange={e => setCashReceived(Number(e.target.value))} />
                  </div>
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
              {pm === 'credit_store' && (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">Parcelas (fiado)</label>
                  <select className="form-select" value={installments} onChange={e => setInstallments(Number(e.target.value))}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}x de {fmt(total / n)}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Observações</label>
                <input type="text" className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações sobre a venda..." />
              </div>
            </div>

            <button
              id="pdv-finalize"
              className="btn btn-primary btn-lg"
              onClick={finalize}
              disabled={!cart.length || loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading
                ? <><svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg> Processando...</>
                : `Finalizar — ${fmt(total)}`}
            </button>
          </div>
        </div>
      )}

      {/* Modal de cadastro rápido de cliente */}
      {showQuickCustomer && (
        <div className="modal-overlay" onClick={() => setShowQuickCustomer(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem', fontSize: '1.1rem' }}>👤 Cadastro Rápido de Cliente</h2>
            <form onSubmit={quickAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input type="text" className="form-input" value={quickForm.name} onChange={e => setQuickForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input type="tel" className="form-input" value={quickForm.phone} onChange={e => setQuickForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 9 9999-9999" />
              </div>
              <div className="form-group">
                <label className="form-label">CPF (opcional)</label>
                <input type="text" className="form-input" value={quickForm.cpf_cnpj} onChange={e => setQuickForm(f => ({ ...f, cpf_cnpj: e.target.value }))} placeholder="000.000.000-00" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickCustomer(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingCust}>
                  {savingCust ? 'Cadastrando...' : 'Cadastrar e Usar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de seleção de variante (grade) */}
      {pendingProduct && (
        <div className="modal-overlay" onClick={() => setPendingProduct(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem', fontSize: '1.1rem' }}>🎨 Selecionar Variação</h2>
            <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>{pendingProduct.name}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
              {(variantsMap[pendingProduct.id] || []).map(v => (
                <button
                  key={v.id}
                  className="btn btn-secondary"
                  style={{ flexDirection: 'column', alignItems: 'center', padding: '0.875rem 0.5rem', height: 'auto', opacity: v.stock_qty === 0 ? 0.4 : 1 }}
                  disabled={v.stock_qty === 0}
                  onClick={() => addToCart(pendingProduct, false, v)}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)', marginTop: 4 }}>
                    {v.stock_qty > 0 ? `Estoque: ${v.stock_qty}` : 'Sem estoque'}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00D4AA', marginTop: 4 }}>
                    {fmt(v.sale_price ?? pendingProduct.sale_price)}
                  </span>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} onClick={() => setPendingProduct(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal de cancelamento de venda */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cancelar Venda {saleLabel(cancelTarget)}?</h2>
              <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>
                O estoque será estornado e o lançamento financeiro removido. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--kdl-surface-2)', borderRadius: 8, marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: '1.25rem', color: '#EF4444' }}>{fmt(cancelTarget.total)}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>
                {new Date(cancelTarget.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setCancelTarget(null)}>Manter venda</button>
              <button
                className="btn btn-danger"
                onClick={() => cancelSale(cancelTarget)}
                disabled={cancelling}
              >{cancelling ? 'Cancelando...' : '✕ Confirmar Cancelamento'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
