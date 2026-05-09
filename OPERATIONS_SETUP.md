# Operations Sheet — Setup Guide

This document is the step-by-step to wire up the Operations Sheet feature
(Properties, Inventory, Budget, Product Links, Income, Backup) on Vercel.

The code is fully scaffolded under `/admin/operations`. What's left is
provisioning storage and setting env vars. Run through this once.

---

## 1 — Provision Postgres (required)

The schema auto-creates on first request, so you just need a connection string.

1. Go to **Vercel dashboard → golden-key-retreats → Storage → Create Database**.
2. Pick **Postgres** (any of the marketplace integrations works — Neon,
   Supabase, etc. The native option is fine).
3. Confirm region (closest to your users — `iad1` if east coast US).
4. **Connect** it to this project. Vercel will inject `POSTGRES_URL` and
   `POSTGRES_URL_NON_POOLING` automatically into Production + Preview.
5. Pull them locally:
   ```
   vercel env pull .env.local
   ```
6. Verify:
   ```
   cat .env.local | grep POSTGRES_URL
   ```

   You should see `POSTGRES_URL=postgres://...` populated.

---

## 2 — Provision Vercel Blob (for backups)

This powers "Save Snapshot to Blob" and the nightly auto-backup. Without it,
manual download still works but snapshot history won't.

1. **Storage → Create Database → Blob**.
2. Name it whatever (e.g. `gkr-backups`).
3. **Connect** to this project. Vercel injects `BLOB_READ_WRITE_TOKEN`.
4. Pull again: `vercel env pull .env.local`.

Already-uploaded unit photos use the same Blob store — no conflict.

---

## 3 — Set the cron secret (recommended)

Protects the nightly auto-backup endpoint from random hits.

1. Generate a secret:
   ```
   openssl rand -hex 32
   ```
2. **Vercel → Settings → Environment Variables**:
   - Key: `CRON_SECRET`
   - Value: (paste the hex from step 1)
   - Environments: Production (only)
3. Vercel automatically sends `Authorization: Bearer ${CRON_SECRET}` on the
   nightly cron request. The route at `/api/cron/backup` rejects anything
   without that header.

If you skip this, the endpoint still works but is unprotected.

---

## 4 — Confirm cron config

`vercel.json` is committed at repo root with:

```json
{
  "crons": [
    { "path": "/api/cron/backup", "schedule": "15 7 * * *" }
  ]
}
```

That's `07:15 UTC` daily — `03:15 America/New_York` after DST kicks in. Edit
the schedule string if you'd rather a different time. Note: Vercel cron
schedules are UTC; the `Etc/UTC` timezone is implicit.

You'll see the cron listed in **Project → Settings → Cron Jobs** after the
next deploy.

---

## 5 — Deploy & smoke test

```
vercel --prod
```

Once live:

1. Visit `https://<your-domain>/admin/login` and log in (password from
   `ADMIN_PASSWORD`).
2. Click the **Operations Sheet** card on the dashboard. You should land on
   `/admin/operations` with all 4 portfolio stats reading zeros.
3. Click **Properties → New Property**, add Cherry Tree (or any test). On
   save you'll be bounced back; the property card shows up with progress
   bars.
4. Click **Inventory** → switch property → toggle a few "Have" boxes, edit
   a qty inline, add a new item, delete one. Each should save with no page
   reload.
5. Click **Budget** → set budget + price + store + status on a row. The
   stat cards and per-category bars update.
6. Click **Product Links → New Link** and save one entry. Open the row's
   "Open" link in a new tab to confirm it works.
7. Click **Income → Log Booking**, fill in dates and gross/cleaning/platform.
   Confirm nights auto-calc and net auto-calc preview.
8. Click **Backup → Download .xlsx**. You should get a 4-sheet workbook.
   Click **Save Snapshot to Blob** — it should appear in Snapshot History.
9. Manually fire the cron once to verify:
   ```
   curl -H "Authorization: Bearer $CRON_SECRET" \
        https://<your-domain>/api/cron/backup
   ```
   Should return `{"ok":true,"url":"...","size":...}`.

---

## 6 — Hand it off to Nat

Tell Nat:
- The hot-pink standalone HTML previews under
  `Desktop/Website/GK spread sheet/` are her visual reference, not the live
  sheet anymore.
- The live tool is `goldenkeyretreats.org/admin/operations` — log in with
  the admin password.
- Add Property first → that auto-seeds inventory → fill in stuff over time.
- The "Backup" tab is her insurance: tap once whenever she wants a frozen
  copy on her computer.

---

## File map (what exists where)

```
src/
  lib/
    db.ts                                  - Postgres + schema migrations
    operations.ts                          - types + CRUD for all 4 tables
    backup.ts                              - .xlsx workbook generator + Blob helpers
  app/
    api/
      cron/backup/route.ts                 - nightly cron endpoint
      operations/backup/download/route.ts  - manual .xlsx download
    admin/
      page.tsx                             - main dashboard (links to /admin/operations)
      operations/
        page.tsx                           - sub-dashboard
        properties/                        - CRUD: list / new / [id]/edit / actions / _form
        inventory/                         - inline-editable per-property checklist
        budget/                            - inline-editable budget table
        links/                             - CRUD: catalog
        income/                            - CRUD: bookings
        backup/                            - download + snapshot history

vercel.json                                - cron config
```

---

## Schema quick reference

```
properties           id, name, address, monthly_rent_cents, beds, baths(NUMERIC),
                     amenities(JSONB), created_at
property_items       id, property_id (FK CASCADE), category, item, qty, notes,
                     budget_cents, actual_cost_cents, store, status, has_it,
                     sort_order, last_purchased_at, created_at
product_catalog      id, category, item, brand, store, link_url, price_cents,
                     notes, last_verified_at, created_at
bookings             id, property_id (FK CASCADE), source, check_in, check_out,
                     nights, gross_cents, cleaning_cents, platform_fee_cents,
                     net_cents, notes, created_at
```

All money is in **cents** to avoid float precision bugs. `dollarsToCents` /
`centsToDollars` helpers in `operations.ts` handle conversion.

---

## Known gotchas

- **Inline edits don't have optimistic UI for qty/notes/store** — they show a
  spinner while saving. Fast enough for normal use; revisit if it feels slow.
- **`.next/` cache occasionally has macOS-style ` 2.ts` duplicate files**
  that confuse tsc. If typecheck barfs about duplicate identifiers, run
  `rm -rf .next && npx tsc --noEmit`.
- **Backup retention is unlimited by default.** Vercel Blob has a free tier
  but snapshots will accumulate. Add a 30-day prune step inside
  `/api/cron/backup` later if needed.
- **The cron runs at the same UTC time year-round.** EST→EDT shift will
  move it from 02:15 to 03:15 local. If you care, parameterize.
- **Unit photos and backups share one Blob store.** Different prefixes
  (`units/...` vs `operations-backups/...`), so no collision.
