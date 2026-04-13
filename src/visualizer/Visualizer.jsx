// ─────────────────────────────────────────────────────────────
// visualizer/Visualizer.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react'
import { computeSkillNodes,  drawSkillTree }  from './drawSkillTree.js'
import { computeProjectNodes, drawProjectNet } from './drawProjectNet.js'
import { initMatrix, drawMatrix }              from './drawMatrix.js'
import { drawLanding }                         from './drawLanding.js'
import Dashboard                               from '../components/Dashboard.jsx'

export default function Visualizer({ mode, onStateChange }) {
  const canvasRef    = useRef(null)
  const animRef      = useRef(null)
  const cachedRef    = useRef({})   // cache computed node positions
  const matrixRef    = useRef(null)
  const mouseRef     = useRef({ x: -100, y: -100 })
  const hoveredRef   = useRef(null)

  // Reset matrix drops when leaving matrix mode
  useEffect(() => {
    if (mode !== 'matrix') matrixRef.current = null
  }, [mode])

  const draw = useCallback((ctx, t) => {
    const canvas = ctx.canvas
    // Use logical CSS width/height for all positioning physics
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    const mX = mouseRef.current.x
    const mY = mouseRef.current.y
    
    let newHovered = null;

    if (mode === 'skills') {
      if (!cachedRef.current.skill) cachedRef.current.skill = computeSkillNodes(W, H)
      const { nodes, edges } = cachedRef.current.skill
      newHovered = drawSkillTree(ctx, W, H, t, nodes, edges, mX, mY)

    } else if (mode === 'projects') {
      if (!cachedRef.current.project) cachedRef.current.project = computeProjectNodes(W, H)
      const { projNodes, skillNodes, edges } = cachedRef.current.project
      newHovered = drawProjectNet(ctx, W, H, t, projNodes, skillNodes, edges, mX, mY)

    } else if (mode === 'matrix') {
      if (!matrixRef.current) matrixRef.current = initMatrix(W, H)
      drawMatrix(ctx, W, H, matrixRef.current)

    } else if (mode === 'dashboard') {
      ctx.fillStyle = 'rgba(3, 4, 7, 0.8)'
      ctx.fillRect(0, 0, W, H)
      drawLanding(ctx, W, H, t)
    } else {
      // Idle / standby / landing screen
      drawLanding(ctx, W, H, t)
    }
    
    hoveredRef.current = newHovered;
    canvas.style.cursor = newHovered ? 'pointer' : 'default';
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Resize canvas to match CSS size * device pixel ratio
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      
      // Scale context to match logical CSS coordinates
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Invalidate cached node positions on resize
      cachedRef.current = {}
      matrixRef.current = null
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const loop = (t) => {
      animRef.current = requestAnimationFrame(loop)
      draw(ctx, t)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [draw])

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseLeave = () => {
    mouseRef.current = { x: -100, y: -100 }
  }

  const handleClick = () => {
    const node = hoveredRef.current
    if (node && onStateChange) {
      // Strip out internal positions x,y for clean output
      const { x, y, ...cleanData } = node;
      const title = node.status ? `// projects/${node.id || 'record'}.intelligence` : `// skills/${node.id || 'record'}.intelligence`;
      
      onStateChange({
        sourcePane: {
          title,
          content: cleanData,
          mode: 'intelligence'
        }
      })
    }
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'block', opacity: mode === 'dashboard' ? 0.3 : 1, transition: 'opacity 0.3s' }}
      />
      
      {mode === 'dashboard' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
          <Dashboard onStateChange={onStateChange} />
        </div>
      )}

      {mode !== 'idle' && mode !== 'boot' && mode !== 'dashboard' && (
        <button
          onClick={() => onStateChange && onStateChange({ viz: 'idle' })}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--accent-cyan)',
            fontFamily: 'var(--font-ui)',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            zIndex: 10,
            opacity: 0.7,
            transition: 'opacity 0.2s, text-shadow 0.2s',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.textShadow = '0 0 8px var(--accent-cyan)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '0.7'
            e.currentTarget.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          ← Back to Observatory
        </button>
      )}
    </>
  )
}
