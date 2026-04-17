'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Supplier = { id: string; name: string; contact_name: string; phone: string; email: string; created_at: string };

export default function FornecedoresPage() {
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState<Supplier | null>(null);
  const [orderProduct, setOrderProduct] = useState('');
  const [orderQty, setOrderQty] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '' });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const { data } = await supabase.from('suppliers').select('*').eq('tenant_id', ud.tenant_id).order('name');
      setSuppliers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function openNew() { setEditing(null); setForm({ name: '', contact_name: '', phone: '', email: '' }); setShowModal(true); }
  function openEdit(s: Supplier) { setEditing(s); setForm({ name: s.name, contact_name: s.contact_name || '', phone: s.phone || '', email: s.email || '' }); setShowModal(true); }

  async function saveSupplier(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    if (editing) {
      const { data } = await supabase.from('suppliers').update(form).eq('id', editing.id).select().single();
      if (data) setSuppliers(prev => prev.map(s => s.id === data.id ? data : s));
    } else {
      const { data } = await supabase.from('suppliers').insert({ ...form, tenant_id: tenantId }).select().single();
      if (data) setSuppliers(prev => [...prev, data]);
    }
    setSaving(false); setShowModal(false);
  }

  async function saveOrder() {
    if (!showOrderModal) return; setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('supplier_orders').insert({
      tenant_id: tenantId, supplier_id: showOrderModal.id,
      product_description: orderProduct, qty: orderQty, notes: orderNotes,
      status: 'requested', user_id: user!.id,
    });
    setSaving(false); setShowOrderModal(null);
    setOrderProduct(''); setOrderQty(1); setOrderNotes('');
  }

  const filtered = suppliers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>🔗 Fornecedores</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{suppliers.length} fornecedores cadastrados</p>
        </div>
        <button id="forn-novo-btn" className="btn btn-primary" onClick={openNew}>+ Novo Fornecedor</button>
      </div>

      <input id="forn-search" type="text" className="form-input" placeholder="🔍 Buscar fornecedor..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360, marginBottom: '1.25rem' }} />

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Fornecedor</th><th>Contato</th><th>Telefone</th><th>Email</th><th>Cadastrado em</th><th style={{ textAlign: 'center' }}>Ações</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Carregando...</td></tr>
              : !filtered.length ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhum fornecedor encontrado</td></tr>
              : filtered.map(s => (
                <tr key={s.id}>
                  <td><div style={{ fontWeight: 600 }}>{s.name}</div></td>
                  <td style={{ color: 'var(--kdl-text-muted)' }}>{s.contact_name || '—'}</td>
                  <td>{s.phone || '—'}</td>
                  <td style={{ color: 'var(--kdl-text-muted)' }}>{s.email || '—'}</td>
                  <td style={{ color: 'var(--kdl-text-muted)', fontSize: '0.8rem' }}>{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                      <button id={`forn-order-${s.id.slice(0,8)}`} className="btn btn-primary btn-sm" onClick={() => setShowOrderModal(s)}>📦 Pedir</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Supplier modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
            <form onSubmit={saveSupplier} id="forn-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label" htmlFor="forn-name">Nome da empresa *</label><input id="forn-name" type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Distribuidora Auto Som" /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-contact">Nome do contato</label><input id="forn-contact" type="text" className="form-input" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Ex: Carlos" /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-phone">Telefone / WhatsApp</label><input id="forn-phone" type="tel" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" /></div>
              <div className="form-group"><label className="form-label" htmlFor="forn-email">Email</label><input id="forn-email" type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="fornecedor@email.com" /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="forn-save" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order modal */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>📦 Solicitar Pedido</h2>
            <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Fornecedor: <strong>{showOrderModal.name}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label" htmlFor="order-product">Produto / Descrição *</label><input id="order-product" type="text" className="form-input" value={orderProduct} onChange={e => setOrderProduct(e.target.value)} placeholder="Ex: Moldura Fiat Palio 2018" /></div>
              <div className="form-group"><label className="form-label" htmlFor="order-qty">Quantidade</label><input id="order-qty" type="number" min={1} className="form-input" value={orderQty} onChange={e => setOrderQty(Number(e.target.value))} /></div>
              <div className="form-group"><label className="form-label" htmlFor="order-notes">Observações</label><textarea id="order-notes" className="form-input" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={3} placeholder="Prazo, especificações, urgência..." style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(null)}>Cancelar</button>
                <button id="order-save" type="button" className="btn btn-primary" onClick={saveOrder} disabled={saving || !orderProduct}>{saving ? 'Salvando...' : 'Registrar Pedido'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
