// Inbox data layer.
//
// HANDOFF (Osvaldo): everything in this file is currently mocked so Natalie
// can preview the inbox UI. Replace the in-memory MOCK array + the four
// helper functions with Postgres-backed implementations using the existing
// `getSql()` from src/lib/db.ts. Suggested table:
//
//   CREATE TABLE messages (
//     id           TEXT PRIMARY KEY,
//     name         TEXT NOT NULL,
//     email        TEXT NOT NULL,
//     phone        TEXT,
//     subject      TEXT,            -- nullable; derive from message if blank
//     body         TEXT NOT NULL,
//     status       TEXT NOT NULL DEFAULT 'new',  -- new | read | replied | archived
//     created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
//   );
//
// Then update src/app/contact/actions.ts to also INSERT a row before/after
// the Resend send, so messages persist in the inbox even if email delivery
// fails.

export type MessageStatus = "new" | "read" | "replied" | "archived";

export type InboxMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  status: MessageStatus;
  /** ISO 8601 */
  createdAt: string;
};

const MOCK: InboxMessage[] = [
  {
    id: "m_001",
    name: "Marcus Hill",
    email: "marcus.hill@example.com",
    phone: "646-555-0119",
    subject: "Brickell unit availability — June 12-19",
    body: "Hi Natalie — my partner and I are coming to Miami for a wedding the weekend of June 14 and would love to extend the trip. Is the Brickell unit available June 12-19? We'd be 2 adults, no pets. Thanks!",
    status: "new",
    createdAt: "2026-04-30T18:42:00Z",
  },
  {
    id: "m_002",
    name: "Priya Shah",
    email: "priya@example.com",
    phone: null,
    subject: "Question about parking",
    body: "Hello — does the Coral Gables stay include parking? We'll have a rental car. Also wondering about late check-in (after 11pm) since our flight lands at 9.",
    status: "new",
    createdAt: "2026-04-29T13:05:00Z",
  },
  {
    id: "m_003",
    name: "James Okafor",
    email: "j.okafor@example.com",
    phone: "305-555-0173",
    subject: "Long-stay rate inquiry",
    body: "Hi! I'm relocating to Miami for a 3-month medical rotation. Do you offer monthly rates for any of the South Beach units? I'd be a single occupant, very quiet.",
    status: "read",
    createdAt: "2026-04-27T09:18:00Z",
  },
  {
    id: "m_004",
    name: "Lauren Bell",
    email: "lauren.bell@example.com",
    phone: null,
    subject: "Thank you!",
    body: "Just wanted to say thank you for an incredible stay last weekend at the Wynwood place — everything was spotless and your check-in instructions were so easy to follow. Will definitely book again!",
    status: "replied",
    createdAt: "2026-04-22T16:30:00Z",
  },
  {
    id: "m_005",
    name: "Robert Chen",
    email: "rchen@example.com",
    phone: "212-555-0144",
    subject: null,
    body: "Test inquiry through the contact form, please ignore.",
    status: "archived",
    createdAt: "2026-04-15T20:01:00Z",
  },
];

export async function listMessages(opts?: {
  includeArchived?: boolean;
}): Promise<InboxMessage[]> {
  // TODO(osvaldo): replace with `SELECT * FROM messages ORDER BY created_at DESC`
  // and filter status != 'archived' unless includeArchived is true.
  const rows = MOCK.slice().sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
  if (opts?.includeArchived) return rows;
  return rows.filter((m) => m.status !== "archived");
}

export async function getMessage(id: string): Promise<InboxMessage | null> {
  // TODO(osvaldo): SELECT * FROM messages WHERE id = $1
  return MOCK.find((m) => m.id === id) ?? null;
}

export async function unreadCount(): Promise<number> {
  // TODO(osvaldo): SELECT count(*) FROM messages WHERE status = 'new'
  return MOCK.filter((m) => m.status === "new").length;
}

export async function setMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<void> {
  // TODO(osvaldo): UPDATE messages SET status = $2 WHERE id = $1
  const m = MOCK.find((x) => x.id === id);
  if (m) m.status = status;
}
