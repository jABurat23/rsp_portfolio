// ─────────────────────────────────────────────────────────────
// commands/handlers.js
// One exported function per command. Each receives:
//   state  – current kernel state (read-only snapshot)
//   args   – positional arguments array
//   flags  – named flags object
// Each returns:
//   { output, error?, vizMode?, sourcePane?, cwdUpdate? }
// ─────────────────────────────────────────────────────────────

import { FS, resolvePath } from '../kernel/filesystem.js'
import { SKILLS, PROJECTS, OWNER } from '../kernel/data.js'
import { SOURCE_MODULES } from '../kernel/sourceCode.js'

const bar = (pct) =>
  '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))

// ── help ──────────────────────────────────────────────────────
export function handleHelp() {
  return {
    output: `AVAILABLE COMMANDS
${'─'.repeat(46)}
  help                   Show this message
  ls [path]              List directory contents
  cd <path>              Change directory
  cat <file>             Display file contents
  pwd                    Print working directory
  tree                   Show directory tree
  echo <text>            Print text
  whoami                 Current user info
  uname [-a]             System information
  uptime                 Session uptime
  sysinfo                Imperial system overview

  visualize --skills     Render skill dependency tree
  visualize --projects   Render project network graph
  visualize --matrix     Enter the matrix
  visualize --off        Clear visualizer

  inspect <module>       Show module source code
    modules: commandParser | kernel | visualizer | registry

  view <target>          Inspect live kernel state
    targets: skills | projects | state

  clear                  Clear terminal output
  sudo <anything>        ...try it
${'─'.repeat(46)}
  Tab: autocomplete   ↑↓: command history`,
  }
}

// ── whoami ────────────────────────────────────────────────────
export function handleWhoami() {
  return {
    output:
      `root@rsp-os\n${'─'.repeat(44)}\n` +
      `  User    : ${OWNER.name}\n` +
      `  UID     : 0 (you always have root here)\n` +
      `  Shell   : rsp-sh v2.4.1\n` +
      `  Home    : ~\n` +
      `  Session : ${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  }
}

// ── uname ─────────────────────────────────────────────────────
export function handleUname({ flags }) {
  if (flags.a || flags['-all']) {
    return {
      output: `RSP-OS rsp-kernel 2.4.1-RELEASE #1 SMP ${new Date().toDateString()} x86_64 GNU/Linux`,
    }
  }
  return { output: 'RSP-OS' }
}

// ── pwd ───────────────────────────────────────────────────────
export function handlePwd({ state }) {
  return { output: state.cwd }
}

// ── clear ─────────────────────────────────────────────────────
export function handleClear() {
  return { output: '', clearTerminal: true }
}

// ── echo ──────────────────────────────────────────────────────
export function handleEcho({ args }) {
  return { output: args.join(' ') }
}

// ── uptime ────────────────────────────────────────────────────
export function handleUptime({ state }) {
  const sec = Math.floor((Date.now() - state.startTime) / 1000)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return {
    output: `up ${h}h ${m}m ${s}s  |  1 user  |  load avg: 0.12, 0.08, 0.05`,
  }
}

// ── ls ────────────────────────────────────────────────────────
export function handleLs({ state, args }) {
  const target = args[0] ? resolvePath(state.cwd, args[0]) : state.cwd
  const node = FS[target]

  if (!node) {
    return { output: `ls: ${args[0] || '.'}: No such file or directory`, error: true }
  }
  if (node.type === 'file') {
    return { output: target.split('/').pop() }
  }

  // Format: directories in cyan, files plain
  const formatted = node.children
    .map((c) => {
      const isDir = c.endsWith('/') || FS[`${target}/${c.replace('/', '')}`]?.type === 'dir'
      return isDir ? `\x1b[36m${c}\x1b[0m` : c
    })
    .join('   ')

  return { output: formatted || '(empty)' }
}

// ── cd ────────────────────────────────────────────────────────
export function handleCd({ state, args }) {
  const target = resolvePath(state.cwd, args[0])

  if (target === '~' || FS[target]?.type === 'dir') {
    return { output: '', cwdUpdate: target }
  }
  return { output: `cd: ${args[0]}: No such directory`, error: true }
}

// ── cat ───────────────────────────────────────────────────────
export function handleCat({ state, args }) {
  if (!args[0]) return { output: 'Usage: cat <file>', error: true }

  const target = resolvePath(state.cwd, args[0])
  const node = FS[target]

  if (!node) return { output: `cat: ${args[0]}: No such file`, error: true }
  if (node.type === 'dir') return { output: `cat: ${args[0]}: Is a directory`, error: true }

  return { output: node.content }
}

// ── tree ──────────────────────────────────────────────────────
export function handleTree({ state }) {
  // Build a simple tree from the cwd
  const node = FS[state.cwd]
  if (!node || node.type !== 'dir') return { output: state.cwd }

  const lines = [state.cwd]
  const children = node.children
  children.forEach((c, i) => {
    const last    = i === children.length - 1
    const prefix  = last ? '└── ' : '├── '
    const child   = c.replace('/', '')
    const fullKey = `${state.cwd}/${child}`
    const childNode = FS[fullKey]

    lines.push(`${prefix}${c}`)

    if (childNode?.type === 'dir') {
      childNode.children?.forEach((gc, gi) => {
        const glast = gi === (childNode.children.length - 1)
        lines.push(`${last ? '    ' : '│   '}${glast ? '└── ' : '├── '}${gc}`)
      })
    }
  })

  return { output: lines.join('\n') }
}

// ── visualize ────────────────────────────────────────────────
export function handleVisualize({ args, flags }) {
  const mode = flags.skills    ? 'skills'
             : flags.projects  ? 'projects'
             : flags.matrix    ? 'matrix'
             : flags.off       ? 'off'
             : args[0]?.replace('--', '')

  if (!mode) {
    return {
      output: 'Usage: visualize --skills | --projects | --matrix | --off',
      error: true,
    }
  }

  const messages = {
    skills:   'Rendering skill tree…\n  Nodes: 12 skills | Edges: dependency graph | Colors: by category',
    projects: 'Rendering project network…\n  Nodes: 5 projects + skill nodes | Edges: usage graph',
    matrix:   "Entering the matrix.\n  Run 'visualize --off' to exit.",
    off:      'Visualizer cleared.',
  }

  return {
    output:  messages[mode] || `Unknown visualization mode: ${mode}`,
    vizMode: mode === 'off' ? 'idle' : mode,
  }
}

// ── inspect ───────────────────────────────────────────────────
export function handleInspect({ args }) {
  const mod = args[0]
  if (!mod) {
    return {
      output: `Usage: inspect <module>\nModules: ${Object.keys(SOURCE_MODULES).join(' | ')}`,
      error: true,
    }
  }

  const src = SOURCE_MODULES[mod]
  if (!src) {
    return {
      output: `inspect: module '${mod}' not found\nAvailable: ${Object.keys(SOURCE_MODULES).join(', ')}`,
      error: true,
    }
  }

  return {
    output: `Loaded ${mod} → Source pane updated.`,
    sourcePane: { title: `// ${mod}.js`, content: src, mode: 'code' },
  }
}

// ── view ─────────────────────────────────────────────────────
export function handleView({ state, args }) {
  const target = args[0] || 'state'

  const payloads = {
    skills: {
      title: '// kernel.state.skills',
      content: JSON.stringify(SKILLS, null, 2),
      mode: 'json',
    },
    projects: {
      title: '// kernel.state.projects',
      content: JSON.stringify(
        PROJECTS.map(({ id, name, year, status, skills }) => ({ id, name, year, status, skills })),
        null,
        2
      ),
      mode: 'json',
    },
    state: {
      title: '// kernel.state',
      content: JSON.stringify(
        {
          cwd:           state.cwd,
          visualization: state.viz,
          skills:        SKILLS.length,
          projects:      PROJECTS.length,
          uptime:        Math.floor((Date.now() - state.startTime) / 1000) + 's',
        },
        null,
        2
      ),
      mode: 'json',
    },
  }

  const pane = payloads[target]
  if (!pane) {
    return {
      output: `view: unknown target '${target}'\nTargets: skills | projects | state`,
      error: true,
    }
  }

  return { output: 'State dumped → Source pane updated.', sourcePane: pane }
}

// ── sudo ──────────────────────────────────────────────────────
const SUDO_MSGS = [
  'Nice try. The root password is hidden somewhere in this portfolio.',
  'Password: ██████████  [INCORRECT] — Hint: check ~/about.md',
  'sudo: command not found in this dimension',
  'Privilege escalation blocked. But you\'re already inside the kernel.',
]
export function handleSudo() {
  return {
    output: SUDO_MSGS[Math.floor(Math.random() * SUDO_MSGS.length)],
    error:  true,
  }
}

// ── hack ─────────────────────────────────────────────────────
export function handleHack() {
  // Returns a list of delayed lines for the terminal to drip-feed
  const lines = [
    'INITIATING HACK SEQUENCE...',
    '[>>>] Bypassing firewall...',
    '[>>>] Injecting payload...',
    '[>>>] Accessing mainframe...',
    '[>>>] Decrypting kernel...',
    '[>>>] ...',
    '[!!!] ACCESS GRANTED',
    '',
    "Just kidding. But 'visualize --matrix' is pretty close.",
  ]
  return {
    output:       lines[0],
    delayedLines: lines.slice(1).map((text, i) => ({ text, delay: 250 * (i + 1) })),
    vizMode:      'matrix',
    vizDelay:     250 * lines.length,
  }
}

// ── admin ────────────────────────────────────────────────────
export function handleAdmin({ state }) {
  if (state.viz === 'dashboard') {
    return {
      output: '[!] Imperial CMS is already active on the primary display.',
    }
  }
  return {
    output:  'Access granted. Spawning specialized Imperial CMS...',
    vizMode: 'dashboard',
  }
}

// ── sysinfo ──────────────────────────────────────────────────
export function handleSysInfo({ state }) {
  const art = `
       .
      / \\      RSP OS v2.4.1 (Imperial Edition)
     /   \\     --------------------------------
    /     \\    OS: Sovereign Kernel x86_64
   /-------\\   Host: Imperial Observatory v4
  /         \\  Uptime: ${Math.floor((Date.now() - state.startTime) / 60000)} mins
 /           \\ Visualizer: ${state.viz.toUpperCase()}
'             ' Shell: rsp-sh (zsh-compatible)
  `
  return { output: art }
}
