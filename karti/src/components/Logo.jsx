// Karti logo: ink rounded tile, lime "K" whose arms rise like a growth line,
// ending in a coin dot. Wordmark in Space Grotesk.
export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Karti">
      <rect width="64" height="64" rx="16" fill="#0D1117" />
      <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#B6F23A" strokeOpacity=".18" />
      <path d="M20 14v36M20 33l20-19M26 31l16 19" fill="none" stroke="#B6F23A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46" cy="18" r="4" fill="#B6F23A" />
    </svg>
  )
}
export default function Logo({ size = 36, dark = false }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word" style={{ color: dark ? '#fff' : 'var(--ink)', fontSize: size * 0.62 }}>
        karti<i />
      </span>
    </span>
  )
}
