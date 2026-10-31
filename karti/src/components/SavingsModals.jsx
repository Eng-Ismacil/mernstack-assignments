import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { errText } from '../lib/net'
import Modal from './Modal'

const today = () => new Date().toISOString().slice(0, 10)

// goal present => edit. Owner is only set on insert (defaults to auth.uid()).
export function GoalModal({ goal, onClose, onSaved }) {
  const { t } = useI18n()
  const [f, setF] = useState({ name: goal?.name ?? '', target: goal ? String(goal.target_amount) : '', date: goal?.target_date ?? '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { name: f.name.trim(), target_amount: Number(f.target), target_date: f.date || null }
    const { error } = goal
      ? await supabase.from('savings_goals').update(payload).eq('id', goal.id)
      : await supabase.from('savings_goals').insert(payload)
    if (error) { setError(errText(error, t)); setSaving(false); return }
    await onSaved(); onClose()
  }
  return (
    <Modal title={goal ? t('sv.goal.edit') : t('sv.goal.title')} subtitle={t('sv.goal.sub')} onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="alert">{error}</div>}
        <label className="field"><span>{t('sv.goal.name')}</span>
          <input className="input" required autoFocus maxLength={100} placeholder={t('sv.goal.name.ph')} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <div className="grid2">
          <label className="field"><span>{t('sv.goal.target')}</span>
            <input className="input" type="number" inputMode="decimal" min="0.01" step="0.01" required placeholder="0.00" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} /></label>
          <label className="field"><span>{t('sv.goal.date')}</span>
            <input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>{t('form.cancel')}</button>
          <button className="btn" disabled={saving}>{saving ? t('c.saving') : t('c.save')}</button>
        </div>
      </form>
    </Modal>
  )
}

// entry present => edit; otherwise create for `goal` with `type` ('deposit' | 'withdraw').
// `saved` = current balance of the goal, used to stop over-withdrawing.
export function EntryModal({ goal, entry, type = 'deposit', saved = 0, onClose, onSaved }) {
  const { t } = useI18n()
  const [f, setF] = useState({
    type: entry?.type ?? type, amount: entry ? String(entry.amount) : '',
    note: entry?.note ?? '', date: entry?.occurred_on ?? today(),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const title = entry ? t('sv.entry.edit') : f.type === 'deposit' ? t('sv.entry.deposit') : t('sv.entry.withdraw')

  async function save(e) {
    e.preventDefault(); setError('')
    const amount = Number(f.amount)
    if (!entry && f.type === 'withdraw' && amount > saved) return setError(t('sv.err.insufficient'))
    setSaving(true)
    const payload = { type: f.type, amount, note: f.note.trim() || null, occurred_on: f.date }
    const { error } = entry
      ? await supabase.from('savings_entries').update(payload).eq('id', entry.id)
      : await supabase.from('savings_entries').insert({ ...payload, goal_id: goal.id })
    if (error) { setError(errText(error, t)); setSaving(false); return }
    await onSaved(); onClose()
  }
  return (
    <Modal title={title} subtitle={goal?.name} onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="alert">{error}</div>}
        {entry && (
          <div className="seg">
            <label><input type="radio" checked={f.type === 'deposit'} onChange={() => setF({ ...f, type: 'deposit' })} /><div><b>{t('sv.deposit.l')}</b></div></label>
            <label><input type="radio" checked={f.type === 'withdraw'} onChange={() => setF({ ...f, type: 'withdraw' })} /><div><b>{t('sv.withdraw.l')}</b></div></label>
          </div>
        )}
        <div className="grid2">
          <label className="field"><span>{t('form.amount')}</span>
            <input className="input" type="number" inputMode="decimal" min="0.01" step="0.01" required autoFocus placeholder="0.00" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></label>
          <label className="field"><span>{t('form.date')}</span>
            <input className="input" type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        </div>
        <label className="field"><span>{t('sv.entry.note')}</span>
          <input className="input" maxLength={200} placeholder={t('sv.entry.note.ph')} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></label>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>{t('form.cancel')}</button>
          <button className="btn" disabled={saving}>{saving ? t('c.saving') : t('c.save')}</button>
        </div>
      </form>
    </Modal>
  )
}

// Shared confirm dialog for destructive actions.
export function ConfirmModal({ title, subtitle, text, confirmLabel, busyLabel, busy, onConfirm, onClose }) {
  const { t } = useI18n()
  return (
    <Modal small title={title} subtitle={subtitle} onClose={() => !busy && onClose()}>
      <p className="del-text">{text}</p>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose} disabled={busy}>{t('form.cancel')}</button>
        <button className="btn danger-btn" onClick={onConfirm} disabled={busy}>{busy ? busyLabel : confirmLabel}</button>
      </div>
    </Modal>
  )
}
