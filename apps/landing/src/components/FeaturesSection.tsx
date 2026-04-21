'use client';

import { ScrollReveal, StaggerReveal, StaggerItem, ParallaxElement } from './ParallaxKit';

const FEATURES = [
  { icon: '🛒', title: 'PDV Inteligente', description: 'Ponto de venda completo com busca por nome ou código, descontos, brindes, múltiplas formas de pagamento e parcelamento.', color: '#6C47FF', tags: ['Desconto', 'Brinde', 'Parcelamento'], image: '/features/pdv.jpg' },
  { icon: '📦', title: 'Controle de Estoque', description: 'Estoque em tempo real com histórico de movimentações, alertas de mínimo, entrada e saída. Nunca mais venda o que não tem.', color: '#00C6A2', tags: ['Alerta', 'Histórico', 'Inventário'], image: '/features/estoque.jpg' },
  { icon: '🛡️', title: 'Garantia Digital', description: 'Certificado de garantia gerado automaticamente a cada venda. Código único e envio direto no WhatsApp do cliente.', color: '#FF6B47', tags: ['WhatsApp', 'QR Code', 'Automático'] },
  { icon: '👥', title: 'Gestão de Clientes', description: 'Cadastro completo com histórico de compras, aniversário, CPF/CNPJ e observações internas.', color: '#F59E0B', tags: ['Histórico', 'Fidelidade', 'CRM'], image: '/features/clientes.jpg' },
  { icon: '🔗', title: 'Fornecedores', description: 'Cadastre fornecedores, registre pedidos e envie direto via WhatsApp. Estoque baixo pré-preenche o pedido.', color: '#3B82F6', tags: ['Pedidos', 'WhatsApp', 'Contatos'] },
  { icon: '🔧', title: 'Ordens de Serviço', description: 'Kanban visual: orçamento → aprovado → em andamento → concluído → cobrado. Avance com 1 clique.', color: '#8B5CF6', tags: ['Kanban', 'Status', 'Instalação'], image: '/features/os.jpg' },
  { icon: '💰', title: 'Financeiro Completo', description: 'Contas a pagar e receber, fluxo de caixa, DRE simplificado. Saiba exatamente quanto sua loja lucra.', color: '#10B981', tags: ['Fluxo de Caixa', 'DRE', 'Relatórios'] },
  { icon: '📊', title: 'Relatórios e Análises', description: 'Vendas por período com gráfico diário, top produtos, forma de pagamento e estoque crítico.', color: '#EC4899', tags: ['Gráficos', 'Exportar', 'Dashboard'] },
  { icon: '🧾', title: 'Documento de Venda', description: 'Comprovantes de venda em PDF com dados completos. Profissional e rastreável em qualquer momento.', color: '#F97316', tags: ['PDF', 'Profissional', 'Rastreável'] },
];

export default function FeaturesSection() {
  // Configuração Bento Grid: spans para colunas (base 12)
  const bentoConfig = [
    { span: 'col-span-12 md:col-span-8', row: 'row-span-2' }, // PDV (Maior)
    { span: 'col-span-12 md:col-span-4', row: 'row-span-1' }, // Estoque
    { span: 'col-span-12 md:col-span-4', row: 'row-span-1' }, // Garantia
    { span: 'col-span-12 md:col-span-4', row: 'row-span-1' }, // Clientes
    { span: 'col-span-12 md:col-span-4', row: 'row-span-1' }, // Fornecedores
    { span: 'col-span-12 md:col-span-4', row: 'row-span-2' }, // OS (Vertical)
    { span: 'col-span-12 md:col-span-8', row: 'row-span-1' }, // Financeiro (Largo)
    { span: 'col-span-12 md:col-span-6', row: 'row-span-1' }, // Relatórios
    { span: 'col-span-12 md:col-span-6', row: 'row-span-1' }, // Documento de venda
  ];

  return (
    <section id="funcionalidades" style={{ background: '#07060F', padding: '8rem 0', position: 'relative', overflow: 'hidden' }}>

      {/* Grade decorativa inspirada no Dribbble */}
      <ParallaxElement speed={0.15} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }} />
      </ParallaxElement>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>

        {/* Header no estilo tipográfico Dribbble */}
        <ScrollReveal direction="up" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 100, padding: '0.4rem 1.25rem', marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
              Módulos do sistema
            </span>
          </div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em',
            color: 'rgba(255,255,255,0.95)', marginBottom: '1.5rem',
          }}>
            O controle perfeito para <br/>
            <span style={{ 
              fontFamily: 'Inter, serif', 
              fontStyle: 'italic', 
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              marginRight: '8px'
            }}>o futuro da</span>
            <span style={{ background: 'linear-gradient(90deg, #6C47FF, #00C6A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              sua loja
            </span>
          </h2>
        </ScrollReveal>

        {/* Bento Grid */}
        <StaggerReveal style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '1.5rem',
          autoRows: 'minmax(280px, auto)' 
        }}>
          {FEATURES.map((f, i) => {
            const config = bentoConfig[i] || { span: 'col-span-12 md:col-span-4', row: 'row-span-1' };
            const isLarge = config.span.includes('col-span-8');
            const isVertical = config.row.includes('row-span-2');
            
            return (
            <StaggerItem key={i} direction="up" className={`${config.span} ${config.row}`}>
              <div
                style={{
                  height: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 32, // Extremamente arredondado
                  padding: isLarge ? '2.5rem' : '2rem',
                  position: 'relative', overflow: 'hidden',
                  display: 'flex',
                  flexDirection: isLarge ? 'row' : 'column',
                  gap: '2rem',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'default',
                }}
                className="bento-card"
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = 'rgba(255,255,255,0.04)';
                  el.style.borderColor = 'rgba(255,255,255,0.12)';
                  el.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = 'rgba(255,255,255,0.02)';
                  el.style.borderColor = 'rgba(255,255,255,0.06)';
                  el.style.transform = 'translateY(0)';
                }}
              >
                {/* Glow subtle background */}
                <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: f.color, opacity: 0.05, filter: 'blur(50px)', pointerEvents: 'none' }} />

                {/* Conteúdo */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: `${f.color}15`, border: `1px solid ${f.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, marginBottom: '1.5rem', flexShrink: 0
                  }}>
                    {f.icon}
                  </div>

                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: isLarge ? '1.75rem' : '1.25rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>{f.description}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                    {f.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.8rem',
                        borderRadius: 100, background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.6)', border: `1px solid rgba(255,255,255,0.08)`,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Imagem */}
                {f.image && (
                  <div style={{
                    width: isLarge ? '50%' : '100%', 
                    height: isLarge ? '100%' : (isVertical ? 250 : 160), 
                    borderRadius: 20, 
                    overflow: 'hidden', position: 'relative',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginTop: isLarge ? 0 : 'auto',
                    flexShrink: 0
                  }}>
                    <img src={f.image} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.8) 0%, transparent 50%)' }} />
                  </div>
                )}
              </div>
            </StaggerItem>
            );
          })}
        </StaggerReveal>

        {/* Global Styles for Bento responsiveness */}
        <style>{`
          .col-span-12 { grid-column: span 12 / span 12; }
          .row-span-1 { grid-row: span 1 / span 1; }
          .row-span-2 { grid-row: span 2 / span 2; }
          
          @media (min-width: 768px) {
            .md\\:col-span-4 { grid-column: span 4 / span 12; }
            .md\\:col-span-6 { grid-column: span 6 / span 12; }
            .md\\:col-span-8 { grid-column: span 8 / span 12; }
          }
          
          @media (max-width: 767px) {
            .bento-card {
              flex-direction: column !important;
              padding: 1.5rem !important;
            }
            .bento-card > div:last-child {
              width: 100% !important;
              height: 200px !important;
              margin-top: 1.5rem !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
