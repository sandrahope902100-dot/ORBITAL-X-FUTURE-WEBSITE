# ORBITAL X FUTURE — Launch Readiness Checklist

**Review date:** 27 November 2026  
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
- [ ] Build a real searchable directory database.
- [x] Build the first business submission form with separate privacy and publication consent; **database activation and end-to-end testing are still pending**.
- [x] Add a database readiness RPC that checks required anonymous insert grants, private-field read restrictions and RLS policies before enabling the public form.
- [ ] Build duplicate detection and business-claim ownership checks; current workflow uses an applicant authority declaration only.
- [x] Build a founder-only pending-application review queue with approve/publish, request-changes and reject actions; suspension/removal controls remain pending.
- [ ] Define a factual verification standard and display exactly what was checked and when.
- [ ] Build a public report-a-listing / correction / removal request process.
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
- [x] Founder-only admin login and business application/review interfaces are implemented in code; database activation and end-to-end testing remain pending.
- [x] No public customer account system, checkout or subscription management is implemented.
- [x] General contact route is an email link; business application form code is present but remains disabled until Supabase setup is verified. Visitors are warned not to send sensitive data.
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
- [ ] Verify Google Search Console ownership and indexing directly; a verification meta tag alone is not proof of verification or indexing.
- [ ] Complete legal registration and any tax/business registrations when financially and legally appropriate. Do not claim registration before it exists.

## Directory activation steps (not yet complete)

1. Confirm the Supabase Auth user `orbitalxfuture@gmail.com` exists and its email is confirmed.
2. Confirm public sign-ups are disabled.
3. Run the complete `admin/setup.sql` in Supabase SQL Editor. It seeds the founder UUID allowlist if the Auth user already exists. If the user is created afterward, run the SQL again to seed the allowlist.
4. Open `/admin/` and verify founder sign-in, pending queue and review actions.
5. Submit a test application from a separate browser/private session; confirm anonymous access cannot read it.
6. Approve the test application; confirm only the public business profile appears on the homepage and private applicant contact details remain hidden.
7. Test request-changes and rejection; confirm neither creates a public listing.
8. Delete test records through a controlled SQL cleanup after verification.
9. Only then announce that applications are open.

## Go-live rule
The website may currently be used to explain the venture and invite voluntary email enquiries. Do not publish directory entries, accept listing applications, take payments, promise advertising delivery, or sell Sasha AI for business use until the relevant sections above are completed and tested. The founder should approve final prices, legal terms and all customer-facing commitments before activation.
