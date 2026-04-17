export default function Footer() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', padding: '4rem 0 2.5rem' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 100%, rgba(108,71,255,0.07) 0%, transparent 70%)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #6C47FF, #00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15 }}>K</div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F4F4FF' }}>
                KDL <span className="text-gradient">Store</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(244,244,255,0.35)', lineHeight: 1.7, maxWidth: 300 }}>
              Sistema de gestão completo para o pequeno comércio brasileiro. Do estoque ao financeiro, tudo em um só lugar.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
              <a href="https://instagram.com/kdlstore" id="footer-instagram" aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'all 0.2s ease' }}>
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="https://wa.me/5511999999999" id="footer-whatsapp" aria-label="WhatsApp" style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'all 0.2s ease' }}>
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>

          {/* Links Produto */}
          <div>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(244,244,255,0.7)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Produto</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[['Funcionalidades', '#funcionalidades'], ['Planos', '#planos'], ['Para quem é?', '#paraquem'], ['FAQ', '#faq']].map(([label, href]) => (
                <li key={label}><a href={href} style={{ fontSize: '0.875rem', color: 'rgba(244,244,255,0.38)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={e => (e.currentTarget.style.color = '#F4F4FF')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,255,0.38)')}>{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal + Acesso */}
          <div>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(244,244,255,0.7)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {['Termos de Uso', 'Política de Privacidade', 'Cookies'].map(item => (
                <li key={item}><a href="#" style={{ fontSize: '0.875rem', color: 'rgba(244,244,255,0.38)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={e => (e.currentTarget.style.color = '#F4F4FF')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,255,0.38)')}>{item}</a></li>
              ))}
            </ul>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(244,244,255,0.7)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Acesso</h4>
            <a href={`${storeUrl}/login`} style={{ fontSize: '0.875rem', color: '#6C47FF', textDecoration: 'none', fontWeight: 600 }}>Entrar na minha conta →</a>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(244,244,255,0.2)' }}>© 2025 KDL Store. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D4AA', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            <p style={{ fontSize: '0.8rem', color: 'rgba(244,244,255,0.2)' }}>Sistema operacional</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </footer>
  );
}
