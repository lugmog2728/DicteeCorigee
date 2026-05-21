import { CATEGORIES } from '../../constants'
import type { CategoryKey } from '../../constants'
import type { DicteeApi } from '../../../../api/dictees'

export interface ExportParams {
  dictee: DicteeApi
  studentName: string
  counts: Record<CategoryKey, number>
  today: string
}

const SEGS = [
  { a: 180, b: 216, c: '#ef4444' }, { a: 216, b: 252, c: '#f97316' },
  { a: 252, b: 288, c: '#eab308' }, { a: 288, b: 324, c: '#84cc16' },
  { a: 324, b: 360, c: '#22c55e' },
] as const

const CX = 160, CY = 160, R_OUTER = 120, R_INNER = 85

function toXY(r: number, angleDeg: number) {
  const rad = angleDeg * Math.PI / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function svgArc(r: number, start: number, end: number) {
  const sp = toXY(r, start), ep = toXY(r, end)
  return `M ${sp.x.toFixed(2)} ${sp.y.toFixed(2)} A ${r} ${r} 0 ${end - start <= 180 ? 0 : 1} 1 ${ep.x.toFixed(2)} ${ep.y.toFixed(2)}`
}

export function speedometerSvg(done: number, total: number): string {
  const percent = total <= 0 ? 0 : Math.min(100, Math.max(0, (done / total) * 100))
  const needle = toXY(R_INNER, 180 + (percent / 100) * 180)
  const segsHtml = SEGS.map(s =>
    `<path d="${svgArc(R_OUTER, s.a, s.b)}" stroke="${s.c}" stroke-width="18" fill="none" stroke-linecap="butt"/>`
  ).join('')
  const labelsHtml = ['0%', '20%', '40%', '60%', '80%', '100%'].map((lbl, i) => {
    const p = toXY(R_OUTER + 20, 180 + i * 36)
    return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" font-size="11" text-anchor="middle" fill="#666">${lbl}</text>`
  }).join('')
  const ticksHtml = total > 0
    ? Array.from({ length: total + 1 }).map((_, i) => {
        const p = toXY(R_INNER - 20, 180 + (i * 180) / total)
        return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" font-size="14" text-anchor="middle" fill="#111">${i}</text>`
      }).join('')
    : ''
  return `<svg width="340" height="200" viewBox="0 0 340 200">
    ${segsHtml}
    ${labelsHtml}
    <path d="${svgArc(R_INNER, 180, 360)}" stroke="#e5e7eb" stroke-width="10" fill="none"/>
    ${ticksHtml}
    <line x1="${CX}" y1="${CY}" x2="${needle.x.toFixed(2)}" y2="${needle.y.toFixed(2)}" stroke="#111" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${CX}" cy="${CY}" r="6" fill="#111"/>
    <text x="${CX}" y="${CY + 12}" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">${done}/${total}</text>
    <text x="${CX}" y="${CY + 34}" text-anchor="middle" font-size="13" fill="#555">${percent.toFixed(0)}%</text>
  </svg>`
}

export function speedometerToDataUrl(done: number, total: number): string {
  const scale = 3
  const canvas = document.createElement('canvas')
  canvas.width = 340 * scale
  canvas.height = 200 * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  const percent = total <= 0 ? 0 : Math.min(100, Math.max(0, (done / total) * 100))
  const deg = (d: number) => d * Math.PI / 180

  for (const s of SEGS) {
    ctx.beginPath(); ctx.arc(CX, CY, R_OUTER, deg(s.a), deg(s.b))
    ctx.strokeStyle = s.c; ctx.lineWidth = 18; ctx.lineCap = 'butt'; ctx.stroke()
  }

  ctx.beginPath(); ctx.arc(CX, CY, R_INNER, deg(180), deg(360))
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 10; ctx.stroke()

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillStyle = '#666'; ctx.font = '11px system-ui'
  ;['0%', '20%', '40%', '60%', '80%', '100%'].forEach((lbl, i) => {
    const a = deg(180 + i * 36)
    ctx.fillText(lbl, CX + (R_OUTER + 20) * Math.cos(a), CY + (R_OUTER + 20) * Math.sin(a))
  })

  if (total > 0) {
    ctx.fillStyle = '#111'; ctx.font = '14px system-ui'
    for (let i = 0; i <= total; i++) {
      const a = deg(180 + (i * 180) / total)
      ctx.fillText(String(i), CX + (R_INNER - 20) * Math.cos(a), CY + (R_INNER - 20) * Math.sin(a))
    }
  }

  const na = deg(180 + (percent / 100) * 180)
  ctx.beginPath(); ctx.moveTo(CX, CY)
  ctx.lineTo(CX + R_INNER * Math.cos(na), CY + R_INNER * Math.sin(na))
  ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke()

  ctx.beginPath(); ctx.arc(CX, CY, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#111'; ctx.fill()

  ctx.fillStyle = '#111'; ctx.font = 'bold 24px system-ui'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(`${done}/${total}`, CX, CY + 10)
  ctx.fillStyle = '#555'; ctx.font = '13px system-ui'
  ctx.fillText(`${percent.toFixed(0)}%`, CX, CY + 34)

  return canvas.toDataURL('image/png')
}

function getActiveCats(dictee: DicteeApi) {
  return CATEGORIES.filter(cat => {
    if (cat.key === 'nonPresent' || cat.key === 'son') return false
    return cat.key === 'orthographe' || (dictee.errors[cat.key as keyof typeof dictee.errors] ?? 0) > 0
  })
}

export async function savePdf({ dictee, studentName, counts, today }: ExportParams) {
  const { jsPDF } = await import('jspdf')
  const wordCount = dictee.texte.split(/\s+/).filter(Boolean).length
  const activeCats = getActiveCats(dictee)

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const margin = 20, gap = 8, cols = 4
  const cardW = (pageW - 2 * margin - (cols - 1) * gap) / cols
  const svgH = cardW * (200 / 340)
  const labelH = 16
  const cardH = svgH + labelH + 6

  let y = margin
  if (studentName) {
    pdf.setFontSize(13); pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#101828')
    pdf.text(studentName, margin, y + 10); y += 15
  }
  pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#6a7282')
  pdf.text(`${dictee.titre} · ${today}`, margin, y + 8); y += 16

  for (let i = 0; i < activeCats.length; i++) {
    const cat = activeCats[i]
    const col = i % cols
    const x = margin + col * (cardW + gap)
    const count = counts[cat.key] ?? 0
    const expected = cat.key === 'orthographe' ? wordCount : (dictee.errors[cat.key as keyof typeof dictee.errors] ?? 0)
    const done = Math.max(0, expected - count)

    pdf.setDrawColor('#e5e7eb'); pdf.setLineWidth(0.5)
    pdf.roundedRect(x, y, cardW, cardH, 3, 3)

    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#101828')
    pdf.text(cat.label, x + cardW / 2, y + 10, { align: 'center' })

    pdf.addImage(speedometerToDataUrl(done, expected), 'PNG', x + 2, y + labelH, cardW - 4, svgH)

    if (col === cols - 1 && i < activeCats.length - 1) y += cardH + gap
  }

  pdf.save(`${studentName || dictee.titre} - Résultats.pdf`)
}

export function printResults({ dictee, studentName, counts, today }: ExportParams) {
  const wordCount = dictee.texte.split(/\s+/).filter(Boolean).length
  const activeCats = CATEGORIES.filter(cat => {
    if (cat.key === 'nonPresent' || cat.key === 'son') return false
    const isNeutralized = cat.key !== 'orthographe' && (dictee.errors[cat.key as keyof typeof dictee.errors] ?? 0) === 0
    return !isNeutralized
  })
  const cards = activeCats.map(cat => {
    const count = counts[cat.key] ?? 0
    const expected = cat.key === 'orthographe' ? wordCount : (dictee.errors[cat.key as keyof typeof dictee.errors] ?? 0)
    const done = Math.max(0, expected - count)
    return `<div class="card"><p class="label">${cat.label}</p>${speedometerSvg(done, expected)}</div>`
  }).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>${studentName || dictee.titre}</title>
    <style>
      @page{margin:0}
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:system-ui,sans-serif;padding:20px}
      header{margin-bottom:14px}
      h2{font-size:15px;font-weight:700;color:#101828}
      .meta{font-size:11px;color:#6a7282;margin-top:2px}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .card{border:1px solid #e5e7eb;border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:2px}
      .label{font-size:12px;font-weight:600;color:#101828;text-align:center}
      svg{width:100%;height:auto}
    </style></head><body>
    <header>
      ${studentName ? `<h2>${studentName}</h2>` : ''}
      <p class="meta">${dictee.titre} · ${today}</p>
    </header>
    <div class="grid">${cards}</div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
    </body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  window.open(URL.createObjectURL(blob), '_blank')
}
