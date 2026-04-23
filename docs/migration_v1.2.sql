-- ============================================================
-- KDL Store — Migration v1.2
-- Execute no SQL Editor do Supabase (safe to re-run: IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- Fidelidade: função para incrementar pontos atomicamente
create or replace function add_loyalty_points(p_customer_id uuid, p_points integer)
returns void as $$
  update customers set loyalty_points = loyalty_points + p_points where id = p_customer_id;
$$ language sql security definer;

-- Número de garantia (coluna já prevista no schema v1.0; garante existência)
alter table warranties add column if not exists warranty_code text;

-- Número sequencial de venda por tenant (já no schema v1.0; garante existência)
alter table tenants add column if not exists last_sale_number integer default 0;

-- Número da venda na tabela sales
alter table sales add column if not exists sale_number integer;

-- WhatsApp do tenant (para futuro envio de comprovantes)
alter table tenants add column if not exists whatsapp text;

-- OS vinculada à venda de origem (ex: instalação de produto vendido no PDV)
alter table service_orders add column if not exists sale_id uuid references sales(id) on delete set null;

-- Email no perfil do usuário (para convites e notificações)
alter table users add column if not exists email text;

-- Índice para busca rápida de garantia por código
create index if not exists idx_warranties_code on warranties(tenant_id, warranty_code);

-- Índice para OS por sale_id
create index if not exists idx_os_sale_id on service_orders(sale_id);
