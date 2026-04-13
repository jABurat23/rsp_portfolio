// ─────────────────────────────────────────────────────────────
// components/PaneHeader.jsx
// ─────────────────────────────────────────────────────────────

export default function PaneHeader({ title, badge, dotColor = 'var(--accent-cyan)', right }) {
  return (
    <div
      style={{
        padding:      '8px 16px',
        background:   'transparent',
        borderBottom: '1px solid var(--panel-border)',
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        fontSize:     12,
        color:        'var(--text-primary)',
        letterSpacing: 1,
        flexShrink:   0,
        fontFamily:   "var(--font-ui)",
        fontWeight:   500,
      }}
    >
      {/* Traffic light dots */}
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block', boxShadow: '0 0 4px #ff5f5780' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block', boxShadow: '0 0 4px #ffbd2e80' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor,  display: 'inline-block', boxShadow: `0 0 6px ${dotColor}` }} />

      <span style={{ marginLeft: 8, color: 'var(--text-primary)' }}>{title}</span>

      {right && (
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{right}</span>
      )}
    </div>
  )
}
