// ─────────────────────────────────────────────────────────────
// components/Dashboard.jsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { addProject } from '../kernel/data'

export default function Dashboard({ onStateChange }) {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    url: '',
    visibility: 'public',
    skills: ''
  })

  // Scanner state
  const [scanTarget, setScanTarget] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanOutput, setScanOutput] = useState([])

  const [alert, setAlert] = useState(null)

  const handleScan = async () => {
    if (!scanTarget) return;
    setScanning(true)
    setScanOutput(['[!] Initiating Deep-Scan sequence...'])
    
    setTimeout(() => {
      setScanOutput(prev => [...prev, `[ ] Resolving URI: ${scanTarget}`])
    }, 400)

    setTimeout(async () => {
      try {
        let extractedName = ''
        let extractedDesc = ''
        let extractedLang = ''

        if (scanTarget.includes('github.com')) {
          setScanOutput(prev => [...prev, `[ ] GitHub target detected. Initiating API breach...`])
          const parts = scanTarget.split('/')
          const repoIdx = parts.findIndex(p => p.includes('github.com'))
          if (repoIdx !== -1 && parts[repoIdx + 1] && parts[repoIdx + 2]) {
            const owner = parts[repoIdx + 1]
            const repo = parts[repoIdx + 2]
            
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
            if (res.ok) {
              const data = await res.json()
              extractedName = data.name || repo
              extractedDesc = data.description || ''
              extractedLang = (data.language || '').toLowerCase()
              setScanOutput(prev => [...prev, `[OK] Exfiltrated repo metadata successfully.`])
            } else {
              setScanOutput(prev => [...prev, `[WARN] Failed to bypass GitHub API. Using path.`])
              extractedName = repo
            }
          }
        } else {
          setScanOutput(prev => [...prev, `[ ] Local target detected. Accessing Node.js subsystem...`])
          const res = await fetch(`/api/scan?path=${encodeURIComponent(scanTarget)}`)
          if (res.ok) {
            const data = await res.json()
            extractedName = data.name
            extractedDesc = data.description
            extractedLang = data.skills
            setScanOutput(prev => [...prev, `[OK] Filesystem scan successful. Metadata extracted.`])
          } else {
            const errorData = await res.json()
            setScanOutput(prev => [...prev, `[ERR] Scanner failed: ${errorData.error || 'Access denied'}`])
            setScanning(false)
            return
          }
        }
        
        setTimeout(() => {
          setScanOutput(prev => [...prev, `[OK] Scan Complete. Pre-filling deployment form...`])
          
          setFormData(prev => ({
            ...prev,
            name: extractedName.replace(/-/g, ' '),
            desc: extractedDesc,
            url: scanTarget,
            skills: extractedLang
          }))

          setTimeout(() => {
            setScanning(false)
            setScanOutput([])
            setScanTarget('')
          }, 1500)

        }, 800)

      } catch (e) {
        setScanOutput(prev => [...prev, `[ERR] Scan protocol terminated unexpectedly.`])
        setTimeout(() => setScanning(false), 2000)
      }
    }, 1200)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Auto-generate an ID based on name
    const id = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') || ('proj_' + Date.now())
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    
    // Construct final description including mock/private tags if needed
    let finalDesc = formData.desc
    if (formData.visibility === 'private') {
      finalDesc += ' [SOURCE CODE IS PRIVATE]'
    }

    const newProject = {
      id,
      name: formData.name,
      year: new Date().getFullYear(),
      status: 'active',
      skills: skillsArray,
      desc: finalDesc,
      url: formData.visibility === 'private' ? 'private' : formData.url
    }

    addProject(newProject)
    setAlert(`Project '${formData.name}' successfully inserted into kernel memory.`)
    setFormData({ name: '', desc: '', url: '', visibility: 'public', skills: '' })
    
    setTimeout(() => {
      setAlert(null)
    }, 4000)
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: 24, boxSizing: 'border-box', pointerEvents: 'auto' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(3, 4, 7, 0.8)', padding: 32, border: '1px solid var(--panel-border)', borderRadius: 8, backdropFilter: 'blur(10px)' }}>
        <h2 style={{ fontSize: 24, color: 'var(--accent-gold)', marginBottom: 24, fontWeight: 'bold' }}>IMPERIAL CMS</h2>
        
        {/* TARGET SCANNER SECTION */}
        <div style={{ marginBottom: 32, padding: 16, background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <h3 style={{ fontSize: 14, color: 'var(--accent-cyan)', marginBottom: 12, textTransform: 'uppercase' }}>DEEP SYSTEM SCANNER</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <input 
              value={scanTarget}
              onChange={e => setScanTarget(e.target.value)}
              disabled={scanning}
              style={{ ...inputStyle, flex: 1 }} 
              placeholder="Enter GitHub URL or Local Path to auto-scan..."
            />
            <button 
              type="button"
              onClick={handleScan}
              disabled={scanning || !scanTarget}
              style={{ ...btnStyle, background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)', opacity: (scanning || !scanTarget) ? 0.5 : 1 }}
            >
              [ SCAN TARGET ]
            </button>
          </div>
          
          {scanOutput.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: '#000', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', position: 'relative', overflow: 'hidden' }}>
              {scanning && <ScannerTunnel />}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {scanOutput.map((out, i) => (
                  <div key={i} style={{ color: out.includes('[OK]') ? 'var(--accent-cyan)' : out.includes('[ERR]') ? 'red' : 'inherit' }}>
                    {out}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {alert && (
          <div style={{ padding: 12, border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', marginBottom: 24, background: 'rgba(0, 240, 255, 0.05)' }}>
            [ ✓ ] {alert}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>Project Name</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle} 
              placeholder="e.g. Apollo Engine"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>Description</label>
            <textarea 
              required
              rows={4}
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }} 
              placeholder="A high-performance quantum routing gateway..."
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>Source URL (Github/Local)</label>
              <input 
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                style={inputStyle} 
                placeholder="https://github.com/..."
                disabled={formData.visibility === 'private'}
              />
            </div>
            <div style={{ width: 140 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>Visibility</label>
              <select 
                value={formData.visibility}
                onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                style={inputStyle}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>Built With (comma separated skill IDs)</label>
            <input 
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              style={inputStyle} 
              placeholder="react, node, postgres"
            />
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button 
              type="submit"
              style={{ ...btnStyle, background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', flex: 1 }}
            >
              [+] DEPLOY TO KERNEL
            </button>
            <button 
              type="button"
              onClick={() => onStateChange({ viz: 'idle' })}
              style={{ ...btnStyle, background: 'rgba(3, 4, 7, 0.6)' }}
            >
              CLOSE CMS
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(3, 4, 7, 0.6)',
  border: '1px solid var(--panel-border)',
  color: 'var(--text-primary)',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none'
}

const btnStyle = {
  padding: '10px 24px',
  border: '1px solid var(--panel-border)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-ui)',
  fontWeight: 'bold',
  letterSpacing: 1,
  fontSize: 12,
  borderRadius: 4,
  transition: 'all 0.2s'
}

function ScannerTunnel() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 5 }}>
      <svg width="60" height="60" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="20 10" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent-cyan)" strokeWidth="4" strokeDasharray="40 20">
          <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="5" fill="var(--accent-cyan)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
