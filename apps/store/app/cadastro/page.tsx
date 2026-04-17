'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const PLANS: Record<string, { name: string; price: string; color: string }> = {
  starter: { name: 'Starter', price: 'R$49,90/mês', color: '#6C47FF' },
  pro: { name: 'Pro', price: 'R$69,90/mês', color: '#00D4AA' },
  premium: { name: 'Premium', price: 'R$99,90/mês', color: '#FF6B47' },
};

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plano') || 'starter';
  const plan = PLANS[planId] || PLANS.starter;

  const [step, setStep] = useState<'info' | 'pagamento'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    storeName: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setError('');
    setStep('pagamento');
  }

  async function handleCheckout() {
    setLoading(true);
    setError('');

    const supabase = createClient();
    // 1. Cria usuário no Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          store_name: form.storeName,
          plan_id: planId,
        },
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Erro ao criar conta. Tente novamente.');
      setLoading(false);
      return;
    }

    // 2. Chama API para criar sessão Stripe Checkout
    try {
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: data.user.id }),
      });
      const checkoutData = await checkoutRes.json();

      if (checkoutData.url) {
        window.location.href = checkoutData.url; // Redireciona para o Stripe
      } else {
        setError(checkoutData.error || 'Erro ao iniciar pagamento.');
        setLoading(false);
      }
    } catch (err) {
      setError('Falha na comunicação com servidor de pagamento.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-card animate-slide-up" style={{ maxWidth: 480 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6C47FF, #00D4AA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 16,
          }}
        >K</div>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18 }}>
          KDL <span className="text-gradient">Store</span>
        </span>
      </div>

      {/* Plan badge */}
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '0.375rem 0.875rem', borderRadius: 8, marginBottom: '1.5rem',
          background: `${plan.color}15`, border: `1px solid ${plan.color}30`, color: plan.color,
          fontSize: '0.8rem', fontWeight: 700,
        }}
      >
        <span>Plano {plan.name}</span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span>{plan.price}</span>
      </div>

      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        {step === 'info' ? 'Crie sua conta' : 'Finalizar pagamento'}
      </h1>
      <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
        {step === 'info' ? 'Preencha os dados da sua loja' : 'Confirme os dados e pague'}
      </p>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {['Dados', 'Pagamento'].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i === 0 || step === 'pagamento'
                ? 'linear-gradient(90deg, #6C47FF, #00D4AA)'
                : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}

      {step === 'info' ? (
        <form onSubmit={handleInfoSubmit} id="cadastro-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cad-name">Seu nome</label>
              <input id="cad-name" type="text" className="form-input" placeholder="João Silva" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cad-phone">Telefone</label>
              <input id="cad-phone" type="tel" className="form-input" placeholder="(11) 99999-9999" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cad-store">Nome da loja</label>
            <input id="cad-store" type="text" className="form-input" placeholder="Ex: Auto Som Central" value={form.storeName} onChange={e => update('storeName', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cad-email">Email</label>
            <input id="cad-email" type="email" className="form-input" placeholder="seu@email.com" value={form.email} onChange={e => update('email', e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cad-password">Senha</label>
            <input id="cad-password" type="password" className="form-input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => update('password', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cad-confirm">Confirmar senha</label>
            <input id="cad-confirm" type="password" className="form-input" placeholder="Repita a senha" value={form.confirm} onChange={e => update('confirm', e.target.value)} required />
          </div>
          <button id="cadastro-next" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
            Continuar para pagamento →
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary */}
          <div className="card" style={{ background: 'var(--kdl-surface-2)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--kdl-text-muted)', marginBottom: 8 }}>Resumo do pedido</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>KDL Store — Plano {plan.name}</span>
              <span style={{ fontWeight: 700, color: plan.color }}>{plan.price}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--kdl-text-muted)' }}>
              {form.storeName} · {form.email}
            </div>
          </div>

          <div className="alert alert-info">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <span>Você será redirecionado para o Stripe Checkout para completar o pagamento com segurança.</span>
          </div>

          <button
            id="cadastro-pay"
            type="button"
            className="btn btn-primary"
            onClick={handleCheckout}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            {loading ? (
              <><svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg> Processando...</>
            ) : '🔒 Pagar com cartão'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep('info')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ← Voltar
          </button>
        </div>
      )}

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--kdl-text-muted)' }}>
        Já tem conta?{' '}
        <a href="/login" style={{ color: 'var(--kdl-primary-light)', textDecoration: 'none', fontWeight: 600 }}>
          Entrar
        </a>
      </p>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <div className="auth-page">
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(108,71,255,0.15) 0%, transparent 70%)',
        }}
      />
      <Suspense fallback={<div className="auth-card animate-slide-up" style={{ maxWidth: 480, padding: 40, textAlign: 'center' }}>Carregando...</div>}>
        <CadastroForm />
      </Suspense>
    </div>
  );
}
