import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import Logo from './Logo'
import LangSwitch from './LangSwitch'
import { useOnline } from '../lib/net'
import { IconBin, IconDatabase, IconLogout, IconPiggy, IconShield, IconSidebar, IconSpark, IconUsers, IconWallet } from './Icons'

export default function AppShell({ children }) {
  const { t } = useI18n()
  const { isAdmin } = useAuth()
  const online = useOnline()
  const signOut = () => supabase.auth.signOut()
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('karti_side') === '1' } catch { return false } })
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem('karti_side', c ? '0' : '1') } catch {} return !c })

  const main = [{ to: '/', end: true, icon: IconWallet, label: t('nav.dashboard') }, { to: '/savings', icon: IconPiggy, label: t('nav.savings') }]
  const admin = [
    { to: '/admin/users', icon: IconUsers, label: t('nav.users') },
    { to: '/admin/data', icon: IconDatabase, label: t('nav.data') },
    { to: '/admin/audit', icon: IconShield, label: t('nav.audit') },
    { to: '/admin/recycle', icon: IconBin, label: t('nav.recycle') },
  ]
  const link = ({ to, end, icon: Icon, label }) => (
    <NavLink key={to} to={to} end={end} title={label} className={({ isActive }) => (isActive ? 'active' : '')}><Icon /><span>{label}</span></NavLink>
  )

  return (
    <div className={'shell' + (collapsed ? ' collapsed' : '')}>
      {!online && <div className="offbar" role="status">{t('net.banner')}</div>}
      <div className="mbar">
        <Logo size={30} />
        <div className="mbar-right">
          <LangSwitch />
          <button className="iconbtn" onClick={signOut} aria-label={t('nav.logout')}><IconLogout /></button>
        </div>
      </div>
      <nav className="mnav" aria-label={t('nav.menu')}>
        {[...main, ...(isAdmin ? admin : [])].map(link)}
      </nav>

      <aside className="side">
        <div className="side-top">
          <Logo size={34} />
          <button className="iconbtn toggle" onClick={toggle} title={collapsed ? 'Open' : 'Close'} aria-label="Toggle sidebar" aria-expanded={!collapsed}><IconSidebar /></button>
        </div>
        <div className="side-lang"><LangSwitch /></div>
        <nav className="nav">
          {main.map(link)}
          {isAdmin && <><div className="nav-label">{t('nav.admin')}</div>{admin.map(link)}</>}
          <button onClick={signOut} title={t('nav.logout')}><IconLogout /><span>{t('nav.logout')}</span></button>
        </nav>
        {!isAdmin && (
          <div className="premium">
            <div className="badge"><IconSpark /></div>
            <h3>{t('premium.title')}</h3>
            <p>{t('premium.text')}</p>
            <button className="btn">{t('premium.cta')}</button>
          </div>
        )}
      </aside>
      {children}
    </div>
  )
}
