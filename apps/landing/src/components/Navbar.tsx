'use client';

import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Para quem é?', href: '#paraquem' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A navbar começa transparente sobre o hero escuro, e vira branca ao sair do hero
  const isLight = scrolled;

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: isLight ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: isLight ? 'blur(20px)' : 'none',
      borderBottom: isLight ? '1px solid #E0DDD5' : '1px solid transparent',
      transition: 'all 0.4s ease',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 2rem',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <a href="/" id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#1C3D2E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'Georgia, serif',
          }}>K</div>
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.15rem', color: isLight ? '#111' : 'rgba(255,255,255,0.95)' }}>
            KDL <span style={{ color: '#1C3D2E' }}>Store</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-desktop">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} style={{
              fontSize: '0.9rem', fontWeight: 500,
              color: isLight ? '#555' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none', transition: 'color 0.2s ease',
              fontFamily: 'Inter, sans-serif',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = isLight ? '#111' : 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = isLight ? '#555' : 'rgba(255,255,255,0.7)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="nav-desktop">
          <a href={`${storeUrl}/login`} style={{
            fontSize: '0.875rem', fontWeight: 500,
            color: isLight ? '#555' : 'rgba(255,255,255,0.7)',
            textDecoration: 'none', transition: 'color 0.2s ease',
            fontFamily: 'Inter, sans-serif',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = isLight ? '#111' : 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = isLight ? '#555' : 'rgba(255,255,255,0.7)')}
          >
            Entrar
          </a>
          <a href="#planos" style={{
            background: '#1C3D2E', color: 'white',
            padding: '0.6rem 1.4rem', fontSize: '0.875rem',
            borderRadius: 100, textDecoration: 'none',
            fontWeight: 600, fontFamily: 'Inter, sans-serif',
            transition: 'background 0.2s ease',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2A5C42'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1C3D2E'; }}
          >
            Começar agora
          </a>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: isLight ? '#111' : 'white', padding: 4 }}
          className="nav-mobile-btn">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(255,255,255,0.98)', borderTop: '1px solid #E0DDD5',
          padding: '1.5rem 2rem',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: '1rem', fontWeight: 500, color: '#555', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
                {link.label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href={`${storeUrl}/login`} style={{
              textAlign: 'center', padding: '0.75rem', border: '1px solid #E0DDD5',
              borderRadius: 999, color: '#333', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
            }}>Entrar</a>
            <a href="#planos" onClick={() => setMobileOpen(false)} style={{
              textAlign: 'center', padding: '0.75rem',
              background: '#1C3D2E', color: 'white',
              borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
            }}>
              Começar agora
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
