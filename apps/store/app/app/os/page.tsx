'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '../context';

type OS = { id: string; status: string; description: string; price: number; created_at: string; estimated_date: string; due_date: string; completed_at: string | null; customer_id: string; technician_id: string; customers: { name: string; phone: string } | null; users: { name: string } | null; };

const PIPELINE = [
  { key: 'quote',       label: 'Orçamento',   color: '#888',    badge: 'badge-gray' },
  { key: 'approved',    label: 'Aprovado',    color: '#6C47FF', badge: 'badge-info' },
  { key: 'in_progress', label: 'Em Andamento',color: '#F59E0B', badge: 'badge-warning' },
  { key: 'completed',   label: 'Concluído',   color: '#10B981', badge: 'badge-success' },
  { key: 'billed',      label: 'Cobrado',     color: '#00D4AA', badge: 'badge-success' },
  { key: 'cancelled',   label: 'Cancelado',   color: '#EF4444', badge: 'badge-danger' },
];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OSPage() {
  const supabase = createClient();
  const { tenantId, userId } = useTenant();
  const [list, setList] = useState<OS[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OS | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customer_id: '', technician_id: '', description: '', price: 0, estimated_date: '', due_date: '', status: 'quote' });

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const [os, cust, usrs] = await Promise.all([
        supabase.from('service_orders').select('*, customers(name,phone), users(name)').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
        supabase.from('customers').select('id,name,phone').eq('tenant_id', tenantId).order('name'),
        supabase.from('users').select('id,name').eq('tenant_id', tenantId),
      ]);
      setList(os.data || []);
      setCustomers(cust.data || []);
      setUsers(usrs.data || []);
      setLoading(false);
    }
    load();
  }, [tenantId]);

  function openNew() { setEditing(null); setForm({ customer_id: '', technician_id: '', description: '', price: 0, estimated_date: '', due_date: '', status: 'quote' }); setShowModal(true); }
  function openEdit(os: OS) { setEditing(os); setForm({ customer_id: os.customer_id, technician_id: os.technician_id || '', description: os.description, price: os.price, estimated_date: os.estimated_date || '', due_date: os.due_date || '', status: os.status }); setShowModal(true); }

  async function saveOS(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload: any = { ...form, price: Number(form.price), tenant_id: tenantId };
    if (form.status === 'completed' && editing?.status !== 'completed') payload.completed_at = new Date().toISOString();

    let resultData: any = null;
    let attempts = 0;
    while (!resultData && attempts < 10) {
      attempts++;
      const res = editing
        ? await supabase.from('service_orders').update(payload).eq('id', editing.id).select('*, customers(name,phone), users(name)').single()
        : await supabase.from('service_orders').insert(payload).select('*, customers(name,phone), users(name)').single();
      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match?.[1]) { delete payload[match[1]]; continue; }
        alert('Erro ao salvar OS: ' + res.error.message);
        setSaving(false);
        return;
      }
      resultData = res.data;
    }

    if (resultData) {
      if (editing) {
        setList(prev => prev.map(o => o.id === resultData.id ? resultData as OS : o));
        if (form.status === 'billed' && editing.status !== 'billed' && Number(form.price) > 0) {
          await supabase.from('cash_transactions').insert({
            tenant_id: tenantId, type: 'in', amount: Number(form.price),
            description: `OS #${resultData.id.slice(0, 6).toUpperCase()} — ${resultData.customers?.name || 'Cliente'}`,
            reference_id: resultData.id, reference_type: 'os', user_id: userId || null,
          });
        }
      } else {
        setList(prev => [resultData as OS, ...prev]);
      }
    }
    setSaving(false); setShowModal(false);
  }

  async function quickStatus(os: OS, newStatus: string) {
    const payload: any = { status: newStatus };
    if (newStatus === 'completed') payload.completed_at = new Date().toISOString();
    await supabase.from('service_orders').update(payload).eq('id', os.id);
    setList(prev => prev.map(o => o.id === os.id ? { ...o, ...payload } : o));
    if (newStatus === 'billed' && os.status !== 'billed' && os.price > 0) {
      await supabase.from('cash_transactions').insert({
        tenant_id: tenantId, type: 'in', amount: os.price,
        description: `OS #${os.id.slice(0, 6).toUpperCase()} — ${os.customers?.name || 'Cliente'}`,
        reference_id: os.id, reference_type: 'os', user_id: userId || null,
      });
    }
  }

  const filtered = list.filter(o => {
    const q = search.toLowerCase();
    return (!q || 
      o.description.toLowerCase().includes(q) || 
      o.customers?.name.toLowerCase().includes(q) || 
      o.id.toLowerCase().includes(q) || 
      o.users?.name.toLowerCase().includes(q)) && 
      (!filterStatus || o.status === filterStatus);
  });

  const today = new Date().toISOString().split('T')[0];

  function OSCard({ os }: { os: OS }) {
    const st = PIPELINE.find(p => p.key === os.status) || PIPELINE[0];
    const overdue = os.due_date && os.due_date < today && os.status !== 'completed' && os.status !== 'billed' && os.status !== 'cancelled';
    const nextStatus = PIPELINE[PIPELINE.findIndex(p => p.key === os.status) + 1];
    return (
      <div style={{ background: 'var(--kdl-surface-2)', border: `1px solid ${overdue ? '#EF4444' : 'var(--kdl-border)'}`, borderRadius: 10, padding: '0.875rem', marginBottom: 8, cursor: 'pointer' }} onClick={() => openEdit(os)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--kdl-text-dim)' }}>#{os.id.slice(0, 6).toUpperCase()}</span>
          {overdue && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#EF4444' }}>⚠️ VENCIDA</span>}
        </div>
        <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 4 }}>{os.customers?.name || '—'}</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{os.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#00D4AA' }}>{os.price > 0 ? fmt(os.price) : '—'}</span>
          {nextStatus && (
            <button className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
              onClick={e => { e.stopPropagation(); quickStatus(os, nextStatus.key); }}>
              → {nextStatus.label}
            </button>
          )}
        </div>
        {os.customers?.phone && (
          <a href={`https://wa.me/55${os.customers.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${os.customers.name}, sua OS está ${st.label.toLowerCase()}.`)}`} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()} style={{ display: 'block', marginTop: 6, fontSize: '0.72rem', color: '#10B981', textDecoration: 'none' }}>📲 Avisar cliente</a>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>🔧 Ordens de Serviço</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{list.length} ordens no total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>☰ Lista</button>
          <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>⬛ Kanban</button>
          <button id="os-nova-btn" className="btn btn-primary" onClick={openNew}>+ Nova OS</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input id="os-search" type="text" className="form-input" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select id="os-filter-status" className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Todos os status</option>
          {PIPELINE.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {PIPELINE.map(p => { const n = list.filter(o => o.status === p.key).length; return n > 0 ? <span key={p.key} className={`badge ${p.badge}`}>{n} {p.label}</span> : null; })}
        </div>
      </div>

      {view === 'kanban' ? (
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {PIPELINE.filter(p => p.key !== 'cancelled').map(col => {
            const colOS = filtered.filter(o => o.status === col.key);
            return (
              <div key={col.key} style={{ minWidth: 240, flex: '0 0 240px' }}>
                <div style={{ padding: '0.625rem 0.875rem', borderRadius: '8px 8px 0 0', background: `${col.color}20`, borderBottom: `2px solid ${col.color}`, marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: col.color }}>{col.label}</span>
                  <span style={{ marginLeft: 8, fontWeight: 800, color: col.color }}>{colOS.length}</span>
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                  {colOS.map(os => <OSCard key={os.id} os={os} />)}
                  {!colOS.length && <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-dim)', textAlign: 'center', padding: '1rem' }}>Nenhuma OS</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>OS</th><th>Cliente</th><th>Descrição</th><th>Técnico</th><th style={{ textAlign: 'right' }}>Valor</th><th>Prazo</th><th style={{ textAlign: 'center' }}>Status</th><th style={{ textAlign: 'center' }}>Ações</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Carregando...</td></tr>
                : !filtered.length ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhuma OS encontrada</td></tr>
                : filtered.map(os => {
                  const st = PIPELINE.find(p => p.key === os.status) || PIPELINE[0];
                  const overdue = os.due_date && os.due_date < today && !['completed','billed','cancelled'].includes(os.status);
                  return (
                    <tr key={os.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>#{os.id.slice(0, 6).toUpperCase()}</td>
                      <td style={{ fontWeight: 600 }}>{os.customers?.name || '—'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--kdl-text-muted)' }}>{os.description}</td>
                      <td style={{ color: 'var(--kdl-text-muted)' }}>{os.users?.name || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#00D4AA' }}>{os.price > 0 ? fmt(os.price) : '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: overdue ? '#EF4444' : 'var(--kdl-text-muted)', fontWeight: overdue ? 700 : 400 }}>{os.due_date ? new Date(os.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}{overdue ? ' ⚠️' : ''}</td>
                      <td style={{ textAlign: 'center' }}><span className={`badge ${st.badge}`}>{st.label}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(os)}>✏️</button>
                          {os.customers?.phone && <a href={`https://wa.me/55${os.customers.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📲</a>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editing ? 'Editar OS' : 'Nova Ordem de Serviço'}</h2>
            <form onSubmit={saveOS} id="os-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="os-customer">Cliente *</label>
                <select id="os-customer" className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} required>
                  <option value="">Selecionar...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="os-tech">Técnico</label>
                <select id="os-tech" className="form-select" value={form.technician_id} onChange={e => setForm(f => ({ ...f, technician_id: e.target.value }))}>
                  <option value="">Sem técnico</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label" htmlFor="os-desc">Descrição do serviço *</label>
                <textarea id="os-desc" className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required style={{ resize: 'vertical' }} placeholder="Ex: Instalação de rádio Pioneer + câmera de ré no Fiat Palio 2015" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="os-price">Valor (R$)</label>
                <input id="os-price" type="number" min={0} step={0.01} className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="os-due">Prazo de Entrega</label>
                <input id="os-due" type="date" className="form-input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {PIPELINE.map(p => (
                    <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0.75rem', border: '1px solid', borderColor: form.status === p.key ? p.color : 'var(--kdl-border)', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: form.status === p.key ? `${p.color}15` : 'transparent', color: form.status === p.key ? p.color : 'var(--kdl-text-muted)', transition: 'all 0.15s' }}>
                      <input type="radio" name="os-status" value={p.key} checked={form.status === p.key} onChange={() => setForm(f => ({ ...f, status: p.key }))} style={{ display: 'none' }} />{p.label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
