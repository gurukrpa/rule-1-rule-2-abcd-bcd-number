-- Quick service role debug policies (if data exists but is hidden by RLS)
-- This allows the SERVICE ROLE to read everything (not public clients)

-- Helper function to check if current connection is service role
create or replace function public.is_service_role()
returns boolean language sql stable as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role',
    false
  )
$$;

-- Apply debug read policies to essential tables
create policy if not exists "debug_read_all_service"
on public.users
for select
to service_role
using ( true );

create policy if not exists "debug_read_all_service"
on public.excel_data
for select
to service_role
using ( true );

create policy if not exists "debug_read_all_service"
on public.hour_entries
for select
to service_role
using ( true );

create policy if not exists "debug_read_all_service"
on public.number_box_clicks
for select
to service_role
using ( true );

create policy if not exists "debug_read_all_service"
on public.rule2_analysis_results
for select
to service_role
using ( true );

-- Test message
SELECT 'Debug service policies applied - your app should now see data' as status;
