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
      // Parallax: a imagem se move
      const offset = (progress - 0.5) * 150;
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
    <section style={{ position: 'relative', overflow: 'hidden', height: 550, background: '#1C3D2E' }}>
      {/* Imagem de fundo com parallax — Imagem real Unsplash (Loja acolhedora / lifestyle) */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: '-15%',
          backgroundImage: 'url("https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.05s linear',
        }}
      />

      {/* Overlay verde escuro para dar contraste e manter a identidade Ascone */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(28,61,46,0.9) 0%, rgba(28,61,46,0.6) 100%)',
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
          fontSize: '0.85rem', fontWeight: 600,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)', marginBottom: '3rem',
        }}>
          Números que falam por si
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
        }} id="parallax-stats-grid">
          {STATS.map((stat, i) => (
            <div key={i}>
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: 700, color: '#fff',
                lineHeight: 1, marginBottom: '0.75rem',
                letterSpacing: '-0.02em',
              }}>
                {stat.value}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem', color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.5, maxWidth: 180,
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
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
