# ORBITAL X FUTURE website

Responsive static website for ORBITAL X FUTURE, an independent technology venture. It is not represented as an incorporated or registered company.

- Live website: https://orbital-x-future.onrender.com/
- Hosting: Render Static Site
- Repository: sandrahope902100-dot/ORBITAL-X-FUTURE-WEBSITE
- Branch: main
- Publish directory: .
- Auto-deploy: enabled on commits to main
- Public contact: orbitalxfuture@gmail.com

## Current launch status

**Pre-launch only. Business applications remain closed. No payments are being accepted and no new business listings should be published.** The public form is intentionally disabled in `assets/directory.js` by `APPLICATIONS_OPEN=false`.

The public website explains the venture, Sasha AI and the proposed directory. The directory UI and backend workflow are implemented, but this does not mean the service is ready to accept customers. The live Android/browser application submission and reporting journeys still require end-to-end acceptance testing before applications are opened.

## Directory workflow implemented

**Do not run `admin/setup.sql`.** It is a historical bootstrap file and has been disabled because it predates the current AAL2 and payment controls. Re-running it would overwrite the founder MFA check and re-grant anonymous application inserts. Use `admin/verify.sql` for read-only checks; the live database's migration history is authoritative.


1. Applicant submits a business application with separate privacy, authority, subscription-terms and publication consents.
2. The database stores the application as pending. Anonymous visitors cannot read or alter application records.
3. The verified founder reviews the application. Approval moves it to `approved_pending_payment`; approval does not publish it. Rejections and change requests do not publish.
4. The founder sends payment instructions manually by email and marks them as sent.
5. The founder independently checks that the full payment has cleared in the receiving account. A customer receipt alone is not proof of cleared funds.
6. The founder records the verified payment reference. Only then is the listing activated and published for one month.
7. Renewals are manual. The founder sends new instructions during the final 14 days and extends the listing only after independently confirming the new payment.
8. Listings are excluded from public search after their paid expiry. No automatic card charge or automatic renewal exists.

## Proposed monthly packages

Jamaican businesses are billed in JMD; businesses outside Jamaica are billed in USD. The country and selected package determine the amount in the database.

| Package | Jamaica | International |
|---|---:|---:|
| Standard | J$1,999/month | US$9.99/month |
| Premium | J$3,999/month | US$19.99/month |
| Featured | J$6,999/month | US$39.99/month |

Premium and Featured placements are labelled as sponsored advertising. Payment does not buy verification, favourable reviews, editorial endorsement or guaranteed leads, sales or revenue.

## Refund and cancellation terms shown on the website

- If cleared payment is confirmed but OXF cannot publish the approved listing within five business days, the customer is entitled to a full refund.
- After successful activation, fees are non-refundable except where applicable law requires otherwise.
- Customers may cancel before the next monthly payment. The current paid period remains active until expiry.
- There is no automatic charge or renewal.

These are pre-launch terms and still require jurisdiction-specific legal review before paid service begins.

## Security and privacy controls

- Supabase Row Level Security is enabled on the exposed application tables.
- While the application portal is open, public visitors can submit applications and reports but cannot read private submissions, reports or payment settings. Anonymous direct INSERT permission on business applications is currently revoked at the database level; reopening requires an explicit database permission change as well as the website launch switch.
- Founder access is allowlisted to the verified founder identity and requires an AAL2 (MFA-verified) session for privileged operations.
- Payment/review state changes run through founder-checked database functions; sensitive helper functions are in the private schema.
- Public listing search returns only active, published profile fields.
- Application submissions are limited to three per contact email per rolling 24 hours and duplicate active applications are blocked by a database unique index.
- Public reports are limited to five per contact email per rolling 24 hours and must reference an active published listing.
- A hidden honeypot supplements the rate limit. CAPTCHA is not yet implemented; multi-address abuse remains a known limitation.
- No business self-service accounts, file uploads, checkout, card billing, CRM, lead management or automated email sending are implemented.
- The privacy notice does not yet set a fixed retention period for application/report records.

The current Supabase security advisor has one warning: leaked-password protection is disabled. The performance advisor reports four indexes not yet used; the health advisor reports no findings. The unused-index notices are informational and should not be removed blindly.

## Launch blockers still to close

- Complete live Android/Chrome tests for application submission, reports, founder review, payment instruction drafting, payment confirmation, publication, hide/republish, renewal and expiry.
- Add stronger public abuse protection such as CAPTCHA/Turnstile before opening the form.
- Confirm the public Auth sign-up configuration and complete the leaked-password protection setting where the current Supabase plan permits.
- Verify the actual JMD and USD receiving instructions privately before any payment email is sent.
- Establish a records-retention schedule and deletion/request-handling process.
- Obtain appropriate Jamaica and target-market review of privacy, consumer, advertising, tax and business identity requirements.
- Confirm that all operational email and refund handling can be delivered reliably.

Do not open applications, accept payment, promise publication or announce paid availability until the launch blockers have been reviewed and the founder explicitly approves launch.

## Sasha AI

Sasha AI is a separate product of ORBITAL X FUTURE and is currently a supervised demonstration prototype. It is not approved for paid or unsupervised business deployment. See the Sasha AI repository's `BUSINESS-READINESS.md` for its separate engineering assessment.

## Database migration backup

The complete applied Supabase migration history is currently recorded in the live Supabase project and is not yet maintained as a complete set of SQL migration files in this GitHub repository. Before rebuilding or restoring the database in a new project, export the live schema and applied migrations into version control. The disabled `admin/setup.sql` file is not a current schema backup and must never be used as a restore procedure.

## Deployment notes

The website is a static site with no build step. Commits to `main` deploy automatically through Render. Verify the new deployment is live before announcing a change.
