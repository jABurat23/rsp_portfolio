// ─────────────────────────────────────────────────────────────
// kernel/data.js
// Your portfolio content lives here. Edit freely.
//
// Data priority:
//   1. House of Qui API (live, when running locally)
//   2. localStorage custom projects (CMS additions)
//   3. Static mock data (fallback / production)
// ─────────────────────────────────────────────────────────────

import { fetchHoqProjects } from './hoq-client.js'

export const SKILLS = [
  { id: 'react',    name: 'React / Next.js',     level: 90, cat: 'frontend',  deps: ['ts', 'css'] },
  { id: 'ts',       name: 'TypeScript',           level: 88, cat: 'languages', deps: [] },
  { id: 'css',      name: 'CSS / Design Systems', level: 85, cat: 'frontend',  deps: [] },
  { id: 'node',     name: 'Node.js',              level: 82, cat: 'backend',   deps: ['ts'] },
  { id: 'python',   name: 'Python',               level: 78, cat: 'languages', deps: [] },
  { id: 'rust',     name: 'Rust',                 level: 60, cat: 'languages', deps: [] },
  { id: 'postgres', name: 'PostgreSQL',           level: 75, cat: 'data',      deps: [] },
  { id: 'redis',    name: 'Redis',                level: 70, cat: 'data',      deps: [] },
  { id: 'docker',   name: 'Docker / K8s',         level: 72, cat: 'devops',    deps: [] },
  { id: 'ml',       name: 'ML / PyTorch',         level: 65, cat: 'ai',        deps: ['python'] },
  { id: 'webgl',    name: 'WebGL / Three.js',     level: 68, cat: 'frontend',  deps: ['ts'] },
  { id: 'graphql',  name: 'GraphQL',              level: 73, cat: 'backend',   deps: ['node'] },
]

// Sovereign Default Archive — used as fallback on Vercel or when HoQ is offline
const DEFAULT_ARCHIVE = [
  {
    id: 'sov_core',
    name: 'Sovereign Core Architecture',
    year: 2026,
    status: 'active',
    skills: ['react', 'ts', 'node'],
    desc: 'The fundamental architectural framework for the House of Qui ecosystem. Implements recursive state management and high-fidelity UI rendering.',
    url: 'https://github.com/jABurat23/house-of-qui',
    source: 'archive'
  },
  {
    id: 'astral_intel',
    name: 'Astral Intelligence Engine',
    year: 2025,
    status: 'active',
    skills: ['python', 'ml', 'postgres'],
    desc: 'A specialized intelligence layer for predictive topology analysis. Processes imperial telemetry data to visualize system-wide neural connections.',
    url: 'private',
    source: 'archive'
  },
  {
    id: 'chronicle_sync',
    name: 'Chronicle Synchronization Node',
    year: 2024,
    status: 'maintenance',
    skills: ['rust', 'redis', 'docker'],
    desc: 'High-throughput data preservation unit designed for the Imperial Observatory. Ensures zero-loss synchronization of audit logs across distributed sectors.',
    url: 'https://github.com/jABurat23/rsp_portfolio',
    source: 'archive'
  },
]

// Live project array — populated by initData() below
export let PROJECTS = [...DEFAULT_ARCHIVE]

// Track whether we're connected to HoQ
export let HOQ_CONNECTED = false

// localStorage custom projects (CMS additions made while HoQ is offline)
let customProjects = []
try {
  const stored = localStorage.getItem('RSP_CUSTOM_PROJECTS')
  if (stored) customProjects = JSON.parse(stored)
} catch (e) {
  console.warn('Failed to load custom projects from localStorage', e)
}

/**
 * Called once at app boot (from App.jsx useEffect).
 * Tries to load projects from House of Qui; falls back to statics + localStorage.
 */
export async function initData() {
  const hoqProjects = await fetchHoqProjects()

  if (hoqProjects && hoqProjects.length > 0) {
    // ✅ HoQ is online — use live data + merge any local CMS additions
    PROJECTS.length = 0
    // Mark HoQ projects with live source
    const live = hoqProjects.map(p => ({ ...p, source_origin: 'HOUSE OF QUI [LIVE]' }))
    PROJECTS.push(...live, ...customProjects)
    HOQ_CONNECTED = true
    console.info(`[RSP] HoQ online — loaded ${hoqProjects.length} live projects.`)
  } else {
    // ⚠️  HoQ offline / production — use archive + localStorage
    PROJECTS.length = 0
    PROJECTS.push(...DEFAULT_ARCHIVE, ...customProjects)
    HOQ_CONNECTED = false
    console.info('[RSP] HoQ offline — using local archive fallback data.')
  }
}

/**
 * Add a project. Writes to HoQ if connected, otherwise persists to localStorage.
 */
export function addProject(p) {
  PROJECTS.push(p)
  if (!HOQ_CONNECTED) {
    // Offline mode — persist locally
    customProjects.push(p)
    try {
      localStorage.setItem('RSP_CUSTOM_PROJECTS', JSON.stringify(customProjects))
    } catch (e) {
      console.error('Failed to save project locally', e)
    }
  }
  // If HoQ is connected, Dashboard.jsx handles the POST directly via hoq-client
}

export const OWNER = {
  name: 'Alex Recursive',
  role: 'Full-Stack Systems Engineer',
  location: 'Distributed (UTC±0)',
  email: 'alex@recursive.dev',
  github: 'github.com/user',
  twitter: '@alexrecursive',
  linkedin: 'linkedin.com/in/alexrecursive',
  bio: 'I build software that interrogates its own structure.\nThis portfolio is a live demonstration of that philosophy.',
}
