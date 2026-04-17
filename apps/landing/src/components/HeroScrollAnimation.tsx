'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 40;
const SCROLL_HEIGHT_PER_FRAME = 60;
const TOTAL_SCROLL = TOTAL_FRAMES * SCROLL_HEIGHT_PER_FRAME;

function getFramePath(index: number): string {
  const n = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${n}.png`;
}

export default function HeroScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);

  // Set viewport height on mount (client-only)
  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Pré-carrega todos os frames
  useEffect(() => {
    let count = 0;
    const images = imagesRef.current;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        images[i] = img;
        count++;
        setLoadProgress(Math.round((count / TOTAL_FRAMES) * 100));
        if (count === TOTAL_FRAMES) {
          setLoaded(true);
          drawFrame(0);
        }
      };
      img.onerror = () => {
        count++;
        if (count === TOTAL_FRAMES) setLoaded(true);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawFrame(frameIndex: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[frameIndex];
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  }

  // Resize canvas
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawFrame(currentFrameRef.current);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Scroll handler
  useEffect(() => {
    if (!loaded) return;

    function onScroll() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / TOTAL_SCROLL));
      const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(() => drawFrame(targetFrame));
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${TOTAL_SCROLL + viewportHeight}px` }}
      className="relative"
    >
      {/* Sticky canvas container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Loading overlay */}
        {!loaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A0A0F]">
            <div
              className="w-48 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${loadProgress}%`,
                  background: 'linear-gradient(90deg, #6C47FF, #00D4AA)',
                }}
              />
            </div>
            <p className="mt-3 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {loadProgress}%
            </p>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, transparent 30%, transparent 60%, #0A0A0F 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(10,10,15,0.6) 0%, transparent 60%)',
          }}
        />

        {/* Hero content overlay */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl animate-fade-in-up">
              <div className="section-label pointer-events-auto">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#00D4AA' }}
                />
                Novo jeito de gerenciar
              </div>
              <h1
                className="text-5xl md:text-7xl font-black leading-tight mb-6"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Sua loja,{' '}
                <span className="text-gradient">do jeito certo</span>
              </h1>
              <p
                className="text-lg md:text-xl mb-10 leading-relaxed max-w-xl"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Estoque, vendas, garantias, clientes e muito mais — tudo integrado para
                pequenas lojas que querem crescer com profissionalismo.
              </p>
              <div className="flex flex-wrap gap-4 pointer-events-auto">
                <a href="#planos" className="btn-primary">
                  Começar agora
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a href="#funcionalidades" className="btn-secondary">
                  Ver funcionalidades
                </a>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 mt-10">
                <div className="flex -space-x-2">
                  {['#6C47FF', '#00D4AA', '#FF6B47', '#FFD447'].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2"
                      style={{ background: c, borderColor: '#0A0A0F' }}
                    />
                  ))}
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span className="text-white font-semibold">+500 lojistas</span> já usam o KDL Store
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Role para explorar
          </p>
          <div
            className="w-5 h-8 rounded-full flex items-start justify-center pt-1"
            style={{ border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.4)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
