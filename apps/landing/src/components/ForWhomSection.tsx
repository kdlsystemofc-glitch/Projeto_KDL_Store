'use client';

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
  { icon: '🏪', label: 'Comércio Geral', desc: 'Qualquer tipo de produto, adaptável a qualquer loja' },
];

export default function ForWhomSection() {
  return (
    <section id="paraquem" style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(0,212,170,0.08) 0%, transparent 60%)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div className="section-label" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span>🏪</span> Para quem é o KDL Store?
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '1.25rem', color: '#F4F4FF' }}>
            Funciona para{' '}
            <span className="text-gradient">qualquer loja</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(244,244,255,0.5)', maxWidth: 540, margin: '0 auto' }}>
            O KDL Store foi pensado para ser flexível. Seja loja de som, moda ou utilidades — o sistema se adapta ao seu negócio.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {STORE_TYPES.map((type, i) => (
            <div
              key={i}
              className="card-hover"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 30, marginBottom: '0.75rem' }}>{type.icon}</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', color: '#F4F4FF' }}>{type.label}</h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(244,244,255,0.35)', lineHeight: 1.5 }}>{type.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ color: 'rgba(244,244,255,0.4)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Não encontrou o seu segmento? O KDL Store funciona para qualquer tipo de comércio varejista.
          </p>
          <a href="#planos" className="btn-primary" id="forwhom-cta">
            Experimentar agora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
