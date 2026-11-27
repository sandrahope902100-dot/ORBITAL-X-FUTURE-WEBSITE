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
- The directory submission form, founder review dashboard and public approved-listing display are implemented in code. The Supabase database has not yet been confirmed active, and the complete submission-to-publication workflow has not passed end-to-end testing. The directory must therefore remain closed until activation and tests pass.
- Pricing shown on the website is proposed introductory pricing only. It is not an active checkout offer.
- No payments are currently accepted through the website.
- Paid placements, listing management, billing, cancellation/refund terms and delivery processes must be finalized before taking payment.
- Directory enquiries do not create a listing, reserve advertising space or constitute an endorsement.
- Paid placements must be clearly labelled as advertising; do not promise traffic, leads, sales or search rankings.

## Product disclosure
Sasha AI is a supervised demonstration prototype. It is not approved for paid or unsupervised business deployment. See the Sasha AI repository's BUSINESS-READINESS.md for the current engineering assessment.


## Pre-launch terms and customer protections (27 November 2026)
- Public page: `policies.html` (linked from the homepage).
- Proposed Standard Listing term: 12 months, renewable annually at no charge after business details are reconfirmed and the listing remains eligible.
- No automatic conversion from a free listing to a paid plan.
- Proposed paid plans are month-to-month, with no minimum commitment; final cancellation, refund, tax, billing and delivery terms must be supplied in a written order before payment is enabled.
- Business Plus is described as profile enhancement, not a ranking boost.
- Featured and Premium are described as sponsored advertising with defined 30-day campaigns and an adjacent Sponsored/Advertisement label.
- Payment cannot buy verification, favourable reviews, editorial endorsement or guaranteed results.
- The site currently has no public customer accounts, business self-service editing, checkout, subscription management, booking, lead-management or analytics dashboard. The founder-only admin login and business application/review code exist; database activation and end-to-end tests remain outstanding.
- The privacy notice describes the planned application data flow, Supabase storage, Render hosting and Google Fonts dependency. It is a pre-launch notice, not a legal compliance certification.
- Legal identity, business address, governing law, dispute process, tax handling and jurisdiction-specific consumer/privacy review remain launch blockers.
- Do not accept money, publish listings, promise delivery or sign paid customers until the directory workflow, written customer order, payment method, cancellation/refund process, and applicable legal review are complete.

## Launch gate
The website may be used to explain the venture and collect voluntary email enquiries only. It is **not a live directory or paid advertising service**. The website commit deploys automatically through Render; verify the latest deployment is live before announcing changes.


## Directory application and approval system
- Public homepage form submits new applications as pending.
- Anonymous visitors can submit but cannot read, change or delete applications.
- Founder dashboard at /admin/ displays private applications.
- Only the verified Auth identity orbitalxfuture@gmail.com can review.
- Approve creates a public listing; request-changes and reject do not publish.
- Public directory reads only published profile records; private applicant name/email and review notes are never copied to the public table.
- Database limit: 3 applications per contact email per rolling 24 hours; form honeypot supplements it. CAPTCHA is not yet included.
- Run the full admin/setup.sql in Supabase SQL Editor. Public sign-ups must remain disabled and founder email confirmed.
- No file uploads, business self-service editing, payments, subscriptions or customer accounts in this first version.
- Do not announce applications as open until SQL setup has succeeded and test submissions have been reviewed.
