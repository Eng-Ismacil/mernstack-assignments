import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { errText, useReconnect } from '../../lib/net'
import { adminCall } from '../../lib/admin'
import { useI18n } from '../../lib/i18n'
import { fmtDateTime } from '../../lib/format'
import AppShell from '../../components/AppShell'
import { ConfirmModal } from '../../components/SavingsModals'
import { IconBin, IconRestore, IconTrash } from '../../components/Icons'

export default function RecycleBin() {
  const { t, lang, authError } = useI18n()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purge, setPurge] = useState(null)
  const [busy, setBusy] = useState(false)
  const [workingId, setWorkingId] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
    if (error) setError(errText(error, t)); else setRows(data)
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])
  useReconnect(load)

  async function run(action, id) {
    setError('')
    try { await adminCall({ action, user_id: id }); await load() } catch (e) { setError(authError(e)) }
  }
  async function restore(r) { setWorkingId(r.id); await run('restore', r.id); setWorkingId(null) }
  async function doPurge() { setBusy(true); await run('purge', purge.id); setBusy(false); setPurge(null) }

  return (
    <AppShell>
      <main className="main">
        <header className="top">
          <div className="top-text">
            <span className="chip"><i />{t('us.chip')}</span>
            <h1>{t('rb.title')}</h1>
            <p>{t('rb.sub')}</p>
          </div>
        </header>
        {error && <div className="alert">{error}</div>}

        <section className="card" style={{ overflow: 'hidden' }}>
          {loading ? <div className="empty">{t('c.loading')}</div> : rows.length === 0 ? (
            <div className="empty"><div className="ico"><IconBin /></div><h3>{t('rb.empty.title')}</h3><p>{t('rb.empty.text')}</p></div>
          ) : (
            <div className="scroll">
              <table className="tbl">
                <thead><tr><th>{t('c.name')}</th><th>{t('c.email')}</th><th>{t('rb.when')}</th><th /></tr></thead>
                <tbody>{rows.map((r) => (
                  <tr key={r.id}>
                    <td><div className="who"><span className="avatar muted">{(r.full_name || r.email || '?')[0].toUpperCase()}</span>{r.full_name || '—'}</div></td>
                    <td>{r.email}</td>
                    <td>{fmtDateTime(r.deleted_at, lang)}</td>
                    <td className="r nowrap">
                      <button className="btn ghost sm" disabled={workingId === r.id} onClick={() => restore(r)}><IconRestore width={16} height={16} />{t('rb.restore')}</button>
                      <button className="btn danger-btn sm" onClick={() => setPurge(r)}><IconTrash width={16} height={16} />{t('rb.purge')}</button>
                    </td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      {purge && <ConfirmModal busy={busy} onClose={() => setPurge(null)} onConfirm={doPurge}
        title={t('rb.purge.title')} subtitle={purge.email} text={t('rb.purge.text')}
        confirmLabel={t('rb.purge.confirm')} busyLabel={t('del.busy')} />}
    </AppShell>
  )
}
