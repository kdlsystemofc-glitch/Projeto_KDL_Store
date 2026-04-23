-- ============================================================
-- KDL Store — Migration v1.3 (Fase 8)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- GRADE DE PRODUTOS (variações: tamanho, cor, etc.)
-- ============================================================
create table if not exists product_variants (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  name        text not null,
  sku         text,
  stock_qty   integer default 0,
  sale_price  numeric(10,2),
  cost_price  numeric(10,2),
  is_active   boolean default true,
  created_at  timestamptz default now()
);

alter table product_variants enable row level security;
create policy "variants_tenant_policy" on product_variants
  for all using (tenant_id = auth_tenant_id());

create index if not exists idx_variants_product on product_variants(product_id);

-- Decrementa estoque de variação
create or replace function decrement_variant_stock(p_variant_id uuid, p_qty integer)
returns void as $$
begin
  update product_variants set stock_qty = greatest(0, stock_qty - p_qty) where id = p_variant_id;
end;
$$ language plpgsql security definer;

-- sale_items recebe referência opcional à variação
alter table sale_items add column if not exists variant_id uuid references product_variants(id) on delete set null;

-- ============================================================
-- PETS (vinculados ao cliente)
-- ============================================================
create table if not exists pets (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  name        text not null,
  species     text default 'dog',  -- dog | cat | bird | rabbit | other
  breed       text,
  birth_date  date,
  notes       text,
  created_at  timestamptz default now()
);

alter table pets enable row level security;
create policy "pets_tenant_policy" on pets
  for all using (tenant_id = auth_tenant_id());

create index if not exists idx_pets_customer on pets(customer_id, tenant_id);

-- ============================================================
-- AGENDAMENTOS
-- ============================================================
create table if not exists appointments (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid references tenants(id) on delete cascade,
  customer_id    uuid references customers(id) on delete set null,
  pet_id         uuid references pets(id) on delete set null,
  title          text not null,
  scheduled_at   timestamptz not null,
  duration_min   integer default 60,
  status         text default 'scheduled',  -- scheduled | confirmed | in_progress | completed | cancelled
  notes          text,
  price          numeric(10,2) default 0,
  technician_id  uuid references users(id) on delete set null,
  created_at     timestamptz default now()
);

alter table appointments enable row level security;
create policy "appointments_tenant_policy" on appointments
  for all using (tenant_id = auth_tenant_id());

create index if not exists idx_appointments_date on appointments(tenant_id, scheduled_at);

-- ============================================================
-- REGRAS DE DESCONTO PROGRESSIVO
-- ============================================================
create table if not exists discount_rules (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references tenants(id) on delete cascade,
  name          text not null,
  min_qty       integer,           -- aplica se qualquer item tiver qty >= min_qty
  min_amount    numeric(10,2),     -- aplica se subtotal >= min_amount
  discount_pct  numeric(5,2) not null,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

alter table discount_rules enable row level security;
create policy "discount_rules_tenant_policy" on discount_rules
  for all using (tenant_id = auth_tenant_id());

create index if not exists idx_discount_rules_tenant on discount_rules(tenant_id, is_active);

-- ============================================================
-- FIDELIDADE: deduzir pontos
-- ============================================================
create or replace function deduct_loyalty_points(p_customer_id uuid, p_points integer)
returns void as $$
  update customers set loyalty_points = greatest(0, loyalty_points - p_points) where id = p_customer_id;
$$ language sql security definer;
