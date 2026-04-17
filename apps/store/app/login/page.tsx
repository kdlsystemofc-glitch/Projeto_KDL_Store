'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email ou senha incorretos. Tente novamente.');
      setLoading(false);
    } else {
      router.push('/app/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="auth-page">
      {/* Background glow */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(108,71,255,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="auth-card animate-slide-up">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6C47FF, #00D4AA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 16,
              fontFamily: 'Outfit, sans-serif',
            }}
          >K</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18 }}>
            KDL <span className="text-gradient">Store</span>
          </span>
        </div>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Bem-vindo de volta
        </h1>
        <p style={{ color: 'var(--kdl-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Entre na sua conta para continuar
        </p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Senha</label>
              <a href="/esqueci-senha" style={{ fontSize: '0.75rem', color: 'var(--kdl-primary-light)', textDecoration: 'none' }}>
                Esqueci a senha
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--kdl-text-muted)' }}>
          Não tem conta?{' '}
          <a href="https://kdlstore.com.br#planos" style={{ color: 'var(--kdl-primary-light)', textDecoration: 'none', fontWeight: 600 }}>
            Assinar um plano
          </a>
        </p>
      </div>
    </div>
  );
}
