'use client';

import { ScrollReveal, StaggerReveal, StaggerItem } from './ParallaxKit';

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
    <section id="paraquem" style={{ background: '#fff', padding: '7rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <ScrollReveal direction="up">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '5rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C3D2E', marginBottom: '1rem' }}>
                Para quem é?
              </p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#111', maxWidth: 520 }}>
                Se você tem uma loja,<br />
                <em style={{ fontStyle: 'italic', color: '#1C3D2E' }}>o KDL Store é seu.</em>
              </h2>
            </div>
            <p style={{ fontSize: '1rem', color: '#666', maxWidth: 340, lineHeight: 1.7, fontFamily: 'Inter, sans-serif', paddingTop: '3.5rem' }}>
              Desenvolvido para o comércio varejista brasileiro em todas as suas formas e tamanhos.
            </p>
          </div>
        </ScrollReveal>

        {/* Grid de segmentos — 4 colunas com borda fina separando */}
        <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: '#E0DDD5', border: '1px solid #E0DDD5' }}>
          {STORE_TYPES.map((type, i) => (
            <StaggerItem key={i} direction="up">
              <div
                style={{
                  background: '#fff',
                  padding: '2rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'background 0.25s ease',
                  cursor: 'default',
                  minHeight: 180,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = '#E8EDE0';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = '#fff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.75rem' }}>{type.icon}</span>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ccc" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem', fontWeight: 700, color: '#111', lineHeight: 1.3 }}>
                  {type.label}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                  {type.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* CTA banner verde — igual ao vídeo */}
        <ScrollReveal direction="up" delay={0.1}>
          <div style={{
            marginTop: '4rem',
            background: '#1C3D2E',
            borderRadius: 24,
            padding: '3.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Estrelas decorativas estilo Ascone */}
            <div style={{ position: 'absolute', right: 40, top: 20, fontSize: '3rem', opacity: 0.15, color: 'white', userSelect: 'none' }}>✦ ✦</div>

            <div>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>Não encontrou seu segmento?</p>
              <p style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'white', lineHeight: 1.2 }}>
                O KDL Store funciona para{' '}
                <em style={{ fontStyle: 'italic' }}>qualquer comércio varejista.</em>
              </p>
            </div>

            {/* Imagem real decorativa do lado direito do banner */}
            <div style={{
              width: 240, height: 160, borderRadius: 16, overflow: 'hidden',
              flexShrink: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.1)',
            }} className="forwhom-cta-img">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop"
                alt="Loja organizada"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-start' }} className="forwhom-btn-container">
              <a
                href="#planos"
                id="forwhom-cta"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'white', color: '#1C3D2E',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                  padding: '1rem 2.25rem', borderRadius: 999,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8EDE0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'white'; }}
              >
                Experimentar agora
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .forwhom-cta-img { display: none !important; }
          .forwhom-btn-container { margin-top: 1rem !important; }
        }
      `}</style>
    </section>
  );
}
