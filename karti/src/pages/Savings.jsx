import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import { fmtDate, money } from '../lib/format'
import { errText, useReconnect } from '../lib/net'
import AppShell from '../components/AppShell'
import { ConfirmModal, EntryModal, GoalModal } from '../components/SavingsModals'
import { IconEdit, IconMinus, IconPiggy, IconPlus, IconTrash, IconWallet } from '../components/Icons'

export default function Savings() {
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const [goals, setGoals] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [goalModal, setGoalModal] = useState(null)   // {} | { goal }
  const [entryModal, setEntryModal] = useState(null) // { goal, type } | { goal, entry }
  const [confirm, setConfirm] = useState(null)       // { kind:'goal'|'entry', row }
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(null)

  const load = useCallback(async () => {
    try {
      const [g, e] = await Promise.all([
        supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('savings_entries').select('*').eq('user_id', user.id).order('occurred_on', { ascending: false }).order('created_at', { ascending: false }),
      ])
      if (g.error || e.error) setError(g.error || e.error)   // keep what is already on screen
      else { setError(null); setGoals(g.data); setEntries(e.data) }
    } catch (err) { setError(err) }
    setLoading(false)
  }, [user.id])
  useEffect(() => { load() }, [load])
  useReconnect(load)

  const savedBy = useMemo(() => entries.reduce((m, e) => {
    m[e.goal_id] = (m[e.goal_id] || 0) + (e.type === 'deposit' ? 1 : -1) * Number(e.amount); return m
  }, {}), [entries])
  const totalSaved = goals.reduce((a, g) => a + (savedBy[g.id] || 0), 0)
  const totalTarget = goals.reduce((a, g) => a + Number(g.target_amount), 0)
  const pct = totalTarget ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0

  async function doDelete() {
    setBusy(true)
    const table = confirm.kind === 'goal' ? 'savings_goals' : 'savings_entries'
    let error
    try { ({ error } = await supabase.from(table).delete().eq('id', confirm.row.id)) } catch (err) { error = err }
    if (error) setError(error)
    await load(); setBusy(false); setConfirm(null)
  }

  return (
    <AppShell>
      <main className="main">
        <header className="top">
          <div className="top-text">
            <span className="chip"><i />{t('sv.chip')}</span>
            <h1>{t('sv.title')}</h1>
            <p>{t('sv.sub')}</p>
          </div>
          <button className="btn add-btn" onClick={() => setGoalModal({})}><IconPlus width={18} height={18} />{t('sv.add')}</button>
        </header>
        {error && <div className="alert">{errText(error, t)}</div>}

        <section className="cards">
          <div className="card stat"><div className="row"><div><label>{t('sv.total')}</label><h2>{money(totalSaved)}</h2></div><div className="ico"><IconPiggy /></div></div><p>{t('sv.total.sub')}</p></div>
          <div className="card stat"><div className="row"><div><label>{t('sv.target')}</label><h2>{money(totalTarget)}</h2></div><div className="ico"><IconWallet /></div></div><p>{t('sv.target.sub')}</p></div>
          <div className="card stat dark"><div className="row"><div><label>{t('sv.progress')}</label><h2>{pct}%</h2></div><div className="ico"><IconPlus /></div></div><p>{t('sv.progress.sub')}</p></div>
        </section>

        {loading ? <div className="card empty">{t('c.loading')}</div> : goals.length === 0 ? (
          <div className="card empty">
            <div className="ico"><IconPiggy /></div><h3>{t('sv.empty.title')}</h3><p>{t('sv.empty.text')}</p>
            <button className="btn" style={{ marginTop: 18 }} onClick={() => setGoalModal({})}><IconPlus width={18} height={18} />{t('sv.add')}</button>
          </div>
        ) : (
          <section className="goals">
            {goals.map((g) => {
              const saved = savedBy[g.id] || 0
              const p = Math.max(0, Math.min(100, (saved / Number(g.target_amount)) * 100))
              const done = saved >= Number(g.target_amount)
              const list = entries.filter((e) => e.goal_id === g.id)
              return (
                <article key={g.id} className="card goal">
                  <div className="goal-head">
                    <div><h3>{g.name}</h3>{g.target_date && <small>{fmtDate(g.target_date, lang)}</small>}</div>
                    <div>
                      <button className="iconbtn" title={t('tx.edit')} onClick={() => setGoalModal({ goal: g })}><IconEdit /></button>
                      <button className="iconbtn danger" title={t('tx.delete')} onClick={() => setConfirm({ kind: 'goal', row: g })}><IconTrash /></button>
                    </div>
                  </div>
                  <div className="goal-amt"><b>{money(saved)}</b> <span>{t('sv.of')} {money(Number(g.target_amount))}</span></div>
                  <div className={'bar' + (done ? ' done' : '')}><i style={{ width: p + '%' }} /></div>
                  <small className="goal-sub">{done ? t('sv.reached') : `${money(Number(g.target_amount) - saved)} ${t('sv.left')}`}</small>
                  <div className="goal-actions">
                    <button className="btn" onClick={() => setEntryModal({ goal: g, type: 'deposit' })}><IconPlus width={16} height={16} />{t('sv.deposit')}</button>
                    <button className="btn ghost" onClick={() => setEntryModal({ goal: g, type: 'withdraw' })} disabled={saved <= 0}><IconMinus width={16} height={16} />{t('sv.withdraw')}</button>
                    <button className="btn ghost" onClick={() => setOpen(open === g.id ? null : g.id)}>{t('sv.history')} ({list.length})</button>
                  </div>
                  {open === g.id && (
                    <ul className="hist">
                      {list.length === 0 ? <li className="muted">{t('sv.noentries')}</li> : list.map((e) => (
                        <li key={e.id}>
                          <div><b className={e.type === 'deposit' ? 'amt income' : 'amt'}>{e.type === 'deposit' ? '+' : '−'}{money(Number(e.amount))}</b>
                            <small>{fmtDate(e.occurred_on, lang)}{e.note ? ` · ${e.note}` : ''}</small></div>
                          <div>
                            <button className="iconbtn" onClick={() => setEntryModal({ goal: g, entry: e })}><IconEdit /></button>
                            <button className="iconbtn danger" onClick={() => setConfirm({ kind: 'entry', row: e })}><IconTrash /></button>
                          </div>
                        </li>))}
                    </ul>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </main>

      {goalModal && <GoalModal goal={goalModal.goal} onClose={() => setGoalModal(null)} onSaved={load} />}
      {entryModal && <EntryModal goal={entryModal.goal} entry={entryModal.entry} type={entryModal.type} saved={savedBy[entryModal.goal.id] || 0} onClose={() => setEntryModal(null)} onSaved={load} />}
      {confirm && (
        <ConfirmModal busy={busy} onClose={() => setConfirm(null)} onConfirm={doDelete}
          title={confirm.kind === 'goal' ? t('sv.del.goal') : t('sv.del.entry')}
          subtitle={confirm.kind === 'goal' ? confirm.row.name : money(Number(confirm.row.amount))}
          text={confirm.kind === 'goal' ? t('sv.del.goal.text') : t('del.text')}
          confirmLabel={t('del.confirm')} busyLabel={t('del.busy')} />
      )}
    </AppShell>
  )
}
