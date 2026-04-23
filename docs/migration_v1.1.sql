-- ============================================================
-- KDL Store — Migration v1.1
-- Execute no SQL Editor do Supabase (kdlstore.com.br)
-- Data: 2026-04-23
-- ============================================================

-- ============================================================
-- 1. warranty_code nas garantias (identificador único público)
-- ============================================================
alter table warranties add column if not exists warranty_code text;
create unique index if not exists idx_warranties_code on warranties(warranty_code)
  where warranty_code is not null;

-- ============================================================
-- 2. warranty_months nos produtos (prazo padrão do produto)
-- ============================================================
alter table products add column if not exists warranty_months integer default 0;

-- ============================================================
-- 3. Campos extras nos fornecedores
-- ============================================================
alter table suppliers add column if not exists whatsapp text;
alter table suppliers add column if not exists payment_terms text;
alter table suppliers add column if not exists notes text;

-- ============================================================
-- 4. Vínculo de produto nos pedidos de fornecedor
-- ============================================================
alter table supplier_orders add column if not exists product_id uuid references products(id) on delete set null;

-- ============================================================
-- 5. Número sequencial de venda por tenant (#0001, #0002...)
-- ============================================================
alter table tenants add column if not exists last_sale_number integer default 0;
alter table sales    add column if not exists sale_number integer;

-- Função thread-safe para obter próximo número de venda
create or replace function get_next_sale_number(p_tenant_id uuid)
returns integer as $$
declare
  v_number integer;
begin
  update tenants
    set last_sale_number = last_sale_number + 1
    where id = p_tenant_id
    returning last_sale_number into v_number;
  return v_number;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 6. Email do usuário na tabela users
-- ============================================================
alter table users add column if not exists email text;

-- ============================================================
-- 7. Atualizar trigger handle_new_user para suportar convites
--    (usuários adicionados a um tenant existente)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_tenant_id uuid;
  v_plan_id   uuid;
  v_slug      text;
  v_is_invite boolean;
begin
  v_is_invite := coalesce((new.raw_user_meta_data->>'is_invite')::boolean, false);

  if v_is_invite then
    -- Usuário convidado: vincula ao tenant existente
    v_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;

    insert into users (id, tenant_id, name, email, role, is_active)
    values (
      new.id,
      v_tenant_id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      coalesce(new.raw_user_meta_data->>'role', 'seller'),
      true
    );
  else
    -- Novo lojista: cria tenant próprio
    select id into v_plan_id
      from plans
      where name = coalesce(new.raw_user_meta_data->>'plan_id', 'starter')
      limit 1;

    v_slug := regexp_replace(
      lower(coalesce(
        new.raw_user_meta_data->>'store_name',
        'loja-' || substr(new.id::text, 1, 8)
      )),
      '[^a-z0-9-]', '-', 'g'
    );

    insert into tenants (name, slug, plan_id, status)
    values (
      coalesce(new.raw_user_meta_data->>'store_name', 'Minha Loja'),
      v_slug,
      v_plan_id,
      'active'
    )
    returning id into v_tenant_id;

    insert into users (id, tenant_id, name, email, role, is_active)
    values (
      new.id,
      v_tenant_id,
      new.raw_user_meta_data->>'name',
      new.email,
      'owner',
      true
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 8. Índices extras de performance
-- ============================================================
create index if not exists idx_sales_tenant_number   on sales(tenant_id, sale_number);
create index if not exists idx_products_warranty     on products(tenant_id, warranty_months) where warranty_months > 0;
create index if not exists idx_supplier_orders_prod  on supplier_orders(product_id) where product_id is not null;

-- ============================================================
-- FIM DA MIGRATION v1.1
-- Após executar, o app estará pronto para as novas features.
-- ============================================================
