# Karti Expense Manager
React (Vite) + Supabase (Auth, Postgres + RLS, Edge Functions).

    npm install
    npm run dev

## Features
- Dakhli / kharash (transactions) — add, edit, delete
- **Kaydka (Savings)** — goals, deposit / withdraw, history, progress bars
- **Admin** (`role = 'admin'` in `profiles`):
  - Users — create, edit (name, email, role, password), move to Recycle Bin
  - Recycle Bin — soft-deleted users: restore or delete forever
  - All Data — view / edit / delete every user's transactions & savings
  - Audit Log — who did what, when (before / after values)

## Supabase (already applied)
- Tables: `profiles` (role, email, deleted_at), `transactions`, `savings_goals`, `savings_entries`, `audit_logs`
- RLS: users see only their own rows, admins see all; audit log is admin-read-only
- Triggers write the audit log automatically; Edge Function `admin-users` handles ban/restore/purge/create/update
- Soft-deleted users are banned in Auth and blocked by RLS
- First admin: `ali123@gmail.com`. Make another admin from Users → Edit → Role.
