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
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(10, 10, 15, 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 2rem',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <a href="/" id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6C47FF, #00C6A2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 4px 14px rgba(108,71,255,0.3)',
          }}>K</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: 'rgba(255,255,255,0.9)' }}>
            KDL <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Store</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-desktop">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} style={{
              fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none', transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="nav-desktop">
          <a href={`${storeUrl}/login`} style={{
            fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none', transition: 'color 0.2s ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            Entrar
          </a>
          <a href="#planos" style={{ background: 'linear-gradient(135deg, #6C47FF, #00D4AA)', color: 'white', padding: '0.6rem 1.3rem', fontSize: '0.875rem', borderRadius: 100, textDecoration: 'none', fontWeight: 600 }}>
            Começar agora
          </a>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#16113A', padding: 4 }}
          className="nav-mobile-btn">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(245,244,255,0.98)', borderTop: '1px solid rgba(108,71,255,0.1)',
          padding: '1.5rem 2rem',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: '1rem', fontWeight: 500, color: '#6B6A8A', textDecoration: 'none' }}>
                {link.label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href={`${storeUrl}/login`} style={{
              textAlign: 'center', padding: '0.75rem', border: '1.5px solid rgba(22,17,58,0.1)',
              borderRadius: 12, color: '#16113A', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
            }}>Entrar</a>
            <a href="#planos" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center' }}>
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
