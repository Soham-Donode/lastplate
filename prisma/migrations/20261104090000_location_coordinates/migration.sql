-- Adds optional map coordinates to organization profiles and donations.

alter table public.profiles
  add column if not exists latitude double precision;
alter table public.profiles
  add column if not exists longitude double precision;
alter table public.donations
  add column if not exists latitude double precision;
alter table public.donations
  add column if not exists longitude double precision;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_latitude_range'
  ) then
    alter table public.profiles
      add constraint profiles_latitude_range
      check (latitude is null or (latitude between -90 and 90));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_longitude_range'
  ) then
    alter table public.profiles
      add constraint profiles_longitude_range
      check (longitude is null or (longitude between -180 and 180));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.donations'::regclass
      and conname = 'donations_latitude_range'
  ) then
    alter table public.donations
      add constraint donations_latitude_range
      check (latitude is null or (latitude between -90 and 90));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.donations'::regclass
      and conname = 'donations_longitude_range'
  ) then
    alter table public.donations
      add constraint donations_longitude_range
      check (longitude is null or (longitude between -180 and 180));
  end if;
end $$;
