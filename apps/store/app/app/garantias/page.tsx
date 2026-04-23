'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Warranty = { id: string; status: string; expiry_date: string; issue_date: string; warranty_months: number; warranty_code: string; product_id: string; customer_id: string; products: { name: string } | null; customers: { name: string; phone: string } | null; };

const STATUS = { active: { label: 'Ativa', badge: 'badge-success' }, expired: { label: 'Vencida', badge: 'badge-danger' }, claimed: { label: 'Acionada', badge: 'badge-warning' } };

export default function GarantiasPage() {
  const supabase = createClient();
  const [list, setList] = useState<Warranty[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; warranty_months: number }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: '', customer_id: '', warranty_months: 12, issue_date: new Date().toISOString().split('T')[0] });
  const [viewing, setViewing] = useState<Warranty | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const [w, p, c] = await Promise.all([
        supabase.from('warranties').select('*, products(name), customers(name,phone)').eq('tenant_id', ud.tenant_id).order('expiry_date'),
        supabase.from('products').select('id,name').eq('tenant_id', ud.tenant_id).eq('is_active', true).order('name'),
        supabase.from('customers').select('id,name,phone').eq('tenant_id', ud.tenant_id).order('name'),
      ]);
      setList(w.data || []);
      setProducts(p.data || []);
      setCustomers(c.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function openClaim(w: Warranty) {
    if (!confirm('Confirmar acionamento desta garantia? Uma OS será criada automaticamente.')) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload: any = { tenant_id: tenantId, customer_id: w.customer_id, warranty_id: w.id, status: 'approved', description: `Garantia acionada — ${w.products?.name}`, price: 0, user_id: user!.id };
    
    let success = false;
    let attempts = 0;
    while (!success && attempts < 5) {
      attempts++;
      const res = await supabase.from('service_orders').insert(payload);
      if (res.error) {
        const match = res.error.message.match(/'([^']+)' column/);
        if (match && match[1]) {
          delete payload[match[1]];
          continue;
        } else {
          alert('Erro ao criar OS: ' + res.error.message);
          return;
        }
      }
      success = true;
    }

    await supabase.from('warranties').update({ status: 'claimed' }).eq('id', w.id);
    setList(prev => prev.map(x => x.id === w.id ? { ...x, status: 'claimed' } : x));
  }

  async function saveWarranty(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const expiry = new Date(form.issue_date);
    expiry.setMonth(expiry.getMonth() + form.warranty_months);
    const code = `KDL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const { data } = await supabase.from('warranties').insert({
      tenant_id: tenantId, product_id: form.product_id, customer_id: form.customer_id,
      warranty_months: form.warranty_months, issue_date: form.issue_date,
      expiry_date: expiry.toISOString().split('T')[0], status: 'active', warranty_code: code,
    }).select('*, products(name), customers(name,phone)').single();
    if (data) setList(prev => [...prev, data as Warranty].sort((a, b) => a.expiry_date.localeCompare(b.expiry_date)));
    setSaving(false); setShowModal(false);
  }

  const today = new Date().toISOString().split('T')[0];
  const in30d = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const filtered = list.filter(w => {
    const q = search.toLowerCase();
    return (!q || 
      w.products?.name.toLowerCase().includes(q) || 
      w.customers?.name.toLowerCase().includes(q) || 
      w.warranty_code?.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q)) && 
      (!filterStatus || w.status === filterStatus);
  });

  function expiryInfo(w: Warranty) {
    const diff = Math.ceil((new Date(w.expiry_date).getTime() - Date.now()) / 86400000);
    if (w.status === 'claimed') return { label: 'Acionada', color: '#F59E0B' };
    if (diff < 0) return { label: `Venceu há ${Math.abs(diff)}d`, color: '#EF4444' };
    if (diff <= 30) return { label: `Vence em ${diff}d`, color: '#F59E0B' };
    return { label: `${diff}d restantes`, color: '#10B981' };
  }

  function WarrantyCard({ w }: { w: Warranty }) {
    const exp = expiryInfo(w);
    const st = STATUS[w.status as keyof typeof STATUS] || STATUS.active;
    return (
      <div style={{ background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)', borderRadius: 12, padding: '1.25rem', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => setViewing(w)} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--kdl-border)')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{w.products?.name || '—'}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-muted)' }}>{w.customers?.name || '—'}</p>
          </div>
          <span className={`badge ${st.badge}`}>{st.label}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-dim)' }}>Emitida {new Date(w.issue_date).toLocaleDateString('pt-BR')} · {w.warranty_months}m</p>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: exp.color }}>{exp.label}</p>
          </div>
          {w.status === 'active' && (
            <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); openClaim(w); }}>⚡ Acionar</button>
          )}
        </div>
        {w.warranty_code && <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--kdl-text-dim)', marginTop: 8 }}>{w.warranty_code}</p>}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>🛡️ Garantias</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <span className="badge badge-success">{list.filter(w => w.status === 'active' && w.expiry_date > today).length} ativas</span>
            <span className="badge badge-warning">{list.filter(w => w.status === 'active' && w.expiry_date >= today && w.expiry_date <= in30d).length} vencendo</span>
            <span className="badge badge-danger">{list.filter(w => w.expiry_date < today && w.status === 'active').length} vencidas</span>
            <span className="badge badge-gray">{list.filter(w => w.status === 'claimed').length} acionadas</span>
          </div>
        </div>
        <button id="gar-nova-btn" className="btn btn-primary" onClick={() => { setForm({ product_id: '', customer_id: '', warranty_months: 12, issue_date: new Date().toISOString().split('T')[0] }); setShowModal(true); }}>+ Emitir Garantia</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input id="gar-search" type="text" className="form-input" placeholder="🔍 Buscar por produto ou cliente..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <select id="gar-filter-status" className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Todos</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? <p style={{ color: 'var(--kdl-text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando...</p>
        : !filtered.length ? <div className="empty-state"><span style={{ fontSize: '2.5rem' }}>🛡️</span><p>Nenhuma garantia encontrada.</p><p style={{ fontSize: '0.875rem' }}>As garantias são emitidas automaticamente ao finalizar uma venda de produto com prazo definido.</p></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map(w => <WarrantyCard key={w.id} w={w} />)}
        </div>}

      {/* Emissão manual */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>🛡️ Emitir Garantia Manual</h2>
            <form onSubmit={saveWarranty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="gar-prod">Produto *</label>
                <select id="gar-prod" className="form-select" value={form.product_id} onChange={e => { const p = products.find(x => x.id === e.target.value); setForm(f => ({ ...f, product_id: e.target.value, warranty_months: p?.warranty_months || 12 })); }} required>
                  <option value="">Selecionar produto...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gar-cust">Cliente *</label>
                <select id="gar-cust" className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} required>
                  <option value="">Selecionar cliente...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gar-months">Prazo (meses)</label>
                <input id="gar-months" type="number" min={1} max={120} className="form-input" value={form.warranty_months} onChange={e => setForm(f => ({ ...f, warranty_months: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gar-date">Data de Emissão</label>
                <input id="gar-date" type="date" className="form-input" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} />
              </div>
              {form.warranty_months > 0 && form.issue_date && (
                <div className="alert alert-info">
                  📅 Vence em: <strong>{new Date(new Date(form.issue_date).setMonth(new Date(form.issue_date).getMonth() + form.warranty_months)).toLocaleDateString('pt-BR')}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="gar-save" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Emitindo...' : 'Emitir'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visualização */}
      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem' }}>Garantia Digital</h2>
              {viewing.warranty_code && <p style={{ fontFamily: 'monospace', color: 'var(--kdl-primary-light)', fontSize: '1rem', marginTop: 4 }}>{viewing.warranty_code}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Produto', viewing.products?.name || '—'],
                ['Cliente', viewing.customers?.name || '—'],
                ['Telefone', viewing.customers?.phone || '—'],
                ['Prazo', `${viewing.warranty_months} meses`],
                ['Emitida em', new Date(viewing.issue_date).toLocaleDateString('pt-BR')],
                ['Vence em', new Date(viewing.expiry_date).toLocaleDateString('pt-BR')],
                ['Status', STATUS[viewing.status as keyof typeof STATUS]?.label || viewing.status],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--kdl-border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--kdl-text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
              {viewing.customers?.phone && (
                <a href={`https://wa.me/55${viewing.customers.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${viewing.customers.name}! Segue sua garantia digital:\n\nProduto: ${viewing.products?.name}\nCódigo: ${viewing.warranty_code}\nValidade: ${new Date(viewing.expiry_date).toLocaleDateString('pt-BR')}`)}`} target="_blank" rel="noreferrer" className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>📲 Enviar no WhatsApp</a>
              )}
              {viewing.status === 'active' && (
                <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { openClaim(viewing); setViewing(null); }}>⚡ Acionar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
