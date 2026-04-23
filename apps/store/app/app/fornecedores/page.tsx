'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '../context';

type Supplier = { id: string; name: string; contact_name: string; phone: string; whatsapp: string; email: string; payment_terms: string; notes: string };
type Product = { id: string; name: string; stock_qty: number; min_stock: number; supplier_id: string | null; cost_price: number };
type OrderItem = { product_id: string; name: string; qty: number; cost: number };

export default function FornecedoresPage() {
  const supabase = createClient();
  const { tenantId, userId } = useTenant();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderSupplier, setOrderSupplier] = useState<Supplier | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ product_id: '', name: '', qty: 1, cost: 0 }]);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', whatsapp: '', email: '', payment_terms: '', notes: '' });

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const [s, p, o] = await Promise.all([
        supabase.from('suppliers').select('*').eq('tenant_id', tenantId).order('name'),
        supabase.from('products').select('id,name,stock_qty,min_stock,supplier_id,cost_price').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
        supabase.from('supplier_orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(50),
      ]);
      setSuppliers(s.data || []);
      setProducts(p.data || []);
      setOrders(o.data || []);
      setLoading(false);
    }
    load();
  }, [tenantId]);

  function openNew() { setEditing(null); setForm({ name: '', contact_name: '', phone: '', whatsapp: '', email: '', payment_terms: '', notes: '' }); setShowModal(true); }
  function openEdit(s: Supplier) { setEditing(s); setForm({ name: s.name, contact_name: s.contact_name || '', phone: s.phone || '', whatsapp: s.whatsapp || '', email: s.email || '', payment_terms: s.payment_terms || '', notes: s.notes || '' }); setShowModal(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    let payload: any = { ...form };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

    let success = false;
    let finalData = null;
    let attempts = 0;

    while (!success && attempts < 10) {
      attempts++;
      const res = editing
        ? await supabase.from('suppliers').update(payload).eq('id', editing.id).select().single()
        : await supabase.from('suppliers').insert({ ...payload, tenant_id: tenantId }).select().single();

      if (res.error) {
        // Auto-heal: if column is missing, remove it from payload and retry
        const match = res.error.message.match(/'([^']+)' column/);
        if (match && match[1]) {
          delete payload[match[1]];
          continue; // Retry without the missing column
        } else {
          alert('Erro ao salvar: ' + res.error.message);
          setSaving(false);
          return;
        }
      }
      
      success = true;
      finalData = res.data;
    }

    if (finalData) {
      if (editing) setSuppliers(prev => prev.map(s => s.id === finalData.id ? finalData : s));
      else setSuppliers(prev => [...prev, finalData].sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setShowModal(false);
    }
    setSaving(false);
  }

  function openOrder(s: Supplier) {
    setOrderSupplier(s);
    const supplierProducts = products.filter(p => p.supplier_id === s.id);
    const lowStock = supplierProducts.filter(p => p.stock_qty <= p.min_stock).map(p => ({ product_id: p.id, name: p.name, qty: Math.max(1, p.min_stock - p.stock_qty + 5), cost: p.cost_price }));
    setOrderItems(lowStock.length ? lowStock : [{ product_id: '', name: '', qty: 1, cost: 0 }]);
    setOrderNotes('');
    setOrderDate('');
  }

  async function saveOrder() {
    if (!orderSupplier) return;
    const items = orderItems.filter(i => i.name.trim());
    if (!items.length) { alert('Adicione ao menos um item ao pedido'); return; }
    setSaving(true);

    // Colunas que removemos progressivamente no auto-heal para bulk insert
    const removedCols = new Set<string>();

    const buildPayload = () => items.map(item => {
      const row: any = {
        tenant_id:           tenantId,
        supplier_id:         orderSupplier.id,
        product_description: item.name,
        qty:                 item.qty,
        notes:               JSON.stringify({ notes: orderNotes, cost: item.cost, date: orderDate }),
        status:              'requested',
      };
      if (!removedCols.has('product_id')) row.product_id = item.product_id || null;
      if (!removedCols.has('user_id'))    row.user_id    = userId || null;
      return row;
    });

    let success = false;
    let attempts = 0;
    while (!success && attempts < 10) {
      attempts++;
      const res = await supabase.from('supplier_orders').insert(buildPayload()).select();
      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match?.[1]) { removedCols.add(match[1]); continue; }
        alert('Erro ao criar pedido: ' + res.error.message);
        setSaving(false);
        return;
      }
      if (res.data) {
        setOrders(prev => [...res.data, ...prev]);
        success = true;
      }
    }

    setSaving(false);
    setOrderSupplier(null);
    setOrderItems([{ product_id: '', name: '', qty: 1, cost: 0 }]);
    setOrderNotes('');
    setOrderDate('');
  }

  async function markReceived(order: any) {
    if (!confirm('Marcar este item do pedido como recebido? (Isso não altera o estoque automaticamente, use a tela de Estoque para dar a Entrada oficial e gerar o financeiro)')) return;
    await supabase.from('supplier_orders').update({ status: 'received' }).eq('id', order.id);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'received' } : o));
  }

  function buildWhatsAppMsg(s: Supplier, o: any) {
    const msg = `Olá${s.contact_name ? ` ${s.contact_name}` : ''}! Segue pedido #${o.id.slice(0,6)}:\n\n${o.product_description}\n\nQtd: ${o.qty} un${o.notes ? `\nObs: ${o.notes}` : ''}`;
    return `https://wa.me/55${(s.whatsapp || s.phone).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  }

  const filtered = suppliers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.contact_name?.toLowerCase().includes(search.toLowerCase()));
  const supplierOrders = selectedSupplier ? orders.filter(o => o.supplier_id === selectedSupplier.id) : [];
  const statusMap: Record<string, string> = { requested: '⏳ Aguardando', received: '✅ Recebido', partial: '📦 Parcial', cancelled: '❌ Cancelado' };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
        {/* Lista */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>🔗 Fornecedores</h1>
              <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{suppliers.length} cadastrados</p>
            </div>
            <button id="forn-novo-btn" className="btn btn-primary" onClick={openNew}>+ Novo</button>
          </div>
          <input id="forn-search" type="text" className="form-input" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '1rem' }} />
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading ? <p style={{ color: 'var(--kdl-text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando...</p>
              : !filtered.length ? <div className="empty-state"><span style={{ fontSize: '2.5rem' }}>🔗</span><p>Nenhum fornecedor cadastrado.</p><button className="btn btn-primary" onClick={openNew}>Cadastrar primeiro</button></div>
              : filtered.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s === selectedSupplier ? null : s)} style={{ padding: '1rem', borderRadius: 10, border: '1px solid', borderColor: selectedSupplier?.id === s.id ? 'var(--kdl-primary)' : 'var(--kdl-border)', background: selectedSupplier?.id === s.id ? 'rgba(108,71,255,0.06)' : 'var(--kdl-surface)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.name}</p>
                      {s.contact_name && <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>📞 {s.contact_name}</p>}
                      {s.phone && <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{s.phone}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(s.whatsapp || s.phone) && <a href={`https://wa.me/55${(s.whatsapp || s.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>📲</a>}
                      {s.phone && <a href={`tel:${s.phone}`} className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>📞</a>}
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openEdit(s); }}>✏️</button>
                      <button id={`forn-order-${s.id.slice(0,6)}`} className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); openOrder(s); }}>📦 Pedir</button>
                    </div>
                  </div>
                  {s.payment_terms && <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-dim)', marginTop: 4 }}>💳 {s.payment_terms} · ⏱ {s.avg_delivery_days}d</p>}
                </div>
              ))}
          </div>
        </div>

        {/* Histórico de pedidos */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexShrink: 0 }}>
          {!selectedSupplier
            ? <div className="card empty-state" style={{ flex: 1 }}><span style={{ fontSize: '2.5rem' }}>👆</span><p>Selecione um fornecedor</p></div>
            : <>
              <div className="card">
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '0.5rem' }}>{selectedSupplier.name}</h3>
                {selectedSupplier.notes && <div className="alert alert-info" style={{ fontSize: '0.8rem', marginTop: 8 }}>📝 {selectedSupplier.notes}</div>}
              </div>
              <div className="card">
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', marginBottom: '1rem' }}>Histórico de Pedidos</h3>
                {!supplierOrders.length ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Nenhum pedido registrado.</p>
                  : supplierOrders.map(o => {
                    let cost = 0, date = '';
                    try { const n = JSON.parse(o.notes); cost = n.cost; date = n.date; } catch(e) { /* legacy */ }
                    return (
                    <div key={o.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>#{o.id.slice(0,6)} - {o.product_description}</p>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: o.status === 'received' ? '#10B981' : o.status === 'cancelled' ? '#EF4444' : '#F59E0B' }}>{statusMap[o.status] || o.status}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-muted)', marginBottom: '0.5rem' }}>{o.qty} un {cost > 0 && `· Estimado: R$ ${(cost * o.qty).toFixed(2)} `}{date && `· Prev: ${new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}`} · Criado em {new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                        {(selectedSupplier?.whatsapp || selectedSupplier?.phone) && (
                          <a href={buildWhatsAppMsg(selectedSupplier!, o)} target="_blank" rel="noreferrer" className="btn btn-success btn-sm" title="Enviar pedido pelo WhatsApp">📲 Enviar Zap</a>
                        )}
                        {o.status === 'requested' && <button className="btn btn-primary btn-sm" onClick={() => markReceived(o)} title="Receber item">📦 Receber</button>}
                      </div>
                    </div>
                  )})}
              </div>
            </>}
        </div>
      </div>

      {/* Modal fornecedor */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
            <form onSubmit={save} id="forn-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label" htmlFor="forn-name">Nome da Empresa *</label><input id="forn-name" type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-contact">Contato</label><input id="forn-contact" type="text" className="form-input" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-phone">Telefone</label><input id="forn-phone" type="text" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-wa">WhatsApp</label><input id="forn-wa" type="text" className="form-input" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-email">Email</label><input id="forn-email" type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-terms">Condições de Pagamento</label><input id="forn-terms" type="text" className="form-input" value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} placeholder="Ex: 30/60 dias" /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label" htmlFor="forn-notes">Observações</label><textarea id="forn-notes" className="form-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} placeholder="Ex: Entrega a pronta entrega na região central" /></div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="forn-save" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pedido */}
      {orderSupplier && (
        <div className="modal-overlay" onClick={() => setOrderSupplier(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>📦 Pedido para {orderSupplier.name}</h2>
            <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Os itens abaixo do estoque mínimo (vinculados a este fornecedor) já foram pré-selecionados.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {orderItems.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }}>
                  <select className="form-select" value={item.product_id} onChange={e => {
                    const pid = e.target.value;
                    if (!pid) return setOrderItems(prev => prev.map((x, j) => j === i ? { ...x, product_id: '', name: '', cost: 0 } : x));
                    const prod = products.find(p => p.id === pid);
                    setOrderItems(prev => prev.map((x, j) => j === i ? { ...x, product_id: pid, name: prod!.name, cost: prod!.cost_price } : x));
                  }}>
                    <option value="">Produto (Livre)</option>
                    {products.filter(p => p.supplier_id === orderSupplier.id || p.supplier_id === null).map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock_qty})</option>
                    ))}
                  </select>
                  <input type="text" className="form-input" placeholder="Ou digite o nome" value={item.name} onChange={e => setOrderItems(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ display: item.product_id ? 'none' : 'block' }} />
                  <input type="number" min={1} className="form-input" style={{ width: 80 }} placeholder="Qtd" value={item.qty} onChange={e => setOrderItems(prev => prev.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x))} />
                  <input type="number" min={0} step={0.01} className="form-input" style={{ width: 100 }} placeholder="Custo/un" value={item.cost} onChange={e => setOrderItems(prev => prev.map((x, j) => j === i ? { ...x, cost: Number(e.target.value) } : x))} />
                  <button className="btn btn-ghost btn-sm" onClick={() => setOrderItems(prev => prev.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={() => setOrderItems(prev => [...prev, { product_id: '', name: '', qty: 1, cost: 0 }])} style={{ alignSelf: 'flex-start' }}>+ Adicionar item</button>
            </div>
            
            <div style={{ background: 'var(--kdl-surface-2)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Custo Total Previsto</p>
                <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.75rem' }}>Estimativa baseada no custo unitário</p>
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--kdl-primary)' }}>{orderItems.reduce((sum, item) => sum + (item.qty * item.cost), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group"><label className="form-label" htmlFor="order-date">Data Prevista de Recebimento</label><input id="order-date" type="date" className="form-input" value={orderDate} onChange={e => setOrderDate(e.target.value)} /></div>
              <div className="form-group"><label className="form-label" htmlFor="order-notes">Observações</label><textarea id="order-notes" className="form-input" rows={1} value={orderNotes} onChange={e => setOrderNotes(e.target.value)} style={{ resize: 'vertical' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setOrderSupplier(null)}>Cancelar</button>
              <button id="order-save" type="button" className="btn btn-primary" onClick={saveOrder} disabled={saving}>{saving ? 'Salvando...' : '✅ Registrar Pedido'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
