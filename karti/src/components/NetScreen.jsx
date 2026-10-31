import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import Logo from './Logo'

// Shown instead of a blank/forever "Karti…" screen when the app cannot reach the server.
export default function NetScreen() {
  const { t } = useI18n()
  const { retry, session } = useAuth()
  const [busy, setBusy] = useState(false)
  async function again() { setBusy(true); try { await retry() } finally { setBusy(false) } }
  return (
    <div className="netscreen">
      <Logo size={40} />
      <h2>{t('net.title')}</h2>
      <p>{t('net.text')}</p>
      <div className="netscreen-actions">
        <button className="btn" onClick={again} disabled={busy}>{busy ? t('net.retrying') : t('net.retry')}</button>
        {session && <button className="btn ghost" onClick={() => supabase.auth.signOut({ scope: 'local' })}>{t('nav.logout')}</button>}
      </div>
    </div>
  )
}
