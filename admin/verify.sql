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

-- 4. Confirm the public application portal's minimum grants and RLS policies.
select public.directory_portal_ready() as directory_portal_ready;

-- Anonymous visitors must not be able to read private applicant fields.
select
  has_column_privilege('anon','public.business_submissions','contact_name','SELECT') as anon_can_read_contact_name,
  has_column_privilege('anon','public.business_submissions','contact_email','SELECT') as anon_can_read_contact_email,
  has_column_privilege('anon','public.business_submissions','status','SELECT') as anon_can_read_status,
  has_column_privilege('anon','public.business_submissions','review_notes','SELECT') as anon_can_read_review_notes,
  has_column_privilege('anon','public.business_submissions','reviewer_user_id','SELECT') as anon_can_read_reviewer,
  has_column_privilege('anon','public.business_submissions','submitted_at','SELECT') as anon_can_read_submission_time,
  has_column_privilege('anon','public.business_submissions','business_name','INSERT') as anon_can_submit_business_name,
  has_column_privilege('anon','public.business_submissions','publication_consent','INSERT') as anon_can_submit_publication_consent;

-- 5. Counts only. No applicant contact details are returned.
select
  (select count(*) from public.business_submissions where status='pending') as pending_applications,
  (select count(*) from public.business_submissions where status='changes_requested') as changes_requested,
  (select count(*) from public.business_submissions where status='approved') as approved_applications,
  (select count(*) from public.business_submissions where status='rejected') as rejected_applications,
  (select count(*) from public.business_listings where is_published=true) as published_listings;
