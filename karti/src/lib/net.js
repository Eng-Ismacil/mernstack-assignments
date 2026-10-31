import { useEffect, useRef, useState } from 'react'

// True when the browser reports it has a connection (updates live).
export function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

// Does this error come from a dropped / unreachable connection (not from the server rejecting us)?
export function isNetworkError(err) {
  if (!err) return false
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
  if (err.name === 'AuthRetryableFetchError' || err.status === 0) return true
  const m = String(err.message || err).toLowerCase()
  return /failed to fetch|networkerror|network request failed|load failed|fetch failed|timed? ?out/.test(m)
}

// Friendly text for any error: a translated "no internet" message for network errors, else the original message.
export function errText(err, t) {
  if (!err) return ''
  if (isNetworkError(err)) return t('err.offline')
  return err.message || String(err)
}

// Re-run `fn` automatically when the connection comes back (or the tab becomes visible again).
export function useReconnect(fn) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    const run = () => ref.current && ref.current()
    const vis = () => { if (document.visibilityState === 'visible') run() }
    window.addEventListener('online', run)
    document.addEventListener('visibilitychange', vis)
    return () => { window.removeEventListener('online', run); document.removeEventListener('visibilitychange', vis) }
  }, [])
}
