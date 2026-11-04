-- LastPlate initial schema
--
-- Run with the Supabase CLI:
--   supabase db push
--
-- The migration is written to be idempotent where practical so it can be
-- replayed against a fresh project during development.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'donor'
    check (role in ('donor', 'ngo', 'admin')),
  organization_name text not null,
  organization_type text not null,
  phone text not null,
  city text not null,
  address text not null,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  registration_number text,
  verification_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists is_active boolean not null default true;
alter table public.profiles
  add column if not exists registration_number text;
alter table public.profiles
  add column if not exists verification_notes text;

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  description text not null check (char_length(description) between 20 and 2000),
  category text not null
    check (category in (
      'cooked_meals', 'rice_grains', 'bread_bakery', 'fruits',
      'vegetables', 'packaged_food', 'other'
    )),
  quantity numeric(12, 2) not null check (quantity > 0),
  quantity_unit text not null
    check (quantity_unit in ('kg', 'meals', 'packs', 'litres')),
  food_type text not null
    check (food_type in ('vegetarian', 'non_vegetarian')),
  allergens text,
  image_url text,
  prepared_at timestamptz not null,
  safe_until timestamptz not null,
  pickup_deadline timestamptz not null,
  pickup_address text not null,
  city text not null,
  additional_instructions text,
  status text not null default 'available'
    check (status in ('available', 'assigned', 'collected', 'expired', 'cancelled')),
  assigned_ngo_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donations_time_order check (
    prepared_at < safe_until and pickup_deadline <= safe_until
  ),
  constraint donations_assignment_shape check (
    (status in ('assigned', 'collected') and assigned_ngo_id is not null)
    or (status not in ('assigned', 'collected') and assigned_ngo_id is null)
  )
);

create table if not exists public.collection_requests (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations (id) on delete cascade,
  ngo_id uuid not null references public.profiles (id) on delete cascade,
  requested_quantity numeric(12, 2) not null check (requested_quantity > 0),
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (donation_id, ngo_id)
);

create table if not exists public.collection_records (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null unique references public.donations (id) on delete cascade,
  ngo_id uuid not null references public.profiles (id) on delete cascade,
  donor_id uuid not null references public.profiles (id) on delete cascade,
  collected_quantity numeric(12, 2) not null check (collected_quantity > 0),
  collected_at timestamptz not null default now(),
  notes text
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists donations_status_idx
  on public.donations (status);
create index if not exists donations_donor_id_idx
  on public.donations (donor_id);
create index if not exists donations_city_idx
  on public.donations (city);
create index if not exists donations_pickup_deadline_idx
  on public.donations (pickup_deadline);
create index if not exists donations_available_idx
  on public.donations (safe_until, pickup_deadline)
  where status = 'available';
create index if not exists collection_requests_donation_id_idx
  on public.collection_requests (donation_id);
create index if not exists collection_requests_ngo_id_idx
  on public.collection_requests (ngo_id);
create index if not exists collection_requests_status_idx
  on public.collection_requests (status);
create index if not exists collection_records_donor_id_idx
  on public.collection_records (donor_id);
create index if not exists collection_records_ngo_id_idx
  on public.collection_records (ngo_id);

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.is_verified_ngo(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and role = 'ngo'
      and verification_status = 'verified'
      and is_active
  );
$$;

revoke all on function public.is_verified_ngo(uuid) from public;
grant execute on function public.is_verified_ngo(uuid) to authenticated;

create or replace function public.is_active_account(
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and is_active
  );
$$;

revoke all on function public.is_active_account(uuid) from public;
grant execute on function public.is_active_account(uuid) to authenticated;

-- Used by the donation read policy so an NGO can still open a donation it
-- requested after the donor assigned it to someone else. Keeping this in a
-- security-definer function avoids a recursive RLS reference between the two
-- tables.
create or replace function public.has_requested_donation(
  p_donation_id uuid,
  p_ngo_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.collection_requests
    where donation_id = p_donation_id
      and ngo_id = p_ngo_id
  );
$$;

revoke all on function public.has_requested_donation(uuid, uuid) from public;
grant execute on function public.has_requested_donation(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Public organization view
--
-- The view is owned by the migration role, so it can read the private
-- profiles table without exposing email, phone, or address. Only the
-- organization-facing columns are granted to signed-in users.
-- ---------------------------------------------------------------------------

create or replace view public.public_profiles
with (security_invoker = false)
as
select
  id,
  organization_name,
  organization_type,
  city,
  role,
  verification_status
from public.profiles
where role in ('donor', 'ngo');

revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Profile protection
-- ---------------------------------------------------------------------------

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service-role and trigger-driven changes have no end-user identity.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'You cannot change your own role.';
  end if;

  if new.verification_status is distinct from old.verification_status then
    raise exception 'Only an administrator can change verification status.';
  end if;

  if new.is_active is distinct from old.is_active then
    raise exception 'Only an administrator can change account access.';
  end if;

  if new.email is distinct from old.email then
    raise exception 'Email addresses are managed through authentication.';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Profile identifiers cannot be changed.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- New auth user -> profile
-- ---------------------------------------------------------------------------

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Donation and request guards
-- ---------------------------------------------------------------------------

drop trigger if exists donations_set_updated_at on public.donations;
create trigger donations_set_updated_at
  before update on public.donations
  for each row execute function public.set_updated_at();

drop trigger if exists collection_requests_set_updated_at on public.collection_requests;
create trigger collection_requests_set_updated_at
  before update on public.collection_requests
  for each row execute function public.set_updated_at();

create or replace function public.validate_collection_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_donation public.donations;
begin
  select * into v_donation
  from public.donations
  where id = new.donation_id;

  if not found then
    raise exception 'Donation not found.';
  end if;

  if v_donation.status <> 'available' then
    raise exception 'This donation is no longer available.';
  end if;

  if v_donation.safe_until <= now() or v_donation.pickup_deadline <= now() then
    raise exception 'The collection window for this donation has closed.';
  end if;

  if new.requested_quantity > v_donation.quantity then
    raise exception 'Requested quantity exceeds the available quantity.';
  end if;

  if not public.is_verified_ngo(new.ngo_id) then
    raise exception 'Only verified NGOs can request collections.';
  end if;

  return new;
end;
$$;

drop trigger if exists collection_requests_validate on public.collection_requests;
create trigger collection_requests_validate
  before insert on public.collection_requests
  for each row execute function public.validate_collection_request();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.donations enable row level security;
alter table public.collection_requests enable row level security;
alter table public.collection_records enable row level security;

-- profiles ------------------------------------------------------------------

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: insert self" on public.profiles;
create policy "profiles: insert self"
  on public.profiles for insert
  to authenticated
  with check (
    id = auth.uid()
    and role in ('donor', 'ngo')
    and verification_status = 'pending'
  );

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() and public.is_active_account())
  with check (id = auth.uid());

drop policy if exists "profiles: admin update" on public.profiles;
create policy "profiles: admin update"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- donations -----------------------------------------------------------------

drop policy if exists "donations: read own, assigned, or available" on public.donations;
create policy "donations: read own, assigned, or available"
  on public.donations for select
  to authenticated
  using (
    donor_id = auth.uid()
    or assigned_ngo_id = auth.uid()
    or public.is_admin()
    or public.has_requested_donation(donations.id)
    or (
      status = 'available'
      and safe_until > now()
      and pickup_deadline > now()
      and public.is_verified_ngo()
      and public.is_active_account(donations.donor_id)
    )
  );

drop policy if exists "donations: donor insert" on public.donations;
create policy "donations: donor insert"
  on public.donations for insert
  to authenticated
  with check (
    donor_id = auth.uid()
    and status = 'available'
    and assigned_ngo_id is null
    and public.is_active_account()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'donor'
    )
  );

-- Direct donor edits are limited to still-available donations. Assignment
-- and collection transitions go through the security-definer functions below.
drop policy if exists "donations: donor edit available" on public.donations;
create policy "donations: donor edit available"
  on public.donations for update
  to authenticated
  using (
    donor_id = auth.uid()
    and status = 'available'
    and public.is_active_account()
  )
  with check (
    donor_id = auth.uid()
    and status in ('available', 'cancelled')
    and assigned_ngo_id is null
  );

drop policy if exists "donations: donor delete available" on public.donations;
create policy "donations: donor delete available"
  on public.donations for delete
  to authenticated
  using (donor_id = auth.uid() and status in ('available', 'cancelled'));

drop policy if exists "donations: admin all" on public.donations;
create policy "donations: admin all"
  on public.donations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- collection_requests -------------------------------------------------------

drop policy if exists "requests: read own or donation owner" on public.collection_requests;
create policy "requests: read own or donation owner"
  on public.collection_requests for select
  to authenticated
  using (
    ngo_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.donations
      where donations.id = collection_requests.donation_id
        and donations.donor_id = auth.uid()
    )
  );

drop policy if exists "requests: ngo create" on public.collection_requests;
create policy "requests: ngo create"
  on public.collection_requests for insert
  to authenticated
  with check (
    ngo_id = auth.uid()
    and status = 'pending'
    and public.is_active_account()
    and public.is_verified_ngo()
  );

drop policy if exists "requests: ngo cancel own pending" on public.collection_requests;
create policy "requests: ngo cancel own pending"
  on public.collection_requests for update
  to authenticated
  using (
    ngo_id = auth.uid()
    and status = 'pending'
    and public.is_active_account()
  )
  with check (ngo_id = auth.uid() and status = 'cancelled');

drop policy if exists "requests: admin all" on public.collection_requests;
create policy "requests: admin all"
  on public.collection_requests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- collection_records --------------------------------------------------------

drop policy if exists "records: read participants" on public.collection_records;
create policy "records: read participants"
  on public.collection_records for select
  to authenticated
  using (
    donor_id = auth.uid()
    or ngo_id = auth.uid()
    or public.is_admin()
  );

-- Records are only written by mark_donation_collected().

-- ---------------------------------------------------------------------------
-- Transactional workflow functions
-- ---------------------------------------------------------------------------

create or replace function public.respond_to_collection_request(
  p_request_id uuid,
  p_action text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.collection_requests;
  v_donation public.donations;
  v_now timestamptz := now();
begin
  if p_action not in ('accept', 'reject') then
    raise exception 'Unknown action.';
  end if;

  select * into v_request
  from public.collection_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found.';
  end if;

  select * into v_donation
  from public.donations
  where id = v_request.donation_id
  for update;

  if not found then
    raise exception 'Donation not found.';
  end if;

  if v_donation.donor_id <> auth.uid() and not public.is_admin() then
    raise exception 'You can only respond to requests for your own donations.';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'This request is no longer pending.';
  end if;

  if p_action = 'reject' then
    update public.collection_requests
    set status = 'rejected', updated_at = v_now
    where id = v_request.id;

    return;
  end if;

  if v_donation.status <> 'available' then
    raise exception 'This donation is no longer available.';
  end if;

  if v_donation.safe_until <= v_now or v_donation.pickup_deadline <= v_now then
    raise exception 'The collection window for this donation has closed.';
  end if;

  if not public.is_verified_ngo(v_request.ngo_id) then
    raise exception 'This NGO is not verified.';
  end if;

  update public.donations
  set
    status = 'assigned',
    assigned_ngo_id = v_request.ngo_id,
    updated_at = v_now
  where id = v_donation.id;

  update public.collection_requests
  set status = 'accepted', updated_at = v_now
  where id = v_request.id;

  update public.collection_requests
  set status = 'rejected', updated_at = v_now
  where donation_id = v_donation.id
    and id <> v_request.id
    and status = 'pending';
end;
$$;

revoke all on function public.respond_to_collection_request(uuid, text) from public;
grant execute on function public.respond_to_collection_request(uuid, text) to authenticated;

create or replace function public.mark_donation_collected(
  p_donation_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_donation public.donations;
  v_now timestamptz := now();
begin
  select * into v_donation
  from public.donations
  where id = p_donation_id
  for update;

  if not found then
    raise exception 'Donation not found.';
  end if;

  if v_donation.donor_id <> auth.uid()
     and v_donation.assigned_ngo_id is distinct from auth.uid()
     and not public.is_admin() then
    raise exception 'Only the donor or assigned NGO can confirm this collection.';
  end if;

  if v_donation.status <> 'assigned' or v_donation.assigned_ngo_id is null then
    raise exception 'Only a donation assigned to an NGO can be marked as collected.';
  end if;

  if exists (
    select 1 from public.collection_records
    where donation_id = v_donation.id
  ) then
    raise exception 'This collection has already been recorded.';
  end if;

  insert into public.collection_records (
    donation_id,
    ngo_id,
    donor_id,
    collected_quantity,
    collected_at,
    notes
  )
  values (
    v_donation.id,
    v_donation.assigned_ngo_id,
    v_donation.donor_id,
    v_donation.quantity,
    v_now,
    nullif(btrim(coalesce(p_notes, '')), '')
  );

  update public.donations
  set status = 'collected', updated_at = v_now
  where id = v_donation.id;

  update public.collection_requests
  set status = 'completed', updated_at = v_now
  where donation_id = v_donation.id
    and status = 'accepted';
end;
$$;

revoke all on function public.mark_donation_collected(uuid, text) from public;
grant execute on function public.mark_donation_collected(uuid, text) to authenticated;

create or replace function public.cancel_collection_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.collection_requests;
begin
  select * into v_request
  from public.collection_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found.';
  end if;

  if v_request.ngo_id <> auth.uid() and not public.is_admin() then
    raise exception 'You can only cancel your own requests.';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Only pending requests can be cancelled.';
  end if;

  update public.collection_requests
  set status = 'cancelled', updated_at = now()
  where id = v_request.id;
end;
$$;

revoke all on function public.cancel_collection_request(uuid) from public;
grant execute on function public.cancel_collection_request(uuid) to authenticated;

-- Expire available donations whose safe or pickup window has closed. This is
-- safe to call from a scheduled job or before listing donations.
create or replace function public.expire_stale_donations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with expired as (
    update public.donations
    set status = 'expired', updated_at = now()
    where status = 'available'
      and (safe_until <= now() or pickup_deadline <= now())
    returning id
  )
  select count(*) into v_count from expired;

  update public.collection_requests
  set status = 'rejected', updated_at = now()
  where status = 'pending'
    and donation_id in (
      select id from public.donations where status = 'expired'
    );

  return v_count;
end;
$$;

revoke all on function public.expire_stale_donations() from public;
grant execute on function public.expire_stale_donations() to authenticated;

-- ---------------------------------------------------------------------------
-- Administration
-- ---------------------------------------------------------------------------

create or replace function public.admin_set_ngo_verification(
  p_ngo_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change verification status.';
  end if;

  if p_status not in ('pending', 'verified', 'rejected') then
    raise exception 'Unknown verification status.';
  end if;

  select role into v_role
  from public.profiles
  where id = p_ngo_id
  for update;

  if not found then
    raise exception 'NGO not found.';
  end if;

  if v_role <> 'ngo' then
    raise exception 'Only NGO accounts can be verified.';
  end if;

  update public.profiles
  set verification_status = p_status, updated_at = now()
  where id = p_ngo_id;

  -- Requests from an unverified NGO can never be accepted, so close the
  -- pending ones rather than leaving donors with dead requests.
  if p_status <> 'verified' then
    update public.collection_requests
    set status = 'rejected', updated_at = now()
    where ngo_id = p_ngo_id
      and status = 'pending';
  end if;
end;
$$;

revoke all on function public.admin_set_ngo_verification(uuid, text) from public;
grant execute on function public.admin_set_ngo_verification(uuid, text) to authenticated;

create or replace function public.admin_set_profile_active(
  p_profile_id uuid,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change account access.';
  end if;

  select role into v_role
  from public.profiles
  where id = p_profile_id
  for update;

  if not found then
    raise exception 'Account not found.';
  end if;

  if v_role = 'admin' then
    raise exception 'Administrator accounts cannot be disabled here.';
  end if;

  if p_profile_id = auth.uid() then
    raise exception 'You cannot disable your own account.';
  end if;

  update public.profiles
  set is_active = p_is_active, updated_at = now()
  where id = p_profile_id;

  if not p_is_active then
    update public.collection_requests
    set status = 'rejected', updated_at = now()
    where ngo_id = p_profile_id
      and status = 'pending';

    -- A disabled donor cannot review requests, so open listings are cancelled.
    -- Assigned pickups stay in place so the NGO can finish the collection.
    if v_role = 'donor' then
      update public.donations
      set status = 'cancelled', updated_at = now()
      where donor_id = p_profile_id
        and status = 'available';
    end if;
  end if;
end;
$$;

revoke all on function public.admin_set_profile_active(uuid, boolean) from public;
grant execute on function public.admin_set_profile_active(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Public impact statistics
--
-- Aggregates only. The landing page can show honest platform totals without
-- exposing individual donations or private organization details.
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('donation-images', 'donation-images', true)
on conflict (id) do nothing;

drop policy if exists "donation images: public read" on storage.objects;
create policy "donation images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'donation-images');

drop policy if exists "donation images: owner upload" on storage.objects;
create policy "donation images: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'donation-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "donation images: owner update" on storage.objects;
create policy "donation images: owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'donation-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'donation-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "donation images: owner delete" on storage.objects;
create policy "donation images: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'donation-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ---------------------------------------------------------------------------
-- Registration details and public impact statistics
-- ---------------------------------------------------------------------------

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
