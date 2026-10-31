import { useI18n } from '../lib/i18n'

export default function LangSwitch({ dark = false }) {
  const { lang, setLang } = useI18n()
  return (
    <div className={'lang' + (dark ? ' dark' : '')} role="group" aria-label="Language">
      {[['so', 'SO'], ['en', 'EN']].map(([k, label]) => (
        <button key={k} type="button" className={lang === k ? 'on' : ''} onClick={() => setLang(k)} aria-pressed={lang === k}>{label}</button>
      ))}
    </div>
  )
}
