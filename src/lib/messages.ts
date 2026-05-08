// Inbox data layer — backed by the Postgres `messages` table.
// Schema lives in src/lib/db.ts (see ensureSchema).
//
// All callers in /admin/inbox import the InboxMessage / MessageStatus
// types from here, so types stay stable even if the persistence
// strategy ever changes again.

import { ensureSchema, getSql, isDbConfigured } from "./db";

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

type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  status: string;
  created_at: string | Date;
};

function rowToMessage(row: MessageRow): InboxMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    body: row.body,
    status: row.status as MessageStatus,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

function genId(): string {
  return (
    "m_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  ).toLowerCase();
}

export async function listMessages(opts?: {
  includeArchived?: boolean;
}): Promise<InboxMessage[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const sql = getSql();
  const rows = opts?.includeArchived
    ? await sql<MessageRow[]>`
        SELECT * FROM messages ORDER BY created_at DESC
      `
    : await sql<MessageRow[]>`
        SELECT * FROM messages
        WHERE status <> 'archived'
        ORDER BY created_at DESC
      `;
  return rows.map(rowToMessage);
}

export async function getMessage(id: string): Promise<InboxMessage | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<MessageRow[]>`
    SELECT * FROM messages WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToMessage(rows[0]) : null;
}

export async function unreadCount(): Promise<number> {
  if (!isDbConfigured()) return 0;
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM messages WHERE status = 'new'
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function setMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  await sql`UPDATE messages SET status = ${status} WHERE id = ${id}`;
}

/** Persist a new contact-form submission. Used by /contact actions. */
export async function createMessage(input: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  body: string;
}): Promise<void> {
  // Graceful no-op when the DB isn't configured so the contact form
  // can still send the email even if persistence is unavailable.
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO messages (id, name, email, phone, subject, body)
    VALUES (
      ${genId()},
      ${input.name},
      ${input.email},
      ${input.phone ?? null},
      ${input.subject ?? null},
      ${input.body}
    )
  `;
}
