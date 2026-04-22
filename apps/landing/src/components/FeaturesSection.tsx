'use client';

import { ScrollReveal, StaggerReveal, StaggerItem } from './ParallaxKit';
import { Monitor, ClipboardList } from 'lucide-react';

const FEATURES = [
  {
    icon: '🛒', title: 'PDV Inteligente',
    description: 'Ponto de venda completo com busca por nome ou código, descontos, brindes, múltiplas formas de pagamento e parcelamento.',
    tags: ['Desconto', 'Brinde', 'Parcelamento'],
    highlight: true,
  },
  {
    icon: '📦', title: 'Controle de Estoque',
    description: 'Estoque em tempo real com alertas de mínimo, histórico de movimentações e inventário. Nunca mais venda o que não tem.',
    tags: ['Alerta', 'Histórico', 'Inventário'],
    highlight: false,
  },
  {
    icon: '🛡️', title: 'Garantia Digital',
    description: 'Certificado de garantia gerado automaticamente a cada venda. Código único e envio direto no WhatsApp do cliente.',
    tags: ['WhatsApp', 'QR Code', 'Automático'],
    highlight: false,
  },
  {
    icon: '👥', title: 'Gestão de Clientes',
    description: 'Cadastro completo com histórico de compras, aniversário, CPF/CNPJ e observações internas.',
    tags: ['Histórico', 'Fidelidade', 'CRM'],
    highlight: false,
  },
  {
    icon: '🔗', title: 'Fornecedores',
    description: 'Cadastre fornecedores, registre pedidos e envie direto via WhatsApp. Estoque baixo pré-preenche o pedido automaticamente.',
    tags: ['Pedidos', 'WhatsApp', 'Contatos'],
    highlight: false,
  },
  {
    icon: '🔧', title: 'Ordens de Serviço',
    description: 'Kanban visual: orçamento → aprovado → em andamento → concluído → cobrado. Avance o status com 1 clique.',
    tags: ['Kanban', 'Status', 'Instalação'],
    highlight: true,
  },
  {
    icon: '💰', title: 'Financeiro Completo',
    description: 'Contas a pagar e receber, fluxo de caixa, DRE simplificado. Saiba exatamente quanto sua loja lucra.',
    tags: ['Fluxo de Caixa', 'DRE', 'Relatórios'],
    highlight: false,
  },
  {
    icon: '📊', title: 'Relatórios e Análises',
    description: 'Vendas por período com gráfico diário, top produtos, forma de pagamento preferida e estoque crítico.',
    tags: ['Gráficos', 'Exportar', 'Dashboard'],
    highlight: false,
  },
  {
    icon: '🧾', title: 'Documento de Venda',
    description: 'Comprovantes de venda em PDF com dados completos. Profissional e rastreável em qualquer momento.',
    tags: ['PDF', 'Profissional', 'Rastreável'],
    highlight: false,
  },
];

export default function FeaturesSection() {
  // Layout tipo Ascone: grade com cards de tamanhos variados
  const bentoConfig = [
    { colSpan: '8', rowSpan: '2' }, // PDV — grande
    { colSpan: '4', rowSpan: '1' }, // Estoque
    { colSpan: '4', rowSpan: '1' }, // Garantia
    { colSpan: '4', rowSpan: '1' }, // Clientes
    { colSpan: '4', rowSpan: '1' }, // Fornecedores
    { colSpan: '4', rowSpan: '2' }, // OS — vertical
    { colSpan: '8', rowSpan: '1' }, // Financeiro — largo
    { colSpan: '6', rowSpan: '1' }, // Relatórios
    { colSpan: '6', rowSpan: '1' }, // Documento
  ];

  return (
    <section id="funcionalidades" style={{ background: '#F7F6F2', padding: '8rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 2rem' }}>

        {/* Header — estilo Ascone */}
        <ScrollReveal direction="up">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '5rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C3D2E', marginBottom: '1rem' }}>
                Módulos do sistema
              </p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#111', maxWidth: 520 }}>
                Tudo que sua loja{' '}
                <em style={{ fontStyle: 'italic', color: '#1C3D2E' }}>precisa.</em>
              </h2>
            </div>
            <p style={{ fontSize: '1rem', color: '#666', maxWidth: 340, lineHeight: 1.7, fontFamily: 'Inter, sans-serif', paddingTop: '3.5rem' }}>
              Um sistema integrado do PDV ao financeiro. Sem precisar de vários aplicativos diferentes.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid — no visual limpo do Ascone */}
        <StaggerReveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.25rem',
            gridAutoRows: 'minmax(260px, auto)',
          }}
        >
          {FEATURES.map((feat, i) => {
            const cfg = bentoConfig[i] || { colSpan: '4', rowSpan: '1' };
            const isLarge = cfg.colSpan === '8' || cfg.colSpan === '12';
            const isHighlight = feat.highlight;

            return (
              <StaggerItem
                key={i}
                direction="up"
                style={{ gridColumn: `span ${cfg.colSpan}`, gridRow: `span ${cfg.rowSpan}` }}
              >
                <div
                  style={{
                    background: isHighlight ? '#1C3D2E' : '#fff',
                    border: isHighlight ? 'none' : '1px solid #E0DDD5',
                    borderRadius: 20,
                    padding: isLarge ? '3rem' : '2.25rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: isLarge && !isHighlight ? 'row' : 'column',
                    alignItems: isLarge && !isHighlight ? 'center' : 'flex-start',
                    gap: isLarge && !isHighlight ? '3rem' : '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = isHighlight
                      ? '0 20px 60px rgba(28,61,46,0.3)'
                      : '0 10px 40px rgba(0,0,0,0.07)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Decoração estrelas — só nos cards highlight */}
                  {isHighlight && (
                    <div style={{ position: 'absolute', top: 24, right: 24, color: 'rgba(255,255,255,0.15)', fontSize: '2rem', userSelect: 'none' }}>✦</div>
                  )}

                  {/* Conteúdo principal */}
                  <div style={{ flex: 1 }}>
                    {/* Mockup UI para card PDV */}
                    {isHighlight && i === 0 && (
                      <div style={{
                        width: '100%', height: 160, borderRadius: 12, overflow: 'hidden',
                        marginBottom: '1.5rem', flexShrink: 0,
                        background: '#f8f9fa'
                      }}>
                        <img 
                          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop" 
                          alt="Transação no balcão de vendas" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    {/* Mockup UI para card OS */}
                    {isHighlight && i === 5 && (
                      <div style={{
                        width: '100%', height: 140, borderRadius: 12, overflow: 'hidden',
                        marginBottom: '1.5rem', flexShrink: 0,
                        background: '#f8f9fa'
                      }}>
                        <img 
                          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop" 
                          alt="Anotação de ordem de serviço" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                  {/* Ícone */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: isHighlight ? 'rgba(255,255,255,0.1)' : '#F0EDE5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, marginBottom: '1.5rem',
                    }}>
                      {feat.icon}
                    </div>

                    <h3 style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: isLarge ? '1.75rem' : '1.25rem',
                      fontWeight: 700, lineHeight: 1.2,
                      color: isHighlight ? '#fff' : '#111',
                      marginBottom: '0.75rem',
                      letterSpacing: '-0.01em',
                    }}>
                      {feat.title}
                    </h3>
                    <p style={{
                      fontSize: '0.95rem',
                      color: isHighlight ? 'rgba(255,255,255,0.65)' : '#777',
                      lineHeight: 1.7,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {feat.description}
                    </p>
                  </div>

                  {/* Footer do card */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    width: isLarge && !isHighlight ? 'auto' : '100%',
                    flexShrink: 0,
                  }}>
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {feat.tags.map((tag, ti) => (
                        <span key={ti} style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.7rem', fontWeight: 600,
                          padding: '0.3rem 0.75rem',
                          borderRadius: 999,
                          background: isHighlight ? 'rgba(255,255,255,0.12)' : '#F0EDE5',
                          color: isHighlight ? 'rgba(255,255,255,0.8)' : '#1C3D2E',
                          letterSpacing: '0.05em',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Botão seta circular — igual ao Ascone */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: isHighlight ? 'rgba(255,255,255,0.15)' : '#F0EDE5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginLeft: 12,
                      transition: 'background 0.2s',
                    }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={isHighlight ? 'white' : '#1C3D2E'} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>

        {/* CSS responsivo para o grid */}
        <style>{`
          @media (max-width: 900px) {
            #funcionalidades [style*="span 8"],
            #funcionalidades [style*="span 6"],
            #funcionalidades [style*="span 4"] {
              grid-column: span 12 !important;
              grid-row: span 1 !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
