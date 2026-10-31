import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
  const { t, authError } = useI18n()
  const { disabled } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError(authError(error))
    setBusy(false)
  }

  return (
    <AuthLayout title={t('login.title')} subtitle={t('login.subtitle')}>
      <form onSubmit={submit}>
        {(error || disabled) && <div className="alert">{error || t('login.disabled')}</div>}
        <label className="field"><span>{t('f.email')}</span>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('f.email.ph')} /></label>
        <label className="field"><span>{t('f.password')}</span>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
        <button className="btn block" disabled={busy}>{busy ? t('login.busy') : t('login.submit')}</button>
      </form>
      <p className="alt">{t('login.noaccount')} <Link to="/register">{t('login.register')}</Link></p>
    </AuthLayout>
  )
}
