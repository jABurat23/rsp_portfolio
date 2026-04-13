// ─────────────────────────────────────────────────────────────
// visualizer/drawLanding.js
// ─────────────────────────────────────────────────────────────

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export function drawLanding(ctx, W, H, t) {
  ctx.clearRect(0, 0, W, H)
  
  // Depth Nebula
  const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/1.5)
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.04)')
  grad.addColorStop(0.5, 'rgba(157, 78, 221, 0.03)')
  grad.addColorStop(1, 'rgba(3, 4, 7, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const cx = W / 2
  const cy = H / 2
  const baseR = Math.min(W, H) * 0.35

  const time = t * 0.0005

  // Draw background floating stardust
  for (let i = 0; i < 60; i++) {
    // stable pseudo-random orbit
    const angle = (i * 137.5) * (Math.PI / 180) + time * 0.2 * (i % 2 === 0 ? 1 : -1)
    const dist = baseR * 1.5 * ((i % 10) / 10 + 0.3)
    const px = cx + Math.cos(angle) * dist
    const py = cy + Math.sin(angle) * dist
    const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i)
    ctx.beginPath()
    ctx.arc(px, py, 1.5 * pulse, 0, Math.PI * 2)
    ctx.fillStyle = i % 3 === 0 ? `rgba(212,175,55,${0.3 * pulse})` : `rgba(0,240,255,${0.3 * pulse})`
    ctx.fill()
  }

  // Draw intersecting 3D Astrolabe Rings
  const numRings = 4
  for (let i = 0; i < numRings; i++) {
    ctx.save()
    ctx.translate(cx, cy)
    // Rotate canvas for ring axis
    ctx.rotate(time * 0.3 * (i % 2 === 0 ? 1 : -1) + (i * Math.PI / numRings))
    
    // Calculate simulated 3D tilt (squashing the Y axis)
    const tilt = 0.2 + 0.8 * Math.abs(Math.sin(time * 0.4 + i))
    ctx.scale(1, tilt)

    // Ring Base
    ctx.beginPath()
    ctx.arc(0, 0, baseR, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Ring Active Segment (Glow)
    const dashStart = time * (i + 1) % (Math.PI * 2)
    ctx.beginPath()
    ctx.arc(0, 0, baseR, dashStart, dashStart + Math.PI / 3)
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(0,240,255,0.4)' : 'rgba(212,175,55,0.4)'
    ctx.lineWidth = 2
    ctx.stroke()
    
    ctx.restore()
  }

  // Draw Geo-Core (Sacred Geometry Hexagon)
  ctx.save()
  ctx.translate(cx, cy)
  
  // Outer Hexagon
  ctx.rotate(time * -0.5)
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    const px = Math.cos(angle) * (baseR * 0.2)
    const py = Math.sin(angle) * (baseR * 0.2)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.strokeStyle = `rgba(0,240,255,0.6)`
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Inner Triangle
  ctx.rotate(time * 1.5)
  ctx.beginPath()
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3
    const px = Math.cos(angle) * (baseR * 0.15)
    const py = Math.sin(angle) * (baseR * 0.15)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.strokeStyle = `rgba(212,175,55,0.6)`
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // Pulsing center dot
  const centerPulse = 0.5 + 0.5 * Math.sin(time * 3)
  ctx.beginPath()
  ctx.arc(cx, cy, 3 + 2 * centerPulse, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${0.8 * centerPulse})`
  ctx.shadowBlur = 10
  ctx.shadowColor = '#00f0ff'
  ctx.fill()
  ctx.shadowBlur = 0
}
