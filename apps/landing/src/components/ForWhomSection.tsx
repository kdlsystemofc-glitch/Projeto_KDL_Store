'use client';

import { ScrollReveal, StaggerReveal, StaggerItem, ParallaxElement } from './ParallaxKit';

const STORE_TYPES = [
  { icon: '🔊', label: 'Som Automotivo', desc: 'PDV, OS de instalação, garantia de equipamentos' },
  { icon: '👗', label: 'Moda e Roupas', desc: 'Grade de tamanhos, cores, controle por SKU' },
  { icon: '🏠', label: 'Utilidades Domésticas', desc: 'Categorias, fornecedores, estoque múltiplo' },
  { icon: '📱', label: 'Eletrônicos', desc: 'Garantia por IMEI, OS de reparo, notas' },
  { icon: '💄', label: 'Beleza e Cosméticos', desc: 'Validade, lotes, programa de fidelidade' },
  { icon: '🍕', label: 'Alimentos e Bebidas', desc: 'Controle de validade, estoque perecível' },
  { icon: '⚒️', label: 'Ferramentas e Hardware', desc: 'Código de produto, fornecedores técnicos' },
  { icon: '🧸', label: 'Brinquedos e Kids', desc: 'Garantias de produto, categorias por faixa etária' },
  { icon: '🐾', label: 'Pet Shop', desc: 'Agendamento de serviços, produtos veterinários' },
  { icon: '📚', label: 'Papelaria e Livraria', desc: 'Catálogo extenso, ISBN, fornecedores múltiplos' },
  { icon: '🚲', label: 'Esportes e Lazer', desc: 'Estoque por tamanho, marcas, kits' },
  { icon: '🏪', label: 'Comércio Geral', desc: 'Qualquer tipo de produto, adaptável' },
];

export default function ForWhomSection() {
  return (
    <section id="paraquem" style={{ background: 'linear-gradient(180deg, #07060F 0%, #0D0B1A 100%)', padding: '7rem 0', position: 'relative', overflow: 'hidden' }}>

      {/* Brilho parallax */}
      <ParallaxElement speed={0.5} style={{ position: 'absolute', bottom: '-10%', right: '-5%', pointerEvents: 'none' }}>
        <div style={{ width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(108,71,255,0.12) 0%, transparent 65%)' }} />
      </ParallaxElement>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>

        {/* Header */}
        <ScrollReveal direction="up" style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C47FF', display: 'inline-block', boxShadow: '0 0 8px #6C47FF' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6C47FF' }}>Para quem é o KDL Store?</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.93)', marginBottom: '1.25rem' }}>
            Se você tem uma loja,<br />
            <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>o KDL Store é seu.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Desenvolvido para o comércio varejista brasileiro em todas as suas formas.</p>
        </ScrollReveal>

        {/* Grid staggered */}
        <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {STORE_TYPES.map((type, i) => (
            <StaggerItem key={i} direction="up">
              <div
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem 1.25rem', textAlign: 'center', transition: 'border-color 0.3s, transform 0.3s, background 0.3s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(108,71,255,0.4)'; el.style.transform = 'translateY(-5px)'; el.style.background = 'rgba(108,71,255,0.06)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)'; el.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ fontSize: 30, marginBottom: '0.75rem', lineHeight: 1 }}>{type.icon}</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', marginBottom: '0.4rem' }}>{type.label}</h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>{type.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* CTA */}
        <ScrollReveal direction="up" delay={0.1}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '3rem 2rem' }}>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem' }}>Não encontrou o seu segmento?</p>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'rgba(255,255,255,0.88)', marginBottom: '2rem' }}>
              O KDL Store funciona para{' '}
              <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>qualquer comércio varejista.</span>
            </p>
            <a href="#planos" id="forwhom-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #6C47FF, #00C6A2)', color: 'white', fontWeight: 700, fontSize: '1rem', padding: '0.9rem 2.25rem', borderRadius: 999, textDecoration: 'none', boxShadow: '0 0 40px rgba(108,71,255,0.35)' }}>
              Experimentar agora
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
