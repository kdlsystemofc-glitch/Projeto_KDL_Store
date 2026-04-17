'use client';

const FEATURES = [
  { icon: '🛒', title: 'PDV Inteligente', description: 'Ponto de venda completo com busca por nome ou código, descontos por item, brindes, múltiplas formas de pagamento e parcelamento.', color: '#6C47FF', tags: ['Desconto', 'Brinde', 'Parcelamento'] },
  { icon: '📦', title: 'Controle de Estoque', description: 'Estoque em tempo real com histórico de movimentações, alertas de mínimo, entrada e saída. Nunca mais venda o que não tem.', color: '#00C6A2', tags: ['Alerta', 'Histórico', 'Inventário'] },
  { icon: '🛡️', title: 'Garantia Digital', description: 'Certificado de garantia gerado automaticamente a cada venda. PDF profissional com QR code de validação por produto.', color: '#FF6B47', tags: ['PDF', 'QR Code', 'Automático'] },
  { icon: '👥', title: 'Gestão de Clientes', description: 'Cadastro completo com histórico de compras, saldo devedor e programa de fidelidade.', color: '#F59E0B', tags: ['Histórico', 'Fidelidade', 'CRM'] },
  { icon: '🔗', title: 'Fornecedores', description: 'Cadastre fornecedores, vincule produtos e registre pedidos com histórico completo.', color: '#3B82F6', tags: ['Pedidos', 'Histórico', 'Contatos'] },
  { icon: '🔧', title: 'Ordens de Serviço', description: 'Fluxo completo: orçamento → aprovação → execução → cobrança. Ideal para instalações e reparos.', color: '#8B5CF6', tags: ['OS', 'Status', 'Instalação'] },
  { icon: '💰', title: 'Financeiro Completo', description: 'Contas a pagar e receber, fluxo de caixa, DRE simplificado. Saiba exatamente quanto sua loja lucra.', color: '#10B981', tags: ['Fluxo de Caixa', 'DRE', 'Relatórios'] },
  { icon: '📊', title: 'Relatórios e Análises', description: 'Vendas por período, produto mais vendido, ticket médio, performance de vendedores.', color: '#EC4899', tags: ['Gráficos', 'Exportar', 'Dashboard'] },
  { icon: '🧾', title: 'Documento de Venda', description: 'Comprovantes de venda em PDF com dados completos. Profissional e rastreável.', color: '#F97316', tags: ['PDF', 'Profissional', 'Rastreável'] },
];

export default function FeaturesSection() {
  return (
    <section id="funcionalidades" style={{ padding: '6rem 0', background: '#F5F4FF', position: 'relative' }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(108,71,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,71,255,0.04) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>
            <span>⚡</span> Funcionalidades
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', color: '#16113A' }}>
            Tudo que sua loja{' '}
            <span className="text-gradient">precisa</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#6B6A8A', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            Cada módulo foi desenhado a partir das necessidades reais do pequeno comércio brasileiro.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="kdl-card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: f.color, opacity: 0.06, filter: 'blur(25px)' }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: '1rem' }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: '#16113A', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B6A8A', lineHeight: 1.65, marginBottom: '1.25rem' }}>{f.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {f.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100, background: `${f.color}10`, color: f.color, border: `1px solid ${f.color}25` }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
