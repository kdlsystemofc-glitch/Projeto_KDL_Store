'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Transaction = { id: string; type: 'in' | 'out'; amount: number; description: string; created_at: string; reference_type: string };
type Payable = { id: string; description: string; category: string; amount: number; due_date: string; paid_at: string | null; status: string };
type Receivable = { id: string; amount: number; due_date: string; paid_at: string | null; status: string; installment_number: number; customers: { name: string } | null };

export default function FinanceiroPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<'caixa' | 'pagar' | 'receber'>('caixa');
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payables, setPayables]         = useState<Payable[]>([]);
  const [receivables, setReceivables]   = useState<Receivable[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState('');
  const [payForm, setPayForm] = useState({ description: '', category: 'other', amount: 0, due_date: '' });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud) return;
      setTenantId(ud.tenant_id);
      const [tx, pay, rec] = await Promise.all([
        supabase.from('cash_transactions').select('*').eq('tenant_id', ud.tenant_id).order('created_at', { ascending: false }).limit(50),
        supabase.from('accounts_payable').select('*').eq('tenant_id', ud.tenant_id).order('due_date'),
        supabase.from('accounts_receivable').select('*, customers(name)').eq('tenant_id', ud.tenant_id).order('due_date'),
      ]);
      setTransactions(tx.data || []);
      setPayables(pay.data || []);
      setReceivables(rec.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const totalIn  = transactions.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const balance  = totalIn - totalOut;
  const pendingPay = payables.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const pendingRec = receivables.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);

  async function markPaid(type: 'pay' | 'rec', id: string) {
    const table = type === 'pay' ? 'accounts_payable' : 'accounts_receivable';
    await supabase.from(table).update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
    if (type === 'pay') setPayables(prev => prev.map(p => p.id === id ? { ...p, status: 'paid', paid_at: new Date().toISOString() } : p));
    else setReceivables(prev => prev.map(r => r.id === id ? { ...r, status: 'paid', paid_at: new Date().toISOString() } : r));
  }

  async function savePayable(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('accounts_payable').insert({ ...payForm, amount: Number(payForm.amount), tenant_id: tenantId, status: 'pending' }).select().single();
    if (data) setPayables(prev => [...prev, data]);
    setSaving(false); setShowPayModal(false);
    setPayForm({ description: '', category: 'other', amount: 0, due_date: '' });
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>💰 Financeiro</h1>
        <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Controle de caixa, contas a pagar e receber</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Saldo em Caixa', value: fmt(balance), color: balance >= 0 ? '#00D4AA' : '#EF4444', icon: '💵' },
          { label: 'Total Entradas', value: fmt(totalIn), color: '#10B981', icon: '📈' },
          { label: 'Total Saídas',   value: fmt(totalOut), color: '#EF4444', icon: '📉' },
          { label: 'A Pagar',        value: fmt(pendingPay), color: '#F59E0B', icon: '📤' },
          { label: 'A Receber',      value: fmt(pendingRec), color: '#6C47FF', icon: '📥' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--kdl-text-muted)' }}>{s.label}</p>
              <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs and Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', alignItems: 'center' }}>
        {(['caixa', 'pagar', 'receber'] as const).map(t => (
          <button key={t} id={`fin-tab-${t}`} onClick={() => { setTab(t); setSearch(''); }} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>
            {t === 'caixa' ? '💵 Fluxo de Caixa' : t === 'pagar' ? '📤 Contas a Pagar' : '📥 Contas a Receber'}
          </button>
        ))}
        {tab !== 'caixa' && (
          <input type="text" className="form-input" placeholder={tab === 'pagar' ? '🔍 Buscar conta ou categoria...' : '🔍 Buscar cliente...'} value={search} onChange={e => setSearch(e.target.value)} style={{ marginLeft: '1rem', maxWidth: 300 }} />
        )}
        {tab === 'pagar' && <button id="fin-add-pay" className="btn btn-secondary" onClick={() => setShowPayModal(true)} style={{ marginLeft: 'auto' }}>+ Adicionar Conta</button>}
      </div>

      {/* Caixa */}
      {tab === 'caixa' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Referência</th><th style={{ textAlign: 'right' }}>Valor</th></tr></thead>
            <tbody>
              {!transactions.length ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhuma transação registrada</td></tr>
                : transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>{t.description}</td>
                    <td><span className={`badge ${t.type === 'in' ? 'badge-success' : 'badge-danger'}`}>{t.type === 'in' ? '↑ Entrada' : '↓ Saída'}</span></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>{t.reference_type || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'in' ? '#10B981' : '#EF4444' }}>
                      {t.type === 'in' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* A Pagar */}
      {tab === 'pagar' && (() => {
        const filteredPayables = payables.filter(p => !search || p.description.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
        return (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Descrição</th><th>Categoria</th><th>Vencimento</th><th style={{ textAlign: 'right' }}>Valor</th><th style={{ textAlign: 'center' }}>Status</th><th style={{ textAlign: 'center' }}>Ação</th></tr></thead>
              <tbody>
                {!filteredPayables.length ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>{search ? 'Nenhuma conta encontrada' : 'Nenhuma conta a pagar'}</td></tr>
                  : filteredPayables.map(p => {
                    const overdue = p.status === 'pending' && p.due_date < today;
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.description}</td>
                        <td><span className="badge badge-gray">{p.category}</span></td>
                        <td style={{ fontSize: '0.85rem', color: overdue ? '#EF4444' : 'var(--kdl-text-muted)', fontWeight: overdue ? 700 : 400 }}>{new Date(p.due_date).toLocaleDateString('pt-BR')}{overdue ? ' ⚠️' : ''}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#EF4444' }}>{fmt(p.amount)}</td>
                        <td style={{ textAlign: 'center' }}><span className={`badge ${p.status === 'paid' ? 'badge-success' : overdue ? 'badge-danger' : 'badge-warning'}`}>{p.status === 'paid' ? 'Pago' : overdue ? 'Atrasado' : 'Pendente'}</span></td>
                        <td style={{ textAlign: 'center' }}>{p.status === 'pending' && <button id={`pay-${p.id.slice(0,8)}`} className="btn btn-success btn-sm" onClick={() => markPaid('pay', p.id)} title="Marcar como pago">✓ Pagar</button>}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* A Receber */}
      {tab === 'receber' && (() => {
        const filteredReceivables = receivables.filter(r => !search || r.customers?.name.toLowerCase().includes(search.toLowerCase()));
        return (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Cliente</th><th style={{ textAlign: 'center' }}>Parcela</th><th>Vencimento</th><th style={{ textAlign: 'right' }}>Valor</th><th style={{ textAlign: 'center' }}>Status</th><th style={{ textAlign: 'center' }}>Ação</th></tr></thead>
              <tbody>
                {!filteredReceivables.length ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>{search ? 'Nenhuma conta encontrada' : 'Nenhuma conta a receber'}</td></tr>
                  : filteredReceivables.map(r => {
                    const overdue = r.status === 'pending' && r.due_date < today;
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.customers?.name || '—'}</td>
                        <td style={{ textAlign: 'center' }}><span className="badge badge-gray">#{r.installment_number}</span></td>
                        <td style={{ fontSize: '0.85rem', color: overdue ? '#EF4444' : 'var(--kdl-text-muted)', fontWeight: overdue ? 700 : 400 }}>{new Date(r.due_date).toLocaleDateString('pt-BR')}{overdue ? ' ⚠️' : ''}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#6C47FF' }}>{fmt(r.amount)}</td>
                        <td style={{ textAlign: 'center' }}><span className={`badge ${r.status === 'paid' ? 'badge-success' : overdue ? 'badge-danger' : 'badge-warning'}`}>{r.status === 'paid' ? 'Recebido' : overdue ? 'Atrasado' : 'Pendente'}</span></td>
                        <td style={{ textAlign: 'center' }}>{r.status === 'pending' && <button id={`rec-${r.id.slice(0,8)}`} className="btn btn-primary btn-sm" onClick={() => markPaid('rec', r.id)} title="Marcar como recebido">✓ Receber</button>}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Add payable modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>Nova Conta a Pagar</h2>
            <form onSubmit={savePayable} id="payable-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label" htmlFor="pay-desc">Descrição *</label><input id="pay-desc" type="text" className="form-input" value={payForm.description} onChange={e => setPayForm(f => ({ ...f, description: e.target.value }))} required placeholder="Ex: Aluguel de março" /></div>
              <div className="form-group">
                <label className="form-label" htmlFor="pay-cat">Categoria</label>
                <select id="pay-cat" className="form-select" value={payForm.category} onChange={e => setPayForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="rent">Aluguel</option>
                  <option value="utilities">Água/Luz/Internet</option>
                  <option value="supplier">Fornecedor</option>
                  <option value="salary">Salário</option>
                  <option value="tax">Impostos</option>
                  <option value="other">Outros</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label" htmlFor="pay-amount">Valor (R$) *</label><input id="pay-amount" type="number" min={0} step={0.01} className="form-input" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))} required /></div>
              <div className="form-group"><label className="form-label" htmlFor="pay-due">Vencimento *</label><input id="pay-due" type="date" className="form-input" value={payForm.due_date} onChange={e => setPayForm(f => ({ ...f, due_date: e.target.value }))} required /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Cancelar</button>
                <button id="payable-save" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
