// ─────────────────────────────────────────────────────────────
// components/Terminal.jsx
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import PaneHeader              from './PaneHeader.jsx'
import { execute }             from '../commands/registry.js'
import { ALL_COMMANDS }        from '../commands/registry.js'
import { FS, resolvePath }     from '../kernel/filesystem.js'
import { SOURCE_MODULES }      from '../kernel/sourceCode.js'

const BOOT_LINES = [
  '╔══════════════════════════════════════════════════╗',
  '║         RSP OS v2.4.1 — KERNEL BOOT              ║',
  '╚══════════════════════════════════════════════════╝',
  '',
  '[  OK  ] Loading skill index.............. 12 entries',
  '[  OK  ] Mounting project registry......... 5 entries',
  '[  OK  ] Initializing visualizer engine........  READY',
  '[  OK  ] Spawning command registry......... 16 cmds',
  '[  OK  ] All systems nominal.',
  '',
  "Type 'help' for available commands.",
  "Try: visualize --skills | --projects | --matrix",
  '',
]

let _uid = 0
const uid = () => ++_uid

export default function Terminal({ kernelState, onStateChange }) {
  const [lines,      setLines]      = useState([])
  const [input,      setInput]      = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx,    setHistIdx]    = useState(-1)
  const [tabHint,    setTabHint]    = useState('')

  const termRef  = useRef(null)
  const inputRef = useRef(null)

  // ── Boot sequence ─────────────────────────────────────────
  useEffect(() => {
    const timeouts = []
    BOOT_LINES.forEach((text, i) => {
      const tid = setTimeout(() => addLine(text, 'output'), 80 * i)
      timeouts.push(tid)
    })
    return () => timeouts.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-scroll ───────────────────────────────────────────
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lines])

  const addLine = useCallback((content, type = 'output') => {
    setLines((prev) => [...prev, { id: uid(), content, type }])
  }, [])

  // ── Run a command ─────────────────────────────────────────
  const runCommand = useCallback(
    (raw) => {
      const trimmed = raw.trim()
      if (!trimmed) { addLine('', 'output'); return }

      // Echo the input
      addLine(trimmed, 'input')

      // Push to history
      setCmdHistory((h) => [trimmed, ...h.slice(0, 49)])
      setHistIdx(-1)
      setTabHint('')

      // Execute
      const result = execute(trimmed, kernelState)

      if (result.clearTerminal) {
        setLines([])
        return
      }

      if (result.output !== '') addLine(result.output, result.error ? 'error' : 'output')

      // Drip-feed delayed lines (e.g. `hack` command)
      result.delayedLines?.forEach(({ text, delay }) => {
        setTimeout(() => addLine(text, 'output'), delay)
      })

      // Propagate state changes upward
      const update = {}
      if (result.cwdUpdate  !== undefined) update.cwd       = result.cwdUpdate
      if (result.vizMode    !== undefined) update.viz       = result.vizMode
      if (result.sourcePane !== undefined) update.sourcePane = result.sourcePane
      if (result.vizDelay   !== undefined) {
        setTimeout(() => onStateChange({ viz: result.vizMode }), result.vizDelay)
      }
      if (Object.keys(update).length) onStateChange(update)
    },
    [kernelState, addLine, onStateChange]
  )

  // ── Tab completion ─────────────────────────────────────────
  const handleTab = useCallback(() => {
    const tokens  = input.trim().split(/\s+/)
    const partial = tokens[tokens.length - 1] || ''

    if (tokens.length === 1) {
      const matches = ALL_COMMANDS.filter((c) => c.startsWith(partial))
      if (matches.length === 1) { setInput(matches[0] + ' '); setTabHint('') }
      else if (matches.length > 1) setTabHint(matches.join('  '))
      return
    }

    // Complete filenames / module names for specific commands
    const cmd = tokens[0]
    if (cmd === 'inspect') {
      const mods = Object.keys(SOURCE_MODULES)
      const m = mods.filter((x) => x.startsWith(partial))
      if (m.length === 1) { setInput(`inspect ${m[0]}`); setTabHint('') }
      else if (m.length > 1) setTabHint(m.join('  '))
      return
    }

    if (cmd === 'cat' || cmd === 'cd' || cmd === 'ls') {
      const node = FS[kernelState.cwd]
      const children = node?.children ?? []
      const m = children.filter((c) => c.startsWith(partial))
      if (m.length === 1) { setInput(`${tokens.slice(0,-1).join(' ')} ${m[0]}`); setTabHint('') }
      else if (m.length > 1) setTabHint(m.join('  '))
    }
  }, [input, kernelState.cwd])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        runCommand(input)
        setInput('')
      } else if (e.key === 'Tab') {
        e.preventDefault()
        handleTab()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const ni = Math.min(histIdx + 1, cmdHistory.length - 1)
        setHistIdx(ni)
        setInput(cmdHistory[ni] ?? '')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const ni = Math.max(histIdx - 1, -1)
        setHistIdx(ni)
        setInput(ni === -1 ? '' : (cmdHistory[ni] ?? ''))
      } else {
        setTabHint('')
      }
    },
    [input, histIdx, cmdHistory, runCommand, handleTab]
  )

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        height:        '100%',
        background:    'transparent'
      }}
    >
      <PaneHeader
        title="TERMINAL — rsp-sh"
        right={`${lines.length} lines`}
      />

      {/* Scrollable output area */}
      <div
        ref={termRef}
        onClick={() => inputRef.current?.focus()}
        style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '14px 20px',
          cursor:     'text',
          position:   'relative',
          fontFamily: "var(--font-mono)",
          fontSize:   14,
          fontWeight: 400,
        }}
      >
        {/* CRT scanlines and Matrix overlay */}
        <MatrixRain active={kernelState.viz === 'matrix'} />
        <div className="scanlines" />

        {lines.map((line) => (
          <Line key={line.id} line={line} />
        ))}

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          <Prompt cwd={kernelState.cwd} />
          <span style={{ color: 'var(--text-primary)' }}>{input}</span>
          <span className="cursor" />
          {/* Hidden real input for keyboard capture */}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setTabHint('') }}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ opacity: 0, position: 'absolute', width: 1, height: 1 }}
            aria-label="terminal input"
          />
        </div>

        {tabHint && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
            {tabHint}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Prompt({ cwd }) {
  return (
    <span style={{ color: 'var(--accent-gold)', flexShrink: 0, fontWeight: 500 }}>
      {cwd}&nbsp;&gt;&nbsp;
    </span>
  )
}

function Line({ line }) {
  const colors = {
    input:  'var(--text-primary)',
    output: 'var(--text-secondary)',
    error:  '#ff4444',
  }

  if (line.type === 'input') {
    const parts = line.content.split(' $ ')
    return (
      <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 4 }}>
        <span style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>{parts[0]} &gt; </span>
        <span style={{ color: 'var(--text-primary)' }}>{parts.slice(1).join(' > ')}</span>
      </div>
    )
  }

  // Parse ANSI escape codes (simple implementation)
  const parseAnsi = (text) => {
    if (typeof text !== 'string') return text
    
    // Split by ANSI escape sequences
    const parts = text.split(/(\x1b\[\d+m)/)
    let currentColor = colors[line.type] ?? 'var(--text-secondary)'
    
    return parts.map((part, i) => {
      if (part === '\x1b[36m') {
        currentColor = 'var(--accent-cyan)'
        return null
      }
      if (part === '\x1b[0m') {
        currentColor = colors[line.type] ?? 'var(--text-secondary)'
        return null
      }
      if (part.startsWith('\x1b[')) return null // ignore other codes
      
      return part ? <span key={i} style={{ color: currentColor }}>{part}</span> : null
    })
  }

  return (
    <div
      style={{
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak:  'break-word',
      }}
    >
      {parseAnsi(line.content)}
    </div>
  )
}

function MatrixRain({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const columns = Math.floor(canvas.width / 16)
    const drops = new Array(columns).fill(1)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%'

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 4, 7, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00f0ff'
      ctx.font = '14px monospace'

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length))
        ctx.fillText(text, i * 16, drops[i] * 16)

        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.15,
        zIndex: 0
      }}
    />
  )
}
