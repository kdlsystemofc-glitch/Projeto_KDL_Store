'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Customer = { id: string; name: string; cpf_cnpj: string; phone: string; email: string; address: Record<string, string>; loyalty_points: number; created_at: string };

export default function ClientesPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', cpf_cnpj: '', phone: '', email: '', street: '', city: '', state: '', zip: '' });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const { data } = await supabase.from('customers').select('*').eq('tenant_id', ud.tenant_id).order('name');
      setCustomers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function openNew() { setEditing(null); setForm({ name: '', cpf_cnpj: '', phone: '', email: '', street: '', city: '', state: '', zip: '' }); setShowModal(true); }
  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ name: c.name, cpf_cnpj: c.cpf_cnpj || '', phone: c.phone || '', email: c.email || '', street: c.address?.street || '', city: c.address?.city || '', state: c.address?.state || '', zip: c.address?.zip || '' });
    setShowModal(true);
  }

  async function saveCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, cpf_cnpj: form.cpf_cnpj, phone: form.phone, email: form.email, address: { street: form.street, city: form.city, state: form.state, zip: form.zip } };
    if (editing) {
      const { data } = await supabase.from('customers').update(payload).eq('id', editing.id).select().single();
      if (data) setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
    } else {
      const { data } = await supabase.from('customers').insert({ ...payload, tenant_id: tenantId, loyalty_points: 0 }).select().single();
      if (data) setCustomers(prev => [...prev, data]);
    }
    setSaving(false);
    setShowModal(false);
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !search || c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.cpf_cnpj?.includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>👥 Clientes</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{customers.length} clientes cadastrados</p>
        </div>
        <button id="cliente-novo-btn" className="btn btn-primary" onClick={openNew}>+ Novo Cliente</button>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <input id="cliente-search" type="text" className="form-input" placeholder="🔍 Buscar por nome, telefone, CPF ou email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Email</th><th>Cidade</th>
            <th style={{ textAlign: 'center' }}>Pontos</th><th style={{ textAlign: 'center' }}>Ações</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Carregando...</td></tr>
              : !filtered.length ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhum cliente encontrado</td></tr>
              : filtered.map(c => (
                <tr key={c.id}>
                  <td><div style={{ fontWeight: 600 }}>{c.name}</div></td>
                  <td style={{ color: 'var(--kdl-text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.cpf_cnpj || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td style={{ color: 'var(--kdl-text-muted)' }}>{c.email || '—'}</td>
                  <td style={{ color: 'var(--kdl-text-muted)' }}>{c.address?.city || '—'}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-info">⭐ {c.loyalty_points || 0}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>✏️</button>
                      <a className="btn btn-ghost btn-sm" href={`/app/clientes/${c.id}`}>🔍</a>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={saveCustomer} id="cliente-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label" htmlFor="cli-name">Nome completo *</label>
                  <input id="cli-name" type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: João da Silva" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cli-cpf">CPF / CNPJ</label>
                  <input id="cli-cpf" type="text" className="form-input" value={form.cpf_cnpj} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} placeholder="000.000.000-00" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cli-phone">Telefone</label>
                  <input id="cli-phone" type="tel" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label" htmlFor="cli-email">Email</label>
                  <input id="cli-email" type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="cliente@email.com" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label" htmlFor="cli-street">Endereço</label>
                  <input id="cli-street" type="text" className="form-input" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="Rua, número, bairro" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cli-city">Cidade</label>
                  <input id="cli-city" type="text" className="form-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cli-zip">CEP</label>
                  <input id="cli-zip" type="text" className="form-input" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="00000-000" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="cliente-save" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
