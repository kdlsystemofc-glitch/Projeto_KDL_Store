'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type OS = { id: string; status: string; description: string; price: number; created_at: string; estimated_date: string; customers: { name: string } | null; users: { name: string } | null; };

const STATUS_MAP: Record<string, { label: string; badge: string; color: string }> = {
  quote:       { label: 'Orçamento', badge: 'badge-gray',    color: '#888' },
  approved:    { label: 'Aprovado',  badge: 'badge-info',    color: '#6C47FF' },
  in_progress: { label: 'Em Andamento', badge: 'badge-warning', color: '#F59E0B' },
  completed:   { label: 'Concluído', badge: 'badge-success', color: '#10B981' },
  billed:      { label: 'Cobrado',   badge: 'badge-success', color: '#00D4AA' },
  cancelled:   { label: 'Cancelado', badge: 'badge-danger',  color: '#EF4444' },
};

export default function OSPage() {
  const supabase = createClient();
  const [list, setList] = useState<OS[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers]   = useState<{ id: string; name: string }[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OS | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customer_id: '', technician_id: '', description: '', price: 0, estimated_date: '', status: 'quote' });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const [os, cust, usrs] = await Promise.all([
        supabase.from('service_orders').select('*, customers(name), users(name)').eq('tenant_id', ud.tenant_id).order('created_at', { ascending: false }),
        supabase.from('customers').select('id,name').eq('tenant_id', ud.tenant_id),
        supabase.from('users').select('id,name').eq('tenant_id', ud.tenant_id),
      ]);
      setList(os.data || []);
      setCustomers(cust.data || []);
      setUsers(usrs.data || []);
      setLoading(false);
    }
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ customer_id: '', technician_id: '', description: '', price: 0, estimated_date: '', status: 'quote' });
    setShowModal(true);
  }
  function openEdit(os: OS) {
    setEditing(os);
    setForm({ customer_id: (os as any).customer_id, technician_id: (os as any).technician_id || '', description: os.description, price: os.price, estimated_date: os.estimated_date || '', status: os.status });
    setShowModal(true);
  }

  async function saveOS(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, price: Number(form.price), tenant_id: tenantId };
    if (editing) {
      const completedAt = form.status === 'completed' ? new Date().toISOString() : null;
      const { data } = await supabase.from('service_orders').update({ ...payload, ...(completedAt ? { completed_at: completedAt } : {}) }).eq('id', editing.id).select('*, customers(name), users(name)').single();
      if (data) setList(prev => prev.map(o => o.id === data.id ? data : o));
    } else {
      const { data } = await supabase.from('service_orders').insert(payload).select('*, customers(name), users(name)').single();
      if (data) setList(prev => [data, ...prev]);
    }
    setSaving(false); setShowModal(false);
  }

  const filtered = list.filter(o => {
    const q = search.toLowerCase();
    return (!search || o.description.toLowerCase().includes(q) || o.customers?.name.toLowerCase().includes(q))
      && (!filterStatus || o.status === filterStatus);
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>🔧 Ordens de Serviço</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{list.length} ordens no total</p>
        </div>
        <button id="os-nova-btn" className="btn btn-primary" onClick={openNew}>+ Nova OS</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input id="os-search" type="text" className="form-input" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select id="os-filter-status" className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {Object.entries(STATUS_MAP).map(([k, v]) => {
            const count = list.filter(o => o.status === k).length;
            return count > 0 ? <span key={k} className={`badge ${v.badge}`}>{count} {v.label}</span> : null;
          })}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>OS #</th><th>Cliente</th><th>Descrição</th><th>Técnico</th>
            <th style={{ textAlign: 'right' }}>Valor</th><th>Prazo</th>
            <th style={{ textAlign: 'center' }}>Status</th><th style={{ textAlign: 'center' }}>Ações</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Carregando...</td></tr>
              : !filtered.length ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhuma OS encontrada</td></tr>
              : filtered.map(os => {
                const s = STATUS_MAP[os.status] || STATUS_MAP.quote;
                return (
                  <tr key={os.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>#{os.id.slice(0, 8).toUpperCase()}</td>
                    <td style={{ fontWeight: 600 }}>{os.customers?.name || '—'}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--kdl-text-muted)' }}>{os.description}</td>
                    <td style={{ color: 'var(--kdl-text-muted)' }}>{os.users?.name || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00D4AA' }}>{os.price > 0 ? os.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                    <td style={{ color: 'var(--kdl-text-muted)', fontSize: '0.8rem' }}>{os.estimated_date ? new Date(os.estimated_date).toLocaleDateString('pt-BR') : '—'}</td>
                    <td style={{ textAlign: 'center' }}><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td style={{ textAlign: 'center' }}><button className="btn btn-ghost btn-sm" onClick={() => openEdit(os)}>✏️ Editar</button></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editing ? 'Editar OS' : 'Nova Ordem de Serviço'}</h2>
            <form onSubmit={saveOS} id="os-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="os-customer">Cliente *</label>
                  <select id="os-customer" className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} required>
                    <option value="">Selecionar cliente...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="os-tech">Técnico responsável</label>
                  <select id="os-tech" className="form-select" value={form.technician_id} onChange={e => setForm(f => ({ ...f, technician_id: e.target.value }))}>
                    <option value="">Sem técnico</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label" htmlFor="os-desc">Descrição do serviço *</label>
                  <textarea id="os-desc" className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Ex: Instalação de rádio Pioneer + câmera de ré no Fiat Palio 2015" style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="os-price">Valor do serviço (R$)</label>
                  <input id="os-price" type="number" min={0} step={0.01} className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="os-date">Prazo estimado</label>
                  <input id="os-date" type="date" className="form-input" value={form.estimated_date} onChange={e => setForm(f => ({ ...f, estimated_date: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label" htmlFor="os-status">Status</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {Object.entries(STATUS_MAP).map(([k, v]) => (
                      <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0.75rem', border: '1px solid', borderColor: form.status === k ? v.color : 'var(--kdl-border)', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: form.status === k ? `${v.color}15` : 'transparent', color: form.status === k ? v.color : 'var(--kdl-text-muted)', transition: 'all 0.15s' }}>
                        <input type="radio" name="os-status" value={k} checked={form.status === k} onChange={() => setForm(f => ({ ...f, status: k }))} style={{ display: 'none' }} />
                        {v.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="os-save" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar OS'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
