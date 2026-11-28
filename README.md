# ORBITAL X FUTURE website

A responsive, static HTML/CSS/JavaScript website for ORBITAL X FUTURE, an independent technology venture founded by Sasha-Lee Nugent.

## Live website
https://orbital-x-future.onrender.com/

## Hosting
- Platform: Render Static Site
- Repository: sandrahope902100-dot/ORBITAL-X-FUTURE-WEBSITE
- Branch: main
- Build command: `echo "Static site — no build required"`
- Publish directory: `.`
- Auto-deploy: enabled for commits to main

## Public contact
orbitalxfuture@gmail.com

## Current business status
- ORBITAL X FUTURE is described publicly as an independent technology venture. Do not describe it as incorporated or registered.
- The website is an informational pre-launch site. The directory application interface is present but remains disabled until the database is configured and verified.
- The directory submission form, founder review dashboard, public approved-listing display, business/service search, category/location filters, pagination, duplicate protection and founder hide/republish controls are implemented. Supabase is active and the core role-based workflow has passed synthetic database tests (approval publishes; request-changes and rejection do not). All test records were rolled back. The public form remains intentionally closed pending live browser/Android testing and final operational checks.
- Pricing shown on the website is proposed introductory pricing only. It is not an active checkout offer.
- No payments are currently accepted through the website.
- Paid placements, listing management, billing, cancellation/refund terms and delivery processes must be finalized before taking payment.
- Directory enquiries do not create a listing, reserve advertising space or constitute an endorsement.
- Paid placements must be clearly labelled as advertising; do not promise traffic, leads, sales or search rankings.

## Product disclosure
Sasha AI is a supervised demonstration prototype. It is not approved for paid or unsupervised business deployment. See the Sasha AI repository's BUSINESS-READINESS.md for the current engineering assessment.


## Pre-launch terms and customer protections (27 November 2026)
- Public page: `policies.html` (linked from the homepage).
- Standard Listing term: 12 months. Public visibility automatically ends at expiry unless the founder renews it after the business reconfirms its details. Renewal remains free and subject to review.
- No automatic conversion from a free listing to a paid plan.
- Proposed paid plans are month-to-month, with no minimum commitment; final cancellation, refund, tax, billing and delivery terms must be supplied in a written order before payment is enabled.
- Business Plus is described as profile enhancement, not a ranking boost.
- Featured and Premium are described as sponsored advertising with defined 30-day campaigns and an adjacent Sponsored/Advertisement label.
- Payment cannot buy verification, favourable reviews, editorial endorsement or guaranteed results.
- The site currently has no public customer accounts, business self-service editing, checkout, subscription management, booking, lead-management or analytics dashboard. The founder-only admin login and business application/review code exist; Supabase is active and the core database workflow has passed synthetic role-based tests. Actual dashboard sign-in and browser-based form acceptance tests remain outstanding.
- The privacy notice describes the application data flow, Supabase storage, Render hosting, the esm.sh SDK CDN and Google Fonts. It discloses that no fixed application-record retention period has been set. It remains a pre-launch notice, not a legal compliance certification.
- Legal identity, business address, governing law, dispute process, tax handling and jurisdiction-specific consumer/privacy review remain launch blockers.
- Do not accept money, publish listings, promise delivery or sign paid customers until the directory workflow, written customer order, payment method, cancellation/refund process, and applicable legal review are complete.

## Launch gate
The website may be used to explain the venture and collect voluntary email enquiries only. It is **not a live directory or paid advertising service**. The website commit deploys automatically through Render; verify the latest deployment is live before announcing changes.


## Directory application and approval system
- Public homepage form submits new applications as pending only after the SECURITY INVOKER readiness RPC confirms required public tables, RLS policies, anonymous insert grants, rate-limit trigger and private-field read restrictions. Founder authorization is checked independently by the founder RPC and review RPC.
- Applicants separately consent to privacy processing and to publication of their business profile if approved; the database enforces both.
- Anonymous visitors can submit but cannot read, change or delete applications.
- Founder dashboard at /admin/ displays private applications.
- Only the verified Auth identity orbitalxfuture@gmail.com can review.
- Approve creates a public listing; request-changes and reject do not publish.
- Public directory reads only published profile records; private applicant name/email and review notes are never copied to the public table. Search supports business/service text, category and city/country filters with 12-item pagination. Founder can hide or republish approved profiles.
- Database limit: 3 applications per contact email per rolling 24 hours; a unique partial index blocks duplicate pending/approved applications by normalized contact email and business name. Changes-requested and rejected applications can be resubmitted. Form honeypot supplements these controls. CAPTCHA is not yet included.
- The latest admin/setup.sql has been applied and admin/verify.sql has been run successfully. The founder email is confirmed and allowlisted. Verify that public sign-ups remain disabled; this Auth setting has not yet been independently confirmed.
- No file uploads, business self-service editing, payments, subscriptions or customer accounts in this first version.
- Do not announce applications as open until the Android/browser form test, founder dashboard sign-in test, public Auth sign-up setting, leaked-password protection, retention/legal review and remaining launch checks are complete. The form is intentionally closed in assets/directory.js (APPLICATIONS_OPEN=false).
