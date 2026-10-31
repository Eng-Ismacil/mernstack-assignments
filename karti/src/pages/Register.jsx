import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import AuthLayout from '../components/AuthLayout'

export default function Register() {
  const { t, authError } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (password.length < 6) return setError(t('err.pwshort'))
    setBusy(true); setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: email.trim(), password, full_name: name.trim() }),
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) setError(authError(out.error))
      else {
        // Account is created and confirmed server-side; sign in right away.
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) setError(authError(error))
      }
    } catch {
      setError(t('err.generic'))
    }
    setBusy(false)
  }

  return (
    <AuthLayout title={t('reg.title')} subtitle={t('reg.subtitle')}>
      <form onSubmit={submit}>
        {error && <div className="alert">{error}</div>}
        <label className="field"><span>{t('reg.name')}</span>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t('reg.name.ph')} /></label>
        <label className="field"><span>{t('f.email')}</span>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('f.email.ph')} /></label>
        <label className="field"><span>{t('f.password')}</span>
          <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('reg.pw.ph')} /></label>
        <button className="btn block" disabled={busy}>{busy ? t('reg.busy') : t('reg.submit')}</button>
      </form>
      <p className="alt">{t('reg.have')} <Link to="/login">{t('reg.login')}</Link></p>
    </AuthLayout>
  )
}
