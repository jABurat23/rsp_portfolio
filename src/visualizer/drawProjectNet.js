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
  // Transparent base
  
  let hoveredNode = null;

  // Edges
  edges.forEach(([pi, si]) => {
    const p = projNodes[pi]
    const s = skillNodes[si]
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(s.x, s.y)
    ctx.strokeStyle = 'rgba(0,240,255,0.18)'
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // Skill nodes
  skillNodes.forEach((n, i) => {
    const dist = Math.hypot(n.x - mX, n.y - mY)
    const isHovered = dist < 12
    if (isHovered) hoveredNode = n
    
    const pulse = isHovered ? 1.5 : (0.7 + 0.3 * Math.sin(t * 0.002 + i))
    ctx.beginPath()
    ctx.arc(n.x, n.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(212,175,55,${0.7 * pulse})`
    ctx.fill()
    ctx.font = "11px 'Outfit', sans-serif"
    ctx.fillStyle = `rgba(212,175,55,0.8)`
    ctx.textAlign = 'center'
    ctx.fillText(n.name, n.x, n.y + 16)
  })

  // Project nodes
  projNodes.forEach((n, i) => {
    const dist = Math.hypot(n.x - mX, n.y - mY)
    const isHovered = dist < 20
    if (isHovered) hoveredNode = n

    const col   = isHovered ? '#ffffff' : (STATUS_COLOR[n.status] || '#ffa500')
    const heartbeat = 0.8 + 0.2 * Math.sin(t * 0.003)
    const pulse = isHovered ? 1.5 : (0.8 + 0.2 * Math.sin(t * 0.0015 + i * 1.3)) * heartbeat

    // Filled background
    ctx.beginPath()
    ctx.arc(n.x, n.y, 16 * heartbeat, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(col, 0.12 * pulse)
    ctx.fill()

    // Border
    ctx.beginPath()
    ctx.arc(n.x, n.y, 16 * heartbeat, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(col, 0.9 * pulse)
    ctx.lineWidth = 2
    ctx.stroke()

    // Label
    ctx.font = "bold 12px 'Outfit', sans-serif"
    ctx.fillStyle = hexToRgba(col, 0.95)
    ctx.textAlign = 'center'
    ctx.fillText(n.name.split(' ')[0], n.x, n.y + 4)

    ctx.font = "11px 'Fira Code', monospace"
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText(n.year, n.x, n.y + 30)
  })

  // Legend
  Object.entries(STATUS_COLOR).forEach(([status, col], i) => {
    ctx.fillStyle = col
    ctx.fillRect(10, H - 20 - i * 18, 8, 8)
    ctx.font = "11px 'Outfit', sans-serif"
    ctx.fillStyle = col
    ctx.textAlign = 'left'
    ctx.fillText(status, 22, H - 9 - i * 16)
  })

  return hoveredNode;
}
