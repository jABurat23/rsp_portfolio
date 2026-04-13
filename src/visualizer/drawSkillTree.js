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
  // Transparent base allows glassmorphism to show

  let hoveredNode = null;

  // Dependency edges
  edges.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(nodes[a].x, nodes[a].y)
    ctx.lineTo(nodes[b].x, nodes[b].y)
    ctx.strokeStyle = 'rgba(212,175,55,0.18)'
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // Nodes
  nodes.forEach((n, i) => {
    const r     = 5 + n.level * 0.12
    const dist  = Math.hypot(n.x - mX, n.y - mY)
    const isHovered = dist < r * 3
    if (isHovered) hoveredNode = n

    const col   = isHovered ? '#ffffff' : (CAT_COLORS[n.cat] || '#00ff41')
    // Global heartbeat cycle
    const heartbeat = 0.8 + 0.2 * Math.sin(t * 0.003)
    const pulse = isHovered ? 1.5 : (0.7 + 0.3 * Math.sin(t * 0.002 + i * 0.7)) * heartbeat

    // Glow halo
    ctx.beginPath()
    ctx.arc(n.x, n.y, r * (isHovered ? 4 : 3) * heartbeat, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(col, (isHovered ? 0.25 : 0.1) * pulse)
    ctx.fill()

    // Core dot
    ctx.beginPath()
    ctx.arc(n.x, n.y, r * (isHovered ? 1.2 : 1.0) * heartbeat, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(col, 0.9)
    ctx.fill()

    // Label
    ctx.font = "12px 'Outfit', sans-serif"
    ctx.fillStyle = hexToRgba(col, 0.95)
    ctx.textAlign = 'left'
    ctx.fillText(n.name, n.x + r + 5, n.y + 4)

    // Level bar (background)
    ctx.fillStyle = hexToRgba(col, 0.2)
    ctx.fillRect(n.x + r + 5, n.y + 7, 44, 2)
    // Level bar (filled)
    ctx.fillStyle = hexToRgba(col, 0.75)
    ctx.fillRect(n.x + r + 5, n.y + 7, 44 * (n.level / 100), 2)
  })

  // Legend
  const cats = Object.entries(CAT_COLORS)
  cats.forEach(([cat, col], i) => {
    ctx.fillStyle = col
    ctx.fillRect(10, H - 20 - i * 18, 8, 8)
    ctx.font = "11px 'Outfit', sans-serif"
    ctx.fillStyle = col
    ctx.textAlign = 'left'
    ctx.fillText(cat, 22, H - 9 - i * 16)
  })

  return hoveredNode;
}
