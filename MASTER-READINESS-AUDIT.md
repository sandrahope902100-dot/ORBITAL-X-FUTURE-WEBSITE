# ORBITAL X FUTURE — Master Construction & Readiness Audit

**Audit date:** 28 November 2026  
**Scope:** ORBITAL X FUTURE public website, directory submission/review workflow, Supabase setup code, founder/admin area, pricing and customer operations, Sasha AI application, deployment configuration, privacy and launch controls.  
**Decision:** **Pre-launch only. Not ready to accept directory applications, take payments, or sell Sasha AI as a business service.** Sasha AI may be shown only as a supervised demonstration with its prototype/privacy notice.

This document separates source-code review from live acceptance testing. A file existing in GitHub or a deployment showing “live” is not proof that the feature works end to end.

## 1. Evidence standard

- **Verified in source:** inspected in the current GitHub default-branch files.
- **Verified in Render:** confirmed from Render service/deployment configuration or logs.
- **Pending external verification:** requires Supabase dashboard access, live browser/device testing, provider account checks, or legal review. Do not mark it complete until evidence is recorded.

## 2. Phase-by-phase status

| Phase | Current state | Decision |
|---|---|---|
| Venture identity and ownership | Website identifies ORBITAL X FUTURE as an independent technology venture founded by Sasha-Lee Nugent. It does not claim incorporation. | **Partially complete** — legal registration, legal service-provider identity and business address remain unresolved. |
| Public website | Static site deployed on Render; automatic deployment from GitHub main is enabled. Founder, product, directory, pricing and policy sections exist. | **Code/deployment complete; live browser QA pending.** |
| Founder profile and Google visibility | Founder details, JSON-LD, `robots.txt`, `sitemap.xml` and a Google site-verification meta token are present. No favicon or social-share image was found. | **Partially complete** — Search Console ownership verification, indexing and search appearance are not independently confirmed. |
| Directory application form | Public form is coded with separate privacy and publication consent. Supabase readiness returns true, but a code-level launch gate keeps applications closed until live browser/Android QA is complete. | **Database active; synthetic DB workflow tests passed; public UI test pending.** |
| Founder admin and review | Founder sign-in, private application queue, private notes, approve/publish, request changes and reject are coded. Founder Auth email is confirmed and allowlisted; RLS and RPC roles were tested in Supabase. | **Database permissions/workflow verified; actual dashboard sign-in and queue UI test pending.** |
| Directory public listings | Approved-profile display reads only published rows and escapes displayed text. Search across business/service text, category and city/country filters, plus 12-item pagination are implemented through an invoker-rights RPC. | **Code and database deployed; live browser/Android QA pending.** |
| Directory moderation and verification | Founder review, active duplicate protection, hide/republish controls, public report/correction email route and 12-month database-enforced expiry with founder renewal are implemented. | **Partially complete** — no independent business verification, applicant email verification, applicant edit portal, tracked takedown case workflow or automated expiry notification/archive. |
| Pricing and sales | Proposed free and paid tiers are displayed with pre-launch disclosures. | **Proposal only** — no active offer, order/contract workflow, checkout, invoices, subscription handling, cancellation/refund processing or payment acceptance. |
| Privacy and security | Directory SQL is active with RLS, column-level anonymous insert permissions, a founder allowlist and an application rate limit. Sasha has server-side API keys, bounded request sizes, in-memory IP throttles and an in-app provider disclosure. | **Partially complete** — fixed retention period, deletion operations, incident response, CAPTCHA, provider account tiers and legal review remain pending. |
| Sasha AI product | Live general-purpose assistant prototype with streamed text, optional Fish Audio speech, microphone input and PWA shell. | **Supervised demo only** — not approved for paid, confidential-data or unsupervised customer use. |
| Sasha AI business integration | Optional single-business profile exists in server code. Render startup logs say no business profile is configured. | **Not configured.** |
| Customer operations | No bookings, CRM, lead capture, payments, human handoff or multi-business account system. | **Not built.** |
| Outreach and partnerships | Two initial prospect emails were sent from a personal Gmail account; no partnership or revenue is confirmed. | **Paused** until the official venture sender identity is used. |

## 3. Website and directory — code review

### What is now implemented
- Public business application form with database validation expected through Supabase.
- Separate required applicant privacy consent and consent to publish the business profile if approved.
- Founder-only review dashboard with pending/change-requested queue.
- Approve/publish, request changes and reject decisions through a protected database RPC.
- Public directory reads only published, unexpired business-profile records; applicant contact name/email and private review notes are not copied to the public listing table. Search supports business/service text, category and location filters with 12-item pagination.
- Three-submissions-per-contact-email rolling 24-hour database limit, duplicate protection for active applications by normalized email/business name, plus a honeypot.
- The directory_portal_ready RPC checks public-schema tables, anonymous insert grants, RLS, required policies, the email rate-limit trigger, founder review RPC permissions and private-field read restrictions. It now runs as SECURITY INVOKER and does not inspect private Auth data. Founder identity is independently verified by the founder RPC and again inside the review RPC.
- admin/verify.sql checks founder allowlisting, RLS, policies, readiness/search function privileges, anonymous access to private contact fields, moderation grants and duplicate-index presence.

### Security and reliability corrections made during this audit
1. Removed inherited table privileges from PUBLIC, anon and authenticated before re-granting only the required privileges.
2. Added policy-reset blocks so rerunning the setup script removes unknown/stale policies on the three controlled public tables before recreating the intended policies.
3. Restricted the founder allowlist to the confirmed orbitalxfuture@gmail.com Auth user, using the immutable Auth UUID; the authorization helper also checks that the UUID still belongs to that confirmed email.
4. Added separate publication consent and made approval fail if that consent is absent.
5. Made a reason mandatory when the founder requests changes.
6. Fixed double-encoded line breaks in applicant email drafts.
7. Added error handling so network failures do not leave the public submit button stuck disabled or founder review/login/note controls stuck disabled.
8. Replaced the form's weak “listings table exists” check with the readiness RPC.
9. Rebuilt the SQL setup as a clean, single-pass script; source checks confirm one definition of each workflow function and balanced dollar-quote blocks. The latest script was applied successfully to the live Supabase project.
10. Added matching URL and public-email length limits in the form and database, and normalized applicant email before applying the rolling rate limit.
11. Added a basic sitemap and robots.txt rule to keep the founder admin path out of crawler indexing.
12. Clarified in the policy notice that the current application form does not accept file or image uploads.
13. Pinned the browser Supabase SDK to version 2.119.2 rather than following an unpinned major-version CDN tag.
14. Extended the readiness and verification checks to confirm anonymous users cannot set status, review notes, reviewer identity, review time or submission time.
15. Changed the public readiness RPC to SECURITY INVOKER; verified it still returns true under the anon database role.
16. Added an invoker-rights public directory search RPC with bounded page size/offset and category/location/text filters.
17. Added a unique partial index preventing duplicate active applications for the same normalized contact email and business name; changes-requested and rejected applications can be resubmitted.
18. Added a public listing expiry timestamp, RLS/search exclusion after expiry, and founder renewal control.
19. Added a prefilled email link for public listing corrections and reports.
20. Added founder-only publication/expiry updates so approved listings can be hidden, republished and renewed without direct public write access.
21. Founder dashboard now verifies the authenticated user against the database founder allowlist before showing the workspace.


### What remains blocked
- The latest admin/setup.sql has been applied to the live Supabase project. The confirmed founder Auth user exists and is allowlisted. The public-signup setting has not been independently verified.
- Supabase reports directory_portal_ready = true under the anon role; the readiness function is SECURITY INVOKER. The founder is separately allowlisted. The public form remains closed through an explicit APPLICATIONS_OPEN=false code gate until live browser/Android QA and operational checks pass.
- Synthetic role-based database tests passed: anonymous application insert; private submission fields inaccessible to anon; founder approval creates exactly one public listing; request-changes and rejection do not publish; the fourth same-email submission in 24 hours is blocked; a non-founder review RPC is rejected; the founder-only private-notes insert succeeds. A rolled-back founder-context transaction test also confirmed that a changes-requested record cannot be approved, rejection requires a note, and a fresh pending application can be approved with a 12-month expiry. All synthetic records were rolled back. The actual website form and admin UI have not yet been tested in a browser.
- The three-per-email rate limit, duplicate index and honeypot are not a substitute for CAPTCHA or IP-based abuse protection. A bot can rotate email addresses and bypass a honeypot.
- Applicants are not email-verified. The authority checkbox is a declaration, not independent proof of business ownership.
- Duplicate protection covers the same normalized contact email and business name while an application is pending or approved; it does not prove ownership or detect duplicates submitted from different email addresses. No applicant edit portal, photo upload, business self-service or automated applicant email notification is implemented. Public users can request correction/reporting by email; there is no tracked takedown case system. Public visibility expires automatically after 12 months; founder renewal is manual after business reconfirmation.
- Search, category/location filters and 12-item pagination are implemented and deployed. A rolled-back synthetic database test confirmed anonymous search returned only a published, unexpired listing while excluding an expired listing and a hidden listing. Actual Android/browser interaction tests remain pending.
- The founder dashboard drafts emails in the user's email app; it does not send them automatically.
- Existing applications that predate publication consent must not be approved unless consent is collected again.

### Supabase activation evidence and remaining go-live checks
1. [x] Confirmed Auth user `orbitalxfuture@gmail.com` exists and email is confirmed.
2. [ ] Verify public Auth sign-ups are disabled in Supabase Auth settings; this configuration could not be independently confirmed through the available database checks.
3. [x] Apply the latest `admin/setup.sql` to the live Supabase project.
4. [x] Run the latest `admin/verify.sql`; it completed without SQL errors.
5. [x] Confirm the founder is allowlisted, all four application/admin tables have RLS enabled, `directory_portal_ready` is true, and anonymous access to private applicant fields is denied.
6. [x] Synthetic database transaction tests: anon insert; founder approve/publish; request-changes; reject; confirm no private contact fields are copied into public listings. [ ] Repeat through the actual Android Chrome website form and `/admin/` dashboard.
7. [x] Synthetic tests were rolled back; the live database has zero application rows and zero public listing rows.
8. [ ] Keep the form closed until Android/browser UI testing, public-signup configuration verification and remaining privacy/legal operational gates are complete.

**Latest setup file:** admin/setup.sql  
**Verification file:** admin/verify.sql  
**Founder dashboard:** https://orbital-x-future.onrender.com/admin/  
**Public application section:** https://orbital-x-future.onrender.com/#advertise

### Current Supabase security-advisor interpretation (28 November 2026)
- `directory_portal_ready()` and `search_business_directory()` are SECURITY INVOKER functions; both were tested under the anon role. The readiness RPC returned true, and a rolled-back synthetic test confirmed search excludes hidden and expired rows.
- `is_orbital_founder()` and `review_business_submission()` remain SECURITY DEFINER by design. They have a fixed empty search_path, EXECUTE is limited to authenticated users, the founder helper checks the immutable allowlist against the confirmed Auth user, and the review function repeats founder authorization internally before changing status or publishing. Do not revoke these grants without replacing the founder-review design.
- Supabase still reports generic SECURITY DEFINER advisor warnings for those two restricted functions, plus an INFO notice because `private.founder_admins` has RLS but no policies. The private schema has no USAGE grants to anon/authenticated/service_role and the table has no non-postgres table grants; the no-policy notice is intentional defense in depth.
- Supabase also reports leaked-password protection disabled. Current Supabase documentation says this feature is available on Pro and above. If the project is on Free, it cannot be enabled without upgrading; use a strong founder password and the strongest available password-strength settings. Public signup configuration is not exposed by the available project tools and still needs a dashboard check.
- Latest Supabase health advisor is clean. Performance advisor only reports two newly added indexes as unused because the database currently contains zero application/listing rows; do not remove them based on an empty-database usage counter.

## 4. Pricing, legal and revenue readiness

- Standard Listing is proposed as free. Direct listing revenue from a Standard Listing is **US$0**.
- Business Plus US$9.99/month, Featured Business US$19.99/month and Premium Partner US$39.99/month are proposed introductory prices only.
- No payments are accepted and no package is currently purchasable.
- No customer order/contract record, payment provider, invoice/receipt, tax handling, subscription state, cancellation, refund, failed-payment or advertising delivery workflow exists.
- No traffic, leads, sales, search ranking or business outcomes are guaranteed.
- Standard Listing expiry is enforced by RLS and search after 12 months; expired rows are no longer visible to public roles. Founder renewal is manual and must follow business reconfirmation. No scheduled deletion/archive or applicant notification automation exists.
- The privacy/terms page is a pre-launch draft, not a legal compliance certification. It still needs jurisdiction-specific review and final legal identity, business address, governing law, dispute process, tax and consumer/privacy obligations before paid service.
- ORBITAL X FUTURE must continue to be described as an independent technology venture, not an incorporated/registered company, until legal registration is completed.

## 5. Sasha AI — code and hosting review

### Verified in source and Render
- React/Vite frontend and Express server; API keys are read server-side from environment variables.
- Chat uses Gemini streaming; speech uses Fish Audio; microphone input uses browser SpeechRecognition with en-JM.
- Chat request body is limited to 64 KB; message count, individual message length and total conversation length are bounded.
- In-memory per-IP limits: 12 chat requests/minute and 18 speech requests/minute.
- Provider requests have 45-second timeouts.
- Server-side system instructions prohibit invented staff, bookings, reviews, notifications, refunds, records and completed actions.
- New response headers include X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy.
- Timeout errors now explain that the provider took too long.
- The app displays a privacy notice: messages go to Gemini; response text goes to Fish Audio when voice is enabled; chat history is not saved by this app; users should not enter sensitive/confidential information.
- Render service is a Free Node web service in Oregon, one instance, manual deployment.
- The latest application deployment is tracked separately from the website; GitHub pushes do not automatically deploy Sasha AI.
- Latest source model defaults are gemini-3.1-flash-lite and gemini-3.5-flash-lite.
- Latest Render startup logs report Business profile: not configured. This is the general Sasha AI assistant, not a configured business assistant.

### Important provider and hosting constraints
- Google's Gemini Developer API documentation lists gemini-3.1-flash-lite. The code's primary model identifier is current in the official model/pricing documentation. The API key's project access and actual quota were not inspected.
- Google's pricing page says free-tier content may be used to improve Google products, while paid-tier content is not. The account tier in use is unverified. Customer-confidential data must not be sent through a free-tier key.
- Fish Audio's published notice says model s2.1-pro-free is free only through **30 November 2026**, with no SLA and possible use of requests to improve model quality; commercial use may have restrictions. Recheck terms before 1 December 2026. Do not promise that free cloned-voice generation will continue.
- Render Free web services spin down after 15 minutes without inbound traffic and may take about one minute to wake. This can explain slow first responses after inactivity. The service may also restart; free tier is not a production availability commitment.

### Remaining Sasha AI blockers
- Render's healthCheckPath is blank. /healthz exists in source but was not independently verified with a successful live HTTP request. The endpoint reports process/configuration flags; it does not prove upstream Gemini or Fish Audio availability.
- No lockfile; package dependencies include latest versions. Render's current build command performs repeated npm install operations. A reproducible, pinned build is still needed.
- PWA manifest uses one JPEG icon with sizes:any; dedicated 192px and 512px PNG icons are absent. PWA install/update behavior requires an Android Chrome acceptance test.
- Service worker caches the app shell/static assets only. Chat/API requests do not work offline.
- No user accounts, persistent chat history, multi-tenant separation, business admin dashboard, database-backed approved knowledge base, booking, payment, CRM, lead capture, human handoff, support dashboard or billing.
- Rate limits are in-memory and suitable only for one instance. They are not distributed abuse protection.
- No fresh live tests of chat quality, context, action truthfulness, Gemini quota errors, timeout, Fish Audio, interruption, microphone permission, speech accuracy, PWA installation/update, privacy/logging or abuse limits have passed in this audit.
- The browser/device voice fallback after Fish Audio's free period has not been implemented. A device voice would not reproduce the cloned voice.
- The in-app privacy notice is a prototype disclosure, not a complete legal privacy policy or data-processing agreement.

## 6. Search visibility and founder attribution

- Website source includes founder and venture structured data, canonical URL, Open Graph/Twitter metadata and a Google verification meta token.
- The presence of a verification token in HTML does not prove Search Console ownership verification or Google indexing.
- A basic sitemap.xml and robots.txt are now present, with the founder admin path disallowed for crawlers. Search Console ownership verification, indexing and branded search appearance remain unconfirmed.
- Do not promise that searching the founder's name will immediately show the website.

## 7. Deployment evidence

- Website Render service: static site, branch `main`, automatic deployment enabled. Render confirmed the latest source/audit commit live during this audit. The public application form remains closed through `APPLICATIONS_OPEN=false` until Android/browser acceptance testing and the remaining privacy/operational gates pass.
- Sasha AI Render service: Node web service, Free plan, one instance, Oregon, manual deployment. Application source commit 26464cfce26ef2644c151b2b00f9082b0764d36a is live in deploy dep-dc4ut197lnhs739vr1cg (deployed from branch head 49a1ed210d73fe2b0cf153dd1c144988b00f7c7d).
- A live deployment proves the deployment completed; it does not prove database, provider or user-journey acceptance tests passed.
- The GitHub repository is public and the `main` branch currently has branch protection disabled (no required status checks were reported). Because Render auto-deploys from `main`, a compromised account or accidental direct push can publish changes immediately. Enable a main-branch ruleset that requires pull requests and blocks force-push/deletion, and protect the GitHub account with MFA.
- A GitHub Actions workflow for JavaScript syntax, required-control, launch-gate and browser-secret checks has been added. GitHub currently reports zero workflow runs, so Actions enablement and a passing CI run are not yet verified.
- Render service metadata did not provide evidence that custom response headers are configured. Verify in Render Dashboard → service → Settings → Headers; recommended baseline: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Do not add a restrictive Content-Security-Policy until the CDN and Supabase dependencies are tested.
- No direct live HTTP result for /healthz, /api/config, the website homepage or the admin login was recorded in this audit. Browser/device verification remains pending.

## 8. Customer acquisition and operations

- Two initial roofing prospect emails were sent from a personal Gmail account, not the venture's public sender. No confirmed partnership or revenue is recorded.
- Further outreach should wait until the official venture sender is connected and the directory's actual offer is ready.
- No automated customer support, ticketing, CRM, email notification, sales pipeline, customer onboarding, contract signing, refund handling or complaint/takedown workflow is implemented.

## 9. Closure order — freeze new features

1. **Directory browser acceptance:** test the actual public form and founder dashboard in Android Chrome; verify public Auth sign-ups are disabled.
2. **Directory test status:** database role-based tests are complete and passed; only the actual Android/browser form and dashboard journey remains to be tested.
3. **Website QA:** Android Chrome, navigation, closed-form state, policy links, accessibility, SEO metadata and mobile layout.
4. **Sasha deployment verification:** latest deployment is live and startup logs show the process running; configure `/healthz` as the Render health-check path and complete a direct HTTP test.
5. **Sasha acceptance tests:** text, context, action truthfulness, provider failure, timeout, voice, microphone, PWA and abuse limits.
6. **Provider/privacy decisions:** confirm Gemini account tier and data handling; recheck Fish Audio terms before 1 December 2026; decide fallback.
7. **Operational controls:** complete tracked takedown handling, support and data retention; duplicate prevention, public expiry and founder hide/republish/renew controls are implemented.
8. **Legal and commercial preparation:** legal review, business identity, address, customer order, tax, payment, cancellation/refund and advertising delivery terms.
9. **Only after all relevant gates pass:** open applications; only later consider paid placements or a supervised business pilot.

**No new feature work should begin until the earlier gates above are closed.** This is the controlling audit document; update it only when a test result or configuration change is evidenced.
