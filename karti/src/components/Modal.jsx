import { useEffect } from 'react'
import { IconClose } from './Icons'
import { useI18n } from '../lib/i18n'

export default function Modal({ title, subtitle, onClose, children, small = false }) {
  const { t } = useI18n()
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (small ? ' small' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button type="button" className="iconbtn" onClick={onClose} aria-label={t('form.close')}><IconClose /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
