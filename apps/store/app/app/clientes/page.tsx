'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Customer = { id: string; name: string; phone: string; phone2?: string; cpf_cnpj?: string; email?: string; birthday?: string; address?: string; notes?: string };

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ClientesPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', phone2: '', cpf_cnpj: '', email: '', birthday: '', address: '', notes: '' });

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

  async function loadHistory(c: Customer) {
    setSelected(c); setLoadingHistory(true);
    const { data } = await supabase.from('sales').select('id,total,payment_method,created_at').eq('customer_id', c.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(10);
    setHistory(data || []);
    setLoadingHistory(false);
  }

  function openNew() { setEditing(null); setForm({ name: '', phone: '', phone2: '', cpf_cnpj: '', email: '', birthday: '', address: '', notes: '' }); setShowModal(true); }
  function openEdit(c: Customer) { setEditing(c); setForm({ name: c.name, phone: c.phone, phone2: c.phone2 || '', cpf_cnpj: c.cpf_cnpj || '', email: c.email || '', birthday: c.birthday || '', address: c.address || '', notes: c.notes || '' }); setShowModal(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    let payload: any = { ...form };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
    
    let success = false;
    let finalData = null;
    let attempts = 0;

    while (!success && attempts < 10) {
      attempts++;
      const res = editing
        ? await supabase.from('customers').update(payload).eq('id', editing.id).select().single()
        : await supabase.from('customers').insert({ ...payload, tenant_id: tenantId }).select().single();

      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match && match[1]) {
          delete payload[match[1]];
          continue;
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
      if (editing) setCustomers(prev => prev.map(c => c.id === finalData.id ? finalData : c));
      else setCustomers(prev => [...prev, finalData].sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setShowModal(false);
    }
    setSaving(false);
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    const phoneDigits = c.phone?.replace(/\D/g, '') || '';
    const phone2Digits = c.phone2?.replace(/\D/g, '') || '';
    
    return !q || 
      c.name.toLowerCase().includes(q) || 
      (qDigits && phoneDigits.includes(qDigits)) || 
      (qDigits && phone2Digits.includes(qDigits)) || 
      (qDigits && c.cpf_cnpj?.replace(/\D/g, '').includes(qDigits)) || 
      c.email?.toLowerCase().includes(q);
  });

  const PM: Record<string, string> = { cash: 'Dinheiro', pix: 'Pix', card: 'Débito', credit: 'Crédito', credit_store: 'Fiado' };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
        {/* Lista */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>👥 Clientes</h1>
              <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{customers.length} cadastrados</p>
            </div>
            <button id="clientes-novo-btn" className="btn btn-primary" onClick={openNew}>+ Novo Cliente</button>
          </div>
          <input id="clientes-search" type="text" className="form-input" placeholder="🔍 Buscar por nome, telefone, CPF ou email..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '1rem' }} />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? <p style={{ color: 'var(--kdl-text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando...</p>
              : !filtered.length ? <div className="empty-state"><span style={{ fontSize: '2.5rem' }}>👥</span><p>{search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>{!search && <button className="btn btn-primary" onClick={openNew}>Cadastrar primeiro cliente</button>}</div>
              : filtered.map(c => (
                <div key={c.id} onClick={() => loadHistory(c)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', borderRadius: 10, border: '1px solid', borderColor: selected?.id === c.id ? 'var(--kdl-primary)' : 'var(--kdl-border)', background: selected?.id === c.id ? 'rgba(108,71,255,0.06)' : 'var(--kdl-surface)', marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,71,255,0.3)'; }}
                  onMouseLeave={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.borderColor = 'var(--kdl-border)'; }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-muted)' }}>{c.phone}{c.cpf_cnpj ? ` · CPF: ${c.cpf_cnpj}` : ''}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openEdit(c); }} title="Editar cliente">✏️</button>
                </div>
              ))}
          </div>
        </div>

        {/* Perfil */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexShrink: 0 }}>
          {!selected ? (
            <div className="card empty-state" style={{ flex: 1 }}>
              <span style={{ fontSize: '2.5rem' }}>👆</span>
              <p>Selecione um cliente para ver o histórico</p>
            </div>
          ) : (
            <>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: 4 }}>{selected.name}</h2>
                    {selected.email && <p style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>{selected.email}</p>}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(selected)} title="Editar dados do cliente">✏️ Editar</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.phone && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--kdl-text-muted)' }}>Telefone</span><a href={`tel:${selected.phone}`} style={{ color: 'var(--kdl-text)', textDecoration: 'none', fontWeight: 600 }}>{selected.phone}</a></div>}
                  {selected.phone && <a href={`https://wa.me/55${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-success btn-sm" style={{ justifyContent: 'center' }} title="Abrir conversa no WhatsApp">📲 WhatsApp</a>}
                  {selected.cpf_cnpj && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--kdl-text-muted)' }}>CPF/CNPJ</span><span>{selected.cpf_cnpj}</span></div>}
                  {selected.birthday && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--kdl-text-muted)' }}>Aniversário</span><span>{new Date(selected.birthday + 'T00:00:00').toLocaleDateString('pt-BR')}</span></div>}
                  {selected.address && <div style={{ fontSize: '0.85rem', color: 'var(--kdl-text-muted)' }}>📍 {selected.address}</div>}
                  {selected.notes && <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>📝 {selected.notes}</div>}
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', marginBottom: '1rem' }}>Histórico de Compras</h3>
                {loadingHistory ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Carregando...</p>
                  : !history.length ? <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Nenhuma compra registrada.</p>
                  : history.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fmt(s.total)}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-muted)' }}>{new Date(s.created_at).toLocaleDateString('pt-BR')} · {PM[s.payment_method] || s.payment_method}</p>
                      </div>
                      <span className="badge badge-info">#{s.id.slice(0, 6).toUpperCase()}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={save} id="cliente-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label" htmlFor="cli-name">Nome *</label><input id="cli-name" type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label" htmlFor="cli-phone">Telefone *</label><input id="cli-phone" type="text" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="(11) 99999-9999" /></div>
                <div className="form-group"><label className="form-label" htmlFor="cli-phone2">Telefone 2</label><input id="cli-phone2" type="text" className="form-input" value={form.phone2} onChange={e => setForm(f => ({ ...f, phone2: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label" htmlFor="cli-cpf">CPF / CNPJ</label><input id="cli-cpf" type="text" className="form-input" value={form.cpf_cnpj} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label" htmlFor="cli-email">Email</label><input id="cli-email" type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label" htmlFor="cli-bday">Aniversário</label><input id="cli-bday" type="date" className="form-input" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label" htmlFor="cli-addr">Endereço</label><input id="cli-addr" type="text" className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label" htmlFor="cli-notes">Observações internas</label><textarea id="cli-notes" className="form-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Ex: Cliente prefere pagamento Pix..." style={{ resize: 'vertical' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="cliente-save" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
