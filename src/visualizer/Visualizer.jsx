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
  const ripplesRef   = useRef([])

  // Reset matrix drops when leaving matrix mode
  useEffect(() => {
    if (mode !== 'matrix') matrixRef.current = null
  }, [mode])

  // Click handler
  const handleClick = () => {
    const node = hoveredRef.current
    
    // Create ripples
    const newRipple = { x: mouseRef.current.x, y: mouseRef.current.y, r: 0, opacity: 1 }
    ripplesRef.current.push(newRipple)

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

  const drawRipples = (ctx, t) => {
    ripplesRef.current = ripplesRef.current.filter(r => r.opacity > 0.01)
    ripplesRef.current.forEach(r => {
      r.r += 4
      r.opacity *= 0.96
      ctx.beginPath()
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 240, 255, ${r.opacity * 0.4})`
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }

  const draw = useCallback((ctx, t) => {
    const canvas = ctx.canvas
    // Use logical CSS width/height for all positioning physics
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    const mX = mouseRef.current.x
    const mY = mouseRef.current.y
    
    let newHovered = null;

    // Chromatic Aberration Pass
    const shift = hoveredRef.current ? 1.2 : 0
    
    const renderAll = (offsetX, colorMask) => {
      ctx.save()
      if (colorMask) {
        ctx.globalCompositeOperation = 'screen'
        ctx.translate(offsetX, 0)
      }

      if (mode === 'skills') {
        if (!cachedRef.current.skill) cachedRef.current.skill = computeSkillNodes(W, H)
        const { nodes, edges } = cachedRef.current.skill
        newHovered = drawSkillTree(ctx, W, H, t, nodes, edges, mX - (colorMask ? offsetX : 0), mY)

      } else if (mode === 'projects') {
        if (!cachedRef.current.project) cachedRef.current.project = computeProjectNodes(W, H)
        const { projNodes, skillNodes, edges } = cachedRef.current.project
        newHovered = drawProjectNet(ctx, W, H, t, projNodes, skillNodes, edges, mX - (colorMask ? offsetX : 0), mY)
      }
      ctx.restore()
    }

    if (mode === 'skills' || mode === 'projects') {
      if (shift > 0) {
        // Red shift
        ctx.save()
        ctx.filter = 'matrix(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0)'
        renderAll(-shift, true)
        ctx.restore()

        // Blue shift
        ctx.save()
        ctx.filter = 'matrix(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0)'
        renderAll(shift, true)
        ctx.restore()
      }
      
      // Full channel render
      renderAll(0, false)
    } else if (mode === 'matrix') {
      if (!matrixRef.current) matrixRef.current = initMatrix(W, H)
      drawMatrix(ctx, W, H, matrixRef.current)
    } else {
      drawLanding(ctx, W, H, t)
    }

    drawRipples(ctx, t)
    
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
