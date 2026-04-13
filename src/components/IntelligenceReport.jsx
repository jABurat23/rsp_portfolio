// ─────────────────────────────────────────────────────────────
// components/IntelligenceReport.jsx
// ─────────────────────────────────────────────────────────────

import React from 'react'

export default function IntelligenceReport({ data }) {
  const isProject = !!data.status
  const accent = isProject ? 'var(--accent-cyan)' : 'var(--accent-gold)'

  return (
    <div style={{ color: 'var(--text-primary)', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', color: accent, margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>
            {data.name.toUpperCase()}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            ID: {data.id} {isProject ? `· ${data.year}` : ''}
          </div>
        </div>
        <div style={{ 
          padding: '4px 12px', 
          border: `1px solid ${accent}`, 
          borderRadius: '4px',
          fontSize: '10px',
          color: accent,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          letterSpacing: '1px',
          background: `${accent}11`
        }}>
          {isProject ? data.status : `LEVEL ${data.level}`}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Profile Analytics
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            {data.desc || `Core competency in ${data.name}. Integrated into system architecture with high stability.`}
          </p>
        </div>
        
        {!isProject && (
          <div style={{ width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={accent}
                  strokeWidth="2"
                  strokeDasharray={`${data.level}, 100`}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '14px', fontWeight: 'bold', color: accent }}>
                {data.level}%
              </div>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>EFFICIENCY</div>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
          {isProject ? 'Integrated Logic Tags' : 'Dependency Network'}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(isProject ? data.skills : (data.deps || [])).map(tag => (
            <span key={tag} style={{ 
              padding: '4px 10px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '2px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)'
            }}>
              {tag}
            </span>
          ))}
          {(!isProject && (!data.deps || data.deps.length === 0)) && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No external dependencies.</span>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '6px', height: '6px', background: accent, borderRadius: '50%', boxShadow: `0 0 10px ${accent}` }}></div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>
            {isProject 
              ? `LOG LINEAGE: ${data.source_origin || 'LOCAL SYSTEM ARCHIVE [DEFAULT]'}` 
              : 'SKILL MATRICES AUTHENTICATED // SOURCE: KERNEL-STATIC'}
          </div>
        </div>
      </div>
    </div>
  )
}
