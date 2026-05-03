# Handoff — Header login + Inbox

This batch ships the **UI** for two new admin features. The data layer is
mocked so Natalie can preview the design end-to-end. Everything you need
to wire up is below.

## What's already done (UI / design)

### 1. Header login dropdown

- New component: `src/components/admin-login-button.tsx`
- Wired into `src/components/site-header.tsx` (which is now `async` and
  reads `isAdmin()` from `src/lib/auth.ts`)
- Server action: `src/app/admin/_actions.ts` (`headerLoginAction` reuses
  the existing `checkPassword` + `setAdminCookie`)

When signed out: small key icon → click drops a panel with a password
field. On success it redirects to `/admin`.

When signed in: the icon morphs into a "Dashboard" link to `/admin`.

The existing `/admin/login` page is untouched and still works as a
direct-URL fallback.

### 2. Admin hub at `/admin`

- New page: `src/app/admin/page.tsx`
- Cards link to: Inbox, Featured Units, Operations Sheet (placeholder),
  View Public Site
- Reads `unreadCount()` to show a "X new" badge on the Inbox card

### 3. Inbox at `/admin/inbox`

- New pages: `src/app/admin/inbox/page.tsx` (list) +
  `src/app/admin/inbox/InboxList.tsx` (client list with expand-to-read)
- Mock data + helpers in `src/lib/messages.ts`
- Server actions in `src/app/admin/inbox/_actions.ts` for status updates
  (gated by `isAdmin()`)
- Reply UX: "Reply via Email" opens the user's mail app with `mailto:`
  pre-quoted. No in-site composer. Mark as Replied / Archive update
  status; expanding a "new" message auto-marks it Read.

### 4. Admin layout nav updated

- `src/app/admin/layout.tsx` now has Dashboard + Inbox + Units + New Unit.

---

## What you (Osvaldo) need to wire up

### A. Database table for messages

Add to `src/lib/db.ts` inside the `ensureSchema()` IIFE:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  subject      TEXT,
  body         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_status_idx ON messages(status);
CREATE INDEX IF NOT EXISTS messages_created_idx ON messages(created_at DESC);
```

### B. Replace mocks in `src/lib/messages.ts`

Each function has a `TODO(osvaldo)` comment with the SQL hint:

- `listMessages({ includeArchived })` →
  `SELECT * FROM messages [WHERE status != 'archived'] ORDER BY created_at DESC`
- `getMessage(id)` → `SELECT * FROM messages WHERE id = $1`
- `unreadCount()` → `SELECT count(*) FROM messages WHERE status = 'new'`
- `setMessageStatus(id, status)` →
  `UPDATE messages SET status = $2 WHERE id = $1`

Delete the `MOCK` array once the helpers talk to Postgres. Keep the
`InboxMessage` and `MessageStatus` types — the UI imports those.

### C. Persist contact-form submissions

In `src/app/contact/actions.ts`, after the validation block (and ideally
before or alongside the Resend send, in a try/catch so an email failure
doesn't lose the message), insert a row:

```ts
import { getSql } from "@/lib/db";

await getSql()`
  INSERT INTO messages (id, name, email, phone, subject, body)
  VALUES (
    ${"m_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12)},
    ${name},
    ${email},
    ${phone || null},
    ${null /* form has no subject field today; leave null */},
    ${message}
  )
`;
```

(`getSql` isn't currently exported from `db.ts` — export it, or add a
small `createMessage()` helper there to keep imports tidy.)

### D. Verify `isAdmin()` cookie still flows

The header login uses the same `setAdminCookie()` as the legacy login
page — should "just work," but worth a smoke test in production.

---

## Notes on auth scope

`headerLoginAction` calls `redirect("/admin")` on success. Because that
redirect happens inside a server action invoked from a client component
form, Next will surface it as a navigation. If you'd rather keep the
user where they were after login, swap the redirect for returning
`{ ok: true }` and have the client read the action state to decide.

## Notes on the "Operations Sheet" card

That's a placeholder for a future Google Sheet embed (separate feature
Natalie wants to build later, after she finalizes the sheet). Leave the
"Coming Soon" badge until that lands.
