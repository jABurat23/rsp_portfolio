// ─────────────────────────────────────────────────────────────
// kernel/hoq-client.js
// Communicates with the House of Qui backend API.
// Uses Vite's dev proxy (/hoq-api → localhost:4000) in dev.
// In production (Vercel), /hoq-api has no target → returns null
// and the app falls back to static mock data gracefully.
// ─────────────────────────────────────────────────────────────

const HOQ_BASE = '/hoq-api'
const TIMEOUT_MS = 3000 // Give up quickly if HoQ is offline

async function hoqFetch(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${HOQ_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.json()
  } catch {
    clearTimeout(timer)
    return null // HoQ offline or unreachable
  }
}

/**
 * Fetch all Imperial Projects from House of Qui.
 * Returns null if HoQ is unreachable (triggers fallback to static data).
 */
export async function fetchHoqProjects() {
  const data = await hoqFetch('/monarch/projects')
  if (!data || !Array.isArray(data)) return null

  // Map HoQ ImperialProject shape → RSP Portfolio project shape
  return data.map((p) => ({
    id:     p.id,
    name:   p.name,
    year:   new Date(p.createdAt).getFullYear(),
    status: mapStatus(p.status),
    skills: [],          // HoQ doesn't store skills yet — CMS can add them
    desc:   p.description,
    url:    p.isShadow ? 'private' : (p.publicKey || ''),
    source: 'hoq',       // tag so we know it came from the live system
  }))
}

/**
 * Create a new project in House of Qui via the Monarch endpoint.
 * Requires authentication — will return null if unauthenticated.
 */
export async function createHoqProject({ name, description, signature }) {
  return hoqFetch('/monarch/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description, signature }),
  })
}

/** Map HoQ ProjectStatus enum → RSP status string */
function mapStatus(s) {
  if (s === 'active')      return 'active'
  if (s === 'maintenance') return 'active'
  if (s === 'suspended')   return 'archived'
  return 'active'
}

/**
 * Quick connectivity check — tells callers if HoQ is live.
 */
export async function isHoqOnline() {
  const data = await hoqFetch('/monarch/projects')
  return data !== null
}
