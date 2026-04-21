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

        {/* GRID DE PROBLEMAS */}
        <StaggerReveal style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}>
          {PROBLEMS.map((p) => (
            <StaggerItem key={p.number} direction="up">
            <div
              key={p.number}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 32,
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
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
              {/* Número grande de fundo decorativo */}
              <span style={{
                position: 'absolute', top: 8, right: 16,
                fontSize: '5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif',
                color: 'rgba(255,255,255,0.03)',
                lineHeight: 1, userSelect: 'none',
              }}>
                {p.number}
              </span>

              {/* ANTES */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: '#FF6B6B',
                    background: 'rgba(255,107,107,0.12)', padding: '2px 10px', borderRadius: 999,
                  }}>
                    Problema
                  </span>
                </div>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem',
                  fontWeight: 800, color: 'rgba(255,255,255,0.88)',
                  marginBottom: '0.5rem', lineHeight: 1.3,
                }}>
                  {p.pain}
                </h3>
                <p style={{
                  fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.65, fontFamily: 'Inter, sans-serif',
                }}>
                  {p.painDetail}
                </p>
              </div>

              {/* Separador com gradiente */}
              <div style={{
                height: 1,
                background: `linear-gradient(to right, transparent, ${p.fixColor}55, transparent)`,
              }} />

              {/* DEPOIS */}
              <div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: p.fixColor,
                  display: 'block', marginBottom: '0.5rem',
                }}>
                  ✦ Com KDL Store
                </span>
                <p style={{
                  fontSize: '0.925rem', color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.65, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                }}>
                  {p.fix}
                </p>
              </div>
            </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <ScrollReveal direction="up" delay={0.1}>
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <p style={{
            fontSize: '1.15rem', color: 'rgba(255,255,255,0.5)',
            marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif',
          }}>
            Esses problemas têm solução. E ela é mais simples do que parece.
          </p>
          <a
            href="#funcionalidades"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', fontFamily: 'Inter, sans-serif',
              fontWeight: 600, fontSize: '0.95rem',
              padding: '0.9rem 2.5rem', borderRadius: 100,
              textDecoration: 'none',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'white';
              (e.currentTarget as HTMLAnchorElement).style.color = '#0A0A0F';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'white';
            }}
          >
            Ver como o KDL Store resolve
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
