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

  type DiscountRule = { id: string; name: string; min_qty: number | null; min_amount: number | null; discount_pct: number; is_active: boolean };

  const [tab, setTab]           = useState<'loja' | 'usuarios' | 'descontos' | 'assinatura'>('loja');
  const [tenant, setTenant]     = useState<{ name: string; slug: string } | null>(null);
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [planInfo, setPlanInfo] = useState<{ name: string; price: number; status: string } | null>(null);
  const [saving, setSaving]     = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', slug: '', whatsapp: '' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'seller', password: '' });
  const [savedMsg, setSavedMsg] = useState('');
  const [userError, setUserError] = useState('');

  // Desconto progressivo
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);
  const [savingRule, setSavingRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: '', min_qty: '', min_amount: '', discount_pct: '' });

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const [tenantRes, usersRes, rulesRes] = await Promise.all([
        supabase.from('tenants')
          .select('name, slug, whatsapp, status, plans(name, price_monthly)')
          .eq('id', tenantId)
          .single(),
        supabase.from('users')
          .select('id, name, email, role, is_active')
          .eq('tenant_id', tenantId)
          .order('name'),
        supabase.from('discount_rules')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('min_amount', { ascending: true }),
      ]);

      if (tenantRes.data) {
        const t = tenantRes.data as any;
        const p = t.plans;
        setTenant({ name: t.name, slug: t.slug });
        setStoreForm({ name: t.name || '', slug: t.slug || '', whatsapp: t.whatsapp || '' });
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
      setDiscountRules(rulesRes.data || []);
    }
    load();
  }, [tenantId]);

  async function saveTenant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('tenants').update({ name: storeForm.name, whatsapp: storeForm.whatsapp || null }).eq('id', tenantId);
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

  function openNewRule() {
    setEditingRule(null);
    setRuleForm({ name: '', min_qty: '', min_amount: '', discount_pct: '' });
    setShowRuleModal(true);
  }
  function openEditRule(r: DiscountRule) {
    setEditingRule(r);
    setRuleForm({ name: r.name, min_qty: r.min_qty != null ? String(r.min_qty) : '', min_amount: r.min_amount != null ? String(r.min_amount) : '', discount_pct: String(r.discount_pct) });
    setShowRuleModal(true);
  }

  async function saveRule(e: React.FormEvent) {
    e.preventDefault();
    if (!ruleForm.discount_pct || (!ruleForm.min_qty && !ruleForm.min_amount)) {
      alert('Defina ao menos um gatilho (quantidade mínima ou valor mínimo) e o percentual de desconto.');
      return;
    }
    setSavingRule(true);
    const payload: any = {
      name: ruleForm.name.trim() || `Desconto ${ruleForm.discount_pct}%`,
      min_qty: ruleForm.min_qty ? Number(ruleForm.min_qty) : null,
      min_amount: ruleForm.min_amount ? Number(ruleForm.min_amount) : null,
      discount_pct: Number(ruleForm.discount_pct),
      tenant_id: tenantId,
      is_active: true,
    };
    let resultData: any = null;
    let attempts = 0;
    while (!resultData && attempts < 10) {
      attempts++;
      const res = editingRule
        ? await supabase.from('discount_rules').update(payload).eq('id', editingRule.id).select().single()
        : await supabase.from('discount_rules').insert(payload).select().single();
      if (res.error) {
        const col = res.error.message.match(/'([^']+)' column/)?.[1];
        if (col) { delete payload[col]; continue; }
        alert('Erro: ' + res.error.message);
        setSavingRule(false);
        return;
      }
      resultData = res.data;
    }
    if (resultData) {
      if (editingRule) setDiscountRules(prev => prev.map(r => r.id === resultData.id ? resultData : r));
      else setDiscountRules(prev => [...prev, resultData].sort((a, b) => (a.min_amount || 0) - (b.min_amount || 0)));
    }
    setSavingRule(false);
    setShowRuleModal(false);
  }

  async function toggleRule(r: DiscountRule) {
    await supabase.from('discount_rules').update({ is_active: !r.is_active }).eq('id', r.id);
    setDiscountRules(prev => prev.map(x => x.id === r.id ? { ...x, is_active: !r.is_active } : x));
  }

  async function deleteRule(r: DiscountRule) {
    if (!confirm(`Remover a regra "${r.name}"?`)) return;
    await supabase.from('discount_rules').delete().eq('id', r.id);
    setDiscountRules(prev => prev.filter(x => x.id !== r.id));
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>⚙️ Configurações</h1>
        <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Gerencie sua loja, usuários e assinatura</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {(['loja', 'usuarios', 'descontos', 'assinatura'] as const).map(t => (
          <button
            key={t}
            id={`cfg-tab-${t}`}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t === 'loja' ? '🏪 Loja' : t === 'usuarios' ? '👥 Usuários' : t === 'descontos' ? '🏷️ Descontos' : '💳 Assinatura'}
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
            <div className="form-group">
              <label className="form-label" htmlFor="loja-whatsapp">WhatsApp da loja</label>
              <input
                id="loja-whatsapp"
                type="tel"
                className="form-input"
                value={storeForm.whatsapp}
                onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value }))}
                placeholder="Ex: 5511999999999 (com DDI e DDD)"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-dim)', marginTop: 4 }}>Usado para gerar links de contato no sistema.</p>
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

      {/* Aba Descontos */}
      {tab === 'descontos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>Regras de desconto automático aplicadas no PDV quando o carrinho atinge o gatilho.</p>
            </div>
            <button className="btn btn-primary" onClick={openNewRule}>+ Nova Regra</button>
          </div>
          {!discountRules.length ? (
            <div className="empty-state">
              <span style={{ fontSize: '2.5rem' }}>🏷️</span>
              <p>Nenhuma regra cadastrada.</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--kdl-text-muted)' }}>Ex: Compras acima de R$200 ganham 10% de desconto automático.</p>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={openNewRule}>Criar primeira regra</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Nome</th><th>Gatilho</th><th style={{ textAlign: 'right' }}>Desconto</th><th style={{ textAlign: 'center' }}>Status</th><th style={{ textAlign: 'center' }}>Ações</th></tr></thead>
                <tbody>
                  {discountRules.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>
                        {r.min_amount != null && `Subtotal ≥ ${r.min_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                        {r.min_qty != null && `${r.min_qty ? (r.min_amount != null ? ' · ' : '') : ''}Qtd ≥ ${r.min_qty} itens`}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#00D4AA' }}>{r.discount_pct}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${r.is_active ? 'badge-success' : 'badge-gray'}`}>{r.is_active ? 'Ativa' : 'Inativa'}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditRule(r)}>✏️</button>
                          <button className={`btn btn-sm ${r.is_active ? 'btn-secondary' : 'btn-success'}`} onClick={() => toggleRule(r)}>{r.is_active ? 'Pausar' : 'Ativar'}</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteRule(r)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showRuleModal && (
            <div className="modal-overlay" onClick={() => setShowRuleModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editingRule ? 'Editar Regra' : 'Nova Regra de Desconto'}</h2>
                <form onSubmit={saveRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nome da Regra</label>
                    <input type="text" className="form-input" value={ruleForm.name} onChange={e => setRuleForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Desconto atacado, Promoção fim de semana..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Valor mínimo do carrinho (R$)</label>
                      <input type="number" min={0} step={0.01} className="form-input" value={ruleForm.min_amount} onChange={e => setRuleForm(f => ({ ...f, min_amount: e.target.value }))} placeholder="Ex: 200.00" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ou quantidade mínima (itens)</label>
                      <input type="number" min={1} className="form-input" value={ruleForm.min_qty} onChange={e => setRuleForm(f => ({ ...f, min_qty: e.target.value }))} placeholder="Ex: 5" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Percentual de desconto (%) *</label>
                    <input type="number" min={0.01} max={100} step={0.01} className="form-input" value={ruleForm.discount_pct} onChange={e => setRuleForm(f => ({ ...f, discount_pct: e.target.value }))} placeholder="Ex: 10" required />
                  </div>
                  {ruleForm.discount_pct && (ruleForm.min_amount || ruleForm.min_qty) && (
                    <div className="alert alert-info">
                      💡 {ruleForm.min_amount ? `Carrinho ≥ R$ ${ruleForm.min_amount}` : ''}{ruleForm.min_amount && ruleForm.min_qty ? ' ou ' : ''}{ruleForm.min_qty ? `${ruleForm.min_qty} ou mais itens` : ''} → <strong>{ruleForm.discount_pct}% de desconto automático no PDV</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowRuleModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={savingRule}>{savingRule ? 'Salvando...' : editingRule ? 'Salvar' : 'Criar Regra'}</button>
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

              <button
                id="subscription-portal-btn"
                className="btn btn-secondary"
                style={{ justifyContent: 'center' }}
                disabled={portalLoading}
                onClick={async () => {
                  setPortalLoading(true);
                  try {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' });
                    const json = await res.json();
                    if (json.url) window.location.href = json.url;
                    else alert(json.error || 'Erro ao abrir portal');
                  } catch { alert('Erro de comunicação'); }
                  setPortalLoading(false);
                }}
              >
                {portalLoading ? 'Abrindo...' : '🔗 Gerenciar assinatura no Stripe'}
              </button>

              <a
                href={`${process.env.NEXT_PUBLIC_LANDING_URL || 'https://kdlstore.com.br'}#planos`}
                target="_blank"
                rel="noopener noreferrer"
                id="upgrade-btn"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >⬆️ Fazer upgrade de plano</a>

              <p style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--kdl-border)', paddingTop: '0.75rem' }}>
                Pelo portal do Stripe você pode <strong>alterar o método de pagamento</strong>, visualizar faturas, <strong>cancelar</strong> ou <strong>reativar</strong> sua assinatura. Após o cancelamento, o acesso é mantido até o fim do período pago. Para reativar, basta acessar o portal antes do encerramento.
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--kdl-text-muted)' }}>Carregando dados da assinatura...</p>
          )}
        </div>
      )}
    </div>
  );
}
