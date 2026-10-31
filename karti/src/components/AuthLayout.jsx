import Logo from './Logo'
import LangSwitch from './LangSwitch'
import { useI18n } from '../lib/i18n'

export default function AuthLayout({ title, subtitle, children }) {
  const { t } = useI18n()
  return (
    <div className="auth">
      <aside className="auth-art">
        <div className="art-grid" />
        <Logo size={40} dark />
        <div style={{ position: 'relative' }}>
          <h2>{t('auth.art.title1')} <em>{t('auth.art.title2')}</em>.</h2>
          <p>{t('auth.art.text')}</p>
        </div>
        <div className="art-card">
          <small>{t('auth.art.balance')}</small>
          <b>$2,480.00</b>
          <div className="bars">{[30, 52, 40, 66, 48, 80, 100].map((h, i) => <i key={i} style={{ height: h + '%' }} />)}</div>
        </div>
      </aside>
      <main className="auth-form">
        <div className="auth-box">
          <div className="auth-top"><Logo size={34} /><LangSwitch /></div>
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  )
}
