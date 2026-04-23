'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '../context';

type Product = {
  id: string; name: string; sku: string; category_id: string; supplier_id: string | null;
  cost_price: number; sale_price: number; stock_qty: number;
  min_stock: number; unit: string; is_active: boolean; warranty_months: number;
};
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export default function EstoquePage() {
  const supabase = createClient();
  const { tenantId, userId } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Modals de Movimentação
  const [showMovModal, setShowMovModal] = useState<Product | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [movType, setMovType] = useState<'adjustment' | 'loss'>('adjustment');
  const [movQty, setMovQty] = useState(1);
  const [movReason, setMovReason] = useState('');
  
  // Estado de Entrada (Entry)
  const [entrySupplier, setEntrySupplier] = useState('');
  const [entryReference, setEntryReference] = useState('');
  const [entryItems, setEntryItems] = useState<{ product_id: string; qty: number; cost: number }[]>([]);
  const [entryCreatePayable, setEntryCreatePayable] = useState(false);

  // States for Categories
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const [form, setForm] = useState({
    name: '', sku: '', category_id: '', supplier_id: '', cost_price: 0, sale_price: 0,
    stock_qty: 0, min_stock: 0, unit: 'un', warranty_months: 0,
  });

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const [p, c, s] = await Promise.all([
        supabase.from('products').select('*').eq('tenant_id', tenantId).order('name'),
        supabase.from('categories').select('*').eq('tenant_id', tenantId).order('name'),
        supabase.from('suppliers').select('id,name').eq('tenant_id', tenantId).order('name'),
      ]);
      setProducts(p.data || []);
      setCategories(c.data || []);
      setSuppliers(s.data || []);
      setLoading(false);
    }
    load();
  }, [tenantId]);

  function openNew() {
    setEditing(null);
    setForm({ name: '', sku: '', category_id: '', supplier_id: '', cost_price: 0, sale_price: 0, stock_qty: 0, min_stock: 0, unit: 'un', warranty_months: 0 });
    setShowModal(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku || '', category_id: p.category_id || '', supplier_id: p.supplier_id || '', cost_price: p.cost_price, sale_price: p.sale_price, stock_qty: p.stock_qty, min_stock: p.min_stock, unit: p.unit, warranty_months: p.warranty_months || 0 });
    setShowModal(true);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    let payload: any = { ...form, category_id: form.category_id || null };
    
    let success = false;
    let finalData = null;
    let attempts = 0;

    while (!success && attempts < 10) {
      attempts++;
      const res = editing
        ? await supabase.from('products').update(payload).eq('id', editing.id).select().single()
        : await supabase.from('products').insert({ ...payload, tenant_id: tenantId, is_active: true }).select().single();

      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match && match[1]) {
          delete payload[match[1]];
          continue;
        } else {
          alert('Erro ao salvar produto: ' + res.error.message);
          setSaving(false);
          return;
        }
      }
      success = true;
      finalData = res.data;
    }

    if (finalData) {
      if (editing) setProducts(prev => prev.map(p => p.id === finalData.id ? finalData : p));
      else setProducts(prev => [...prev, finalData]);
      setShowModal(false);
    }
    setSaving(false);
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    const { data } = await supabase.from('categories').insert({ name: newCatName.trim(), tenant_id: tenantId }).select().single();
    if (data) {
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(f => ({ ...f, category_id: data.id }));
    }
    setSavingCat(false);
    setShowCatModal(false);
    setNewCatName('');
  }

  async function saveMovement() {
    if (!showMovModal) return;
    if (!movReason.trim()) { alert('Motivo é obrigatório'); return; }
    setSaving(true);

    let success = false;
    let attempts = 0;
    const payload: any = {
      tenant_id: tenantId, product_id: showMovModal.id, type: movType,
      qty: movType === 'loss' ? -Math.abs(movQty) : movQty,
      reason: movReason, user_id: userId || null,
    };
    if (movType === 'adjustment') payload.qty = movQty - showMovModal.stock_qty;

    while (!success && attempts < 5) {
      attempts++;
      const res = await supabase.from('stock_movements').insert(payload);
      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match && match[1]) { delete payload[match[1]]; continue; }
        alert('Erro: ' + res.error.message); setSaving(false); return;
      }
      success = true;
    }

    // Update stock
    const newQty = movType === 'adjustment' ? movQty : showMovModal.stock_qty - Math.abs(movQty);
    await supabase.from('products').update({ stock_qty: Math.max(0, newQty) }).eq('id', showMovModal.id);
    setProducts(prev => prev.map(p => p.id === showMovModal.id ? { ...p, stock_qty: Math.max(0, newQty) } : p));
    setSaving(false); setShowMovModal(null); setMovQty(1); setMovReason('');
  }

  async function saveEntry() {
    if (!entryItems.length) { alert('Adicione pelo menos um produto'); return; }
    if (entryItems.some(i => !i.product_id || i.qty <= 0)) { alert('Preencha os produtos corretamente'); return; }
    setSaving(true);

    const movements = entryItems.map(item => ({
      tenant_id: tenantId, product_id: item.product_id, type: 'entry',
      qty: item.qty, unit_cost: item.cost, supplier_id: entrySupplier || null,
      reference: entryReference, reason: 'Entrada de mercadoria', user_id: userId || null,
    }));
    
    // Auto-heal array
    let currentMovs = [...movements];
    let success = false; let attempts = 0;
    while (!success && attempts < 5) {
      attempts++;
      const res = await supabase.from('stock_movements').insert(currentMovs);
      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match && match[1]) { currentMovs = currentMovs.map(m => { const nm = {...m}; delete (nm as any)[match[1]]; return nm; }); continue; }
        alert('Erro: ' + res.error.message); setSaving(false); return;
      }
      success = true;
    }

    // Update products stock & optionally update cost
    await Promise.all(entryItems.map(async (item) => {
      const prod = products.find(p => p.id === item.product_id);
      if (!prod) return;
      const payload: any = { stock_qty: prod.stock_qty + item.qty };
      if (item.cost !== prod.cost_price && item.cost > 0) payload.cost_price = item.cost;
      await supabase.from('products').update(payload).eq('id', prod.id);
    }));

    // Generate accounts payable if requested
    if (entryCreatePayable) {
      const totalValue = entryItems.reduce((sum, item) => sum + (item.qty * item.cost), 0);
      const supplierName = suppliers.find(s => s.id === entrySupplier)?.name || 'Fornecedor';
      await supabase.from('accounts_payable').insert({
        tenant_id: tenantId, description: `Compra de Mercadoria - ${supplierName}${entryReference ? ` (Ref: ${entryReference})` : ''}`,
        category: 'supplier', amount: totalValue, due_date: new Date().toISOString().split('T')[0], status: 'pending'
      });
    }

    // Refresh products list to get new stocks
    const p = await supabase.from('products').select('*').eq('tenant_id', tenantId).order('name');
    if (p.data) setProducts(p.data);
    
    setSaving(false); setShowEntryModal(false);
    setEntrySupplier(''); setEntryReference(''); setEntryItems([]); setEntryCreatePayable(false);
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!search || p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
      && (!filterCat || p.category_id === filterCat);
  });

  const margin = (p: Product) => p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price * 100).toFixed(1) : '0';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>📦 Estoque</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{products.length} produtos cadastrados</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => {
            setEntrySupplier(''); setEntryReference(''); setEntryItems([{ product_id: '', qty: 1, cost: 0 }]); setEntryCreatePayable(false); setShowEntryModal(true);
          }}>📥 Registrar Entrada</button>
          <button id="estoque-novo-btn" className="btn btn-primary" onClick={openNew}>+ Novo Produto</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input id="estoque-search" type="text" className="form-input" placeholder="🔍 Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        <select id="estoque-cat-filter" className="form-select" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Todas as categorias</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className="badge badge-danger">{products.filter(p => p.stock_qty <= p.min_stock).length} baixo estoque</span>
          <span className="badge badge-info">{products.length} total</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th>Categoria</th>
              <th style={{ textAlign: 'right' }}>Custo</th>
              <th style={{ textAlign: 'right' }}>Preço</th>
              <th style={{ textAlign: 'right' }}>Margem</th>
              <th style={{ textAlign: 'center' }}>Estoque</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Carregando...</td></tr>
            ) : !filtered.length ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhum produto encontrado</td></tr>
            ) : filtered.map(p => {
              const lowStock = p.stock_qty <= p.min_stock;
              const catName = categories.find(c => c.id === p.category_id)?.name || '—';
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {!p.is_active && <span className="badge badge-gray" style={{ marginTop: 2 }}>Inativo</span>}
                  </td>
                  <td style={{ color: 'var(--kdl-text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku || '—'}</td>
                  <td style={{ color: 'var(--kdl-text-muted)' }}>{catName}</td>
                  <td style={{ textAlign: 'right', color: 'var(--kdl-text-muted)' }}>{p.cost_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#00D4AA' }}>{p.sale_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge ${Number(margin(p)) > 30 ? 'badge-success' : Number(margin(p)) > 10 ? 'badge-warning' : 'badge-danger'}`}>{margin(p)}%</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${lowStock ? 'badge-danger' : 'badge-success'}`}>
                      {p.stock_qty} {p.unit}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Editar Produto">✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setShowMovModal(p); setMovType('adjustment'); setMovQty(p.stock_qty); }} title="Ajuste / Perda">🔄</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>
              {editing ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={saveProduct} id="produto-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="prod-name">Nome do Produto *</label>
                  <input id="prod-name" type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Rádio Pioneer MVH-S218BT" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-sku">SKU / Código</label>
                  <input id="prod-sku" type="text" className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="Ex: RAD-001" />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="form-label" htmlFor="prod-cat" style={{ margin: 0 }}>Categoria</label>
                    <button type="button" onClick={() => setShowCatModal(true)} style={{ background: 'none', border: 'none', color: 'var(--kdl-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>+ Nova</button>
                  </div>
                  <select id="prod-cat" className="form-select" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">Sem categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-forn">Fornecedor Principal</label>
                  <select id="prod-forn" className="form-select" value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}>
                    <option value="">Sem fornecedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-cost">Preço de Custo (R$)</label>
                  <input id="prod-cost" type="number" min={0} step={0.01} className="form-input" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Preço de Venda (R$) *</label>
                  <input id="prod-price" type="number" min={0} step={0.01} className="form-input" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: Number(e.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-stock">Estoque Inicial</label>
                  <input id="prod-stock" type="number" min={0} className="form-input" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-min">Estoque Mínimo (alerta)</label>
                  <input id="prod-min" type="number" min={0} className="form-input" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-unit">Unidade</label>
                  <select id="prod-unit" className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    <option value="un">Un</option>
                    <option value="kg">Kg</option>
                    <option value="m">Metro</option>
                    <option value="cx">Caixa</option>
                    <option value="par">Par</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-warranty">🛡️ Garantia padrão (meses)</label>
                  <input id="prod-warranty" type="number" min={0} max={120} className="form-input" value={form.warranty_months} onChange={e => setForm(f => ({ ...f, warranty_months: Number(e.target.value) }))} placeholder="0 = sem garantia" />
                  {form.warranty_months > 0 && <p style={{ fontSize: '0.75rem', color: '#00D4AA', marginTop: 4 }}>✅ Garantia de {form.warranty_months} meses será sugerida no PDV</p>}
                </div>
              </div>
              {form.sale_price > 0 && form.cost_price > 0 && (
                <div className="alert alert-info">💡 Margem: {((form.sale_price - form.cost_price) / form.sale_price * 100).toFixed(1)}% · Lucro por unidade: {(form.sale_price - form.cost_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="produto-save" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjustment/Loss modal */}
      {showMovModal && (
        <div className="modal-overlay" onClick={() => setShowMovModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>Ajuste ou Perda</h2>
            <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{showMovModal.name} · Atual: <strong style={{ color: 'var(--kdl-text)' }}>{showMovModal.stock_qty}</strong> {showMovModal.unit}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">O que aconteceu?</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([['adjustment', '🔄 Ajuste de Inventário'], ['loss', '📤 Produto Danificado/Perda']] as const).map(([v, l]) => (
                    <label key={v} style={{ flex: 1, padding: '0.625rem', border: '1px solid', borderColor: movType === v ? 'var(--kdl-primary)' : 'var(--kdl-border)', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, background: movType === v ? 'rgba(108,71,255,0.1)' : 'transparent', color: movType === v ? 'var(--kdl-primary-light)' : 'var(--kdl-text-muted)' }}>
                      <input type="radio" name="movType" value={v} checked={movType === v} onChange={() => { setMovType(v as any); setMovQty(v === 'adjustment' ? showMovModal.stock_qty : 1); }} style={{ display: 'none' }} />{l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mov-qty">{movType === 'adjustment' ? 'Quantidade final encontrada na prateleira' : 'Quantidade perdida'}</label>
                <input id="mov-qty" type="number" min={0} className="form-input" value={movQty} onChange={e => setMovQty(Number(e.target.value))} />
                {movType === 'adjustment' && <p style={{ fontSize: '0.75rem', marginTop: 4, color: movQty !== showMovModal.stock_qty ? '#F59E0B' : 'var(--kdl-text-dim)' }}>Diferença: {movQty - showMovModal.stock_qty}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mov-reason">Motivo (Obrigatório) *</label>
                <input id="mov-reason" type="text" className="form-input" value={movReason} onChange={e => setMovReason(e.target.value)} placeholder={movType === 'adjustment' ? "Ex: Contagem mensal, erro inicial..." : "Ex: Caiu e quebrou, extraviado..."} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMovModal(null)}>Cancelar</button>
                <button id="mov-save" type="button" className="btn btn-primary" onClick={saveMovement} disabled={saving || !movReason.trim()}>
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry modal (Entrada Avançada) */}
      {showEntryModal && (
        <div className="modal-overlay" onClick={() => setShowEntryModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>📥 Entrada de Mercadoria</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Fornecedor</label>
                <select className="form-select" value={entrySupplier} onChange={e => setEntrySupplier(e.target.value)}>
                  <option value="">Desconhecido / Não especificado</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nota Fiscal / Referência</label>
                <input type="text" className="form-input" value={entryReference} onChange={e => setEntryReference(e.target.value)} placeholder="Nº da NFe ou recibo" />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Produtos Recebidos</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {entryItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select className="form-select" style={{ flex: 2 }} value={item.product_id} onChange={e => {
                      const pid = e.target.value;
                      const prod = products.find(p => p.id === pid);
                      setEntryItems(prev => prev.map((x, j) => j === i ? { ...x, product_id: pid, cost: prod?.cost_price || 0 } : x));
                    }}>
                      <option value="">Selecione um produto...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock_qty})</option>)}
                    </select>
                    <input type="number" min={1} className="form-input" placeholder="Qtd" value={item.qty || ''} onChange={e => setEntryItems(prev => prev.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x))} style={{ width: 80 }} />
                    <input type="number" min={0} step={0.01} className="form-input" placeholder="Custo unit." value={item.cost || ''} onChange={e => setEntryItems(prev => prev.map((x, j) => j === i ? { ...x, cost: Number(e.target.value) } : x))} style={{ width: 110 }} title="Custo por unidade" />
                    <button className="btn btn-ghost btn-sm" onClick={() => setEntryItems(prev => prev.filter((_, j) => j !== i))} style={{ color: 'var(--kdl-text-muted)' }}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={() => setEntryItems(prev => [...prev, { product_id: '', qty: 1, cost: 0 }])} style={{ alignSelf: 'flex-start', marginTop: 4 }}>+ Adicionar Produto</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--kdl-surface-2)', borderRadius: 8, marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Valor Total: {entryItems.reduce((s, i) => s + (i.qty * i.cost), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={entryCreatePayable} onChange={e => setEntryCreatePayable(e.target.checked)} />
                  Gerar lançamento no "Contas a Pagar" automaticamente
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEntryModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={saveEntry} disabled={saving || !entryItems.length}>
                {saving ? 'Registrando...' : 'Confirmar Entrada'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)} style={{ zIndex: 100 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Nova Categoria</h2>
            <form onSubmit={saveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">Nome da Categoria *</label>
                <input id="cat-name" type="text" className="form-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} required placeholder="Ex: Som Automotivo" autoFocus />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingCat}>
                  {savingCat ? 'Salvando...' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
