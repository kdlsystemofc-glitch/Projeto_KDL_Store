'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  {
    section: 'Principal',
    items: [
      { href: '/app/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/app/pdv', label: 'Ponto de Venda', icon: '🛒' },
    ],
  },
  {
    section: 'Gestão',
    items: [
      { href: '/app/estoque', label: 'Estoque', icon: '📦' },
      { href: '/app/clientes', label: 'Clientes', icon: '👥' },
      { href: '/app/fornecedores', label: 'Fornecedores', icon: '🔗' },
    ],
  },
  {
    section: 'Operações',
    items: [
      { href: '/app/os', label: 'Ordens de Serviço', icon: '🔧' },
      { href: '/app/garantias', label: 'Garantias', icon: '🛡️' },
    ],
  },
  {
    section: 'Financeiro',
    items: [
      { href: '/app/financeiro', label: 'Financeiro', icon: '💰' },
      { href: '/app/relatorios', label: 'Relatórios', icon: '📈' },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { href: '/app/configuracoes', label: 'Configurações', icon: '⚙️' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: '1.25rem 1rem',
          borderBottom: '1px solid var(--kdl-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #6C47FF, #00D4AA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 14,
            fontFamily: 'Outfit, sans-serif', flexShrink: 0,
          }}
        >K</div>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16 }}>
          KDL <span className="text-gradient">Store</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.625rem' }}>
        {NAV.map((section) => (
          <div key={section.section}>
            <p className="nav-section-label">{section.section}</p>
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-${item.href.replace('/app/', '').replace('/', '-')}`}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.75rem 0.625rem', borderTop: '1px solid var(--kdl-border)' }}>
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kdl-text-muted)' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
