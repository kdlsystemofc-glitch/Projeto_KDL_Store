'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// ─── Fade + slide reveal ao entrar na viewport ────────────────────────────────
export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  const offsets: Record<string, { x: number; y: number }> = {
    up:    { x: 0,   y: 40  },
    down:  { x: 0,   y: -40 },
    left:  { x: 60,  y: 0   },
    right: { x: -60, y: 0   },
  };
  const { x, y } = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x, y }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Parallax: elemento se move a velocidade diferente do scroll ───────────────
export function ParallaxElement({
  children,
  speed = 0.5,
  style,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 80}px`, `${speed * 80}px`]);

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Parallax background: camada de fundo que se move mais devagar ─────────────
export function ParallaxBackground({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);

  return (
    <motion.div
      ref={ref}
      style={{ y, position: 'absolute', inset: '-15%', pointerEvents: 'none', ...style }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger: lista de filhos revelados em cascata ────────────────────────────
export function StaggerReveal({
  children,
  staggerDelay = 0.12,
  className,
  style,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  direction = 'up',
  style,
  className,
}: {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right';
  style?: React.CSSProperties;
  className?: string;
}) {
  const offsets = { up: { y: 30, x: 0 }, left: { y: 0, x: 40 }, right: { y: 0, x: -40 } };
  const { x, y } = offsets[direction];
  return (
    <motion.div
      style={style}
      className={className}
      variants={{
        hidden:  { opacity: 0, x, y },
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Contador animado que conta de 0 até value quando entra na tela ───────────
export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  style,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      style={style}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
    >
      {prefix}
      <motion.span>
        {inView ? (
          <Counter from={0} to={value} duration={duration} />
        ) : '0'}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

function Counter({ from, to, duration }: { from: number; to: number; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(from + (to - from) * ease).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [from, to, duration]);
  return <span ref={ref}>{from}</span>;
}

// ─── Precisa importar useEffect acima ─────────────────────────────────────────
import { useEffect } from 'react';

// ─── Linha decorativa animada (separador com gradiente que "desenha") ──────────
export function AnimatedLine({ color = 'rgba(108,71,255,0.5)' }: { color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden', height: 1, margin: '2rem 0' }}>
      <motion.div
        initial={{ scaleX: 0, transformOrigin: 'left' }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
        style={{ height: '100%', background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
}
