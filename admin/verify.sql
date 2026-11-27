-- ORBITAL X FUTURE: read-only activation checks.
-- Run after admin/setup.sql in Supabase SQL Editor.

-- 1. Confirm the founder Auth user exists and was added to the database allowlist.
select u.email, u.email_confirmed_at, (a.user_id is not null) as founder_allowlisted
from auth.users u
left join private.founder_admins a on a.user_id = u.id
where lower(u.email) = 'orbitalxfuture@gmail.com';

-- 2. Confirm all directory tables exist and Row Level Security is enabled.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('business_submissions','business_listings','founder_notes')
order by c.relname;

-- 3. Review the policies currently installed.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('business_submissions','business_listings','founder_notes')
order by tablename, policyname;

-- 4. Counts only. No applicant contact details are returned.
select
  (select count(*) from public.business_submissions where status='pending') as pending_applications,
  (select count(*) from public.business_submissions where status='changes_requested') as changes_requested,
  (select count(*) from public.business_submissions where status='approved') as approved_applications,
  (select count(*) from public.business_submissions where status='rejected') as rejected_applications,
  (select count(*) from public.business_listings where is_published=true) as published_listings;
