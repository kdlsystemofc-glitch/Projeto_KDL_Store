'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 40;

function getFramePath(i: number) {
  return `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
}

export default function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null));
  const rafRef = useRef<number | null>(null);
  // Guarda as dimensões do canvas para não recriar a cada frame
  const canvasSizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // -------------------------------------------------------------------
  // FUNÇÃO que define o tamanho físico do canvas com devicePixelRatio
  // Isso corrige a imagem borrada em telas Retina (iPhones, Androids top)
  // Chamada UMA vez no mount e novamente só no resize
  // -------------------------------------------------------------------
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement?.clientWidth || window.innerWidth;
    const h = window.innerHeight;
    // Só faz o resize se algo realmente mudou — evita limpar o canvas à toa
    if (canvasSizeRef.current.w === w && canvasSizeRef.current.h === h && canvasSizeRef.current.dpr === dpr) return;
    canvasSizeRef.current = { w, h, dpr };
    // Tamanho CSS do canvas (tamanho visual)
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    // Tamanho interno em pixels físicos (sharp em telas de alta densidade)
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // Aplica a escala para que os ctx.drawImage etc usem coordenadas CSS normais
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  };

  // -------------------------------------------------------------------
  // FUNÇÃO de desenho — NÃO toca mais em canvas.width/height
  // -------------------------------------------------------------------
  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = canvasSizeRef.current;
    if (w === 0 || h === 0) return;

    // Interpolação entre dois frames consecutivos para morfing suave
    const exactFrame = Math.max(0, Math.min(1, progress)) * (TOTAL_FRAMES - 1);
    const idx1 = Math.floor(exactFrame);
    const idx2 = Math.min(TOTAL_FRAMES - 1, idx1 + 1);
    const blend = exactFrame - idx1; // 0.0 → 1.0

    const img1 = imagesRef.current[idx1] ?? imagesRef.current[0];
    const img2 = imagesRef.current[idx2];

    if (!img1) return;

    // Ativa suavização máxima (melhora qualidade especialmente em mobile)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Cobre o canvas com cor de fundo (sem clearRect para evitar flicker)
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, w, h);

    // Helper: "object-fit: cover" para uma imagem
    const cover = (img: HTMLImageElement) => {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = (w - sw) / 2;
      const sy = (h - sh) / 2;
      return { sx, sy, sw, sh };
    };

    // Desenha frame atual a 100% de opacidade
    const { sx: x1, sy: y1, sw: w1, sh: h1 } = cover(img1);
    ctx.globalAlpha = 1;
    ctx.drawImage(img1, x1, y1, w1, h1);

    // Faz o blend com o próximo frame (crossfade) se ele já estiver carregado
    if (img2 && blend > 0) {
      const { sx: x2, sy: y2, sw: w2, sh: h2 } = cover(img2);
      ctx.globalAlpha = blend;
      ctx.drawImage(img2, x2, y2, w2, h2);
    }

    ctx.globalAlpha = 1;
  };

  // Mount: resolve o tamanho do canvas e faz o preload de todas as imagens
  useEffect(() => {
    resizeCanvas();
    drawFrame(0); // Exibe frame 0 imediatamente (sem esperar as demais)

    // Carrega frame 0 primeiro para mostrar algo de cara
    const first = new Image();
    first.src = getFramePath(0);
    first.onload = () => {
      imagesRef.current[0] = first;
      drawFrame(scrollYProgress.get());

      // Carrega o restante em background, na ordem (prioridade do início)
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          imagesRef.current[i] = img;
        };
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza scroll → canvas via requestAnimationFrame
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(latest));
  });

  // Resize: recalcula canvas FÍSICO e redesenha
  useEffect(() => {
    const onResize = () => {
      resizeCanvas();
      drawFrame(scrollYProgress.get());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ANIMAÇÕES DOS TEXTOS ---
  const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.18], [1, 1, 0]);
  const y1       = useTransform(scrollYProgress, [0, 0.18], [0, -60]);

  const opacity2 = useTransform(scrollYProgress, [0.2, 0.28, 0.38, 0.48], [0, 1, 1, 0]);
  const y2       = useTransform(scrollYProgress, [0.2, 0.28], [50, 0]);

  const opacity3 = useTransform(scrollYProgress, [0.52, 0.60, 0.70, 0.78], [0, 1, 1, 0]);
  const y3       = useTransform(scrollYProgress, [0.52, 0.60], [50, 0]);

  const opacity4 = useTransform(scrollYProgress, [0.82, 0.90, 1], [0, 1, 1]);
  const y4       = useTransform(scrollYProgress, [0.82, 0.90], [50, 0]);

  return (
    /* 500vh: mais espaço de scroll = animação não acaba antes da hora */
    <div
      ref={containerRef}
      className="relative w-full bg-[#0A0A0F]"
      style={{ height: '500vh' }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#0A0A0F]">

        {/* Canvas principal — CSS não define largura/altura (controlado via resizeCanvas) */}
        <canvas
          ref={canvasRef}
          style={{ display: 'block', position: 'absolute', inset: 0 }}
        />

        {/* Gradiente para legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/50 via-transparent to-[#0A0A0F]/70 pointer-events-none" />

        {/* Textos sincronizados com o scroll */}
        <div className="absolute inset-0 max-w-7xl mx-auto w-full px-6 md:px-12 pointer-events-none">

          {/* 0% — Headline principal */}
          <motion.div
            style={{ opacity: opacity1, y: y1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            <h1 className="font-outfit text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white/90 drop-shadow-2xl leading-[1.05]">
              Sua loja,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#a78bff] to-[#00C6A2]">
                do jeito certo.
              </span>
            </h1>
            <p className="font-inter mt-6 text-lg md:text-xl text-white/50 max-w-md">
              Role para descobrir o sistema
            </p>
            {/* Seta animada de "role para baixo" */}
            <div className="mt-10 flex flex-col items-center gap-1 animate-bounce">
              <div className="w-px h-10 bg-white/20 rounded-full" />
              <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>

          {/* 30% — PDV */}
          <motion.div
            style={{ opacity: opacity2, y: y2 }}
            className="absolute inset-0 flex flex-col items-start justify-center max-w-lg"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#6C47FF] shadow-[0_0_12px_#6C47FF]" />
              <span className="font-inter uppercase tracking-[0.2em] text-xs font-bold text-[#6C47FF]">Ponto de Venda</span>
            </div>
            <h2 className="font-outfit text-4xl md:text-6xl font-extrabold text-white/90 leading-tight mb-5">
              Frente de Caixa<br />Ágil.
            </h2>
            <p className="font-inter text-base md:text-lg text-white/55 leading-relaxed">
              Sem papel, sem confusão.<br />Venda em segundos.
            </p>
          </motion.div>

          {/* 60% — Gestão */}
          <motion.div
            style={{ opacity: opacity3, y: y3 }}
            className="absolute inset-0 flex flex-col items-end justify-center text-right max-w-lg ml-auto"
          >
            <div className="flex items-center justify-end gap-3 mb-5 w-full">
              <span className="font-inter uppercase tracking-[0.2em] text-xs font-bold text-[#00C6A2]">Backoffice</span>
              <span className="w-2 h-2 rounded-full bg-[#00C6A2] shadow-[0_0_12px_#00C6A2]" />
            </div>
            <h2 className="font-outfit text-4xl md:text-6xl font-extrabold text-white/90 leading-tight mb-5">
              Gestão<br />Completa.
            </h2>
            <p className="font-inter text-base md:text-lg text-white/55 leading-relaxed">
              Estoque, financeiro e garantias<br />digitais em tempo real.
            </p>
          </motion.div>

          {/* 90% — CTA Final */}
          <motion.div
            style={{ opacity: opacity4, y: y4 }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-[12vh] text-center"
          >
            <h2 className="font-outfit text-4xl md:text-6xl font-black text-white/90 mb-8 leading-tight drop-shadow-2xl">
              O futuro do seu comércio<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-[#00C6A2]">
                começa aqui.
              </span>
            </h2>
            <a
              href="#planos"
              id="hero-cta-final"
              className="pointer-events-auto group flex items-center gap-3 bg-white text-[#0A0A0F] font-inter font-bold px-10 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_0_40px_rgba(108,71,255,0.4)]"
            >
              Começar Agora
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
