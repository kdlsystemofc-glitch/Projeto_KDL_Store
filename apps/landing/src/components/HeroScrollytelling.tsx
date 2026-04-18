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

  // Framer Motion: Acompanha o scroll apenas dentro deste container de 400vh
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Preload das 40 imagens super leves em JPG
  useEffect(() => {
    // Carrega o frame 0 primeiro para mostrar imediatamente
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      drawFrame(0);
      
      // Carrega o resto silenciosamente em background
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => { imagesRef.current[i] = img; };
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lógica principal: Desenha no canvas com Crossfade (Morphing) para não travar
  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Calcula a posição exata (ex: 24.6)
    const exactFrame = progress * (TOTAL_FRAMES - 1);
    const frameIndex1 = Math.floor(exactFrame); // ex: 24
    const frameIndex2 = Math.min(TOTAL_FRAMES - 1, frameIndex1 + 1); // ex: 25
    const blendFactor = exactFrame - frameIndex1; // ex: 0.6 (60% de opacidade na imagem 2)

    const img1 = imagesRef.current[frameIndex1] || imagesRef.current[0];
    const img2 = imagesRef.current[frameIndex2];
    
    if (!img1) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolução interna do canvas = resolução da tela do celular/PC
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Lógica de "object-fit: cover"
    const scale = Math.max(canvas.width / img1.width, canvas.height / img1.height);
    const x = (canvas.width - img1.width * scale) / 2;
    const y = (canvas.height - img1.height * scale) / 2;

    // Limpa o frame anterior e pinta o fundo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a Imagem 1 (Frame atual)
    ctx.globalAlpha = 1;
    ctx.drawImage(img1, x, y, img1.width * scale, img1.height * scale);

    // Aplica o "Crossfade" (Morphing) com a Imagem 2 para suavidade perfeita
    if (img2 && blendFactor > 0) {
      ctx.globalAlpha = blendFactor;
      ctx.drawImage(img2, x, y, img2.width * scale, img2.height * scale);
    }
    
    ctx.globalAlpha = 1; // reseta
  };

  // Sincroniza o Scroll com o Canvas (60fps)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(latest));
  });

  // Redesenha ao virar o celular ou redimensionar a tela
  useEffect(() => {
    const handleResize = () => drawFrame(scrollYProgress.get());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ANIMAÇÕES DOS TEXTOS (Framer Motion) ---

  const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.15], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.35, 0.45], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.3], [50, 0]);

  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.65, 0.75], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.6], [50, 0]);

  const opacity4 = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.8, 0.9], [50, 0]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-[#0A0A0F]" 
      style={{ height: '400vh' }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#0A0A0F]">
        
        {/* Canvas de Alta Performance que renderiza as imagens */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradiente sutil para escurecer o fundo e dar leitura aos textos */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-transparent to-[#0A0A0F]/80 pointer-events-none" />

        {/* --- CAMADAS DE TEXTO --- */}
        <div className="absolute inset-0 w-full max-w-7xl mx-auto px-6 md:px-12 pointer-events-none">
          
          <motion.div 
            style={{ opacity: opacity1, y: y1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center mt-[-10vh]"
          >
            <h1 className="font-outfit text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white/90 drop-shadow-lg">
              Sua loja,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00C6A2]">
                do jeito certo.
              </span>
            </h1>
          </motion.div>

          <motion.div 
            style={{ opacity: opacity2, y: y2 }}
            className="absolute inset-0 flex flex-col items-start justify-center max-w-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#6C47FF] shadow-[0_0_10px_#6C47FF]" />
              <span className="font-inter uppercase tracking-[0.2em] text-xs font-bold text-[#6C47FF]">Ponto de Venda</span>
            </div>
            <h2 className="font-outfit text-4xl md:text-5xl font-bold text-white/90 leading-tight mb-4 drop-shadow-md">
              Frente de Caixa Ágil.
            </h2>
            <p className="font-inter text-lg text-white/60 leading-relaxed">
              Sem papel, sem confusão. Venda em segundos com uma interface projetada para a máxima velocidade.
            </p>
          </motion.div>

          <motion.div 
            style={{ opacity: opacity3, y: y3 }}
            className="absolute inset-0 flex flex-col items-end justify-center text-right max-w-xl ml-auto"
          >
            <div className="flex items-center justify-end gap-3 mb-4 w-full">
              <span className="font-inter uppercase tracking-[0.2em] text-xs font-bold text-[#00C6A2]">Backoffice</span>
              <span className="w-2 h-2 rounded-full bg-[#00C6A2] shadow-[0_0_10px_#00C6A2]" />
            </div>
            <h2 className="font-outfit text-4xl md:text-5xl font-bold text-white/90 leading-tight mb-4 drop-shadow-md">
              Gestão Completa.
            </h2>
            <p className="font-inter text-lg text-white/60 leading-relaxed">
              Controle de estoque, financeiro e garantias digitais em tempo real. O ecossistema inteiro nas suas mãos.
            </p>
          </motion.div>

          <motion.div 
            style={{ opacity: opacity4, y: y4 }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-[15vh] text-center"
          >
            <h2 className="font-outfit text-4xl md:text-6xl font-bold text-white/90 mb-8 drop-shadow-lg">
              O futuro do seu comércio<br/>
              <span className="text-[#6C47FF]">começa aqui.</span>
            </h2>
            <a 
              href="#planos" 
              className="pointer-events-auto group relative flex items-center justify-center gap-3 bg-white text-[#0A0A0F] font-inter font-bold px-8 py-4 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Começar Agora</span>
              <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
