'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Product = {
  id: string; name: string; sku: string; category_id: string;
  cost_price: number; sale_price: number; stock_qty: number;
  min_stock: number; unit: string; is_active: boolean;
};
type Category = { id: string; name: string };

export default function EstoquePage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMovModal, setShowMovModal] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [movType, setMovType] = useState<'entry' | 'adjustment' | 'loss'>('entry');
  const [movQty, setMovQty] = useState(1);
  const [movReason, setMovReason] = useState('');

  const [form, setForm] = useState({
    name: '', sku: '', category_id: '', cost_price: 0, sale_price: 0,
    stock_qty: 0, min_stock: 0, unit: 'un',
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const [p, c] = await Promise.all([
        supabase.from('products').select('*').eq('tenant_id', ud.tenant_id).order('name'),
        supabase.from('categories').select('*').eq('tenant_id', ud.tenant_id).order('name'),
      ]);
      setProducts(p.data || []);
      setCategories(c.data || []);
      setLoading(false);
    }
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: '', sku: '', category_id: '', cost_price: 0, sale_price: 0, stock_qty: 0, min_stock: 0, unit: 'un' });
    setShowModal(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category_id: p.category_id, cost_price: p.cost_price, sale_price: p.sale_price, stock_qty: p.stock_qty, min_stock: p.min_stock, unit: p.unit });
    setShowModal(true);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      const payload = { ...form, category_id: form.category_id || null };
      const { data } = await supabase.from('products').update(payload).eq('id', editing.id).select().single();
      if (data) setProducts(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      const payload = { ...form, category_id: form.category_id || null };
      const { data } = await supabase.from('products').insert({ ...payload, tenant_id: tenantId, is_active: true }).select().single();
      if (data) setProducts(prev => [...prev, data]);
    }
    setSaving(false);
    setShowModal(false);
  }

  async function saveMovement() {
    if (!showMovModal) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('stock_movements').insert({
      tenant_id: tenantId,
      product_id: showMovModal.id,
      type: movType,
      qty: movType === 'loss' ? -Math.abs(movQty) : Math.abs(movQty),
      reason: movReason,
      user_id: user!.id,
    });
    // Update stock
    const delta = movType === 'entry' ? movQty : movType === 'adjustment' ? movQty - showMovModal.stock_qty : -movQty;
    const newQty = movType === 'adjustment' ? movQty : showMovModal.stock_qty + delta;
    await supabase.from('products').update({ stock_qty: Math.max(0, newQty) }).eq('id', showMovModal.id);
    setProducts(prev => prev.map(p => p.id === showMovModal.id ? { ...p, stock_qty: Math.max(0, newQty) } : p));
    setSaving(false);
    setShowMovModal(null);
    setMovQty(1); setMovReason('');
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
        <button id="estoque-novo-btn" className="btn btn-primary" onClick={openNew}>+ Novo Produto</button>
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
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Editar">✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setShowMovModal(p); setMovType('entry'); }} title="Movimentação">📦</button>
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
                  <label className="form-label" htmlFor="prod-cat">Categoria</label>
                  <select id="prod-cat" className="form-select" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">Sem categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

      {/* Movement modal */}
      {showMovModal && (
        <div className="modal-overlay" onClick={() => setShowMovModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>Movimentação de Estoque</h2>
            <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{showMovModal.name} · Atual: {showMovModal.stock_qty} {showMovModal.unit}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Tipo de movimentação</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([['entry', '📥 Entrada'], ['adjustment', '🔄 Ajuste'], ['loss', '📤 Perda']] as const).map(([v, l]) => (
                    <label key={v} style={{ flex: 1, padding: '0.625rem', border: '1px solid', borderColor: movType === v ? 'var(--kdl-primary)' : 'var(--kdl-border)', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, background: movType === v ? 'rgba(108,71,255,0.1)' : 'transparent', color: movType === v ? 'var(--kdl-primary-light)' : 'var(--kdl-text-muted)' }}>
                      <input type="radio" name="movType" value={v} checked={movType === v} onChange={() => setMovType(v)} style={{ display: 'none' }} />{l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mov-qty">{movType === 'adjustment' ? 'Quantidade final (total)' : 'Quantidade'}</label>
                <input id="mov-qty" type="number" min={0} className="form-input" value={movQty} onChange={e => setMovQty(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mov-reason">Motivo</label>
                <input id="mov-reason" type="text" className="form-input" value={movReason} onChange={e => setMovReason(e.target.value)} placeholder="Ex: Compra no fornecedor, Inventário, Produto danificado..." />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMovModal(null)}>Cancelar</button>
                <button id="mov-save" type="button" className="btn btn-primary" onClick={saveMovement} disabled={saving}>
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
