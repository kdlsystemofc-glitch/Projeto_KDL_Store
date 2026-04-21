'use client';

import { useEffect, useRef } from 'react';
import { useScroll, useMotionValueEvent, useTransform, motion } from 'framer-motion';

const TOTAL_FRAMES = 153;

function getFramePath(i: number) {
  return `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
}

// Partículas de parallax flutuando na tela
function ParticleLayer({ scrollYProgress }: { scrollYProgress: any }) {
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const particles = [
    { x: '8%',  y: '20%', size: 2, layer: y3, delay: 0 },
    { x: '15%', y: '65%', size: 3, layer: y1, delay: 0.5 },
    { x: '25%', y: '40%', size: 1.5, layer: y2, delay: 1 },
    { x: '35%', y: '80%', size: 2.5, layer: y3, delay: 0.3 },
    { x: '48%', y: '15%', size: 1, layer: y1, delay: 0.8 },
    { x: '60%', y: '55%', size: 2, layer: y2, delay: 0.2 },
    { x: '72%', y: '30%', size: 3, layer: y3, delay: 0.6 },
    { x: '82%', y: '70%', size: 1.5, layer: y1, delay: 1.2 },
    { x: '90%', y: '45%', size: 2, layer: y2, delay: 0.4 },
    { x: '5%',  y: '88%', size: 1, layer: y3, delay: 0.9 },
    { x: '93%', y: '12%', size: 2.5, layer: y1, delay: 0.1 },
    { x: '55%', y: '90%', size: 1.5, layer: y2, delay: 0.7 },
  ];

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            y: p.layer,
            width: p.size * 2,
            height: p.size * 2,
            borderRadius: '50%',
            background: i % 3 === 0
              ? 'rgba(108,71,255,0.8)'
              : i % 3 === 1
              ? 'rgba(0,212,170,0.6)'
              : 'rgba(255,255,255,0.5)',
            boxShadow: i % 3 === 0
              ? `0 0 ${p.size * 6}px rgba(108,71,255,0.9)`
              : i % 3 === 1
              ? `0 0 ${p.size * 6}px rgba(0,212,170,0.8)`
              : `0 0 ${p.size * 4}px rgba(255,255,255,0.6)`,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2.5 + p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </motion.div>
  );
}

// Anéis orbitais de fundo (camada mais profunda)
function OrbitalRings({ scrollYProgress }: { scrollYProgress: any }) {
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.4, 0.4, 0]);

  return (
    <motion.div
      style={{ position: 'absolute', inset: 0, y, opacity, pointerEvents: 'none', overflow: 'hidden' }}
    >
      {[600, 900, 1200].map((size, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            borderRadius: '50%',
            border: `1px solid rgba(${i === 0 ? '108,71,255' : i === 1 ? '0,212,170' : '255,255,255'},0.08)`,
            rotate,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </motion.div>
  );
}

// Texto hero com parallax por camadas de profundidade
function HeroText({ scrollYProgress }: { scrollYProgress: any }) {
  const titleY    = useTransform(scrollYProgress, [0, 0.4], ['0%', '-40%']);
  const subtitleY = useTransform(scrollYProgress, [0, 0.4], ['0%', '-20%']);
  const ctaY      = useTransform(scrollYProgress, [0, 0.4], ['0%', '-10%']);
  const titleOp   = useTransform(scrollYProgress, [0, 0.05, 0.25, 0.4], [0, 1, 1, 0]);
  const subtitleOp = useTransform(scrollYProgress, [0, 0.08, 0.28, 0.42], [0, 1, 1, 0]);
  const ctaOp     = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.44], [0, 1, 1, 0]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
      {/* Badge */}
      <motion.div style={{ y: ctaY, opacity: ctaOp, marginBottom: '1.5rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0.35rem 0.875rem',
          borderRadius: 100,
          border: '1px solid rgba(108,71,255,0.4)',
          background: 'rgba(108,71,255,0.1)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', boxShadow: '0 0 6px #00D4AA', display: 'inline-block' }} />
          Sistema de Gestão para Lojas
        </span>
      </motion.div>

      {/* Título com parallax mais agressivo */}
      <motion.h1
        style={{
          y: titleY,
          opacity: titleOp,
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(2.8rem, 7vw, 7rem)',
          fontWeight: 900,
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          color: 'rgba(255,255,255,0.95)',
          textShadow: '0 4px 60px rgba(0,0,0,0.8)',
          marginBottom: '0.5rem',
        }}
      >
        Sua loja,{' '}
        <span style={{
          background: 'linear-gradient(90deg, #ffffff 0%, #a78bff 50%, #00C6A2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          do jeito certo.
        </span>
      </motion.h1>

      {/* Subtítulo — camada intermediária */}
      <motion.p
        style={{
          y: subtitleY,
          opacity: subtitleOp,
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 400,
          maxWidth: 540,
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          marginTop: '1rem',
        }}
      >
        PDV, estoque, financeiro, OS e garantias — tudo integrado para o pequeno comércio.
      </motion.p>

      {/* CTAs — camada mais próxima */}
      <motion.div style={{ y: ctaY, opacity: ctaOp, pointerEvents: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href="#pricing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0.875rem 2rem',
            borderRadius: 100,
            background: 'linear-gradient(135deg, #6C47FF, #00D4AA)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 8px 40px rgba(108,71,255,0.5)',
            letterSpacing: '-0.01em',
          }}
        >
          Começar grátis →
        </a>
        <a
          href="#features"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0.875rem 2rem',
            borderRadius: 100,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
          }}
        >
          Ver funcionalidades
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
          role para explorar
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Textos que aparecem durante o scroll do canvas (storytelling)
function ScrollStories({ scrollYProgress }: { scrollYProgress: any }) {
  const stories = [
    { range: [0.15, 0.35], title: 'PDV completo', desc: 'Venda mais rápido com busca por nome, código ou SKU. Troco automático, parcelamento e Pix.', icon: '🛒' },
    { range: [0.35, 0.55], title: 'Estoque inteligente', desc: 'Alertas automáticos quando o produto estiver acabando. Nunca mais venda o que não tem.', icon: '📦' },
    { range: [0.55, 0.72], title: 'Financeiro sob controle', desc: 'Caixa, contas a pagar e receber em um só lugar. Saiba exatamente onde está seu dinheiro.', icon: '💰' },
    { range: [0.72, 0.90], title: 'Garantias digitais', desc: 'Emita garantias com código único e envie direto no WhatsApp do cliente. Profissional.', icon: '🛡️' },
  ];

  return (
    <>
      {stories.map((s, i) => {
        const opacity = useTransform(
          scrollYProgress,
          [s.range[0] - 0.05, s.range[0], s.range[1] - 0.05, s.range[1]],
          [0, 1, 1, 0]
        );
        const x = useTransform(
          scrollYProgress,
          [s.range[0] - 0.05, s.range[0], s.range[1] - 0.05, s.range[1]],
          [-40, 0, 0, 40]
        );
        const side = i % 2 === 0 ? { left: '3%' } : { right: '3%' };

        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              ...side,
              opacity,
              x,
              maxWidth: 280,
              padding: '1.5rem',
              borderRadius: 16,
              background: 'rgba(10,10,15,0.7)',
              border: '1px solid rgba(108,71,255,0.25)',
              backdropFilter: 'blur(16px)',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}>
              {s.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              {s.desc}
            </p>
          </motion.div>
        );
      })}
    </>
  );
}

export default function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imagesRef    = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null));
  const rafRef       = useRef<number | null>(null);
  const canvasSizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvasSizeRef.current.w === w && canvasSizeRef.current.h === h && canvasSizeRef.current.dpr === dpr) return;
    canvasSizeRef.current = { w, h, dpr };
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  };

  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = canvasSizeRef.current;
    if (w === 0 || h === 0) return;
    const exactFrame = Math.max(0, Math.min(1, progress)) * (TOTAL_FRAMES - 1);
    const idx1 = Math.floor(exactFrame);
    const idx2 = Math.min(TOTAL_FRAMES - 1, idx1 + 1);
    const blend = exactFrame - idx1;
    const img1 = imagesRef.current[idx1] ?? imagesRef.current[0];
    const img2 = imagesRef.current[idx2];
    if (!img1) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, w, h);
    const cover = (img: HTMLImageElement) => {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      return { sx: (w - img.naturalWidth * scale) / 2, sy: (h - img.naturalHeight * scale) / 2, sw: img.naturalWidth * scale, sh: img.naturalHeight * scale };
    };
    const c1 = cover(img1);
    ctx.globalAlpha = 1;
    ctx.drawImage(img1, c1.sx, c1.sy, c1.sw, c1.sh);
    if (img2 && blend > 0) {
      const c2 = cover(img2);
      ctx.globalAlpha = blend;
      ctx.drawImage(img2, c2.sx, c2.sy, c2.sw, c2.sh);
    }
    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    resizeCanvas();
    const first = new Image();
    first.src = getFramePath(0);
    first.onload = () => {
      imagesRef.current[0] = first;
      drawFrame(scrollYProgress.get());
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => { imagesRef.current[i] = img; };
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(latest));
  });

  useEffect(() => {
    const onResize = () => { resizeCanvas(); drawFrame(scrollYProgress.get()); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} style={{ height: '700vh', position: 'relative', background: '#0A0A0F' }}>
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden', background: '#0A0A0F' }}>

        {/* Anéis orbitais — camada mais profunda */}
        <OrbitalRings scrollYProgress={scrollYProgress} />

        {/* Canvas principal (frames de scroll) */}
        <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />

        {/* Overlay gradiente */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent 55%, #0A0A0F 100%)' }} />

        {/* Partículas luminosas — camada intermediária */}
        <ParticleLayer scrollYProgress={scrollYProgress} />

        {/* Cards de storytelling lateral */}
        <ScrollStories scrollYProgress={scrollYProgress} />

        {/* Texto do hero — camada mais próxima */}
        <HeroText scrollYProgress={scrollYProgress} />

      </div>
    </div>
  );
}
