// ─────────────────────────────────────────────────────────────
// components/SyntaxHighlight.jsx
// Lightweight JS/TS syntax highlighter — no dependencies.
// ─────────────────────────────────────────────────────────────

const KEYWORDS =
  /^\b(export|import|interface|const|let|var|function|return|extends|new|this|private|public|class|type|from|of|for|if|else|typeof|in|async|await)\b$/

const TOKEN_RE =
  /(\b(?:export|import|interface|const|let|var|function|return|extends|new|this|private|public|class|type|from|of|for|if|else|typeof|in|async|await)\b|\/\/[^\n]*|"[^"]*"|'[^']*'|`[^`]*`|\b\d+\b|[{}[\]();,])/g

export default function SyntaxHighlight({ code }) {
  const tokens = code.split(TOKEN_RE)

  return (
    <pre
      style={{
        margin:      0,
        fontFamily:  "var(--font-mono)",
        fontSize:    13,
        lineHeight:  1.65,
        color:       'var(--text-primary)',
        whiteSpace:  'pre-wrap',
        wordBreak:   'break-word',
      }}
    >
      {tokens.map((tok, i) => {
        if (KEYWORDS.test(tok))        return <span key={i} style={{ color: 'var(--accent-cyan)' }}>{tok}</span>
        if (/^\/\//.test(tok))         return <span key={i} style={{ color: 'var(--text-secondary)' }}>{tok}</span>
        if (/^["'`]/.test(tok))        return <span key={i} style={{ color: 'var(--accent-gold)' }}>{tok}</span>
        if (/^\b(?:true|false|null|undefined|\d+)\b$/.test(tok))
                                       return <span key={i} style={{ color: 'var(--accent-purple)' }}>{tok}</span>
        if (/^[{}[\]]$/.test(tok))     return <span key={i} style={{ color: 'var(--text-primary)' }}>{tok}</span>
        return <span key={i}>{tok}</span>
      })}
    </pre>
  )
}
