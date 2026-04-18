'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_SCROLL = 3600; // px de scroll para a animação completa

export default function HeroScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const [viewportH, setViewportH] = useState(900);

  useEffect(() => {
    setViewportH(window.innerHeight);
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Preload do vídeo para garantir o scrubbing suave
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.preload = 'auto';
    }
  }, []);

  // Scroll -> controla o tempo do vídeo
  useEffect(() => {
    function onScroll() {
      const container = containerRef.current;
      const video = videoRef.current;
      if (!container || !video) return;

      // Garante que o vídeo já carregou seus metadados
      if (isNaN(video.duration) || video.duration === 0) return;

      const scrolled = -container.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, scrolled / TOTAL_SCROLL));
      
      const targetTime = progress * video.duration;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        // Atualiza apenas se a diferença for maior que 0.01s para evitar micro-engasgos
        if (Math.abs(video.currentTime - targetTime) > 0.01) {
          video.currentTime = targetTime;
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: `${TOTAL_SCROLL + viewportH}px`, position: 'relative' }}
    >
      {/* Sticky viewport */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>

        {/* Video — cena 3D animada pelo scroll */}
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          muted
          playsInline
          style={{ 
            display: 'block', 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            position: 'absolute', 
            inset: 0 
          }}
        />

        {/* Gradiente sutil para legibilidade do texto (esquerda) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(245,244,255,0.88) 0%, rgba(245,244,255,0.55) 45%, transparent 75%)',
        }} />

        {/* Gradiente suave no topo para a Navbar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 120, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(245,244,255,0.6) 0%, transparent 100%)',
        }} />

        {/* Hero content — esquerda inferior */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'flex-end',
          maxWidth: 1280, margin: '0 auto', left: 0, right: 0,
          padding: '0 2rem 5rem',
        }}>
          <div style={{ maxWidth: 560 }} className="animate-fade-in-up">
            {/* Label */}
            <div className="section-label" style={{ marginBottom: '1.25rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C6A2', display: 'inline-block' }} />
              Sistema completo para lojistas
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(3rem, 5.5vw, 5rem)',
              fontWeight: 900,
              lineHeight: 1.0,
              color: '#16113A',
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}>
              Sua loja,{' '}
              <span className="text-gradient">do jeito<br />certo</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#6B6A8A', lineHeight: 1.65, maxWidth: 440, marginBottom: '2rem' }}>
              PDV, estoque, garantias digitais, clientes, financeiro e muito mais — tudo integrado para o pequeno comércio.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <a href="#planos" className="btn-primary" id="hero-cta-primary">
                Começar agora
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#funcionalidades" className="btn-secondary" id="hero-cta-secondary">
                Ver funcionalidades
              </a>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex' }}>
                {['#6C47FF', '#00C6A2', '#FF6B47', '#FFD447'].map((c, i) => (
                  <div key={i} style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: c, border: '2px solid #F5F4FF',
                    marginLeft: i === 0 ? 0 : -8,
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {['L', 'V', 'M', 'A'][i]}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6B6A8A' }}>
                <strong style={{ color: '#16113A' }}>+500 lojistas</strong> já usam o KDL Store
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '1.75rem', right: '2rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(22,17,58,0.3)', writingMode: 'vertical-rl' }}>
            role para explorar
          </p>
          <div style={{
            width: 18, height: 28, borderRadius: 9,
            border: '1.5px solid rgba(22,17,58,0.18)',
            display: 'flex', justifyContent: 'center', paddingTop: 4,
          }}>
            <div style={{
              width: 3, height: 7, borderRadius: 2,
              background: 'rgba(22,17,58,0.35)',
              animation: 'scrollDot 1.8s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
