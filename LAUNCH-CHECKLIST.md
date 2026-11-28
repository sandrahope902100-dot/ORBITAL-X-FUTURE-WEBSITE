# ORBITAL X FUTURE — Launch Readiness Checklist

**Review date:** 28 November 2026  
**Current decision:** Pre-launch information and enquiry website only. The directory and paid advertising service are not live.

This checklist is a go/no-go control. A checked box means evidence exists; it must not be checked merely because a task has been discussed.

## A. Public claims and customer protection
- [x] Describe ORBITAL X FUTURE as an independent technology venture, not an incorporated company.
- [x] Describe Sasha AI as a supervised demonstration prototype.
- [x] Disclose that the directory is not live and that enquiries do not create listings.
- [x] Show proposed pricing as indicative only; state that no payment is accepted.
- [x] State the proposed 12-month Standard Listing term and free annual renewal, subject to review.
- [x] Prohibit automatic conversion from free to paid.
- [x] Separate paid advertising from verification, editorial opinion and ordinary listing order.
- [x] Publish a pre-launch service terms and privacy notice.
- [ ] Obtain jurisdiction-specific legal review and confirm the final service provider identity, business contact address, governing law, dispute process and tax treatment.

## B. Directory product — NOT COMPLETE
- [x] Create Supabase storage for private business applications and approved public listings.
- [x] Add public search across business/service text, category and city/country, category/location filters and 12-item pagination. [ ] Complete live browser/Android QA.
- [x] Build the business submission form with separate privacy and publication consent. [ ] Complete live browser/Android form testing; applications remain closed.
- [x] Add a SECURITY INVOKER readiness RPC that checks public-schema tables, anonymous insert grants, private-field read restrictions, RLS policies and the rate-limit trigger. Founder authorization is checked separately by the founder RPC and review RPC.
- [x] Add duplicate protection for the same normalized contact email and business name while pending/approved. [ ] Add independent business-claim ownership verification; the authority checkbox is a declaration only.
- [x] Build a founder-only review queue with approve/publish, request-changes and reject actions.
- [x] Add founder controls to hide and republish approved listings.
- [x] Add a public prefilled email route for listing correction/report requests. [ ] Build a tracked takedown/case workflow and response-time standard.
- [x] Enforce a 12-month listing expiry in database RLS and search; founder can renew after business reconfirmation. [ ] Add automated expiry notifications/archive.
- [ ] Define a factual verification standard and display exactly what was checked and when.
- [ ] Define category taxonomy, neutral default sort order and sponsored inventory limits.
- [ ] Add CAPTCHA/bot protection beyond the honeypot and email rate limit; test accessibility, mobile layout, security, backups and data export/deletion.
- [ ] Add a clear business contact and support process before accepting submissions.

## C. Paid packages — NOT AVAILABLE FOR SALE
- [x] Proposed price points are visible as proposals: Business Plus US$9.99/month; Featured Business US$19.99/month; Premium Partner US$39.99/month.
- [x] Proposed deliverables are defined at a high level; paid placements are to be labelled Sponsored/Advertisement.
- [ ] Confirm package capacity, creative specifications, exact placement locations and reporting definitions.
- [ ] Build an order/contract record with price, currency, tax, dates, deliverables and customer approval.
- [ ] Select and configure a suitable payment provider; verify supported country, settlement, fees and chargeback handling.
- [ ] Build invoices/receipts, subscription status, cancellation, downgrade, failed-payment and refund workflows.
- [ ] Publish final cancellation, renewal, refund, make-good and complaint terms.
- [ ] Test the entire purchase-to-delivery-to-cancellation lifecycle before taking any money.
- [ ] Do not accept manual transfers or promise placements before the written order and delivery process are ready.

## D. Privacy, security and trust
- [x] Founder-only admin login and business application/review interfaces are implemented; Supabase is active, founder is confirmed/allowlisted and core database workflow tests passed. Dashboard now verifies the founder allowlist through RPC. [ ] Test actual dashboard sign-in and queue UI.
- [x] No public customer account system, checkout or subscription management is implemented.
- [x] General contact route is an email link; business application form is intentionally disabled pending live browser/Android acceptance testing. Visitors are warned not to send sensitive data.
- [ ] Verify public Auth sign-ups are disabled in Supabase Authentication settings.
- [ ] Enable leaked-password protection if the Supabase plan supports it; current security advisor reports it disabled. Supabase documents this feature as Pro plan and above; if this project is on Free, use the strongest available password policy and keep the founder password strong.
- [ ] Decide what personal/business data will be collected when the directory launches and collect only what is necessary.
- [ ] Set retention and deletion periods, access controls, backup protection and incident response.
- [ ] Review hosting, email, analytics and payment processors as data processors/service providers.
- [ ] Add consent and image/logo usage permissions to the future submission process.
- [ ] Define how complaints, impersonation, misleading claims, prohibited content and takedown requests are handled.

## E. Sasha AI — separate product gate
- [x] Keep the current status at supervised demonstration prototype only.
- [x] Record that no business booking, payments, CRM, lead capture or human handoff is implemented.
- [x] Record Render manual-deploy configuration and missing health-check path.
- [ ] Verify /healthz returns HTTP 200 and configure Render health-check path.
- [ ] Pin dependencies and commit a lockfile.
- [ ] Complete the mobile, PWA, voice, microphone, context, failure, truthfulness, rate-limit and privacy/logging acceptance tests in BUSINESS-READINESS.md.
- [ ] Complete a supervised, narrow FAQ pilot using owner-approved facts before any commercial offer.

## F. Founder and venture identity
- [x] Public website attributes the venture to founder Sasha-Lee Nugent.
- [x] Public contact email is orbitalxfuture@gmail.com.
- [ ] Confirm control and recovery access for the business email, domain/hosting accounts and repositories.
- [ ] Protect the public GitHub repository's `main` branch with a ruleset requiring pull requests and blocking force-push/deletion; enable MFA on the GitHub account.
- [ ] Configure and verify baseline security response headers in Render Dashboard → service → Settings → Headers.

- [ ] Verify Google Search Console ownership and indexing directly; a verification meta tag alone is not proof of verification or indexing.
- [ ] Complete legal registration and any tax/business registrations when financially and legally appropriate. Do not claim registration before it exists.

## Remaining directory go-live checks

1. [x] Confirm the Supabase Auth user `orbitalxfuture@gmail.com` exists and its email is confirmed.
2. Confirm public sign-ups are disabled.
3. [x] Apply the latest `admin/setup.sql`; the founder UUID allowlist was seeded.
4. [ ] Open `/admin/` in Android Chrome and verify founder sign-in, pending queue and review actions.
5. [x] Role-based database test: anonymous insert permitted; anonymous read and mutation privileges denied. [ ] Repeat through the actual public form in a separate/private browser.
6. [x] Synthetic database transaction test: founder approval created one public listing while private applicant fields remained in the private submissions table; test was rolled back. [ ] Verify the same through the live UI.
7. [x] Synthetic database transaction tests confirmed request-changes and rejection create no public listing; tests were rolled back.
8. [x] Test records were rolled back; live database currently contains zero submissions and zero listings.
9. [ ] Keep applications closed until all browser/device checks and legal/operational gates pass.

## Go-live rule
The website may currently be used to explain the venture and invite voluntary email enquiries. Do not publish directory entries, accept listing applications, take payments, promise advertising delivery, or sell Sasha AI for business use until the relevant sections above are completed and tested. The founder should approve final prices, legal terms and all customer-facing commitments before activation.
