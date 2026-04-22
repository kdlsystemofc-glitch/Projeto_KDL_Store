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
    <div className="animate-slide-up" style={{
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: 24,
      padding: '3rem',
      width: '100%',
      maxWidth: 520,
      boxShadow: '0 20px 40px rgba(0,0,0,0.04)'
    }}>
      {/* Logo Landing */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <a href="https://kdlstore.com.br" style={{
          fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700,
          letterSpacing: '0.02em', color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <div style={{ width: 36, height: 36, background: '#1C3D2E', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>K</div>
          KDL Store
        </a>
      </div>

      {/* Plan badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.4rem 1rem', borderRadius: 100,
            background: 'rgba(28,61,46,0.05)', color: '#1C3D2E',
            border: '1px solid rgba(28,61,46,0.1)',
            fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          <span>Plano {plan.name}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{plan.price}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
          {step === 'info' ? 'Crie sua conta' : 'Finalizar pagamento'}
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem' }}>
          {step === 'info' ? 'Preencha os dados da sua loja' : 'Confirme os dados e pague'}
        </p>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {['Dados', 'Pagamento'].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i === 0 || step === 'pagamento'
                ? '#1C3D2E'
                : '#eee',
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FFE4E6', color: '#E11D48', padding: '0.875rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          {error}
        </div>
      )}

      {step === 'info' ? (
        <form onSubmit={handleInfoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="cad-name">Seu nome</label>
              <input id="cad-name" type="text" placeholder="João Silva" value={form.name} onChange={e => update('name', e.target.value)} required style={{ width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1C3D2E'} onBlur={e => e.target.style.borderColor = '#ddd'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="cad-phone">Telefone</label>
              <input id="cad-phone" type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={e => update('phone', e.target.value)} style={{ width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1C3D2E'} onBlur={e => e.target.style.borderColor = '#ddd'} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="cad-store">Nome da loja</label>
            <input id="cad-store" type="text" placeholder="Ex: Auto Som Central" value={form.storeName} onChange={e => update('storeName', e.target.value)} required style={{ width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1C3D2E'} onBlur={e => e.target.style.borderColor = '#ddd'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="cad-email">E-mail</label>
            <input id="cad-email" type="email" placeholder="seu@email.com" value={form.email} onChange={e => update('email', e.target.value)} required autoComplete="email" style={{ width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1C3D2E'} onBlur={e => e.target.style.borderColor = '#ddd'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="cad-password">Senha</label>
            <input id="cad-password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => update('password', e.target.value)} required style={{ width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1C3D2E'} onBlur={e => e.target.style.borderColor = '#ddd'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="cad-confirm">Confirmar senha</label>
            <input id="cad-confirm" type="password" placeholder="Repita a senha" value={form.confirm} onChange={e => update('confirm', e.target.value)} required style={{ width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1C3D2E'} onBlur={e => e.target.style.borderColor = '#ddd'} />
          </div>
          <button type="submit" style={{ width: '100%', background: '#1C3D2E', color: 'white', padding: '1rem', borderRadius: 12, fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2A5C42'} onMouseLeave={e => e.currentTarget.style.background = '#1C3D2E'}>
            Continuar para pagamento →
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary */}
          <div style={{ background: '#F7F6F2', border: '1px solid #eee', borderRadius: 12, padding: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>Resumo do pedido</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#111' }}>KDL Store — Plano {plan.name}</span>
              <span style={{ fontWeight: 700, color: '#1C3D2E' }}>{plan.price}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              {form.storeName} · {form.email}
            </div>
          </div>

          <div style={{ background: '#F0F9FF', border: '1px solid #E0F2FE', color: '#0369A1', padding: '0.875rem', borderRadius: 12, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            <span>Você será redirecionado para o Stripe Checkout para completar o pagamento com segurança.</span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            style={{ width: '100%', background: '#1C3D2E', color: 'white', padding: '1rem', borderRadius: 12, fontWeight: 600, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#2A5C42'; }}
            onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#1C3D2E'; }}
          >
            {loading ? (
              <><svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg> Processando...</>
            ) : '🔒 Pagar com cartão'}
          </button>
          <button
            type="button"
            onClick={() => setStep('info')}
            style={{ width: '100%', background: 'transparent', color: '#666', border: 'none', padding: '1rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >
            ← Voltar
          </button>
        </div>
      )}

      <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
        Já tem conta?{' '}
        <a href="/login" style={{ color: '#1C3D2E', textDecoration: 'none', fontWeight: 600 }}>
          Entrar
        </a>
      </p>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F7F6F2',
      padding: '1.5rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Suspense fallback={<div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 24, padding: '3rem', width: '100%', maxWidth: 520, textAlign: 'center' }}>Carregando...</div>}>
        <CadastroForm />
      </Suspense>
    </div>
  );
}
