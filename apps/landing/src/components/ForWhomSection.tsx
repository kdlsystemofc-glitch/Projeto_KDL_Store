'use client';

import { ScrollReveal, StaggerReveal, StaggerItem, ParallaxElement } from './ParallaxKit';

const STORE_TYPES = [
  { icon: '👗', label: 'Moda e Roupas', desc: 'Grade de tamanhos, cores, controle por SKU', span: 'col-span-12 md:col-span-8', row: 'row-span-1', isLarge: true },
  { icon: '📱', label: 'Eletrônicos', desc: 'Garantia por IMEI, OS de reparo, notas', span: 'col-span-12 md:col-span-4', row: 'row-span-2', isLarge: false },
  { icon: '🏠', label: 'Utilidades', desc: 'Categorias e estoque múltiplo', span: 'col-span-12 md:col-span-4', row: 'row-span-1', isLarge: false },
  { icon: '🍕', label: 'Alimentos', desc: 'Controle de validade e perecíveis', span: 'col-span-12 md:col-span-4', row: 'row-span-1', isLarge: false },
  { icon: '🐾', label: 'Pet Shop', desc: 'Agendamentos e serviços', span: 'col-span-12 md:col-span-4', row: 'row-span-1', isLarge: false },
  { icon: '🏪', label: 'Comércio Geral', desc: 'Adaptável a qualquer tipo de produto', span: 'col-span-12 md:col-span-8', row: 'row-span-1', isLarge: true },
];

export default function ForWhomSection() {
  return (
    <section id="paraquem" style={{ background: '#0A0A0F', padding: '8rem 0', position: 'relative', overflow: 'hidden' }}>

      {/* Grade decorativa inspirada no Dribbble */}
      <ParallaxElement speed={0.15} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }} />
      </ParallaxElement>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>

        {/* Header */}
        <ScrollReveal direction="up" style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '0.4rem 1.25rem', marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Para quem é o KDL Store?</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.95)', marginBottom: '1.5rem' }}>
            Se você tem uma loja,<br />
            <span style={{ 
              fontFamily: 'Inter, serif', 
              fontStyle: 'italic', 
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              marginRight: '8px'
            }}>o KDL Store é</span>
            <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>seu.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Desenvolvido para o comércio varejista brasileiro em todas as suas formas.</p>
        </ScrollReveal>

        {/* Grid Bento staggered */}
        <StaggerReveal style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '1.5rem', 
          marginBottom: '5rem',
          gridAutoRows: 'minmax(250px, auto)'
        }}>
          {STORE_TYPES.map((type, i) => (
            <StaggerItem key={i} direction="up" className={`${type.span} ${type.row}`}>
              <div
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: 32, 
                  padding: type.isLarge ? '3rem' : '2.5rem', 
                  textAlign: 'left', 
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                  cursor: 'default',
                  height: '100%',
                  display: 'flex',
                  flexDirection: type.isLarge ? 'row' : 'column',
                  alignItems: type.isLarge ? 'center' : 'flex-start',
                  gap: type.isLarge ? '2.5rem' : '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="forwhom-card"
                onMouseEnter={e => { 
                  const el = e.currentTarget as HTMLDivElement; 
                  el.style.borderColor = 'rgba(255,255,255,0.12)'; 
                  el.style.transform = 'translateY(-4px)'; 
                  el.style.background = 'rgba(255,255,255,0.04)'; 
                }}
                onMouseLeave={e => { 
                  const el = e.currentTarget as HTMLDivElement; 
                  el.style.borderColor = 'rgba(255,255,255,0.06)'; 
                  el.style.transform = 'translateY(0)'; 
                  el.style.background = 'rgba(255,255,255,0.02)'; 
                }}
              >
                {/* Glow decorativo */}
                <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: '#6C47FF', opacity: 0.05, filter: 'blur(40px)', pointerEvents: 'none' }} />

                <div style={{ 
                  width: 64, height: 64, borderRadius: 20,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, flexShrink: 0,
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
                }}>{type.icon}</div>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: type.isLarge ? '1.5rem' : '1.25rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>{type.label}</h3>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{type.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* CTA CTA Frosted Glass */}
        <ScrollReveal direction="up" delay={0.1}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 32, padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(108,71,255,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>Não encontrou o seu segmento?</p>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'rgba(255,255,255,0.95)', marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
              O KDL Store funciona para{' '}
              <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>qualquer comércio varejista.</span>
            </p>
            <a href="#planos" id="forwhom-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.95)', color: '#0A0A0F', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', padding: '1rem 2.5rem', borderRadius: 100, textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 10px 40px rgba(255,255,255,0.1)' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 15px 50px rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 10px 40px rgba(255,255,255,0.1)';
              }}
            >
              Experimentar agora
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </div>
        </ScrollReveal>

        {/* Global Styles for Bento responsiveness */}
        <style>{`
          .col-span-12 { grid-column: span 12 / span 12; }
          .row-span-1 { grid-row: span 1 / span 1; }
          .row-span-2 { grid-row: span 2 / span 2; }
          
          @media (min-width: 768px) {
            .md\\:col-span-4 { grid-column: span 4 / span 12; }
            .md\\:col-span-8 { grid-column: span 8 / span 12; }
          }
          
          @media (max-width: 767px) {
            .forwhom-card {
              flex-direction: column !important;
              align-items: flex-start !important;
              padding: 2rem !important;
              gap: 1.5rem !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
