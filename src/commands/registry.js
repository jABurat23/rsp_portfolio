// ─────────────────────────────────────────────────────────────
// commands/registry.js
// Central dispatch table: command name → handler function.
// Add new commands here.
// ─────────────────────────────────────────────────────────────

import * as h from './handlers.js'
import { parseCommand } from './parser.js'

export const REGISTRY = {
  help:      h.handleHelp,
  ls:        h.handleLs,
  cd:        h.handleCd,
  cat:       h.handleCat,
  pwd:       h.handlePwd,
  tree:      h.handleTree,
  echo:      h.handleEcho,
  uptime:    h.handleUptime,
  whoami:    h.handleWhoami,
  uname:     h.handleUname,
  clear:     h.handleClear,
  visualize: h.handleVisualize,
  vis:       h.handleVisualize,  // alias
  inspect:   h.handleInspect,
  view:      h.handleView,
  sudo:      h.handleSudo,
  hack:      h.handleHack,
  admin:     h.handleAdmin,
  sysinfo:   h.handleSysInfo,
}

// Tab-completable command list (exported for the Terminal component)
export const ALL_COMMANDS = Object.keys(REGISTRY)

/**
 * Execute a raw input string against the current kernel state.
 * Returns a result object (see handlers.js for shape).
 */
export function execute(rawInput, state) {
  const { name, args, flags } = parseCommand(rawInput)

  if (!name) return { output: '' }

  const handler = REGISTRY[name]
  if (!handler) {
    return {
      output: `rsp-sh: command not found: ${name}\nType 'help' for available commands.`,
      error: true,
    }
  }

  return handler({ state, args, flags })
}
