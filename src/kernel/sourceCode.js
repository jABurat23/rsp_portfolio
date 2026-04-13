// ─────────────────────────────────────────────────────────────
// kernel/sourceCode.js
// Pre-loaded source strings shown by the `inspect` command.
// ─────────────────────────────────────────────────────────────

export const SOURCE_MODULES = {
  commandParser: `// commands/parser.js
export function parseCommand(input) {
  const tokens = input.trim().split(/\\s+/)
  const name   = tokens[0]?.toLowerCase() ?? ''
  const args   = []
  const flags  = {}

  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].startsWith('--')) {
      const [key, val] = tokens[i].slice(2).split('=')
      flags[key] = val ?? true
    } else if (tokens[i].startsWith('-')) {
      flags[tokens[i].slice(1)] = true
    } else {
      args.push(tokens[i])
    }
  }

  return { name, args, flags }
}`,

  kernel: `// kernel/data.js (excerpt)
export const SKILLS = [
  { id: 'react', name: 'React / Next.js', level: 90,
    cat: 'frontend', deps: ['ts', 'css'] },
  // ... 11 more skills
]

export const PROJECTS = [
  { id: 'rsp', name: 'Recursive Simulation Portfolio',
    year: 2024, status: 'active',
    skills: ['react', 'ts', 'webgl', 'css'],
    desc: '...' },
  // ... 4 more projects
]

// kernel state shape
export const initialKernelState = {
  cwd:           '~',
  visualization: 'boot',
  uptime:        Date.now(),
}`,

  visualizer: `// visualizer/drawSkillTree.js
export function drawSkillTree(ctx, W, H, t, nodes, edges) {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, W, H)

  const CAT_COLORS = {
    frontend: '#00ff41', backend:   '#ffa500',
    data:     '#ff6b6b', devops:    '#00d4ff',
    ai:       '#bf5fff', languages: '#ffd700',
  }

  // Draw dependency edges
  edges.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(nodes[a].x, nodes[a].y)
    ctx.lineTo(nodes[b].x, nodes[b].y)
    ctx.strokeStyle = 'rgba(0,255,65,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // Draw nodes with glow pulse
  nodes.forEach((n, i) => {
    const r     = 5 + n.level * 0.1
    const col   = CAT_COLORS[n.cat] || '#00ff41'
    const pulse = 0.7 + 0.3 * Math.sin(t * 0.002 + i * 0.7)
    // ... glow gradient + label + level bar
  })
}`,

  registry: `// commands/registry.js
import * as handlers from './handlers.js'

// Maps command name → handler function
// Each handler: (state, args, flags) => { output, sideEffect? }
export const REGISTRY = {
  help:      handlers.handleHelp,
  ls:        handlers.handleLs,
  cd:        handlers.handleCd,
  cat:       handlers.handleCat,
  visualize: handlers.handleVisualize,
  inspect:   handlers.handleInspect,
  view:      handlers.handleView,
  clear:     handlers.handleClear,
  sudo:      handlers.handleSudo,
  hack:      handlers.handleHack,
  whoami:    handlers.handleWhoami,
  uname:     handlers.handleUname,
  pwd:       handlers.handlePwd,
  tree:      handlers.handleTree,
  echo:      handlers.handleEcho,
  uptime:    handlers.handleUptime,
}`,
}
