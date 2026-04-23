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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F7F6F2',
      padding: '1.5rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="animate-slide-up" style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 24,
        padding: '3rem',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 40px rgba(0,0,0,0.04)'
      }}>
        {/* Logo Landing */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <a href="https://kdlstore.com.br" style={{
            fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700,
            letterSpacing: '0.02em', color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem'
          }}>
            <div style={{ width: 36, height: 36, background: '#1C3D2E', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>K</div>
            KDL Store
          </a>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
            Bem-vindo de volta
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Entre na sua conta para continuar
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FFE4E6', color: '#E11D48', padding: '0.875rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#1C3D2E'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }} htmlFor="login-password">Senha</label>
              <a href="/esqueci-senha" style={{ fontSize: '0.8rem', color: '#1C3D2E', textDecoration: 'none', fontWeight: 500 }}>
                Esqueci a senha
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%', padding: '0.875rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#111', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#1C3D2E'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: '#1C3D2E', color: 'white', padding: '1rem', borderRadius: 12, fontWeight: 600, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#2A5C42'; }}
            onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#1C3D2E'; }}
          >
            {loading ? (
              <>
                <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          Não tem conta?{' '}
          <a href="/cadastro" style={{ color: '#1C3D2E', textDecoration: 'none', fontWeight: 600 }}>
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}
