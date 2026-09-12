-- Give every business record an owner and expose only that owner's records.
-- Run this migration in the Supabase SQL editor before testing multiple accounts.

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'furniture_projects',
    'project_steps',
    'techniques',
    'materials',
    'suppliers',
    'price_list_items',
    'finished_projects',
    'quotations'
  ] loop
    execute format(
      'alter table public.%I add column if not exists user_id uuid references auth.users(id) default auth.uid()',
      table_name
    );

    execute format('create index if not exists %I on public.%I (user_id)', table_name || '_user_id_idx', table_name);
    execute format('alter table public.%I enable row level security', table_name);

    -- Policies are additive in PostgreSQL. Remove older policies first so a
    -- previous public/anonymous policy cannot bypass owner isolation.
    for policy_name in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;

    execute format(
      'create policy %I on public.%I for select using (user_id = auth.uid())',
      table_name || '_select_own', table_name
    );
    execute format(
      'create policy %I on public.%I for insert with check (user_id = auth.uid())',
      table_name || '_insert_own', table_name
    );
    execute format(
      'create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())',
      table_name || '_update_own', table_name
    );
    execute format(
      'create policy %I on public.%I for delete using (user_id = auth.uid())',
      table_name || '_delete_own', table_name
    );
  end loop;
end $$;

-- Do not allow an anonymous client to read or write profiles.
alter table public.profiles enable row level security;
do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', policy_name);
  end loop;
end $$;
create policy profiles_select_own on public.profiles for select using (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete_own on public.profiles for delete using (id = auth.uid());

-- Keep uploaded project designs in per-user folders.
-- Add matching storage policies if the project-designs bucket is private.
insert into storage.buckets (id, name, public)
values ('project-designs', 'project-designs', true)
on conflict (id) do nothing;

drop policy if exists project_designs_insert_own on storage.objects;
drop policy if exists project_designs_update_own on storage.objects;
drop policy if exists project_designs_delete_own on storage.objects;
create policy project_designs_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-designs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy project_designs_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'project-designs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'project-designs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy project_designs_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-designs' and (storage.foldername(name))[1] = auth.uid()::text);
