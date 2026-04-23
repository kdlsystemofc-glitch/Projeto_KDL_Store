-- ============================================================
-- KDL Store — Schema Completo do Banco de Dados (Supabase)
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- ============================================================
-- PLANOS
-- ============================================================
create table plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,  -- 'starter' | 'pro' | 'premium'
  display_name    text not null,
  price_monthly   numeric(10,2) not null,
  max_users       integer,        -- null = ilimitado
  max_products    integer,        -- null = ilimitado
  stripe_price_id text,
  features        jsonb,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

insert into plans (name, display_name, price_monthly, max_users, max_products, features) values
  ('starter', 'Starter',  49.90, 1,    300,  '{"pdv":true,"estoque":true,"garantia":true,"clientes":true,"documento":true,"relatorios_basicos":true}'),
  ('pro',      'Pro',      69.90, 3,    1000, '{"pdv":true,"estoque":true,"garantia":true,"clientes":true,"documento":true,"relatorios_basicos":true,"fornecedores":true,"os":true,"financeiro":true,"parcelamento":true,"exportacao":true}'),
  ('premium',  'Premium',  99.90, null, null, '{"pdv":true,"estoque":true,"garantia":true,"clientes":true,"documento":true,"relatorios_basicos":true,"fornecedores":true,"os":true,"financeiro":true,"parcelamento":true,"exportacao":true,"comissoes":true,"relatorios_avancados":true,"dre":true,"fidelidade":true,"whatsapp":true}');

-- ============================================================
-- TENANTS (Lojas)
-- ============================================================
create table tenants (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  slug                    text unique not null,
  plan_id                 uuid references plans(id),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text default 'active',  -- active | suspended | cancelled
  last_sale_number        integer default 0,
  created_at              timestamptz default now()
);

-- ============================================================
-- USUÁRIOS (Extensão de auth.users)
-- ============================================================
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid references tenants(id) on delete cascade,
  name        text,
  email       text,
  role        text default 'seller',  -- owner | manager | seller | technician
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Auto-cria user row após signup (ou vincula a tenant existente via invite)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_tenant_id uuid;
  v_plan_id   uuid;
  v_slug      text;
  v_is_invite boolean;
begin
  v_is_invite := (new.raw_user_meta_data->>'is_invite')::boolean;

  if v_is_invite then
    -- Usuário convidado: vincula ao tenant existente
    v_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;
    insert into users (id, tenant_id, name, email, role, is_active)
    values (new.id, v_tenant_id, new.raw_user_meta_data->>'name', new.email,
            coalesce(new.raw_user_meta_data->>'role', 'seller'), true);
  else
    -- Novo dono: cria tenant + plano
    select id into v_plan_id from plans where name = coalesce(new.raw_user_meta_data->>'plan_id', 'starter') limit 1;
    v_slug := regexp_replace(lower(coalesce(new.raw_user_meta_data->>'store_name', 'loja-' || substr(new.id::text, 1, 8))), '[^a-z0-9-]', '-', 'g');

    insert into tenants (name, slug, plan_id, status)
    values (coalesce(new.raw_user_meta_data->>'store_name', 'Minha Loja'), v_slug, v_plan_id, 'active')
    returning id into v_tenant_id;

    insert into users (id, tenant_id, name, email, role, is_active)
    values (new.id, v_tenant_id, new.raw_user_meta_data->>'name', new.email, 'owner', true);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CATEGORIAS DE PRODUTOS
-- ============================================================
create table categories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,
  name        text not null,
  parent_id   uuid references categories(id),
  created_at  timestamptz default now()
);

-- ============================================================
-- PRODUTOS
-- ============================================================
create table products (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid references tenants(id) on delete cascade,
  name             text not null,
  sku              text,
  category_id      uuid references categories(id),
  supplier_id      uuid references suppliers(id) on delete set null,
  cost_price       numeric(10,2) default 0,
  sale_price       numeric(10,2) not null,
  stock_qty        integer default 0,
  min_stock        integer default 0,
  unit             text default 'un',
  warranty_months  integer default 0,
  image_url        text,
  is_active        boolean default true,
  created_at       timestamptz default now()
);

-- Decrementa estoque de forma segura
create or replace function decrement_stock(p_product_id uuid, p_qty integer)
returns void as $$
begin
  update products set stock_qty = greatest(0, stock_qty - p_qty) where id = p_product_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================
create table stock_movements (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references tenants(id) on delete cascade,
  product_id      uuid references products(id),
  user_id         uuid references users(id),
  supplier_id     uuid references suppliers(id) on delete set null,
  type            text not null,  -- entry | exit | adjustment | loss
  qty             integer not null,
  unit_cost       numeric(10,2) default 0,
  reason          text,
  reference       text,
  reference_type  text,           -- sale | purchase_order | manual
  reference_id    uuid,
  created_at      timestamptz default now()
);

-- ============================================================
-- CLIENTES
-- ============================================================
create table customers (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references tenants(id) on delete cascade,
  name            text not null,
  cpf_cnpj        text,
  phone           text,
  email           text,
  address         jsonb,
  loyalty_points  integer default 0,
  created_at      timestamptz default now()
);

-- ============================================================
-- FORNECEDORES
-- ============================================================
create table suppliers (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid references tenants(id) on delete cascade,
  name           text not null,
  contact_name   text,
  phone          text,
  whatsapp       text,
  email          text,
  payment_terms  text,
  notes          text,
  created_at     timestamptz default now()
);

create table supplier_orders (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid references tenants(id) on delete cascade,
  supplier_id         uuid references suppliers(id),
  user_id             uuid references users(id),
  product_id          uuid references products(id) on delete set null,
  product_description text,
  qty                 integer default 1,
  notes               text,
  status              text default 'requested',  -- requested | received | partial | cancelled
  created_at          timestamptz default now()
);

-- ============================================================
-- VENDAS
-- ============================================================
create table sales (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references tenants(id) on delete cascade,
  sale_number     integer,
  customer_id     uuid references customers(id),
  seller_id       uuid references users(id),
  subtotal        numeric(10,2) not null,
  discount        numeric(10,2) default 0,
  total           numeric(10,2) not null,
  payment_method  text not null,  -- cash | pix | card | credit | credit_store
  installments    integer default 1,
  status          text default 'completed',  -- completed | cancelled | returned
  notes           text,
  created_at      timestamptz default now()
);

create table sale_items (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid references sales(id) on delete cascade,
  product_id  uuid references products(id),
  qty         integer not null,
  unit_price  numeric(10,2) not null,
  discount    numeric(10,2) default 0,
  is_gift     boolean default false,
  subtotal    numeric(10,2) not null
);

-- ============================================================
-- GARANTIAS
-- ============================================================
create table warranties (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references tenants(id) on delete cascade,
  warranty_code   text,
  sale_item_id    uuid references sale_items(id),
  sale_id         uuid references sales(id),
  customer_id     uuid references customers(id),
  product_id      uuid references products(id),
  warranty_months integer not null,
  issue_date      date not null default current_date,
  expiry_date     date not null,
  status          text default 'active',  -- active | expired | claimed
  notes           text
);

-- Auto-gera data de vencimento
create or replace function set_warranty_expiry()
returns trigger as $$
begin
  new.expiry_date := new.issue_date + (new.warranty_months * interval '1 month');
  return new;
end;
$$ language plpgsql;

create trigger warranty_expiry_trigger
  before insert or update on warranties
  for each row execute procedure set_warranty_expiry();

-- ============================================================
-- ORDENS DE SERVIÇO
-- ============================================================
create table service_orders (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references tenants(id) on delete cascade,
  customer_id     uuid references customers(id),
  technician_id   uuid references users(id),
  warranty_id     uuid references warranties(id),
  status          text default 'quote',  -- quote | approved | in_progress | completed | billed | cancelled
  description     text not null,
  price           numeric(10,2) default 0,
  estimated_date  date,
  completed_at    timestamptz,
  created_at      timestamptz default now()
);

-- ============================================================
-- FINANCEIRO
-- ============================================================
create table accounts_receivable (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid references tenants(id) on delete cascade,
  sale_id           uuid references sales(id),
  customer_id       uuid references customers(id),
  installment_number integer,
  amount            numeric(10,2) not null,
  due_date          date not null,
  paid_at           timestamptz,
  status            text default 'pending'  -- pending | paid | overdue
);

create table accounts_payable (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,
  supplier_id uuid references suppliers(id),
  description text not null,
  category    text,  -- rent | utilities | supplier | salary | tax | other
  amount      numeric(10,2) not null,
  due_date    date not null,
  paid_at     timestamptz,
  status      text default 'pending'
);

create table cash_transactions (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references tenants(id) on delete cascade,
  type            text not null,  -- in | out
  amount          numeric(10,2) not null,
  description     text,
  reference_id    uuid,
  reference_type  text,           -- sale | os | manual
  user_id         uuid references users(id),
  created_at      timestamptz default now()
);

-- ============================================================
-- ADMIN KDL (acesso interno)
-- ============================================================
create table admin_users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  role        text default 'super_admin',
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilita RLS em todas as tabelas tenant-bound
alter table tenants        enable row level security;
alter table users           enable row level security;
alter table categories      enable row level security;
alter table products        enable row level security;
alter table stock_movements enable row level security;
alter table customers       enable row level security;
alter table suppliers       enable row level security;
alter table supplier_orders enable row level security;
alter table sales           enable row level security;
alter table sale_items      enable row level security;
alter table warranties      enable row level security;
alter table service_orders  enable row level security;
alter table accounts_receivable enable row level security;
alter table accounts_payable    enable row level security;
alter table cash_transactions   enable row level security;

-- Função helper: pega tenant_id do usuário autenticado
create or replace function auth_tenant_id()
returns uuid as $$
  select tenant_id from users where id = auth.uid()
$$ language sql stable security definer;

-- Políticas individuais por tabela (mais explícito e sem erros)

-- Tabelas com tenant_id direto
create policy "categories_tenant_policy"       on categories       for all using (tenant_id = auth_tenant_id());
create policy "products_tenant_policy"         on products         for all using (tenant_id = auth_tenant_id());
create policy "stock_movements_tenant_policy"  on stock_movements  for all using (tenant_id = auth_tenant_id());
create policy "customers_tenant_policy"        on customers        for all using (tenant_id = auth_tenant_id());
create policy "suppliers_tenant_policy"        on suppliers        for all using (tenant_id = auth_tenant_id());
create policy "supplier_orders_tenant_policy"  on supplier_orders  for all using (tenant_id = auth_tenant_id());
create policy "sales_tenant_policy"            on sales            for all using (tenant_id = auth_tenant_id());
create policy "warranties_tenant_policy"       on warranties       for all using (tenant_id = auth_tenant_id());
create policy "service_orders_tenant_policy"   on service_orders   for all using (tenant_id = auth_tenant_id());
create policy "accounts_receivable_policy"     on accounts_receivable for all using (tenant_id = auth_tenant_id());
create policy "accounts_payable_policy"        on accounts_payable    for all using (tenant_id = auth_tenant_id());
create policy "cash_transactions_policy"       on cash_transactions   for all using (tenant_id = auth_tenant_id());

-- sale_items NÃO tem tenant_id — acessa via tabela sales (join)
create policy "sale_items_tenant_policy" on sale_items
  for all using (
    sale_id in (
      select id from sales where tenant_id = auth_tenant_id()
    )
  );

-- Tenants: usuário vê apenas o seu
create policy "tenants_own_policy" on tenants for all using (id = auth_tenant_id());

-- Users: usuário vê apenas os do seu tenant
create policy "users_tenant_policy" on users for all using (tenant_id = auth_tenant_id());

-- Planos: todos podem ler (necessário para a tela de cadastro)
alter table plans enable row level security;
create policy "plans_public_read" on plans for select using (true);

-- ============================================================
-- NÚMERO SEQUENCIAL DE VENDA POR TENANT
-- ============================================================
create or replace function get_next_sale_number(p_tenant_id uuid)
returns integer as $$
declare
  v_next integer;
begin
  update tenants
  set last_sale_number = last_sale_number + 1
  where id = p_tenant_id
  returning last_sale_number into v_next;
  return v_next;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================
create index idx_products_tenant       on products(tenant_id);
create index idx_sales_tenant_date     on sales(tenant_id, created_at);
create index idx_warranties_expiry     on warranties(tenant_id, expiry_date, status);
create index idx_warranties_code       on warranties(tenant_id, warranty_code);
create index idx_users_tenant          on users(tenant_id);
create index idx_stock_product         on stock_movements(product_id, created_at);
create index idx_ar_tenant_status      on accounts_receivable(tenant_id, status, due_date);
create index idx_ap_tenant_status      on accounts_payable(tenant_id, status, due_date);
