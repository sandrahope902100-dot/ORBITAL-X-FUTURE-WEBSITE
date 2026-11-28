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

select
  exists(
    select 1
    from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relname='business_submissions'
      and t.tgname='business_submission_rate_limit'
      and not t.tgisinternal
  ) as rate_limit_trigger_exists,
  has_function_privilege('authenticated','public.review_business_submission(uuid,text,text)','EXECUTE') as founder_review_rpc_executable,
  has_function_privilege('authenticated','public.is_orbital_founder()','EXECUTE') as founder_check_executable;

-- Anonymous visitors must not be able to read private applicant fields.
select
  has_column_privilege('anon','public.business_submissions','contact_name','SELECT') as anon_can_read_contact_name,
  has_column_privilege('anon','public.business_submissions','contact_email','SELECT') as anon_can_read_contact_email,
  has_column_privilege('anon','public.business_submissions','status','SELECT') as anon_can_read_status,
  has_column_privilege('anon','public.business_submissions','review_notes','SELECT') as anon_can_read_review_notes,
  has_column_privilege('anon','public.business_submissions','reviewer_user_id','SELECT') as anon_can_read_reviewer,
  has_column_privilege('anon','public.business_submissions','submitted_at','SELECT') as anon_can_read_submission_time,
  has_column_privilege('anon','public.business_submissions','business_name','INSERT') as anon_can_submit_business_name,
  has_column_privilege('anon','public.business_submissions','publication_consent','INSERT') as anon_can_submit_publication_consent,
  has_column_privilege('anon','public.business_submissions','status','INSERT') as anon_can_set_status,
  has_column_privilege('anon','public.business_submissions','review_notes','INSERT') as anon_can_set_review_notes,
  has_column_privilege('anon','public.business_submissions','reviewed_at','INSERT') as anon_can_set_reviewed_at,
  has_column_privilege('anon','public.business_submissions','reviewer_user_id','INSERT') as anon_can_set_reviewer,
  has_column_privilege('anon','public.business_submissions','submitted_at','INSERT') as anon_can_set_submitted_at;

-- 5. Counts only. No applicant contact details are returned.
select
  (select count(*) from public.business_submissions where status='pending') as pending_applications,
  (select count(*) from public.business_submissions where status='changes_requested') as changes_requested,
  (select count(*) from public.business_submissions where status='approved') as approved_applications,
  (select count(*) from public.business_submissions where status='rejected') as rejected_applications,
  (select count(*) from public.business_listings where is_published=true) as published_listings;


-- 6. Verify public discovery and moderation boundaries.
select
  (select prosecdef from pg_proc where oid='public.directory_portal_ready()'::regprocedure) as readiness_is_security_definer,
  (select prosecdef from pg_proc where oid='public.search_business_directory(text,text,text,integer,integer)'::regprocedure) as search_is_security_definer,
  has_function_privilege('anon','public.directory_portal_ready()','EXECUTE') as anon_can_check_readiness,
  has_function_privilege('anon','public.search_business_directory(text,text,text,integer,integer)','EXECUTE') as anon_can_search_published_directory,
  has_function_privilege('anon','public.review_business_submission(uuid,text,text)','EXECUTE') as anon_can_review,
  has_table_privilege('anon','public.business_submissions','SELECT') as anon_can_read_applications,
  has_column_privilege('anon','public.business_submissions','contact_email','SELECT') as anon_can_read_private_email,
  has_column_privilege('anon','public.business_submissions','status','INSERT') as anon_can_set_application_status,
  has_table_privilege('anon','public.business_listings','UPDATE') as anon_can_moderate_listings,
  has_column_privilege('authenticated','public.business_listings','is_published','UPDATE') as founder_role_can_change_publication_flag,
  to_regclass('public.business_submissions_active_business_email_uidx') is not null as duplicate_application_index_exists;

-- 7. Counts only; never return private applicant data in this verification report.
select
  (select count(*) from public.business_submissions) as total_applications,
  (select count(*) from public.business_listings where is_published=true) as published_listings,
  (select count(*) from public.business_listings where is_published=false) as hidden_listings;


-- 8. Verify listing expiry is enforced and the founder can renew/hide listings.
select
  exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='business_listings' and column_name='expires_at'
  ) as expiry_column_exists,
  has_column_privilege('anon','public.business_listings','expires_at','SELECT') as public_expiry_date_visible,
  has_column_privilege('anon','public.business_listings','expires_at','UPDATE') as anon_can_change_expiry,
  has_column_privilege('authenticated','public.business_listings','expires_at','UPDATE') as authenticated_role_can_update_expiry,
  exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='business_listings'
      and policyname='Anyone can read published business listings'
      and qual like '%expires_at%'
  ) as public_policy_checks_expiry;


-- 9. Verify strict review transitions and documented rejection reasons.
select
  position('A changes-requested application cannot be approved' in pg_get_functiondef('public.review_business_submission(uuid,text,text)'::regprocedure)) > 0 as stale_application_cannot_be_approved,
  position('A review note is required for this decision.' in pg_get_functiondef('public.review_business_submission(uuid,text,text)'::regprocedure)) > 0 as rejection_and_change_notes_required;


-- 9. Directory reports are insert-only for the public; only the founder can read/update them.
select
  exists(select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
         where n.nspname='public' and c.relname='directory_reports' and c.relrowsecurity) as reports_rls_enabled,
  has_column_privilege('anon','public.directory_reports','listing_id','INSERT') as anon_can_submit_report,
  has_table_privilege('anon','public.directory_reports','SELECT') as anon_can_read_reports,
  has_table_privilege('anon','public.directory_reports','UPDATE') as anon_can_update_reports,
  has_table_privilege('anon','public.directory_reports','DELETE') as anon_can_delete_reports,
  has_column_privilege('authenticated','public.directory_reports','status','UPDATE') as founder_role_can_update_status,
  exists(select 1 from pg_catalog.pg_trigger t
         join pg_catalog.pg_class c on c.oid=t.tgrelid
         join pg_catalog.pg_namespace n on n.oid=c.relnamespace
         where n.nspname='public' and c.relname='directory_reports'
           and t.tgname='directory_report_rate_limit' and not t.tgisinternal) as report_rate_limit_trigger_exists,
  exists(select 1 from pg_catalog.pg_trigger t
         join pg_catalog.pg_class c on c.oid=t.tgrelid
         join pg_catalog.pg_namespace n on n.oid=c.relnamespace
         where n.nspname='public' and c.relname='directory_reports'
           and t.tgname='validate_directory_report_before_insert' and not t.tgisinternal) as report_target_validation_trigger_exists;
