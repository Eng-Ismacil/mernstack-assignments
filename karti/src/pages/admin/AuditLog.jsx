import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { errText, useReconnect } from '../../lib/net'
import { useI18n } from '../../lib/i18n'
import { fmtDateTime } from '../../lib/format'
import AppShell from '../../components/AppShell'
import { IconChevron, IconSearch } from '../../components/Icons'

const PAGE = 50
const TABLES = ['transactions', 'savings_goals', 'savings_entries', 'users']
const ACTIONS = ['INSERT', 'UPDATE', 'DELETE', 'USER_CREATE', 'USER_UPDATE', 'USER_SOFT_DELETE', 'USER_RESTORE', 'USER_PURGE']
const HIDE = new Set(['id', 'user_id', 'created_at'])
const tone = (a) => (a === 'INSERT' || a === 'USER_CREATE' || a === 'USER_RESTORE' ? 'income' : a.includes('DELETE') || a === 'USER_PURGE' ? 'bad' : 'expense')
const show = (v) => (v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v))

// Changed fields for UPDATE; all fields for INSERT / DELETE.
function changes(log) {
  const o = log.old_data || {}, n = log.new_data || {}
  const keys = [...new Set([...Object.keys(o), ...Object.keys(n)])].filter((k) => !HIDE.has(k))
  if (log.action.endsWith('UPDATE')) return keys.filter((k) => JSON.stringify(o[k]) !== JSON.stringify(n[k])).map((k) => [k, o[k], n[k]])
  return keys.map((k) => [k, o[k], n[k]])
}

export default function AuditLog() {
  const { t, lang } = useI18n()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [more, setMore] = useState(false)
  const [error, setError] = useState('')
  const [table, setTable] = useState('')
  const [action, setAction] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const fetchPage = useCallback(async (from) => {
    let query = supabase.from('audit_logs').select('*').order('id', { ascending: false }).range(from, from + PAGE - 1)
    if (table) query = query.eq('table_name', table)
    if (action) query = query.eq('action', action)
    const { data, error } = await query
    if (error) { setError(errText(error, t)); return [] }
    setError(''); setMore(data.length === PAGE)
    return data
  }, [table, action])

  const reload = useCallback(async () => { setLoading(true); setRows(await fetchPage(0)); setLoading(false) }, [fetchPage])
  useEffect(() => { reload() }, [reload])
  useReconnect(reload)
  async function loadMore() { const next = await fetchPage(rows.length); setRows((r) => [...r, ...next]) }

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? rows.filter((r) => `${r.actor_email} ${r.target_email}`.toLowerCase().includes(s)) : rows
  }, [rows, q])

  return (
    <AppShell>
      <main className="main wide">
        <header className="top">
          <div className="top-text">
            <span className="chip"><i />{t('us.chip')}</span>
            <h1>{t('au.title')}</h1>
            <p>{t('au.sub')}</p>
          </div>
          <button className="btn ghost add-btn" onClick={reload}>{t('c.refresh')}</button>
        </header>
        {error && <div className="alert">{error}</div>}

        <section className="card" style={{ overflow: 'hidden' }}>
          <div className="toolbar">
            <div className="search"><IconSearch /><input className="input" placeholder={t('au.search')} value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select className="input filter" value={table} onChange={(e) => setTable(e.target.value)}>
              <option value="">{t('au.table')}: {t('c.all')}</option>
              {TABLES.map((x) => <option key={x} value={x}>{t('au.t.' + x)}</option>)}
            </select>
            <select className="input filter" value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="">{t('au.action')}: {t('c.all')}</option>
              {ACTIONS.map((x) => <option key={x} value={x}>{t('au.a.' + x)}</option>)}
            </select>
          </div>
          <div className="scroll">
            {loading ? <div className="empty">{t('c.loading')}</div> : shown.length === 0 ? <div className="empty">{t('au.empty')}</div> : (
              <table className="tbl">
                <thead><tr><th /><th>{t('au.when')}</th><th>{t('au.who')}</th><th>{t('au.action')}</th><th>{t('au.table')}</th><th>{t('au.target')}</th></tr></thead>
                <tbody>{shown.map((r) => {
                  const isOpen = open === r.id
                  return (
                    <Fragment key={r.id}>
                      <tr className="clickable" onClick={() => setOpen(isOpen ? null : r.id)}>
                        <td className="chev"><IconChevron style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }} /></td>
                        <td className="nowrap">{fmtDateTime(r.created_at, lang)}</td>
                        <td>{r.actor_email || <span className="muted">{t('au.system')}</span>}</td>
                        <td><span className={'pill ' + tone(r.action)}>{t('au.a.' + r.action)}</span></td>
                        <td>{t('au.t.' + r.table_name)}</td>
                        <td>{r.target_email || '—'}</td>
                      </tr>
                      {isOpen && (
                        <tr className="detail"><td /><td colSpan={5}>
                          <table className="diff">
                            <thead><tr><th>{t('au.field')}</th><th>{t('au.before')}</th><th>{t('au.after')}</th></tr></thead>
                            <tbody>{changes(r).map(([k, a, b]) => <tr key={k}><td>{k}</td><td className="old">{show(a)}</td><td className="new">{show(b)}</td></tr>)}</tbody>
                          </table>
                        </td></tr>
                      )}
                    </Fragment>)
                })}</tbody>
              </table>
            )}
          </div>
          <div className="foot">
            {t('tx.showing')} <b>{shown.length}</b> {t('ad.count')}
            {more && <button className="btn ghost sm" style={{ marginLeft: 12 }} onClick={loadMore}>{t('c.loadmore')}</button>}
          </div>
        </section>
      </main>
    </AppShell>
  )
}
