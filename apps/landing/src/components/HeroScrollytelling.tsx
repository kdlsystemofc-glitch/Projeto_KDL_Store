'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

export default function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  // Framer Motion: Acompanha o scroll apenas dentro deste container de 400vh
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Lida com o carregamento do vídeo para pegar a duração correta
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    
    // Se o vídeo já estiver pronto, pega a duração imediatamente
    if (video.readyState >= 1) {
      setDuration(video.duration);
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  // Lógica principal: Sincroniza o tempo do vídeo com o scroll
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!videoRef.current || duration === 0) return;
    
    // Calcula o tempo alvo (ex: 50% do scroll = 50% da duração do vídeo)
    const targetTime = latest * duration;

    // requestAnimationFrame garante que a atualização ocorra no timing perfeito da tela (60fps/120fps)
    requestAnimationFrame(() => {
      if (videoRef.current) {
        // Evita atualizações minúsculas para não engasgar o decodificador do navegador
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.01) {
          videoRef.current.currentTime = targetTime;
        }
      }
    });
  });

  // --- ANIMAÇÕES DOS TEXTOS (Framer Motion) ---

  // Seção 1 (0%): Aparece no início e some aos 15%
  const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.15], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  // Seção 2 (30%): Surge aos 20%, fica visível nos 30%, some aos 45%
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.35, 0.45], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.3], [50, 0]);

  // Seção 3 (60%): Surge aos 50%, fica visível nos 60%, some aos 75%
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.65, 0.75], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.6], [50, 0]);

  // Seção 4 (90%): Surge aos 80% e fica até o fim
  const opacity4 = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.8, 0.9], [50, 0]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-[#0A0A0F]" 
      style={{ height: '400vh' }}
    >
      {/* Container Fixo (Sticky) que prende o vídeo na tela enquanto rolamos */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#0A0A0F]">
        
        {/* O Vídeo HTML5 - Sem controles, mutado e com playsInline para iOS */}
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradiente sutil para escurecer o fundo e dar leitura aos textos */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-transparent to-[#0A0A0F]/80 pointer-events-none" />

        {/* --- CAMADAS DE TEXTO --- */}
        <div className="absolute inset-0 w-full max-w-7xl mx-auto px-6 md:px-12 pointer-events-none">
          
          {/* SEÇÃO 1 - 0% */}
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

          {/* SEÇÃO 2 - 30% */}
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

          {/* SEÇÃO 3 - 60% */}
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

          {/* SEÇÃO 4 - 90% */}
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
