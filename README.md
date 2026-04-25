# Golden Key Retreats

Marketing website for **Golden Key Retreats** — Natalie Ortega's Miami-based short-term rental brand.

Built with Next.js 16, TypeScript, Tailwind CSS, Vercel Postgres, and Vercel Blob.

---

## What's on the site

- **Homepage** — hero, info cards, "What You Can Expect", "Our Standards", featured units, stay types, services, and house rules.
- **Featured Units** (`/units`) — grid of all units, each linking to a full detail page with photos, amenities, and services included.
- **Contact** (`/contact`) — Natalie's info plus a working contact form that emails `goldenkeyretreats@gmail.com`.
- **Admin** (`/admin/login`) — password-protected. Add, edit, and delete units. Photos upload to Vercel Blob.

---

## Local development

```bash
npm install
npm run dev
```

The site runs at http://localhost:3000 even without any environment variables — the Featured Units section will be empty, and the admin panel will warn that the database isn't connected.

To test the admin and database locally, copy `.env.example` to `.env.local` and fill in your Vercel Postgres + Blob credentials (after step 2 below).

---

## Deploy to Vercel

### 1. Push this repo to GitHub

```bash
git add .
git commit -m "Initial site"
git remote add origin https://github.com/<your-username>/golden-key-retreats.git
git push -u origin main
```

### 2. Create the Vercel project

1. Go to https://vercel.com/new and import the GitHub repo.
2. Click **Deploy** (the build will succeed even before storage is connected).

### 3. Add Postgres + Blob storage

In your Vercel project dashboard:

1. **Storage → Create Database → Postgres** → name it `gkr-units` → Connect.
2. **Storage → Create Database → Blob** → name it `gkr-photos` → Connect.

Vercel auto-creates the `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` environment variables and links them to your project. Redeploy to pick them up.

### 4. Set up the contact form (Resend)

1. Sign up at https://resend.com (free tier covers 100 emails/day).
2. **API Keys → Create API Key** → copy the key.
3. In Vercel: **Project → Settings → Environment Variables**, add:
   - `RESEND_API_KEY` = the key you copied
   - `CONTACT_TO_EMAIL` = `goldenkeyretreats@gmail.com`
   - `CONTACT_FROM_EMAIL` = `Golden Key Retreats <onboarding@resend.dev>` *(works immediately)*
4. **Recommended:** verify the domain `goldenkeyretreats.org` in Resend (Domains → Add Domain) so emails come from `hello@goldenkeyretreats.org` instead of the shared sender. Update `CONTACT_FROM_EMAIL` once verified.

Redeploy after adding env vars.

### 5. Connect your domain

In your Vercel project dashboard:

1. **Settings → Domains → Add** → enter `goldenkeyretreats.org` and `www.goldenkeyretreats.org`.
2. Vercel will show DNS instructions. At your domain registrar, add the A / CNAME records they provide.
3. Once DNS propagates (usually a few minutes), HTTPS is provisioned automatically.

---

## Admin: managing units

1. Go to `https://goldenkeyretreats.org/admin/login`.
2. Sign in with the password (default: `Golden2026$`).
3. Click **+ New Unit** to create a listing — fill in name, location, description, photos, amenities, services, etc.
4. Edit or delete units anytime from the **Units** page.

To change the admin password, set `ADMIN_PASSWORD` to a new value in your Vercel environment variables and redeploy.

---

## Updating starter content

These files contain text shown on the homepage that you can edit anytime:

- **House rules** — `src/lib/site-data.ts` (`HOUSE_RULES`)
- **Services included** — `src/lib/site-data.ts` (`HOMEPAGE_SERVICES`)
- **Stay types** — `src/components/stay-types.tsx`
- **What You Can Expect** — `src/components/expect.tsx`
- **Our Standards** — `src/components/standards.tsx`
- **Hero copy** — `src/components/hero.tsx`

Push to GitHub and Vercel will redeploy automatically.

---

## Project structure

```
src/
  app/
    page.tsx              homepage
    units/                public unit pages
    contact/              contact page + form action
    admin/                password-protected admin panel
  components/             reusable section components (hero, footer, etc.)
  lib/
    db.ts                 Postgres queries
    auth.ts               admin password + session cookies
    types.ts              Unit type
    site-data.ts          editable static content (rules, services)
```
