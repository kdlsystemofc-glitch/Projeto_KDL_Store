'use client';

import { useEffect, useState, useRef } from 'react';

export default function HeroVideo() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';
  const [useFallback, setUseFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check connection speed for fallback
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-3g') {
        setUseFallback(true);
      }
    }

    // Attempt to play the video programmatically as a fallback for autoplay issues
    if (videoRef.current && !useFallback) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented or failed:', err);
      });
    }
  }, [useFallback]);

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      minHeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1, // Permite que a próxima seção role por cima do fixed background
    }}>
      {/* Background Media (Fixed para efeito parallax) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        ...(useFallback ? {
          backgroundImage: 'url("/hero-poster.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {})
      }}>
        {!useFallback && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            poster="/hero-poster.jpg"
          >
            <source src="/hero.webm" type="video/webm" />
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* Dark Overlay Gradient (Bottom to Top) - Fixo como o vídeo */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
        zIndex: 1,
        pointerEvents: 'none' // garante que os cliques passem
      }} />

      {/* Hero Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '4rem' // Offset para a navbar
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 100,
          padding: '0.4rem 1.25rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>
            Lançamento 2025
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: 700,
          lineHeight: 1.05,
          color: '#fff',
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          KDL Store
        </h1>
        
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: 600,
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          textShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          Sistema de gestão completo para o pequeno comércio brasileiro. Do estoque ao financeiro, tudo em um só lugar.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="#planos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#00C6A2', color: '#111',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem',
              padding: '1.1rem 2.5rem', borderRadius: 999,
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 10px 30px rgba(0,198,162,0.3)'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 15px 40px rgba(0,198,162,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 30px rgba(0,198,162,0.3)'; }}
          >
            Começar agora
          </a>
          <a
            href="#funcionalidades"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '1rem',
              padding: '1.1rem 2.5rem', borderRadius: 999,
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)'; }}
          >
            Conhecer recursos
          </a>
        </div>
      </div>
    </section>
  );
}
