'use client';

import { ScrollReveal, StaggerReveal, StaggerItem, ParallaxBackground } from './ParallaxKit';

const PROBLEMS = [
  {
    number: '01',
    icon: '📦',
    pain: 'Sem controle de estoque',
    painDetail: 'Você vende o que não tem. Ou deixa de vender o que tem em excesso.',
    fix: 'Estoque em tempo real com alertas automáticos de reposição.',
    fixColor: '#00C6A2',
  },
  {
    number: '02',
    icon: '🧾',
    pain: 'Nota no papel que some',
    painDetail: 'Um pedaço de papel rasgado como comprovante não gera confiança — nem no cliente, nem em você.',
    fix: 'PDV digital com documento de venda em PDF, profissional e rastreável.',
    fixColor: '#6C47FF',
  },
  {
    number: '03',
    icon: '🔖',
    pain: 'Garantia colada no produto',
    painDetail: 'O papelzinho cai, o cliente volta reclamando e você não sabe o que vendeu nem quando.',
    fix: 'Certificado de garantia digital gerado automaticamente por produto vendido.',
    fixColor: '#00C6A2',
  },
  {
    number: '04',
    icon: '📞',
    pain: 'Fornecedor só no telefone',
    painDetail: 'Ligar para cada fornecedor toda vez que precisa de algo é ineficiente e caro.',
    fix: 'Módulo de fornecedores com histórico completo de pedidos e contatos.',
    fixColor: '#6C47FF',
  },
  {
    number: '05',
    icon: '💸',
    pain: 'Desconto sem margem',
    painDetail: 'Você dá desconto de cabeça e não sabe se ainda está lucrando ou prejudicando o negócio.',
    fix: 'Desconto por item e global no PDV com margem calculada em tempo real.',
    fixColor: '#00C6A2',
  },
  {
    number: '06',
    icon: '🏦',
    pain: 'Financeiro no caderninho',
    painDetail: 'Aluguel, luz, contas a pagar — tudo na memória ou num caderno perdido.',
    fix: 'Financeiro completo: contas a pagar/receber, fluxo de caixa e DRE.',
    fixColor: '#6C47FF',
  },
];

export default function ProblemsSection() {
  return (
    <section
      id="problemas"
      style={{
        background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0B1A 60%, #0A0A0F 100%)',
        padding: '7rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Brilho decorativo de fundo */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse, rgba(108,71,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>

        {/* HEADER */}
        <ScrollReveal direction="up">
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,80,80,0.05)',
            border: '1px solid rgba(255,80,80,0.15)',
            borderRadius: 100, padding: '0.4rem 1.25rem',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,80,80,0.9)' }}>
              A realidade do pequeno comércio
            </span>
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'rgba(255,255,255,0.93)',
            marginBottom: '1.25rem',
          }}>
            Sua loja merece mais<br />
            <span style={{
              background: 'linear-gradient(90deg, #6C47FF, #00C6A2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              do que improviso.
            </span>
          </h2>
          <p style={{
            fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.7,
            fontFamily: 'Inter, sans-serif',
          }}>
            Criamos o KDL Store depois de ver de perto como pequenas lojas ainda sobrevivem no limite — e como isso não precisa ser assim.
          </p>
        </div>
        </ScrollReveal>

        {/* GRID DE PROBLEMAS BENTO */}
        <StaggerReveal style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.5rem',
          gridAutoRows: 'minmax(300px, auto)'
        }}>
          {PROBLEMS.map((p, i) => {
            // Configuração Bento
            const spans = [
              'col-span-12 md:col-span-8 row-span-1', // 01 largo
              'col-span-12 md:col-span-4 row-span-2', // 02 vertical
              'col-span-12 md:col-span-4 row-span-1', // 03 quadrado
              'col-span-12 md:col-span-4 row-span-1', // 04 quadrado
              'col-span-12 md:col-span-8 row-span-1', // 05 largo
              'col-span-12 md:col-span-12 row-span-1', // 06 panoramico
            ];
            const configClass = spans[i] || 'col-span-12 md:col-span-4 row-span-1';
            const isLarge = configClass.includes('col-span-8') || configClass.includes('col-span-12');
            const isVertical = configClass.includes('row-span-2');

            return (
              <StaggerItem key={p.number} direction="up" className={configClass}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 32,
                    padding: isLarge ? '3rem' : '2.5rem',
                    display: 'flex',
                    flexDirection: isLarge ? 'row' : 'column',
                    alignItems: isLarge ? 'center' : 'flex-start',
                    gap: isLarge ? '3rem' : '1.5rem',
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className="problem-card"
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'rgba(255,255,255,0.12)';
                    el.style.background = 'rgba(255,255,255,0.04)';
                    el.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'rgba(255,255,255,0.06)';
                    el.style.background = 'rgba(255,255,255,0.02)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Número grande estilo tipográfico limpo */}
                  <div style={{
                    position: 'absolute', top: -20, right: -10,
                    fontSize: isLarge ? '12rem' : '8rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif',
                    color: 'rgba(255,255,255,0.02)',
                    lineHeight: 1, userSelect: 'none', pointerEvents: 'none'
                  }}>
                    {p.number}
                  </div>

                  <div style={{ flex: 1, zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                        {p.icon}
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF6B6B', background: 'rgba(255,107,107,0.1)', padding: '4px 12px', borderRadius: 100 }}>
                        Problema
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: isLarge ? '1.8rem' : '1.4rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                      {p.pain}
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                      {p.painDetail}
                    </p>
                  </div>

                  {/* Separador flexível */}
                  {!isLarge && <div style={{ width: '100%', height: 1, background: `linear-gradient(to right, transparent, ${p.fixColor}40, transparent)`, margin: '1rem 0' }} />}
                  {isLarge && <div style={{ width: 1, height: '80%', background: `linear-gradient(to bottom, transparent, ${p.fixColor}40, transparent)` }} className="problem-divider" />}

                  <div style={{ flex: 1, zIndex: 1 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.fixColor, display: 'block', marginBottom: '0.75rem' }}>
                      ✦ A solução
                    </span>
                    <p style={{ fontSize: isLarge ? '1.1rem' : '1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      {p.fix}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div style={{ textAlign: 'center', marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>
              Esses problemas têm solução. E ela é mais simples do que parece.
            </p>
            <a
              href="#funcionalidades"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.95)', color: '#0A0A0F',
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem',
                padding: '1rem 2.5rem', borderRadius: 100, textDecoration: 'none',
                transition: 'all 0.3s ease', boxShadow: '0 10px 40px rgba(255,255,255,0.1)'
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 15px 50px rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 10px 40px rgba(255,255,255,0.1)';
              }}
            >
              Ver como resolver
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </ScrollReveal>

        {/* Estilos CSS do Bento Responsivo */}
        <style>{`
          .col-span-12 { grid-column: span 12 / span 12; }
          .row-span-1 { grid-row: span 1 / span 1; }
          .row-span-2 { grid-row: span 2 / span 2; }
          
          @media (min-width: 768px) {
            .md\\:col-span-4 { grid-column: span 4 / span 12; }
            .md\\:col-span-8 { grid-column: span 8 / span 12; }
            .md\\:col-span-12 { grid-column: span 12 / span 12; }
          }
          
          @media (max-width: 767px) {
            .problem-card {
              flex-direction: column !important;
              padding: 2rem !important;
              align-items: flex-start !important;
              gap: 1.5rem !important;
            }
            .problem-divider {
              width: 100% !important;
              height: 1px !important;
              background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent) !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
