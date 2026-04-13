// ─────────────────────────────────────────────────────────────
// kernel/data.js
// Your portfolio content lives here. Edit freely.
// ─────────────────────────────────────────────────────────────

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

export const PROJECTS = [
  {
    id: 'mock_alpha',
    name: 'Project Alpha (Mock)',
    year: 2026,
    status: 'active',
    skills: ['react', 'ts', 'css'],
    desc: 'An advanced web interface for a totally fictional startup. [REMINDER: THIS IS MOCK DATA]',
    url: 'https://example.com/alpha',
  },
  {
    id: 'mock_beta',
    name: 'Neural Net Beta (Mock)',
    year: 2025,
    status: 'archived',
    skills: ['python', 'ml', 'postgres'],
    desc: 'Deep learning pipeline for predictive analysis of made-up datasets. [REMINDER: THIS IS MOCK DATA]',
    url: 'https://example.com/beta',
  },
  {
    id: 'mock_gamma',
    name: 'Gamma Microservice (Mock)',
    year: 2024,
    status: 'maintenance',
    skills: ['rust', 'redis', 'docker'],
    desc: 'A blazing fast distributed system that technically does nothing. [REMINDER: THIS IS MOCK DATA]',
    url: 'https://example.com/gamma',
  }
]

let customProjects = []
try {
  const stored = localStorage.getItem('RSP_CUSTOM_PROJECTS')
  if (stored) {
    customProjects = JSON.parse(stored)
    PROJECTS.push(...customProjects)
  }
} catch (e) {
  console.warn('Failed to load custom projects', e)
}

export function addProject(p) {
  PROJECTS.push(p)
  customProjects.push(p)
  try {
    localStorage.setItem('RSP_CUSTOM_PROJECTS', JSON.stringify(customProjects))
  } catch (e) {
    console.error('Failed to save project', e)
  }
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
