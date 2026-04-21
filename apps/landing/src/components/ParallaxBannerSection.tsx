'use client';

import { useEffect, useRef } from 'react';

// Seção tipo Ascone: banner full-width com parallax scroll e números de impacto
export default function ParallaxBannerSection() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current) return;
      const section = bgRef.current.closest('section') as HTMLElement;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = (viewH - rect.top) / (viewH + rect.height);
      // Parallax: a imagem se move mais devagar que o scroll
      const offset = (progress - 0.5) * 120;
      bgRef.current.style.transform = `translateY(${offset}px) scale(1.15)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const STATS = [
    { value: '500+', label: 'Lojas ativas no Brasil' },
    { value: '98%', label: 'Satisfação dos clientes' },
    { value: '3min', label: 'Para fazer sua primeira venda' },
    { value: '24/7', label: 'Sistema sempre disponível' },
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', height: 520 }}>
      {/* Imagem de fundo com parallax — gradiente verde rico estilo seda */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: '-15%',
          background: `
            radial-gradient(ellipse at 20% 50%, #0d4a2a 0%, transparent 60%),
            radial-gradient(ellipse at 80% 30%, #1a5c35 0%, transparent 55%),
            radial-gradient(ellipse at 50% 80%, #0a3520 0%, transparent 50%),
            linear-gradient(135deg, #0d3d22 0%, #1C3D2E 30%, #2d6b45 60%, #1a4f30 100%)
          `,
          backgroundSize: '100% 100%',
          transition: 'transform 0.05s linear',
          // Textura de seda com pseudo-reflexos via múltiplos gradientes
          backgroundImage: `
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 60px,
              rgba(255,255,255,0.015) 60px,
              rgba(255,255,255,0.015) 120px
            ),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 80px,
              rgba(255,255,255,0.01) 80px,
              rgba(255,255,255,0.01) 160px
            ),
            radial-gradient(ellipse at 15% 60%, rgba(45,107,69,0.8) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 20%, rgba(26,92,53,0.7) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 90%, rgba(10,53,32,0.9) 0%, transparent 45%),
            linear-gradient(135deg, #0a3520 0%, #1C3D2E 35%, #2A5C42 65%, #163a26 100%)
          `,
        }}
      />

      {/* Overlay para texto legível */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10,40,22,0.35)',
      }} />

      {/* Conteúdo */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto', padding: '0 2rem',
        height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem', fontWeight: 600,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)', marginBottom: '3rem',
        }}>
          Números que falam por si
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
        }}>
          {STATS.map((stat, i) => (
            <div key={i}>
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 700, color: '#fff',
                lineHeight: 1, marginBottom: '0.75rem',
                letterSpacing: '-0.02em',
              }}>
                {stat.value}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.5,
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #parallax-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
