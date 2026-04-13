// ─────────────────────────────────────────────────────────────
// components/SourcePane.jsx
// ─────────────────────────────────────────────────────────────

import PaneHeader      from './PaneHeader.jsx'
import SyntaxHighlight from './SyntaxHighlight.jsx'
import IntelligenceReport from './IntelligenceReport.jsx'

export default function SourcePane({ pane }) {
  const { title, content, mode } = pane

  // Try to determine if we should show the Intelligence Report
  let intelligenceData = null
  if (mode === 'intelligence') {
    intelligenceData = content
  } else if (mode === 'json') {
    try {
      const parsed = JSON.parse(content)
      // Only show intelligence report if it looks like a project or skill record
      if (parsed.name && (parsed.status || parsed.level !== undefined)) {
        intelligenceData = parsed
      }
    } catch (e) { /* ignore */ }
  }

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        flex:          1,
        background:    'transparent'
      }}
    >
      <PaneHeader
        title={title}
        dotColor="var(--accent-cyan)"
        right={intelligenceData ? 'INTELLIGENCE' : mode.toUpperCase()}
      />

      <div
        style={{
          flex:       1,
          overflow:   'auto',
          padding:    '10px 14px',
        }}
      >
        {intelligenceData ? (
          <IntelligenceReport data={intelligenceData} />
        ) : mode === 'code' ? (
          <SyntaxHighlight code={content} />
        ) : (
          <pre
            style={{
              margin:     0,
              fontSize:   13,
              lineHeight: 1.65,
              color:      'var(--text-secondary)',
              fontFamily: "var(--font-mono)",
              whiteSpace: 'pre-wrap',
              wordBreak:  'break-word',
            }}
          >
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
