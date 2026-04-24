import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: tenant } = await supabase.from('tenants').select('name').eq('slug', slug).single();
  return {
    title: tenant ? `Catálogo — ${tenant.name}` : 'Catálogo',
    description: tenant ? `Veja os produtos disponíveis em ${tenant.name}` : '',
  };
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function CatalogoPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id,name,slug')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!tenant) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('id,name,sku,sale_price,stock_qty,unit,warranty_months,image_url,categories(name)')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .neq('product_type', 'service')
    .gt('stock_qty', 0)
    .order('name');

  const items = products || [];

  return (
    <>
      <style>{`
        body { background: #0f0f0f !important; color: #e5e5e5; }
        .cat-header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-bottom: 1px solid #2a2a3e; padding: 1.5rem 2rem; text-align: center; }
        .cat-logo { font-family: Outfit, sans-serif; font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #6C47FF, #00D4AA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .cat-subtitle { color: #888; font-size: 0.875rem; margin-top: 4px; }
        .cat-count { display: inline-block; background: rgba(108,71,255,0.15); color: #a78bfa; border: 1px solid rgba(108,71,255,0.3); border-radius: 20px; font-size: 0.72rem; font-weight: 600; padding: 2px 12px; margin-top: 8px; }
        .cat-container { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
        .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .cat-card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; transition: transform 0.2s, border-color 0.2s; }
        .cat-card:hover { transform: translateY(-2px); border-color: rgba(108,71,255,0.4); }
        .cat-img-wrap { width: 100%; height: 160px; background: #242424; display: flex; align-items: center; justify-content: center; font-size: 3rem; overflow: hidden; }
        .cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .cat-body { padding: 1rem; }
        .cat-name { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; line-height: 1.3; color: #e5e5e5; }
        .cat-category { font-size: 0.72rem; color: #666; margin-bottom: 8px; }
        .cat-price { font-family: Outfit, sans-serif; font-size: 1.25rem; font-weight: 800; color: #00D4AA; }
        .cat-meta { font-size: 0.72rem; color: #555; margin-top: 6px; }
        .cat-warranty { display: inline-block; background: rgba(16,185,129,0.1); color: #10B981; border-radius: 4px; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; margin-top: 4px; }
        .cat-empty { text-align: center; padding: 4rem 2rem; color: #555; }
        .cat-footer { text-align: center; padding: 2rem; border-top: 1px solid #1a1a1a; color: #444; font-size: 0.75rem; margin-top: 2rem; }
        @media (max-width: 600px) { .cat-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); } .cat-logo { font-size: 1.5rem; } }
      `}</style>

      <div className="cat-header">
        <p className="cat-logo">{tenant.name}</p>
        <p className="cat-subtitle">Catálogo de Produtos</p>
        <span className="cat-count">🛒 {items.length} itens disponíveis</span>
      </div>

      <div className="cat-container">
        {!items.length ? (
          <div className="cat-empty">
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</p>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Nenhum produto disponível no momento.</p>
            <p>Volte em breve para novidades!</p>
          </div>
        ) : (
          <div className="cat-grid">
            {items.map((p: any) => (
              <div key={p.id} className="cat-card">
                <div className="cat-img-wrap">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} />
                    : '📦'}
                </div>
                <div className="cat-body">
                  <p className="cat-name">{p.name}</p>
                  {p.categories?.name && <p className="cat-category">{p.categories.name}</p>}
                  <p className="cat-price">{fmt(p.sale_price)}</p>
                  <p className="cat-meta">
                    Estoque: {p.stock_qty} {p.unit}
                    {p.sku ? ` · SKU: ${p.sku}` : ''}
                  </p>
                  {(p.warranty_months ?? 0) > 0 && (
                    <span className="cat-warranty">🛡️ {p.warranty_months}m garantia</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cat-footer">
        Catálogo gerado por <strong>KDL Store</strong> · {new Date().toLocaleDateString('pt-BR')}
      </div>
    </>
  );
}
