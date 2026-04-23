'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '../context';

type UserRow = { id: string; name: string; email: string; role: string; is_active: boolean };

const ROLES: Record<string, string> = {
  owner:      'Dono',
  manager:    'Gerente',
  seller:     'Vendedor',
  technician: 'Técnico',
};

export default function ConfiguracoesPage() {
  const supabase = createClient();
  const { tenantId } = useTenant();

  const [tab, setTab]           = useState<'loja' | 'usuarios' | 'assinatura'>('loja');
  const [tenant, setTenant]     = useState<{ name: string; slug: string } | null>(null);
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [planInfo, setPlanInfo] = useState<{ name: string; price: number; status: string } | null>(null);
  const [saving, setSaving]     = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', slug: '' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'seller', password: '' });
  const [savedMsg, setSavedMsg] = useState('');
  const [userError, setUserError] = useState('');

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const [tenantRes, usersRes] = await Promise.all([
        supabase.from('tenants')
          .select('name, slug, status, plans(name, price_monthly)')
          .eq('id', tenantId)
          .single(),
        supabase.from('users')
          .select('id, name, email, role, is_active')
          .eq('tenant_id', tenantId)
          .order('name'),
      ]);

      if (tenantRes.data) {
        const t = tenantRes.data as any;
        const p = t.plans;
        setTenant({ name: t.name, slug: t.slug });
        setStoreForm({ name: t.name || '', slug: t.slug || '' });
        setPlanInfo(p ? { name: p.name, price: p.price_monthly, status: t.status } : null);
      }

      if (usersRes.data) {
        setUsers(usersRes.data.map((u: any) => ({
          id: u.id,
          name: u.name || '—',
          email: u.email || '—',
          role: u.role || 'seller',
          is_active: u.is_active ?? true,
        })));
      }
    }
    load();
  }, [tenantId]);

  async function saveTenant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('tenants').update({ name: storeForm.name }).eq('id', tenantId);
    setTenant(t => t ? { ...t, name: storeForm.name } : t);
    setSaving(false);
    setSavedMsg('Salvo com sucesso!');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setUserError('');

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userForm, tenant_id: tenantId }),
      });
      const json = await res.json();

      if (!res.ok) {
        setUserError(json.error || 'Erro ao criar usuário');
        setSaving(false);
        return;
      }

      setUsers(prev => [...prev, json.user].sort((a, b) => a.name.localeCompare(b.name)));
      setShowUserModal(false);
      setUserForm({ name: '', email: '', role: 'seller', password: '' });
    } catch (err: any) {
      setUserError(err.message || 'Erro inesperado');
    }
    setSaving(false);
  }

  async function toggleUser(u: UserRow) {
    const newStatus = !u.is_active;
    const { error } = await supabase.from('users').update({ is_active: newStatus }).eq('id', u.id);
    if (!error) setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: newStatus } : x));
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>⚙️ Configurações</h1>
        <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Gerencie sua loja, usuários e assinatura</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {(['loja', 'usuarios', 'assinatura'] as const).map(t => (
          <button
            key={t}
            id={`cfg-tab-${t}`}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t === 'loja' ? '🏪 Loja' : t === 'usuarios' ? '👥 Usuários' : '💳 Assinatura'}
          </button>
        ))}
      </div>

      {/* Aba Loja */}
      {tab === 'loja' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem', fontSize: '1rem' }}>Dados da Loja</h2>
          <form onSubmit={saveTenant} id="loja-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="loja-name">Nome da loja *</label>
              <input
                id="loja-name"
                type="text"
                className="form-input"
                value={storeForm.name}
                onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="loja-slug">Identificador único (slug)</label>
              <input id="loja-slug" type="text" className="form-input" value={storeForm.slug} disabled style={{ opacity: 0.5 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-dim)', marginTop: 4 }}>O slug não pode ser alterado após o cadastro.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button id="loja-save" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              {savedMsg && <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 600 }}>✅ {savedMsg}</span>}
            </div>
          </form>
        </div>
      )}

      {/* Aba Usuários */}
      {tab === 'usuarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{users.length} usuário(s) cadastrado(s)</p>
            <button id="usr-novo-btn" className="btn btn-primary" onClick={() => { setUserError(''); setShowUserModal(true); }}>
              + Adicionar Usuário
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {!users.length
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--kdl-text-muted)' }}>Nenhum usuário encontrado.</td></tr>
                  : users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--kdl-text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                      <td><span className="badge badge-info">{ROLES[u.role] || u.role}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-gray'}`}>
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {u.role !== 'owner' && (
                          <button
                            className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => toggleUser(u)}
                          >{u.is_active ? 'Desativar' : 'Ativar'}</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {showUserModal && (
            <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>Adicionar Usuário</h2>
                {userError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>⚠️ {userError}</div>
                )}
                <form onSubmit={addUser} id="user-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-name">Nome *</label>
                    <input id="usr-name" type="text" className="form-input" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-email">Email *</label>
                    <input id="usr-email" type="email" className="form-input" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-pass">Senha temporária *</label>
                    <input id="usr-pass" type="password" className="form-input" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-dim)', marginTop: 4 }}>Mínimo 6 caracteres. O usuário poderá alterar após o login.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-role">Perfil de acesso</label>
                    <select id="usr-role" className="form-select" value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
                      {Object.entries(ROLES).filter(([k]) => k !== 'owner').map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancelar</button>
                    <button id="usr-save" type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Criando...' : 'Criar Usuário'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aba Assinatura */}
      {tab === 'assinatura' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem', fontSize: '1rem' }}>Minha Assinatura</h2>
          {planInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--kdl-surface-2)', borderRadius: 10 }}>
                <div>
                  <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>Plano {planInfo.name}</p>
                  <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Cobrança mensal</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', color: '#00D4AA' }}>
                    {planInfo.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <span className={`badge ${planInfo.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {planInfo.status === 'active' ? 'Ativa' : 'Suspensa'}
                  </span>
                </div>
              </div>
              <a
                href="https://billing.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                id="subscription-portal-btn"
                className="btn btn-secondary"
                style={{ justifyContent: 'center' }}
              >🔗 Gerenciar assinatura no Stripe</a>
              <a
                href="https://kdlstore.com.br#planos"
                target="_blank"
                rel="noopener noreferrer"
                id="upgrade-btn"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >⬆️ Fazer upgrade de plano</a>
            </div>
          ) : (
            <p style={{ color: 'var(--kdl-text-muted)' }}>Carregando dados da assinatura...</p>
          )}
        </div>
      )}
    </div>
  );
}
