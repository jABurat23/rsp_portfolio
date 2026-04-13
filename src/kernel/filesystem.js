// ─────────────────────────────────────────────────────────────
// kernel/filesystem.js
// Builds the virtual filesystem from portfolio data.
// ─────────────────────────────────────────────────────────────

import { SKILLS, PROJECTS, OWNER } from './data.js'

const bar = (pct) =>
  '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))

function skillsSection(cat) {
  return SKILLS.filter((s) => s.cat === cat)
    .map((s) => `  ${s.name.padEnd(24)} [${bar(s.level)}] ${s.level}%`)
    .join('\n')
}

function buildFilesystem() {
  const fs = {}

  // Root directories
  fs['~'] = { type: 'dir', children: ['skills/', 'projects/', 'about.md', 'contact.md'] }
  fs['~/skills'] = {
    type: 'dir',
    children: ['frontend.md', 'backend.md', 'data.md', 'devops.md', 'ai.md', 'languages.md'],
  }
  fs['~/projects'] = {
    type: 'dir',
    children: PROJECTS.map((p) => `${p.id}.md`),
  }

  // Skill files
  const skillCats = {
    'frontend.md':  { label: 'FRONTEND SKILLS',  cat: 'frontend'  },
    'backend.md':   { label: 'BACKEND SKILLS',   cat: 'backend'   },
    'data.md':      { label: 'DATA SKILLS',       cat: 'data'      },
    'devops.md':    { label: 'DEVOPS SKILLS',     cat: 'devops'    },
    'ai.md':        { label: 'AI / ML SKILLS',    cat: 'ai'        },
    'languages.md': { label: 'LANGUAGES',         cat: 'languages' },
  }
  for (const [file, { label, cat }] of Object.entries(skillCats)) {
    fs[`~/skills/${file}`] = {
      type: 'file',
      content: `${label}\n${'─'.repeat(44)}\n${skillsSection(cat)}`,
    }
  }

  // Project files
  PROJECTS.forEach((p) => {
    const stackLines = p.skills
      .map((sid) => {
        const s = SKILLS.find((sk) => sk.id === sid)
        return `    • ${s ? s.name : sid}`
      })
      .join('\n')

    fs[`~/projects/${p.id}.md`] = {
      type: 'file',
      content:
        `${p.name.toUpperCase()}\n${'─'.repeat(44)}\n` +
        `  Status : ${p.status.toUpperCase()}\n` +
        `  Year   : ${p.year}\n` +
        `  GitHub : ${p.url}\n\n` +
        `  ${p.desc}\n\n` +
        `  Stack:\n${stackLines}\n\n` +
        `  Run 'visualize --projects' to see skill connections.`,
    }
  })

  // Static files
  fs['~/about.md'] = {
    type: 'file',
    content:
      `ABOUT ME\n${'─'.repeat(44)}\n` +
      `  Name     : ${OWNER.name}\n` +
      `  Role     : ${OWNER.role}\n` +
      `  Location : ${OWNER.location}\n\n` +
      `  ${OWNER.bio.split('\n').join('\n  ')}`,
  }

  fs['~/contact.md'] = {
    type: 'file',
    content:
      `CONTACT\n${'─'.repeat(44)}\n` +
      `  Email    : ${OWNER.email}\n` +
      `  GitHub   : ${OWNER.github}\n` +
      `  Twitter  : ${OWNER.twitter}\n` +
      `  LinkedIn : ${OWNER.linkedin}\n\n` +
      `  Open to: Staff / Principal engineering roles,\n` +
      `           research collaborations, interesting problems.`,
  }

  return fs
}

export const FS = buildFilesystem()

// ─── Path utilities ───────────────────────────────────────────

export function normPath(p) {
  const parts = p.replace(/\/$/, '').split('/')
  const out = []
  for (const part of parts) {
    if (part === '..') out.pop()
    else if (part && part !== '.') out.push(part)
  }
  const result = out.join('/')
  return result.startsWith('~') ? result : result ? `~/${result}` : '~'
}

export function cdUp(cwd) {
  if (cwd === '~') return '~'
  return cwd.split('/').slice(0, -1).join('/') || '~'
}

export function resolvePath(cwd, target) {
  if (!target) return cwd
  if (target === '~') return '~'
  if (target === '..') return cdUp(cwd)
  if (target.startsWith('~')) return normPath(target)
  return normPath(`${cwd}/${target}`)
}
