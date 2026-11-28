-- ORBITAL X FUTURE — read-only verification for the current live schema.
-- Run in Supabase SQL Editor as the project owner. This script makes no changes.
-- IMPORTANT: directory_portal_ready=false is EXPECTED while applications are intentionally closed.

-- 1. Founder identity and current MFA state (metadata only; never select TOTP secrets).
select
  u.email,
  (u.email_confirmed_at is not null) as email_confirmed,
  (f.user_id is not null) as founder_allowlisted
from auth.users u
left join private.founder_admins f on f.user_id=u.id
where lower(u.email)='orbitalxfuture@gmail.com';

select status, factor_type, count(*) as factor_count
from auth.mfa_factors
where user_id=(select id from auth.users where lower(email)='orbitalxfuture@gmail.com' limit 1)
group by status,factor_type
order by status,factor_type;

select aal, count(*) as founder_session_count
from auth.sessions
where user_id=(select id from auth.users where lower(email)='orbitalxfuture@gmail.com' limit 1)
group by aal
order by aal;

-- 2. RLS must be enabled on all private application and operational tables.
select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r'
  and c.relname in ('business_submissions','business_listings','founder_notes','directory_reports','directory_payment_settings')
order by c.relname;

-- 3. Application intake must remain closed at BOTH UI and database layers.
select
  public.directory_portal_ready() as directory_portal_ready_expected_false_while_closed,
  has_table_privilege('anon','public.business_submissions','INSERT') as anon_table_insert,
  has_any_column_privilege('anon','public.business_submissions','INSERT') as anon_column_insert,
  has_table_privilege('authenticated','public.business_submissions','INSERT') as authenticated_table_insert,
  has_any_column_privilege('authenticated','public.business_submissions','INSERT') as authenticated_column_insert,
  has_table_privilege('anon','public.business_submissions','SELECT') as anon_can_read_applications,
  has_column_privilege('anon','public.business_submissions','contact_email','SELECT') as anon_can_read_private_email;

-- 4. Public discovery remains available; payment and founder actions remain private.
select
  has_function_privilege('anon','public.search_business_directory(text,text,text,integer,integer)','EXECUTE') as anon_can_search_directory,
  has_function_privilege('anon','public.report_directory_payment(uuid,text)','EXECUTE') as anon_can_report_payment,
  has_function_privilege('anon','public.review_business_submission(uuid,text,text)','EXECUTE') as anon_can_review,
  has_function_privilege('authenticated','public.review_business_submission(uuid,text,text)','EXECUTE') as authenticated_can_call_review_rpc,
  has_function_privilege('authenticated','public.confirm_directory_payment(uuid,text,timestamptz)','EXECUTE') as authenticated_can_call_payment_rpc,
  has_function_privilege('anon','public.get_directory_payment_settings()','EXECUTE') as anon_can_get_payment_settings,
  has_table_privilege('anon','public.directory_payment_settings','SELECT') as anon_can_read_payment_settings,
  has_schema_privilege('anon','private','USAGE') as anon_can_use_private_schema,
  has_schema_privilege('authenticated','private','USAGE') as authenticated_can_use_private_schema;

-- 5. Security mode and renewal safety guard.
select
  (select prosecdef from pg_proc where oid='public.directory_portal_ready()'::regprocedure) as readiness_is_security_definer,
  (select prosecdef from pg_proc where oid='public.search_business_directory(text,text,text,integer,integer)'::regprocedure) as search_is_security_definer,
  (select prosecdef from pg_proc where oid='public.confirm_directory_payment(uuid,text,timestamptz)'::regprocedure) as payment_wrapper_is_security_definer,
  (select prosecdef from pg_proc where oid='private.confirm_directory_payment_internal(uuid,text,timestamptz)'::regprocedure) as payment_internal_is_security_definer,
  (select prosecdef from pg_proc where oid='private.confirm_directory_renewal_payment_internal(uuid,text,timestamptz)'::regprocedure) as renewal_internal_is_security_definer,
  position('IF NOT l.is_published' in pg_get_functiondef('private.confirm_directory_renewal_payment_internal(uuid,text,timestamptz)'::regprocedure))>0 as hidden_listing_renewal_block_present;

-- 6. Counts only. No applicant contact details or payment instructions are returned.
select status, count(*) as application_count
from public.business_submissions
group by status
order by status;

select
  count(*) filter (where is_published and expires_at>now()) as active_published_listings,
  count(*) filter (where is_published and expires_at<=now()) as expired_hidden_from_search,
  count(*) filter (where not is_published) as founder_hidden_listings
from public.business_listings;

select status, count(*) as report_count
from public.directory_reports
group by status
order by status;

-- 7. Public search smoke test under the anonymous database role. Expected to run successfully.
begin;
set local role anon;
select count(*) as public_search_results
from public.search_business_directory(null,null,null,12,0);
rollback;
