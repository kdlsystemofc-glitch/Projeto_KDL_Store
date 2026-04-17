'use client';

const FEATURES = [
  { icon: '🛒', title: 'PDV Inteligente', description: 'Ponto de venda completo com busca por nome ou código, descontos por item, brindes, múltiplas formas de pagamento e parcelamento.', color: '#6C47FF', tags: ['Desconto', 'Brinde', 'Parcelamento'] },
  { icon: '📦', title: 'Controle de Estoque', description: 'Estoque em tempo real com histórico de movimentações, alertas de mínimo, entrada e saída. Nunca mais venda o que não tem.', color: '#00D4AA', tags: ['Alerta', 'Histórico', 'Inventário'] },
  { icon: '🛡️', title: 'Garantia Digital', description: 'Certificado de garantia gerado automaticamente a cada venda. PDF profissional com QR code de validação por produto.', color: '#FF6B47', tags: ['PDF', 'QR Code', 'Automático'] },
  { icon: '👥', title: 'Gestão de Clientes', description: 'Cadastro completo com histórico de compras, saldo devedor e programa de fidelidade. Conheça cada cliente.', color: '#FFD447', tags: ['Histórico', 'Fidelidade', 'CRM'] },
  { icon: '🔗', title: 'Fornecedores', description: 'Cadastre fornecedores, vincule produtos e registre pedidos. Histórico completo de cada solicitação e entrega.', color: '#47C4FF', tags: ['Pedidos', 'Histórico', 'Contatos'] },
  { icon: '🔧', title: 'Ordens de Serviço', description: 'Registre serviços de instalação, reparo e manutenção. Fluxo completo: orçamento → aprovação → execução → cobrança.', color: '#B847FF', tags: ['OS', 'Status', 'Instalação'] },
  { icon: '💰', title: 'Financeiro Completo', description: 'Contas a pagar e receber, fluxo de caixa, DRE simplificado. Saiba exatamente quanto sua loja lucra.', color: '#47FF8B', tags: ['Fluxo de Caixa', 'DRE', 'Relatórios'] },
  { icon: '📊', title: 'Relatórios e Análises', description: 'Vendas por período, produto mais vendido, ticket médio, performance de vendedores. Decisões baseadas em dados.', color: '#FF47A0', tags: ['Gráficos', 'Exportar', 'Dashboard'] },
  { icon: '🧾', title: 'Documento de Venda', description: 'Emita comprovantes de venda em PDF com dados do cliente, produtos, valores e forma de pagamento. Profissional e rastreável.', color: '#FF9147', tags: ['PDF', 'Profissional', 'Rastreável'] },
];

export default function FeaturesSection() {
  return (
    <section id="funcionalidades" style={{ padding: '6rem 0', position: 'relative', background: 'rgba(255,255,255,0.01)' }}>
      {/* Grid pattern background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(108,71,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,71,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, #0A0A0F 0%, transparent 15%, transparent 85%, #0A0A0F 100%)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div className="section-label" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span>⚡</span> Funcionalidades
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '1.25rem', color: '#F4F4FF' }}>
            Tudo que sua loja{' '}
            <span className="text-gradient">precisa</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(244,244,255,0.5)', maxWidth: 560, margin: '0 auto' }}>
            Cada módulo foi desenhado a partir das necessidades reais do pequeno comércio brasileiro.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card-hover"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: f.color, opacity: 0.08, filter: 'blur(30px)', pointerEvents: 'none' }} />
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: '1rem' }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem', color: '#F4F4FF' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(244,244,255,0.5)', lineHeight: 1.65, marginBottom: '1.25rem' }}>{f.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {f.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 100, background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}28` }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
