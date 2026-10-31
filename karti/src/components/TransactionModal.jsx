import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { errText } from '../lib/net'
import Modal from './Modal'
import { IconPlus } from './Icons'

const today = () => new Date().toISOString().slice(0, 10)

// `tx` present => edit mode (income/expense only), otherwise add mode.
// In add mode the user can also choose "saving": the amount is put into a savings goal
// (a deposit in savings_entries) and is deducted from the balance on the dashboard.
export default function TransactionModal({ tx, goals = [], onClose, onSaved }) {
  const { t } = useI18n()
  const [form, setForm] = useState({
    amount: tx ? String(tx.amount) : '',
    type: tx?.type ?? 'expense',
    description: tx?.description ?? '',
    date: tx?.occurred_on ?? today(),
    goalId: goals[0]?.id ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isSaving = form.type === 'saving'
  const noGoals = isSaving && goals.length === 0

  async function save(e) {
    e.preventDefault()
    if (noGoals) return
    setSaving(true); setError('')
    try {
      let res
      if (isSaving) {
        res = await supabase.from('savings_entries').insert({
          goal_id: form.goalId, type: 'deposit', amount: Number(form.amount),
          note: form.description.trim() || null, occurred_on: form.date,
        })
      } else {
        const payload = { type: form.type, amount: Number(form.amount), description: form.description.trim(), occurred_on: form.date }
        res = tx
          ? await supabase.from('transactions').update(payload).eq('id', tx.id)
          : await supabase.from('transactions').insert(payload)
      }
      if (res.error) { setError(errText(res.error, t)); setSaving(false); return }
      await onSaved()
      onClose()
    } catch (err) {
      setError(errText(err, t)); setSaving(false)
    }
  }

  return (
    <Modal title={tx ? t('form.edit.title') : t('form.title')} subtitle={t('form.sub')} onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="alert">{error}</div>}
        <div className="grid2">
          <label className="field"><span>{t('form.amount')}</span>
            <input className="input" type="number" inputMode="decimal" min="0.01" step="0.01" required autoFocus placeholder="0.00"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
          <label className="field"><span>{t('form.date')}</span>
            <input className="input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
        </div>
        <div className={'seg' + (tx ? '' : ' seg3')}>
          <label><input type="radio" name="type" checked={form.type === 'income'} onChange={() => setForm({ ...form, type: 'income' })} /><div><b>{t('form.income')}</b><small>{t('form.income.sub')}</small></div></label>
          <label><input type="radio" name="type" checked={form.type === 'expense'} onChange={() => setForm({ ...form, type: 'expense' })} /><div><b>{t('form.expense')}</b><small>{t('form.expense.sub')}</small></div></label>
          {!tx && <label><input type="radio" name="type" checked={isSaving} onChange={() => setForm({ ...form, type: 'saving' })} /><div><b>{t('form.saving.type')}</b><small>{t('form.saving.sub')}</small></div></label>}
        </div>

        {isSaving && (noGoals
          ? <div className="note-box">{t('form.goal.none')} <Link to="/savings">{t('form.goal.create')}</Link></div>
          : <label className="field"><span>{t('form.goal')}</span>
              <select className="input" required value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })}>
                <option value="" disabled>{t('form.goal.pick')}</option>
                {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select></label>)}

        <label className="field"><span>{isSaving ? t('sv.entry.note') : t('form.desc')}</span>
          <input className="input" required={!isSaving} maxLength={200} placeholder={isSaving ? t('sv.entry.note.ph') : t('form.desc.ph')}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>{t('form.cancel')}</button>
          <button className="btn" disabled={saving || noGoals}>{!tx && <IconPlus width={18} height={18} />}{saving ? t('form.saving') : tx ? t('form.update') : t('form.save')}</button>
        </div>
      </form>
    </Modal>
  )
}
