import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import AppShell from '../components/AppShell'
import Modal from '../components/Modal'
import TransactionModal from '../components/TransactionModal'
import { EntryModal } from '../components/SavingsModals'
import { errText, useReconnect } from '../lib/net'
import { IconDoc, IconEdit, IconMinus, IconPiggy, IconPlus, IconTrash, IconWallet } from '../components/Icons'

const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function Dashboard() {
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const [rows, setRows] = useState([])           // income / expense transactions
  const [goals, setGoals] = useState([])         // savings goals (id, name)
  const [entries, setEntries] = useState([])     // savings deposits / withdrawals
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)    // true once data arrived at least once
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)       // null | { tx?: row }
  const [entryModal, setEntryModal] = useState(null) // { goal, entry } when editing a saving row
  const [toDelete, setToDelete] = useState(null) // row | null
  const [deleting, setDeleting] = useState(false)
  const name = user?.user_metadata?.full_name || user?.email

  const load = useCallback(async () => {
    try {
      const [tx, g, e] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id)
          .order('occurred_on', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('savings_goals').select('id,name').eq('user_id', user.id),
        supabase.from('savings_entries').select('*').eq('user_id', user.id),
      ])
      const err = tx.error || g.error || e.error
      if (err) { setError(err); return }          // keep whatever is already on screen
      setError(null); setRows(tx.data); setGoals(g.data); setEntries(e.data); setLoaded(true)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user.id])
  useEffect(() => { load() }, [load])
  useReconnect(load) // refresh automatically when the internet comes back

  const goalName = useMemo(() => Object.fromEntries(goals.map((g) => [g.id, g.name])), [goals])

  // One list: income/expense transactions + savings deposits ("saving") and withdrawals ("saving_out").
  const items = useMemo(() => [
    ...rows.map((r) => ({ kind: 'tx', id: r.id, type: r.type, amount: Number(r.amount), description: r.description, date: r.occurred_on, created: r.created_at, raw: r })),
    ...entries.map((e) => ({
      kind: 'entry', id: e.id, type: e.type === 'deposit' ? 'saving' : 'saving_out', amount: Number(e.amount),
      description: [goalName[e.goal_id], e.note].filter(Boolean).join(' · ') || '—', date: e.occurred_on, created: e.created_at, raw: e,
    })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.created).localeCompare(String(a.created))), [rows, entries, goalName])

  const saved = useMemo(() => entries.reduce((a, r) => a + (r.type === 'deposit' ? 1 : -1) * Number(r.amount), 0), [entries])

  const { income, expense } = useMemo(() => rows.reduce((a, r) => {
    a[r.type] += Number(r.amount); return a
  }, { income: 0, expense: 0 }), [rows])

  async function confirmDelete() {
    setDeleting(true)
    try {
      const isEntry = toDelete.kind === 'entry'
      const { error } = await supabase.from(isEntry ? 'savings_entries' : 'transactions').delete().eq('id', toDelete.id)
      if (error) setError(error)
      else if (isEntry) setEntries((r) => r.filter((x) => x.id !== toDelete.id))
      else setRows((r) => r.filter((x) => x.id !== toDelete.id))
    } catch (err) { setError(err) }
    setDeleting(false); setToDelete(null)
  }

  function onEdit(it) {
    if (it.kind === 'tx') return setModal({ tx: it.raw })
    const goal = goals.find((g) => g.id === it.raw.goal_id)
    if (goal) setEntryModal({ goal, entry: it.raw })
  }
  const typeLabel = (type) => ({ income: t('form.income'), expense: t('form.expense'), saving: t('tx.saving'), saving_out: t('tx.saving.out') }[type])
  const sign = (type) => (type === 'income' || type === 'saving_out' ? '+' : '−')

  const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <AppShell>
      <main className="main">
        <header className="top">
          <div className="top-text">
            <span className="chip"><i />{t('dash.chip')}</span>
            <h1>{t('dash.title')}</h1>
            <p>{t('dash.hello')}, <b>{name}</b>. {t('dash.sub')}</p>
          </div>
          <button className="btn add-btn" onClick={() => setModal({})}><IconPlus width={18} height={18} />{t('add.btn')}</button>
        </header>

        {error && <div className="alert">{errText(error, t)}</div>}

        <section className="cards">
          <div className="card stat"><div className="row"><div><label>{t('stat.income')}</label><h2>{money(income)}</h2></div><div className="ico"><IconPlus /></div></div><p>{t('stat.income.sub')}</p></div>
          <div className="card stat"><div className="row"><div><label>{t('stat.expense')}</label><h2>{money(expense)}</h2></div><div className="ico"><IconMinus /></div></div><p>{t('stat.expense.sub')}</p></div>
          <div className="card stat dark"><div className="row"><div><label>{t('stat.balance')}</label><h2>{money(income - expense - saved)}</h2></div><div className="ico"><IconWallet /></div></div><p>{t('stat.balance.sub')}</p></div>
          <Link to="/savings" className="card stat savings-card"><div className="row"><div><label>{t('nav.savings')}</label><h2>{money(saved)}</h2></div><div className="ico"><IconPiggy /></div></div><p>{goals.length} {t('sv.chip').toLowerCase()}</p></Link>
        </section>

        <section className="card" style={{ overflow: 'hidden' }}>
          <div className="table-head">
            <div><h2>{t('tx.title')}</h2><p>{t('tx.sub')}</p></div>
            <span className="chip hide-sm">{t('tx.all')}</span>
          </div>
          {loading ? <div className="empty">{t('tx.loading')}</div> : !loaded ? (
            <div className="empty">
              <h3>{t('net.title')}</h3><p>{errText(error, t)}</p>
              <button className="btn" style={{ marginTop: 18 }} onClick={load}>{t('net.retry')}</button>
            </div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="ico"><IconDoc /></div><h3>{t('tx.empty.title')}</h3><p>{t('tx.empty.text')}</p>
              <button className="btn" style={{ marginTop: 18 }} onClick={() => setModal({})}><IconPlus width={18} height={18} />{t('add.btn')}</button>
            </div>
          ) : (
            <table className="tx">
              <thead><tr><th>{t('tx.desc')}</th><th>{t('tx.type')}</th><th>{t('tx.date')}</th><th className="r">{t('tx.amount')}</th><th /></tr></thead>
              <tbody>{items.map((r) => (
                <tr key={r.kind + r.id}>
                  <td className="c-desc">{r.description}</td>
                  <td className="c-type"><span className={`pill ${r.type === 'saving_out' ? 'saving' : r.type}`}>{typeLabel(r.type)}</span></td>
                  <td className="c-date">{fmtDate(r.occurred_on)}</td>
                  <td className={`c-amt r amt ${r.type === 'saving_out' ? 'saving' : r.type}`}>{sign(r.type)}{money(r.amount)}</td>
                  <td className="c-act r">
                    <button className="iconbtn" aria-label={t('tx.edit')} title={t('tx.edit')} onClick={() => onEdit(r)}><IconEdit /></button>
                    <button className="iconbtn danger" aria-label={t('tx.delete')} title={t('tx.delete')} onClick={() => setToDelete(r)}><IconTrash /></button>
                  </td>
                </tr>))}</tbody>
            </table>
          )}
          <div className="foot">{t('tx.showing')} <b>{items.length}</b> {t('tx.count')}</div>
        </section>
      </main>

      {modal && <TransactionModal tx={modal.tx} goals={goals} onClose={() => setModal(null)} onSaved={load} />}

      {entryModal && <EntryModal goal={entryModal.goal} entry={entryModal.entry} onClose={() => setEntryModal(null)} onSaved={load} />}

      {toDelete && (
        <Modal small title={t('del.title')} subtitle={`${toDelete.description} · ${money(toDelete.amount)}`} onClose={() => !deleting && setToDelete(null)}>
          <p className="del-text">{t('del.text')}</p>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setToDelete(null)} disabled={deleting}>{t('form.cancel')}</button>
            <button className="btn danger-btn" onClick={confirmDelete} disabled={deleting}>{deleting ? t('del.busy') : t('del.confirm')}</button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
