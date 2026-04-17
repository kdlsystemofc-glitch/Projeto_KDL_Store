'use client';

import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Parallax sutil: image move up slightly
      el.style.transform = `translateY(${scrollY * 0.12}px) scale(${1 + scrollY * 0.00015})`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'var(--kdl-bg)',
      }}
    >
      {/* Background glows */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(108,71,255,0.18) 0%, transparent 65%), radial-gradient(ellipse 60% 60% at 30% 80%, rgba(0,212,170,0.10) 0%, transparent 60%)',
        }}
      />

      {/* Grid pattern */}
      <div
        className="grid-pattern"
        style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }}
      />

      {/* Main content */}
      <div
        style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 2rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          alignItems: 'center', gap: '4rem', width: '100%',
          paddingTop: '5rem',
        }}
        className="hero-grid"
      >
        {/* Left — copy */}
        <div style={{ position: 'relative', zIndex: 2 }} className="animate-fade-in-up">
          {/* Label */}
          <div className="section-label" style={{ marginBottom: '1.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4AA', display: 'inline-block' }} />
            Sistema completo para lojistas
          </div>

          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: '1.5rem',
              color: '#F4F4FF',
            }}
          >
            Sua loja,{' '}
            <span className="text-gradient">do jeito<br />certo</span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.75,
              color: 'rgba(244,244,255,0.6)',
              maxWidth: 480,
              marginBottom: '2.5rem',
            }}
          >
            Estoque, PDV, garantias digitais, clientes, financeiro e muito mais — tudo integrado para pequenas lojas que querem crescer com profissionalismo.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <a href="#planos" className="btn-primary" id="hero-cta-primary">
              Começar agora
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#funcionalidades" className="btn-secondary" id="hero-cta-secondary">
              Ver funcionalidades
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', marginRight: 4 }}>
              {['#6C47FF', '#00D4AA', '#FF6B47', '#FFD447'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${c}cc, ${c})`,
                    border: '2px solid #0A0A0F',
                    marginLeft: i === 0 ? 0 : -10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}
                >
                  {['L', 'V', 'M', 'A'][i]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: '#F4F4FF', fontWeight: 700 }}>+500 lojistas</span> já usam o KDL Store
            </p>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex', gap: '2rem', marginTop: '3rem',
              paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {[
              { value: '100%', label: 'na nuvem' },
              { value: '< 2min', label: 'para configurar' },
              { value: '24/7', label: 'disponível' },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#F4F4FF' }}>{s.value}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(244,244,255,0.4)', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — 3D illustration */}
        <div
          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Glow behind image */}
          <div
            style={{
              position: 'absolute', width: '80%', height: '80%',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(108,71,255,0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div
            ref={imgRef}
            style={{
              position: 'relative', zIndex: 1,
              width: '100%', maxWidth: 580,
              willChange: 'transform',
              animation: 'float 6s ease-in-out infinite',
            }}
          >
            {/* Floating badges */}
            <div
              style={{
                position: 'absolute', top: '10%', left: '-5%',
                background: 'rgba(10,10,15,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(108,71,255,0.3)',
                borderRadius: 14, padding: '0.75rem 1.25rem',
                zIndex: 10, animation: 'float 4s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            >
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Vendas hoje</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#00D4AA' }}>R$ 3.847,00</p>
            </div>

            <div
              style={{
                position: 'absolute', bottom: '15%', right: '-5%',
                background: 'rgba(10,10,15,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,212,170,0.3)',
                borderRadius: 14, padding: '0.75rem 1.25rem',
                zIndex: 10, animation: 'float 5s ease-in-out infinite',
                animationDelay: '1s',
              }}
            >
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Produtos ativos</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#6C47FF' }}>247 itens</p>
            </div>

            <div
              style={{
                position: 'absolute', top: '45%', right: '-8%',
                background: 'rgba(10,10,15,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,107,71,0.3)',
                borderRadius: 14, padding: '0.6rem 1rem',
                zIndex: 10, animation: 'float 4.5s ease-in-out infinite',
                animationDelay: '1.5s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                <p style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>Garantia emitida</p>
              </div>
            </div>

            <img
              src="/hero-3d.png"
              alt="KDL Store — sistema de gestão para lojistas"
              style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 2 }}
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}
      >
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
          Role para ver mais
        </p>
        <div
          style={{
            width: 20, height: 32, borderRadius: 10,
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4,
          }}
        >
          <div
            style={{
              width: 4, height: 8, borderRadius: 2,
              background: 'rgba(255,255,255,0.35)',
              animation: 'scrollDot 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; padding-top: 6rem !important; }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
