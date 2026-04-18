'use client';

import { useEffect, useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 153;

function getFramePath(i: number) {
  return `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
}

export default function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null));
  const rafRef = useRef<number | null>(null);
  const canvasSizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Define o tamanho físico do canvas com devicePixelRatio (resolve borrado em Retina/mobile)
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (
      canvasSizeRef.current.w === w &&
      canvasSizeRef.current.h === h &&
      canvasSizeRef.current.dpr === dpr
    ) return;
    canvasSizeRef.current = { w, h, dpr };
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  };

  // Desenha o frame correto SEM tocar no tamanho do canvas
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

    // Fundo sólido (evita flicker entre frames)
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, w, h);

    // Helper: object-fit cover
    const cover = (img: HTMLImageElement) => {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      return { sx: (w - sw) / 2, sy: (h - sh) / 2, sw, sh };
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

  // Mount: dimensiona canvas e começa o preload
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

  // Scroll → canvas
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(latest));
  });

  // Resize
  useEffect(() => {
    const onResize = () => { resizeCanvas(); drawFrame(scrollYProgress.get()); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /*
      700vh: garante que todos os 153 frames sejam vistos no desktop
      antes do usuário sair da seção de animação
    */
    <div
      ref={containerRef}
      className="relative w-full bg-[#0A0A0F]"
      style={{ height: '700vh' }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#0A0A0F]">

        {/* Canvas principal */}
        <canvas
          ref={canvasRef}
          style={{ display: 'block', position: 'absolute', inset: 0 }}
        />

        {/* Gradiente escuro embaixo para fundir com o resto da página */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 60%, #0A0A0F 100%)',
          }}
        />

        {/* Única escrita: Sua loja, do jeito certo. — sempre visível */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.8rem, 6vw, 6rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 4px 40px rgba(0,0,0,0.6)',
            }}
          >
            Sua loja,{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #ffffff, #a78bff, #00C6A2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              do jeito certo.
            </span>
          </h1>

          {/* Indicador de scroll */}
          <div
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              animation: 'bounce 2s ease-in-out infinite',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              role para explorar
            </span>
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
