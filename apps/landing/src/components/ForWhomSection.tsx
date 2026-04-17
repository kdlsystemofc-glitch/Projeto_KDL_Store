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
    <section id="paraquem" className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 80% 50%, rgba(0,212,170,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="section-label justify-center mx-auto w-fit">
            <span>🏪</span> Para quem é o KDL Store?
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Funciona para{' '}
            <span className="text-gradient">qualquer loja</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            O KDL Store foi pensado para ser flexível. Seja loja de som, moda ou utilidades —
            o sistema se adapta ao seu negócio.
          </p>
        </div>

        {/* Store types grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {STORE_TYPES.map((type, i) => (
            <div
              key={i}
              className="glass rounded-xl p-5 card-hover text-center group"
            >
              <div className="text-3xl mb-3 transition-transform group-hover:scale-125">
                {type.icon}
              </div>
              <h3
                className="text-sm font-bold mb-1.5"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {type.label}
              </h3>
              <p className="text-xs text-white/35 leading-relaxed">
                {type.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-white/40 mb-4 text-sm">
            Não encontrou o seu segmento? O KDL Store funciona para qualquer tipo de comércio varejista.
          </p>
          <a href="#planos" className="btn-primary">
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
