'use client';

const FEATURES = [
  { icon: '🛒', title: 'PDV Inteligente', description: 'Ponto de venda completo com busca por nome ou código, descontos por item, brindes, múltiplas formas de pagamento e parcelamento.', color: '#6C47FF', tags: ['Desconto', 'Brinde', 'Parcelamento'] },
  { icon: '📦', title: 'Controle de Estoque', description: 'Estoque em tempo real com histórico de movimentações, alertas de mínimo, entrada e saída. Nunca mais venda o que não tem.', color: '#00C6A2', tags: ['Alerta', 'Histórico', 'Inventário'] },
  { icon: '🛡️', title: 'Garantia Digital', description: 'Certificado de garantia gerado automaticamente a cada venda. PDF profissional com QR code de validação por produto.', color: '#FF6B47', tags: ['PDF', 'QR Code', 'Automático'] },
  { icon: '👥', title: 'Gestão de Clientes', description: 'Cadastro completo com histórico de compras, saldo devedor e programa de fidelidade integrado.', color: '#F59E0B', tags: ['Histórico', 'Fidelidade', 'CRM'] },
  { icon: '🔗', title: 'Fornecedores', description: 'Cadastre fornecedores, vincule produtos e registre pedidos com histórico completo de compras.', color: '#3B82F6', tags: ['Pedidos', 'Histórico', 'Contatos'] },
  { icon: '🔧', title: 'Ordens de Serviço', description: 'Fluxo completo: orçamento → aprovação → execução → cobrança. Ideal para instalações e reparos.', color: '#8B5CF6', tags: ['OS', 'Status', 'Instalação'] },
  { icon: '💰', title: 'Financeiro Completo', description: 'Contas a pagar e receber, fluxo de caixa, DRE simplificado. Saiba exatamente quanto sua loja lucra.', color: '#10B981', tags: ['Fluxo de Caixa', 'DRE', 'Relatórios'] },
  { icon: '📊', title: 'Relatórios e Análises', description: 'Vendas por período, produto mais vendido, ticket médio, performance de vendedores. Decisões baseadas em dados.', color: '#EC4899', tags: ['Gráficos', 'Exportar', 'Dashboard'] },
  { icon: '🧾', title: 'Documento de Venda', description: 'Comprovantes de venda em PDF com dados completos. Profissional e rastreável em qualquer momento.', color: '#F97316', tags: ['PDF', 'Profissional', 'Rastreável'] },
];

export default function FeaturesSection() {
  return (
    <section id="funcionalidades" style={{ background: '#07060F', padding: '7rem 0', position: 'relative', overflow: 'hidden' }}>

      {/* Grade decorativa de fundo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(108,71,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,71,255,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Brilho central */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 500,
        background: 'radial-gradient(ellipse, rgba(0,198,162,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,198,162,0.1)', border: '1px solid rgba(0,198,162,0.2)',
            borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.5rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C6A2', display: 'inline-block', boxShadow: '0 0 8px #00C6A2' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00C6A2' }}>
              Módulos do sistema
            </span>
          </div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em',
            color: 'rgba(255,255,255,0.93)', marginBottom: '1.25rem',
          }}>
            Tudo que sua loja precisa,<br />
            <span style={{
              background: 'linear-gradient(90deg, #6C47FF, #00C6A2)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>em um só lugar.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
            Cada módulo foi desenhado a partir das necessidades reais do pequeno comércio brasileiro.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '1.75rem',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.3s, transform 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = f.color + '66';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Glow decorativo */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: f.color, opacity: 0.08, filter: 'blur(35px)', pointerEvents: 'none' }} />

              {/* Ícone */}
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${f.color}18`,
                border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: '1.25rem',
              }}>
                {f.icon}
              </div>

              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: '0.6rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif' }}>{f.description}</p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {f.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.65rem',
                    borderRadius: 100, background: `${f.color}15`,
                    color: f.color, border: `1px solid ${f.color}30`,
                    fontFamily: 'Inter, sans-serif',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
