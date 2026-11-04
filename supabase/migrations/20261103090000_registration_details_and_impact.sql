-- Adds NGO verification details collected at registration and a public
-- aggregate used by the marketing landing page.

alter table public.profiles
  add column if not exists registration_number text;
alter table public.profiles
  add column if not exists verification_notes text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_full_name text;
  v_organization_name text;
  v_registration_number text;
  v_verification_notes text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'donor');

  -- Admin accounts are provisioned manually, never through public sign-up.
  if v_role not in ('donor', 'ngo') then
    v_role := 'donor';
  end if;

  v_full_name := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  v_organization_name := nullif(
    btrim(coalesce(new.raw_user_meta_data ->> 'organization_name', '')),
    ''
  );
  v_registration_number := nullif(
    btrim(coalesce(new.raw_user_meta_data ->> 'registration_number', '')),
    ''
  );
  v_verification_notes := nullif(
    btrim(coalesce(new.raw_user_meta_data ->> 'verification_notes', '')),
    ''
  );

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    organization_name,
    organization_type,
    phone,
    city,
    address,
    verification_status,
    registration_number,
    verification_notes
  )
  values (
    new.id,
    coalesce(v_full_name, split_part(coalesce(new.email, 'member'), '@', 1)),
    coalesce(new.email, ''),
    v_role,
    coalesce(v_organization_name, v_full_name, 'LastPlate member'),
    coalesce(nullif(btrim(coalesce(new.raw_user_meta_data ->> 'organization_type', '')), ''), 'Food establishment'),
    coalesce(nullif(btrim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''), 'Not provided'),
    coalesce(nullif(btrim(coalesce(new.raw_user_meta_data ->> 'city', '')), ''), 'Not provided'),
    coalesce(nullif(btrim(coalesce(new.raw_user_meta_data ->> 'address', '')), ''), 'Not provided'),
    case when v_role = 'ngo' then 'pending' else 'verified' end,
    case when v_role = 'ngo' then v_registration_number else null end,
    case when v_role = 'ngo' then v_verification_notes else null end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.public_impact_stats()
returns table (
  organizations bigint,
  donations_shared bigint,
  collections_completed bigint,
  cities_reached bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.profiles
      where role in ('donor', 'ngo') and is_active),
    (select count(*) from public.donations),
    (select count(*) from public.collection_records),
    (select count(distinct city) from public.donations);
$$;

revoke all on function public.public_impact_stats() from public;
grant execute on function public.public_impact_stats() to anon, authenticated;
