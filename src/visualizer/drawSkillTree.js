// ─────────────────────────────────────────────────────────────
// visualizer/drawSkillTree.js
// ─────────────────────────────────────────────────────────────

import { SKILLS } from '../kernel/data.js'

const CAT_COLORS = {
  frontend:  '#00f0ff',
  backend:   '#d4af37',
  data:      '#ff6b6b',
  devops:    '#9d4edd',
  ai:        '#00f0ff',
  languages: '#d4af37',
}

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export function computeSkillNodes(W, H) {
  const cats = ['frontend', 'backend', 'data', 'devops', 'ai', 'languages']

  const nodes = SKILLS.map((s) => {
    const catIdx    = cats.indexOf(s.cat)
    const catSkills = SKILLS.filter((sk) => sk.cat === s.cat)
    const posInCat  = catSkills.indexOf(s)
    const angle     = (catIdx / cats.length) * Math.PI * 2 - Math.PI / 2
    const r         = Math.min(W, H) * 0.32
    const spread    = (posInCat / Math.max(catSkills.length - 1, 1) - 0.5) * 70

    return {
      ...s,
      x: W / 2 + Math.cos(angle) * r + Math.cos(angle + Math.PI / 2) * spread,
      y: H / 2 + Math.sin(angle) * r + Math.sin(angle + Math.PI / 2) * spread,
    }
  })

  const edges = []
  SKILLS.forEach((s, i) => {
    s.deps.forEach((dep) => {
      const j = SKILLS.findIndex((sk) => sk.id === dep)
      if (j >= 0) edges.push([i, j])
    })
  })

  return { nodes, edges }
}

export function drawSkillTree(ctx, W, H, t, nodes, edges, mX = -100, mY = -100) {
  ctx.clearRect(0, 0, W, H)
  
  // Background Atmospheric Grid
  drawGrid(ctx, W, H, t)

  let hoveredNode = null;

  // Dependency edges & particles
  edges.forEach(([a, b]) => {
    const na = nodes[a]
    const nb = nodes[b]
    
    // Draw Tether
    ctx.beginPath()
    ctx.moveTo(na.x, na.y)
    ctx.lineTo(nb.x, nb.y)
    ctx.strokeStyle = 'rgba(212,175,55,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Flowing Particles
    const particleCount = 2
    for (let p = 0; p < particleCount; p++) {
      const offset = ((t * 0.001) + (p / particleCount)) % 1
      const px = na.x + (nb.x - na.x) * offset
      const py = na.y + (nb.y - na.y) * offset
      
      ctx.beginPath()
      ctx.arc(px, py, 1, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(212,175,55,0.4)'
      ctx.fill()
    }
  })

  // Nodes
  nodes.forEach((n, i) => {
    const r     = 5 + n.level * 0.12
    const dist  = Math.hypot(n.x - mX, n.y - mY)
    const isHovered = dist < r * 3
    if (isHovered) hoveredNode = n

    const col   = isHovered ? '#ffffff' : (CAT_COLORS[n.cat] || '#00ff41')
    const heartbeat = 0.8 + 0.2 * Math.sin(t * 0.003)
    const pulse = isHovered ? 1.5 : (0.7 + 0.3 * Math.sin(t * 0.002 + i * 0.7)) * heartbeat

    // Glow halo with Bloom
    ctx.save()
    ctx.beginPath()
    ctx.arc(n.x, n.y, r * (isHovered ? 4 : 3) * heartbeat, 0, Math.PI * 2)
    ctx.shadowBlur = isHovered ? 20 : 10
    ctx.shadowColor = col
    ctx.fillStyle = hexToRgba(col, (isHovered ? 0.3 : 0.1) * pulse)
    ctx.fill()
    ctx.restore()

    // Core dot
    ctx.beginPath()
    ctx.arc(n.x, n.y, r * (isHovered ? 1.2 : 1.0) * heartbeat, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(col, 1)
    ctx.fill()

    // Label
    ctx.font = "600 13px 'Outfit', sans-serif"
    ctx.fillStyle = isHovered ? '#fff' : hexToRgba(col, 0.9)
    ctx.textAlign = 'left'
    ctx.fillText(n.name, n.x + r + 8, n.y + 4)

    // Level bar
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(n.x + r + 8, n.y + 8, 40, 2)
    ctx.fillStyle = hexToRgba(col, 0.8)
    ctx.fillRect(n.x + r + 8, n.y + 8, 40 * (n.level / 100), 2)
  })

  // Legend
  const cats = Object.entries(CAT_COLORS)
  cats.forEach(([cat, col], i) => {
    ctx.fillStyle = col
    ctx.shadowBlur = 5
    ctx.shadowColor = col
    ctx.fillRect(20, H - 30 - i * 20, 10, 10)
    ctx.shadowBlur = 0
    ctx.font = "12px 'Outfit', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'left'
    ctx.fillText(cat.toUpperCase(), 38, H - 21 - i * 20)
  })

  return hoveredNode;
}

function drawGrid(ctx, W, H, t) {
  ctx.save()
  ctx.strokeStyle = 'rgba(0,240,255,0.03)'
  ctx.lineWidth = 1
  const gridSize = 60
  const offsetX = (t * 0.02) % gridSize
  const offsetY = (t * 0.01) % gridSize

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
