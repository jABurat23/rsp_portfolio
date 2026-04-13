// ─────────────────────────────────────────────────────────────
// visualizer/drawProjectNet.js
// ─────────────────────────────────────────────────────────────

import { SKILLS, PROJECTS } from '../kernel/data.js'

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

const STATUS_COLOR = {
  active:   '#00f0ff',
  complete: '#d4af37',
  archived: '#8b949e',
}

export function computeProjectNodes(W, H) {
  const projNodes = PROJECTS.map((p, i) => {
    const angle = (i / PROJECTS.length) * Math.PI * 2 - Math.PI / 2
    return {
      ...p,
      x: W / 2 + Math.cos(angle) * (Math.min(W, H) * 0.28),
      y: H / 2 + Math.sin(angle) * (Math.min(W, H) * 0.22),
    }
  })

  const uniqueSkillIds = [...new Set(PROJECTS.flatMap((p) => p.skills))]
  const skillNodes = uniqueSkillIds.map((sid, i) => {
    const s     = SKILLS.find((sk) => sk.id === sid)
    const angle = (i / uniqueSkillIds.length) * Math.PI * 2 + Math.PI / 6
    return {
      id:   sid,
      name: s ? s.name.split(' ')[0] : sid,
      x:    W / 2 + Math.cos(angle) * (Math.min(W, H) * 0.44),
      y:    H / 2 + Math.sin(angle) * (Math.min(W, H) * 0.38),
    }
  })

  const edges = []
  PROJECTS.forEach((p, pi) => {
    p.skills.forEach((sid) => {
      const si = uniqueSkillIds.indexOf(sid)
      if (si >= 0) edges.push([pi, si])
    })
  })

  return { projNodes, skillNodes, edges }
}

export function drawProjectNet(ctx, W, H, t, projNodes, skillNodes, edges, mX = -100, mY = -100) {
  ctx.clearRect(0, 0, W, H)
  
  // Background Atmospheric Grid
  drawGrid(ctx, W, H, t)
  
  let hoveredNode = null;

  // Edges & Particles
  edges.forEach(([pi, si]) => {
    const p = projNodes[pi]
    const s = skillNodes[si]

    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(s.x, s.y)
    ctx.strokeStyle = 'rgba(0,240,255,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Flowing Particles (Data stream)
    const particleCount = 2
    for (let i = 0; i < particleCount; i++) {
        const offset = ((t * 0.0008) + (i / particleCount)) % 1
        const px = p.x + (s.x - p.x) * offset
        const py = p.y + (s.y - p.y) * offset
        
        ctx.beginPath()
        ctx.arc(px, py, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,240,255,0.45)'
        ctx.fill()
    }
  })

  // Skill nodes
  skillNodes.forEach((n, i) => {
    const dist = Math.hypot(n.x - mX, n.y - mY)
    const isHovered = dist < 20
    if (isHovered) hoveredNode = n
    
    const col = '#d4af37'
    const pulse = isHovered ? 1.5 : (0.7 + 0.3 * Math.sin(t * 0.002 + i))

    ctx.save()
    ctx.beginPath()
    ctx.arc(n.x, n.y, 5 * pulse, 0, Math.PI * 2)
    ctx.shadowBlur = isHovered ? 15 : 5
    ctx.shadowColor = col
    ctx.fillStyle = hexToRgba(col, 0.8 * pulse)
    ctx.fill()
    ctx.restore()

    ctx.font = "600 11px 'Outfit', sans-serif"
    ctx.fillStyle = hexToRgba(col, 0.9)
    ctx.textAlign = 'center'
    ctx.fillText(n.name.toUpperCase(), n.x, n.y + 18)
  })

  // Project nodes
  projNodes.forEach((n, i) => {
    const dist = Math.hypot(n.x - mX, n.y - mY)
    const isHovered = dist < 25
    if (isHovered) hoveredNode = n

    const col   = isHovered ? '#ffffff' : (STATUS_COLOR[n.status] || '#ffa500')
    const heartbeat = 0.8 + 0.2 * Math.sin(t * 0.003)
    const pulse = isHovered ? 1.5 : (0.8 + 0.2 * Math.sin(t * 0.0015 + i * 1.3)) * heartbeat

    ctx.save()
    ctx.shadowBlur = isHovered ? 25 : 10
    ctx.shadowColor = col

    // Filled background
    ctx.beginPath()
    ctx.arc(n.x, n.y, 16 * heartbeat, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(col, 0.15 * pulse)
    ctx.fill()

    // Border
    ctx.beginPath()
    ctx.arc(n.x, n.y, 16 * heartbeat, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(col, 1 * pulse)
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()

    // Label
    ctx.font = "bold 13px 'Outfit', sans-serif"
    ctx.fillStyle = isHovered ? '#fff' : hexToRgba(col, 1)
    ctx.textAlign = 'center'
    ctx.fillText(n.name.split(' ')[0], n.x, n.y + 4)

    ctx.font = "10px 'Fira Code', monospace"
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(n.year, n.x, n.y + 34)
  })

  // Legend
  Object.entries(STATUS_COLOR).forEach(([status, col], i) => {
    ctx.fillStyle = col
    ctx.shadowBlur = 5
    ctx.shadowColor = col
    ctx.fillRect(20, H - 30 - i * 20, 10, 10)
    ctx.shadowBlur = 0
    ctx.font = "12px 'Outfit', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'left'
    ctx.fillText(status.toUpperCase(), 38, H - 21 - i * 20)
  })

  return hoveredNode;
}

function drawGrid(ctx, W, H, t) {
  ctx.save()
  ctx.strokeStyle = 'rgba(0,240,255,0.03)'
  ctx.lineWidth = 1
  const gridSize = 80
  const offsetX = (t * 0.015) % gridSize
  const offsetY = (t * 0.008) % gridSize

  for (let x = offsetX; x < W; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = offsetY; y < H; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.restore()
}
