import { supabase } from './supabase'

// Calls the `admin-users` edge function (service-role operations: ban/restore/purge/create/update).
// Throws the server's { code } error so callers can translate it with authError().
export async function adminCall(body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(body),
  })
  const out = await res.json().catch(() => ({}))
  if (!res.ok) throw out.error || { code: 'unexpected' }
  return out
}
