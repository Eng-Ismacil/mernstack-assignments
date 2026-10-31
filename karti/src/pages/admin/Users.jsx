import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { errText, useReconnect } from '../../lib/net'
import { adminCall } from '../../lib/admin'
import { useAuth } from '../../lib/auth'
import { useI18n } from '../../lib/i18n'
import { fmtDate } from '../../lib/format'
import AppShell from '../../components/AppShell'
import Modal from '../../components/Modal'
import { ConfirmModal } from '../../components/SavingsModals'
import { IconBin, IconDatabase, IconEdit, IconPlus, IconSearch, IconUsers } from '../../components/Icons'

function UserModal({ user, onClose, onSaved }) {
  const { t, authError } = useI18n()
  const [f, setF] = useState({ full_name: user?.full_name ?? '', email: user?.email ?? '', role: user?.role ?? 'user', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (user) {
        const body = { action: 'update', user_id: user.id, full_name: f.full_name, email: f.email, role: f.role }
        if (f.password) body.password = f.password
        await adminCall(body)
      } else await adminCall({ action: 'create', ...f })
      await onSaved(); onClose()
    } catch (err) { setError(authError(err)); setBusy(false) }
  }
  return (
    <Modal title={user ? t('us.edit.title') : t('us.create.title')} subtitle={t('us.form.sub')} onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="alert">{error}</div>}
        <label className="field"><span>{t('reg.name')}</span>
          <input className="input" required autoFocus value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></label>
        <label className="field"><span>{t('f.email')}</span>
          <input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <div className="grid2">
          <label className="field"><span>{t('c.role')}</span>
            <select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
              <option value="user">{t('us.role.user')}</option><option value="admin">{t('us.role.admin')}</option>
            </select></label>
          <label className="field"><span>{user ? t('us.pw.new') : t('f.password')}</span>
            <input className="input" type="password" minLength={6} required={!user} autoComplete="new-password"
              placeholder={user ? t('us.pw.keep') : t('reg.pw.ph')} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>{t('form.cancel')}</button>
          <button className="btn" disabled={busy}>{busy ? t('c.saving') : t('c.save')}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Users() {
  const { user: me } = useAuth()
  const { t, lang, authError } = useI18n()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)   // {} | { user }
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').is('deleted_at', null).order('created_at')
    if (error) setError(errText(error, t)); else setRows(data)
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])
  useReconnect(load)

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? rows.filter((r) => `${r.full_name} ${r.email}`.toLowerCase().includes(s)) : rows
  }, [rows, q])

  async function softDelete() {
    setBusy(true); setError('')
    try { await adminCall({ action: 'soft_delete', user_id: toDelete.id }); await load() } catch (e) { setError(authError(e)) }
    setBusy(false); setToDelete(null)
  }

  return (
    <AppShell>
      <main className="main">
        <header className="top">
          <div className="top-text">
            <span className="chip"><i />{t('us.chip')}</span>
            <h1>{t('us.title')}</h1>
            <p>{t('us.sub')}</p>
          </div>
          <button className="btn add-btn" onClick={() => setModal({})}><IconPlus width={18} height={18} />{t('us.add')}</button>
        </header>
        {error && <div className="alert">{error}</div>}

        <section className="cards two">
          <div className="card stat"><div className="row"><div><label>{t('us.total')}</label><h2>{rows.length}</h2></div><div className="ico"><IconUsers /></div></div></div>
          <div className="card stat dark"><div className="row"><div><label>{t('us.admins')}</label><h2>{rows.filter((r) => r.role === 'admin').length}</h2></div><div className="ico"><IconUsers /></div></div></div>
        </section>

        <section className="card" style={{ overflow: 'hidden' }}>
          <div className="toolbar">
            <div className="search"><IconSearch /><input className="input" placeholder={t('us.search')} value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          <div className="scroll">
            {loading ? <div className="empty">{t('c.loading')}</div> : shown.length === 0 ? <div className="empty">{t('us.empty')}</div> : (
              <table className="tbl">
                <thead><tr><th>{t('c.name')}</th><th>{t('c.email')}</th><th>{t('c.role')}</th><th>{t('c.created')}</th><th /></tr></thead>
                <tbody>{shown.map((r) => (
                  <tr key={r.id}>
                    <td><div className="who"><span className="avatar">{(r.full_name || r.email || '?')[0].toUpperCase()}</span>{r.full_name || '—'}{r.id === me.id && <span className="pill income">{t('c.you')}</span>}</div></td>
                    <td>{r.email}</td>
                    <td><span className={'pill ' + (r.role === 'admin' ? 'income' : 'expense')}>{r.role === 'admin' ? t('us.role.admin') : t('us.role.user')}</span></td>
                    <td>{fmtDate(r.created_at, lang)}</td>
                    <td className="r nowrap">
                      <Link className="iconbtn" title={t('us.data')} to={`/admin/data?user=${r.id}`}><IconDatabase /></Link>
                      <button className="iconbtn" title={t('tx.edit')} onClick={() => setModal({ user: r })}><IconEdit /></button>
                      <button className="iconbtn danger" title={t('tx.delete')} disabled={r.id === me.id} onClick={() => setToDelete(r)}><IconBin /></button>
                    </td>
                  </tr>))}</tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {modal && <UserModal user={modal.user} onClose={() => setModal(null)} onSaved={load} />}
      {toDelete && <ConfirmModal busy={busy} onClose={() => setToDelete(null)} onConfirm={softDelete}
        title={t('us.del.title')} subtitle={`${toDelete.full_name || ''} · ${toDelete.email}`} text={t('us.del.text')}
        confirmLabel={t('us.del.confirm')} busyLabel={t('del.busy')} />}
    </AppShell>
  )
}
