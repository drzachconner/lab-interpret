-- Fix security linter warnings from Phase-1 schema

-- Fix function search path issues by setting proper search_path
create or replace function public.lab_orders_set_raw_result(_order_id uuid, _json jsonb, _key text)
returns void language plpgsql security definer 
set search_path = public
as $$
begin
  update public.lab_orders
    set raw_result_enc = pgp_sym_encrypt(_json::text, _key),
        updated_at = now()
  where id = _order_id;
end$$;

create or replace function public.lab_orders_get_raw_result(_order_id uuid, _key text)
returns jsonb language plpgsql stable security definer 
set search_path = public
as $$
declare
  plaintext text;
begin
  select pgp_sym_decrypt(raw_result_enc, _key)
    into plaintext
  from public.lab_orders
  where id = _order_id;

  if plaintext is null then
    return null;
  end if;

  return plaintext::jsonb;
end$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql 
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end$$;