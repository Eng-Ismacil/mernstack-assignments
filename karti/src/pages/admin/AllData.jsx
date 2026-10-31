import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { errText, useReconnect } from '../../lib/net'
import { useI18n } from '../../lib/i18n'
import { fmtDate, money } from '../../lib/format'
import AppShell from '../../components/AppShell'
import TransactionModal from '../../components/TransactionModal'
import { ConfirmModal, EntryModal, GoalModal } from '../../components/SavingsModals'
import { IconEdit, IconTrash } from '../../components/Icons'

const TABS = { tx: 'transactions', goals: 'savings_goals', entries: 'savings_entries' }
const LIMIT = 500

export default function AllData() {
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const userFilter = params.get('user') || ''
  const [tab, setTab] = useState('tx')
  const [profiles, setProfiles] = useState({})
  const [rows, setRows] = useState([])
  const [goalNames, setGoalNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('id,full_name,email,deleted_at').order('email').then(({ data }) => setProfiles(Object.fromEntries((data || []).map((p) => [p.id, p]))))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const table = TABS[tab]
    let q = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(LIMIT)
    if (userFilter) q = q.eq('user_id', userFilter)
    const { data, error } = await q
    if (error) setError(errText(error, t)); else { setError(''); setRows(data) }
    if (tab === 'entries') {
      let g = supabase.from('savings_goals').select('id,name')
      if (userFilter) g = g.eq('user_id', userFilter)
      const r = await g
      setGoalNames(Object.fromEntries((r.data || []).map((x) => [x.id, x.name])))
    }
    setLoading(false)
  }, [tab, userFilter])
  useEffect(() => { load() }, [load])
  useReconnect(load)

  const owner = (id) => {
    const p = profiles[id]
    if (!p) return <span className="muted">{t('c.removed')}</span>
    return <div className="who"><span className="avatar">{(p.full_name || p.email || '?')[0].toUpperCase()}</span><div><div>{p.full_name || '—'}</div><small className="muted">{p.email}</small></div>{p.deleted_at && <span className="pill expense">{t('c.deleted')}</span>}</div>
  }
  const users = useMemo(() => Object.values(profiles), [profiles])

  async function doDelete() {
    setBusy(true)
    const { error } = await supabase.from(TABS[tab]).delete().eq('id', del.id)
    if (error) setError(errText(error, t))
    await load(); setBusy(false); setDel(null)
  }
  const actions = (r) => (
    <td className="r nowrap">
      <button className="iconbtn" title={t('tx.edit')} onClick={() => setEdit(r)}><IconEdit /></button>
      <button className="iconbtn danger" title={t('tx.delete')} onClick={() => setDel(r)}><IconTrash /></button>
    </td>
  )

  const head = {
    tx: [t('c.owner'), t('tx.desc'), t('tx.type'), t('tx.date'), t('tx.amount')],
    goals: [t('c.owner'), t('sv.goal.name'), t('ad.target'), t('sv.goal.date'), t('c.created')],
    entries: [t('c.owner'), t('ad.goal'), t('sv.type'), t('sv.date'), t('tx.amount')],
  }[tab]

  return (
    <AppShell>
      <main className="main wide">
        <header className="top">
          <div className="top-text">
            <span className="chip"><i />{t('us.chip')}</span>
            <h1>{t('ad.title')}</h1>
            <p>{t('ad.sub')}</p>
          </div>
        </header>
        {error && <div className="alert">{error}</div>}

        <section className="card" style={{ overflow: 'hidden' }}>
          <div className="toolbar">
            <div className="tabs">
              {Object.keys(TABS).map((k) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t(`ad.tab.${k}`)}</button>)}
            </div>
            <select className="input filter" value={userFilter} onChange={(e) => setParams(e.target.value ? { user: e.target.value } : {})}>
              <option value="">{t('ad.all')}</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}{u.deleted_at ? ` (${t('c.deleted')})` : ''}</option>)}
            </select>
          </div>
          <div className="scroll">
            {loading ? <div className="empty">{t('c.loading')}</div> : rows.length === 0 ? <div className="empty">{t('us.empty')}</div> : (
              <table className="tbl">
                <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}<th /></tr></thead>
                <tbody>{rows.map((r) => (
                  <tr key={r.id}>
                    <td>{owner(r.user_id)}</td>
                    {tab === 'tx' && <>
                      <td>{r.description}</td>
                      <td><span className={`pill ${r.type}`}>{r.type === 'income' ? t('form.income') : t('form.expense')}</span></td>
                      <td>{fmtDate(r.occurred_on, lang)}</td>
                      <td className={`amt ${r.type}`}>{r.type === 'income' ? '+' : '−'}{money(r.amount)}</td></>}
                    {tab === 'goals' && <>
                      <td>{r.name}</td><td>{money(r.target_amount)}</td>
                      <td>{r.target_date ? fmtDate(r.target_date, lang) : '—'}</td><td>{fmtDate(r.created_at, lang)}</td></>}
                    {tab === 'entries' && <>
                      <td>{goalNames[r.goal_id] || '—'}</td>
                      <td><span className={'pill ' + (r.type === 'deposit' ? 'income' : 'expense')}>{r.type === 'deposit' ? t('sv.deposit.l') : t('sv.withdraw.l')}</span></td>
                      <td>{fmtDate(r.occurred_on, lang)}</td>
                      <td className={'amt ' + (r.type === 'deposit' ? 'income' : '')}>{r.type === 'deposit' ? '+' : '−'}{money(r.amount)}</td></>}
                    {actions(r)}
                  </tr>))}</tbody>
              </table>
            )}
          </div>
          <div className="foot">{t('tx.showing')} <b>{rows.length}</b> {t('ad.count')}{rows.length === LIMIT ? ` (max ${LIMIT})` : ''}</div>
        </section>
      </main>

      {edit && tab === 'tx' && <TransactionModal tx={edit} onClose={() => setEdit(null)} onSaved={load} />}
      {edit && tab === 'goals' && <GoalModal goal={edit} onClose={() => setEdit(null)} onSaved={load} />}
      {edit && tab === 'entries' && <EntryModal entry={edit} goal={{ name: goalNames[edit.goal_id] }} onClose={() => setEdit(null)} onSaved={load} />}
      {del && <ConfirmModal busy={busy} onClose={() => setDel(null)} onConfirm={doDelete}
        title={t('del.title')} subtitle={del.description || del.name || money(del.amount)} text={tab === 'goals' ? t('sv.del.goal.text') : t('del.text')}
        confirmLabel={t('del.confirm')} busyLabel={t('del.busy')} />}
    </AppShell>
  )
}
