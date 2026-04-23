import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import { TenantProvider } from './context';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = user
    ? await supabase.from('users').select('*, tenants(name, plan_id, status)').eq('id', user.id).single()
    : { data: null };

  const tenants = userData?.tenants as any;
  const storeName = tenants?.name || 'Minha Loja';
  const userName = userData?.name || user?.email || '';
  const tenantId = userData?.tenant_id || '';
  const userId = user?.id || '';

  return (
    <TenantProvider tenantId={tenantId} userId={userId} storeName={storeName}>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <header className="main-header">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--kdl-text-dim)' }}>Loja</p>
              <p style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>{storeName}</p>
            </div>

            {tenants?.status === 'suspended' && (
              <a
                href="/app/configuracoes"
                className="badge badge-danger"
                style={{ textDecoration: 'none' }}
              >
                ⚠ Assinatura inativa
              </a>
            )}

            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.375rem 0.75rem',
                background: 'var(--kdl-surface-2)',
                border: '1px solid var(--kdl-border)',
                borderRadius: 8, fontSize: '0.8rem',
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6C47FF, #00D4AA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: 'var(--kdl-text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName}
              </span>
            </div>
          </header>

          <main className="page-content">
            {children}
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
