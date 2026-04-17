'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Warranty = { id: string; status: string; expiry_date: string; issue_date: string; warranty_months: number; products: { name: string } | null; customers: { name: string; phone: string } | null; };

const STATUS = {
  active:  { label: 'Ativa',     badge: 'badge-success' },
  expired: { label: 'Vencida',   badge: 'badge-danger' },
  claimed: { label: 'Acionada',  badge: 'badge-warning' },
};

export default function GarantiasPage() {
  const supabase = createClient();
  const [list, setList]         = useState<Warranty[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const { data } = await supabase.from('warranties')
        .select('*, products(name), customers(name,phone)')
        .eq('tenant_id', ud.tenant_id)
        .order('expiry_date', { ascending: true });
      setList(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function openClaim(w: Warranty) {
    // Cria OS a partir da garantia
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('service_orders').insert({
      tenant_id: tenantId,
      customer_id: (w as any).customer_id,
      warranty_id: w.id,
      status: 'approved',
      description: `Acionamento de garantia — ${w.products?.name}`,
      price: 0,
    });
    await supabase.from('warranties').update({ status: 'claimed' }).eq('id', w.id);
    setList(prev => prev.map(x => x.id === w.id ? { ...x, status: 'claimed' } : x));
    alert('OS de garantia criada! Acesse Ordens de Serviço para gerenciar.');
  }

  const today = new Date().toISOString().split('T')[0];
  const in30d = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const filtered = list.filter(w => {
    const q = search.toLowerCase();
    return (!search || w.products?.name.toLowerCase().includes(q) || w.customers?.name.toLowerCase().includes(q))
      && (!filterStatus || w.status === filterStatus);
  });

  const getExpiryInfo = (w: Warranty) => {
    const diff = Math.ceil((new Date(w.expiry_date).getTime() - Date.now()) / 86400000);
    if (w.status === 'claimed') return { label: 'Acionada', color: '#F59E0B' };
    if (diff < 0) return { label: `Venceu há ${Math.abs(diff)}d`, color: '#EF4444' };
    if (diff <= 30) return { label: `Vence em ${diff}d`, color: '#F59E0B' };
    return { label: `${diff}d restantes`, color: '#10B981' };
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>🛡️ Garantias</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{list.length} garantias emitidas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-success">{list.filter(w => w.status === 'active' && w.expiry_date > today).length} ativas</span>
          <span className="badge badge-warning">{list.filter(w => w.status === 'active' && w.expiry_date >= today && w.expiry_date <= in30d).length} vencendo</span>
          <span className="badge badge-danger">{list.filter(w => w.expiry_date < today && w.status === 'active').length} vencidas</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input id="gar-search" type="text" className="form-input" placeholder="🔍 Buscar por produto ou cliente..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <select id="gar-filter-status" className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Produto</th><th>Cliente</th><th>Telefone</th>
            <th style={{ textAlign: 'center' }}>Meses</th><th>Emitida em</th><th>Vencimento</th>
            <th style={{ textAlign: 'center' }}>Situação</th><th style={{ textAlign: 'center' }}>Status</th><th style={{ textAlign: 'center' }}>Ações</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Carregando...</td></tr>
              : !filtered.length ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhuma garantia encontrada</td></tr>
              : filtered.map(w => {
                const exp = getExpiryInfo(w);
                const s = STATUS[w.status as keyof typeof STATUS] || STATUS.active;
                return (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>{w.products?.name || '—'}</td>
                    <td>{w.customers?.name || '—'}</td>
                    <td style={{ color: 'var(--kdl-text-muted)' }}>{w.customers?.phone || '—'}</td>
                    <td style={{ textAlign: 'center' }}><span className="badge badge-info">{w.warranty_months}m</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>{new Date(w.issue_date).toLocaleDateString('pt-BR')}</td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{new Date(w.expiry_date).toLocaleDateString('pt-BR')}</td>
                    <td style={{ textAlign: 'center' }}><span style={{ fontSize: '0.75rem', fontWeight: 700, color: exp.color }}>{exp.label}</span></td>
                    <td style={{ textAlign: 'center' }}><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      {w.status === 'active' && (
                        <button id={`gar-claim-${w.id.slice(0,8)}`} className="btn btn-danger btn-sm" onClick={() => openClaim(w)}>⚡ Acionar</button>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
