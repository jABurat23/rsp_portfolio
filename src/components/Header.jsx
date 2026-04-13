// ─────────────────────────────────────────────────────────────
// components/Header.jsx
// ─────────────────────────────────────────────────────────────

const VIZ_LABEL = {
  boot:     'STANDBY',
  idle:     'IDLE',
  skills:   'SKILL TREE',
  projects: 'PROJECT NET',
  matrix:   'THE MATRIX',
}

export default function Header({ cwd, viz, uptime }) {
  const h = Math.floor(uptime / 3600)
  const m = Math.floor((uptime % 3600) / 60)
  const s = uptime % 60
  const uptimeStr = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')

  const vizColor =
    viz === 'matrix'   ? 'var(--accent-cyan)' :
    viz === 'skills'   ? 'var(--accent-gold)' :
    'var(--accent-purple)'

  return (
    <header
      className="glass-panel"
      style={{
        padding:      '12px 20px',
        display:      'flex',
        justifyContent: 'space-between',
        alignItems:   'center',
        flexShrink:   0,
      }}
    >
      {/* Left: logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span
          style={{
            fontFamily:    "var(--font-ui)",
            fontSize:      16,
            fontWeight:    600,
            color:         'var(--text-primary)',
            letterSpacing: 2,
          }}
        >
          RSP OS
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>
          v2.4.1 IMPERIAL
        </span>
      </div>

      {/* Right: status row */}
      <div
        style={{
          display:    'flex',
          gap:        24,
          fontSize:   12,
          color:      'var(--text-secondary)',
          fontFamily: "var(--font-mono)",
        }}
      >
        <Stat label="UP"  value={uptimeStr} color="var(--accent-cyan)" />
        <Stat label="CWD" value={cwd}       color="var(--accent-gold)" />
        <Stat label="VIZ" value={VIZ_LABEL[viz] || viz.toUpperCase()} color={vizColor} />
        <Stat label="MEM" value="42 MB"     color="var(--accent-purple)" />
      </div>
    </header>
  )
}

function Stat({ label, value, color }) {
  return (
    <span>
      {label}: <span style={{ color }}>{value}</span>
    </span>
  )
}
