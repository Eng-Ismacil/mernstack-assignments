import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { isNetworkError } from './net'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

// Last known profile per user, so a dropped connection never logs the user out or hides the admin menu.
const cacheKey = (id) => 'karti_profile_' + id
const readCache = (id) => { try { return JSON.parse(localStorage.getItem(cacheKey(id))) } catch { return null } }
const writeCache = (id, p) => { try { localStorage.setItem(cacheKey(id), JSON.stringify(p)) } catch {} }
const clearCache = (id) => { try { localStorage.removeItem(cacheKey(id)) } catch {} }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profUid, setProfUid] = useState(null) // which user the loaded profile belongs to
  const [disabled, setDisabled] = useState(false)
  const [sessionNetErr, setSessionNetErr] = useState(false) // could not read/refresh the session (offline)
  const [profileNetErr, setProfileNetErr] = useState(false) // could not load the profile (offline)
  const uid = session?.user?.id ?? null

  const initSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error && isNetworkError(error)) { setSessionNetErr(true); return } // stored session is kept; retry later
      setSession(data?.session ?? null); setSessionNetErr(false); setAuthReady(true)
    } catch (e) {
      if (isNetworkError(e)) setSessionNetErr(true)
      else { setSession(null); setAuthReady(true) }
    }
  }, [])

  useEffect(() => {
    initSession()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [initSession])

  const loadProfile = useCallback(async (id) => {
    let res
    try { res = await supabase.from('profiles').select('*').eq('id', id).maybeSingle() }
    catch (e) { res = { data: null, error: e } }
    const { data, error } = res

    // A failed request (no internet, server hiccup) says nothing about the account: never sign the user out for it.
    if (error) {
      const cached = readCache(id)
      if (cached && !cached.deleted_at) { setProfile((p) => p ?? cached); setDisabled(false); setProfUid(id); setProfileNetErr(false) }
      else setProfileNetErr(true)
      return
    }
    setProfileNetErr(false)
    if (!data || data.deleted_at) { // account really removed / moved to recycle bin
      clearCache(id)
      setDisabled(true); setProfile(null); setProfUid(id)
      await supabase.auth.signOut()
      return
    }
    writeCache(id, data)
    setDisabled(false); setProfile(data); setProfUid(id)
  }, [])

  useEffect(() => {
    if (!authReady) return
    if (!uid) { setProfile(null); setProfUid(null); setProfileNetErr(false); return }
    loadProfile(uid)
  }, [uid, authReady, loadProfile])

  // Come back online / retry while blocked by a network problem.
  const blocked = sessionNetErr || profileNetErr
  const retry = useCallback(() => {
    if (sessionNetErr) return initSession()
    if (uid) return loadProfile(uid)
  }, [sessionNetErr, uid, initSession, loadProfile])

  useEffect(() => {
    const onOnline = () => { if (sessionNetErr) initSession(); else if (uid) loadProfile(uid) }
    window.addEventListener('online', onOnline)
    const timer = blocked ? setInterval(() => retry(), 5000) : null
    return () => { window.removeEventListener('online', onOnline); if (timer) clearInterval(timer) }
  }, [blocked, sessionNetErr, uid, initSession, loadProfile, retry])

  const loading = !authReady || (!!uid && profUid !== uid)
  const value = {
    session, user: session?.user ?? null, profile, loading, disabled,
    netError: blocked, retry,
    isAdmin: profile?.role === 'admin',
    refreshProfile: () => uid && loadProfile(uid),
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
