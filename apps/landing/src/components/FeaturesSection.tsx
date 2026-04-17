'use client';

const FEATURES = [
  {
    icon: '🛒',
    title: 'PDV Inteligente',
    description:
      'Ponto de venda completo com busca por nome ou código, descontos por item, brindes, múltiplas formas de pagamento e parcelamento.',
    color: '#6C47FF',
    tags: ['Desconto', 'Brinde', 'Parcelamento'],
  },
  {
    icon: '📦',
    title: 'Controle de Estoque',
    description:
      'Estoque em tempo real com histórico de movimentações, alertas de mínimo, entrada e saída. Nunca mais venda o que não tem.',
    color: '#00D4AA',
    tags: ['Alerta', 'Histórico', 'Inventário'],
  },
  {
    icon: '🛡️',
    title: 'Garantia Digital',
    description:
      'Certificado de garantia gerado automaticamente a cada venda. PDF profissional com QR code de validação por produto.',
    color: '#FF6B47',
    tags: ['PDF', 'QR Code', 'Automático'],
  },
  {
    icon: '👥',
    title: 'Gestão de Clientes',
    description:
      'Cadastro completo com histórico de compras, saldo devedor e programa de fidelidade. Conheça cada cliente.',
    color: '#FFD447',
    tags: ['Histórico', 'Fidelidade', 'CRM'],
  },
  {
    icon: '🔗',
    title: 'Fornecedores',
    description:
      'Cadastre fornecedores, vincule produtos e registre pedidos. Histórico completo de cada solicitação e entrega.',
    color: '#47C4FF',
    tags: ['Pedidos', 'Histórico', 'Contatos'],
  },
  {
    icon: '🔧',
    title: 'Ordens de Serviço',
    description:
      'Registre serviços de instalação, reparo e manutenção. Fluxo completo: orçamento → aprovação → execução → cobrança.',
    color: '#B847FF',
    tags: ['OS', 'Status', 'Instalação'],
  },
  {
    icon: '💰',
    title: 'Financeiro Completo',
    description:
      'Contas a pagar e receber, fluxo de caixa, DRE simplificado. Saiba exatamente quanto sua loja lucra.',
    color: '#47FF8B',
    tags: ['Fluxo de Caixa', 'DRE', 'Relatórios'],
  },
  {
    icon: '📊',
    title: 'Relatórios e Análises',
    description:
      'Vendas por período, produto mais vendido, ticket médio, performance de vendedores. Decisões baseadas em dados.',
    color: '#FF47A0',
    tags: ['Gráficos', 'Exportar', 'Dashboard'],
  },
  {
    icon: '🧾',
    title: 'Documento de Venda',
    description:
      'Emita comprovantes de venda em PDF com dados do cliente, produtos, valores e forma de pagamento. Profissional e rastreável.',
    color: '#FF9147',
    tags: ['PDF', 'Profissional', 'Rastreável'],
  },
];

export default function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-32 relative grid-pattern">
      {/* Gradient overlay sobre o grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-transparent to-[#0A0A0F] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="section-label justify-center mx-auto w-fit">
            <span>⚡</span> Funcionalidades
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Tudo que sua loja{' '}
            <span className="text-gradient">precisa</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Cada módulo foi desenhado a partir das necessidades reais do pequeno comércio
            brasileiro. Sem complicação, sem burocracia.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 card-hover group relative overflow-hidden"
            >
              {/* Glow accent */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ background: feat.color, filter: 'blur(40px)' }}
              />

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${feat.color}18` }}
              >
                {feat.icon}
              </div>

              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {feat.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                {feat.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {feat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${feat.color}15`,
                      color: feat.color,
                      border: `1px solid ${feat.color}30`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
