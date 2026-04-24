-- ============================================================
-- KDL Store — Migration v1.6
-- Execute no SQL Editor do Supabase (safe to re-run)
-- ============================================================

-- Tipo de produto: 'product' (padrão) ou 'service'
-- Serviços não consomem estoque e não aparecem no catálogo público
alter table products add column if not exists product_type text default 'product';
