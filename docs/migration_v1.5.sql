-- ============================================================
-- KDL Store — Migration v1.5
-- Execute no SQL Editor do Supabase (safe to re-run)
-- ============================================================

-- Unidade de tempo da garantia (days | months | years)
alter table products  add column if not exists warranty_unit text default 'months';
alter table warranties add column if not exists warranty_unit text default 'months';

-- Atualiza trigger set_warranty_expiry para respeitar a unidade
create or replace function set_warranty_expiry()
returns trigger as $$
declare
  v_unit text;
begin
  v_unit := coalesce(new.warranty_unit, 'months');
  if v_unit = 'days' then
    new.expiry_date := new.issue_date + (new.warranty_months * interval '1 day');
  elsif v_unit = 'years' then
    new.expiry_date := new.issue_date + (new.warranty_months * interval '1 year');
  else
    new.expiry_date := new.issue_date + (new.warranty_months * interval '1 month');
  end if;
  return new;
end;
$$ language plpgsql;
