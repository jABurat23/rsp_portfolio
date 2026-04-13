// ─────────────────────────────────────────────────────────────
// App.jsx
// Root component — manages kernel state and lays out the three
// panes: Terminal | Visualizer | SourcePane
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'

import Header     from './components/Header.jsx'
import Terminal   from './components/Terminal.jsx'
import SourcePane from './components/SourcePane.jsx'
import Visualizer from './visualizer/Visualizer.jsx'
import PaneHeader from './components/PaneHeader.jsx'
import { SKILLS } from './kernel/data.js'

const VIZ_LABEL = {
  boot:     'STANDBY',
  idle:     'IDLE',
  skills:   'SKILL TREE',
  projects: 'PROJECT NET',
  matrix:   'THE MATRIX',
}

const DEFAULT_SOURCE = {
  title:   '// kernel.state',
  content: JSON.stringify(
    { skills: SKILLS.length, cwd: '~', visualization: 'boot' },
    null,
    2
  ),
  mode: 'json',
}

export default function App() {
  const startTimeRef = useRef(Date.now())
  const [uptime, setUptime] = useState(0)

  const [kernelState, setKernelState] = useState({
    cwd:       '~',
    viz:       'boot',
    startTime: startTimeRef.current,
  })
  const [sourcePane, setSourcePane] = useState(DEFAULT_SOURCE)

  // Uptime ticker
  useEffect(() => {
    const iv = setInterval(
      () => setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000)),
      1000
    )
    return () => clearInterval(iv)
  }, [])

  // Called by Terminal when a command mutates state
  const handleStateChange = (update) => {
    if (update.sourcePane) {
      setSourcePane(update.sourcePane)
      // eslint-disable-next-line no-param-reassign
      delete update.sourcePane
    }
    if (Object.keys(update).length) {
      setKernelState((prev) => ({ ...prev, ...update }))
    }
  }

  const vizColor =
    kernelState.viz === 'matrix' ? 'var(--accent-cyan)' :
    kernelState.viz === 'skills' ? 'var(--accent-gold)' : 'var(--accent-purple)'

  return (
    <div
      style={{
        fontFamily:    "var(--font-mono)",
        color:         "var(--text-primary)",
        height:        '100vh',
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        padding:       '12px',
        gap:           '12px'
      }}
    >
      {/* ── Status bar ────────────────────────────────────── */}
      <Header cwd={kernelState.cwd} viz={kernelState.viz} uptime={uptime} />

      {/* ── Main grid ─────────────────────────────────────── */}
      <div
        style={{
          flex:                1,
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows:    '1fr',
          overflow:            'hidden',
          minHeight:           0,
          gap:                 '12px'
        }}
      >
        {/* Left column: Terminal */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Terminal
            kernelState={{ ...kernelState, startTime: startTimeRef.current }}
            onStateChange={handleStateChange}
          />
        </div>

        {/* Right column: Visualizer (top) + Source Inspector (bottom) */}
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            overflow:      'hidden',
            minHeight:     0,
            gap:           '12px'
          }}
        >
          {/* Visualizer — 55% height */}
          <div
            className="glass-panel"
            style={{
              flex:         '0 0 55%',
              display:      'flex',
              flexDirection: 'column',
              overflow:     'hidden',
            }}
          >
            <PaneHeader
              title={`VISUALIZER — ${VIZ_LABEL[kernelState.viz] ?? kernelState.viz.toUpperCase()}`}
              dotColor={vizColor}
              right="canvas2d"
            />
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <Visualizer mode={kernelState.viz} onStateChange={handleStateChange} />
            </div>
          </div>

          {/* Source Inspector — remaining height */}
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <SourcePane pane={sourcePane} />
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        className="glass-panel"
        style={{
          padding:      '6px 16px',
          display:      'flex',
          justifyContent: 'space-between',
          fontSize:     11,
          fontFamily:   'var(--font-ui)',
          color:        'var(--text-secondary)',
          flexShrink:   0,
        }}
      >
        <span>RSP OS — Recursive Simulation Portfolio</span>
        <span>Tab: complete &nbsp;·&nbsp; ↑↓: history &nbsp;·&nbsp; inspect &lt;module&gt; &nbsp;·&nbsp; view &lt;state&gt;</span>
      </footer>
    </div>
  )
}
