// ─────────────────────────────────────────────────────────────
// commands/parser.js
// Tokenizes raw terminal input into a structured command object.
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} input  Raw string from the terminal prompt
 * @returns {{ name: string, args: string[], flags: Record<string,string|boolean> }}
 */
export function parseCommand(input) {
  const tokens = input.trim().split(/\s+/)
  const name   = tokens[0]?.toLowerCase() ?? ''
  const args   = []
  const flags  = {}

  for (let i = 1; i < tokens.length; i++) {
    const tok = tokens[i]
    if (tok.startsWith('--')) {
      const [key, val] = tok.slice(2).split('=')
      flags[key] = val ?? true
    } else if (tok.startsWith('-') && tok.length > 1) {
      // short flags like -a  →  flags.a = true
      for (const ch of tok.slice(1)) flags[ch] = true
    } else {
      args.push(tok)
    }
  }

  return { name, args, flags }
}
