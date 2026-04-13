// ─────────────────────────────────────────────────────────────
// visualizer/drawMatrix.js
// ─────────────────────────────────────────────────────────────

const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノ' +
  '0123456789ABCDEF<>{}[]|/\\'

export function initMatrix(W, H) {
  const cols  = Math.floor(W / 14)
  return Array.from({ length: cols }, () => (Math.random() * (H / 14)) | 0)
}

export function drawMatrix(ctx, W, H, drops) {
  // Fade trail
  ctx.fillStyle = 'rgba(3,4,7,0.1)'
  ctx.fillRect(0, 0, W, H)

  ctx.font = "14px 'Fira Code', monospace"

  drops.forEach((y, x) => {
    const ch     = CHARS[(Math.random() * CHARS.length) | 0]
    const bright = Math.random() > 0.95

    ctx.fillStyle = bright
      ? '#ffffff'
      : `rgba(0,240,255,${0.4 + Math.random() * 0.6})`

    ctx.fillText(ch, x * 14, y * 14)

    if (y * 14 > H && Math.random() > 0.975) drops[x] = 0
    else drops[x]++
  })
}
