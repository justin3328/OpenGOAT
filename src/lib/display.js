import chalk from 'chalk'
import boxen from 'boxen'

// ── COLOR SYSTEM ──────────────────────────────────────────────
export const C = {
  positive:  chalk.hex('#4ADE80'),   // earnings, complete
  negative:  chalk.hex('#F87171'),   // missed, error
  neutral:   chalk.hex('#E8A84A'),   // in-progress, warning
  accent:    chalk.hex('#E8F4E8'),   // active, selected
  dim:       chalk.hex('#5C5955'),   // metadata, timestamps
  ghost:     chalk.hex('#3E3C39'),   // dividers, disabled
  label:     chalk.hex('#9B9690'),   // section labels
  primary:   chalk.hex('#F5F3EF'),   // headlines, primary text
  mono:      chalk.hex('#E8F4E8'),   // data figures
}

// ── BLOOMBERG SECTION ANCHOR ──────────────────────────────────
// 9px equivalent — uppercase, letter-spaced, barely there
export const anchor = (text) =>
  C.ghost(text.toUpperCase())

// ── PROGRESS BAR ──────────────────────────────────────────────
export const bar = (percent, width = 12) => {
  const filled = Math.round((Math.min(percent, 100) / 100) * width)
  const empty = width - filled
  const color = percent >= 70 ? C.positive : percent >= 40 ? C.neutral : C.negative
  return color('█'.repeat(filled)) + C.ghost('░'.repeat(empty))
}

// ── CURRENCY ──────────────────────────────────────────────────
export const currency = (amount) => {
  const n = parseFloat(amount) || 0
  return C.mono(`$${n.toFixed(2)}`)
}

// ── DELTA ─────────────────────────────────────────────────────
export const delta = (pct) => {
  if (pct > 0)  return C.positive(`↑ ${pct.toFixed(1)}%`)
  if (pct < 0)  return C.negative(`↓ ${Math.abs(pct).toFixed(1)}%`)
  return C.ghost('─ 0%')
}

// ── SPARKLINE (inline 7-day bar) ──────────────────────────────
export const sparkline = (values, width = 7) => {
  if (!values.length) return C.ghost('▁▁▁▁▁▁▁')
  const max = Math.max(...values, 1)
  const blocks = ['▁','▂','▃','▄','▅','▆','▇','█']
  return values.slice(-width).map((v, i) => {
    const level = Math.round((v / max) * 7)
    const char = blocks[level]
    return i === values.slice(-width).length - 1 ? C.accent(char) : C.dim(char)
  }).join('')
}

// ── ASCII BAR CHART ───────────────────────────────────────────
export const barChart = (data, options = {}) => {
  // data: [{ label, value }]
  const { width = 30, title = '' } = options
  const max = Math.max(...data.map(d => d.value), 1)
  const lines = []
  if (title) lines.push(C.label(title.toUpperCase()) + '\n')
  data.forEach(({ label, value }) => {
    const filled = Math.round((value / max) * width)
    const barStr = C.positive('█'.repeat(filled)) + C.ghost('░'.repeat(width - filled))
    const lbl = label.padEnd(12).slice(0, 12)
    const val = currency(value)
    lines.push(`  ${C.dim(lbl)}  ${barStr}  ${val}`)
  })
  return lines.join('\n')
}

// ── OPERATOR SCORE CARD ───────────────────────────────────────
export const scoreCard = (scoreData) => {
  const {
    score, execution, consistency, capitalVelocity, reflection,
    streak, thisWeekEarnings, allTimeEarnings,
    completedMissions, totalMissions, goal, goalAmount
  } = scoreData

  const scoreColor = score >= 70 ? C.positive : score >= 40 ? C.neutral : C.negative
  const progress = goalAmount > 0 ? Math.round((allTimeEarnings / goalAmount) * 100) : 0

  const lines = [
    `  ${anchor('OPERATOR SCORE')}`,
    ``,
    `  ${scoreColor(`${score}`)}${C.ghost('/100')}   ${bar(score, 20)}`,
    ``,
    `  ${anchor('─────────────────────────────────────')}`,
    `  ${C.label('EXECUTION   ')}  ${bar(execution)}  ${C.mono(execution + '%')}`,
    `  ${C.label('CONSISTENCY ')}  ${bar(consistency)}  ${C.mono(consistency + '%')}`,
    `  ${C.label('CAP VELOCITY')}  ${bar(capitalVelocity)}  ${C.mono(capitalVelocity + '%')}`,
    `  ${C.label('REFLECTION  ')}  ${bar(reflection)}  ${C.mono(reflection + '%')}`,
    ``,
    `  ${anchor('─────────────────────────────────────')}`,
    `  ${C.label('STREAK      ')}  ${C.mono(streak + 'd')}`,
    `  ${C.label('THIS WEEK   ')}  ${currency(thisWeekEarnings)}`,
    `  ${C.label('ALL TIME    ')}  ${currency(allTimeEarnings)}`,
    `  ${C.label('MISSIONS    ')}  ${C.mono(completedMissions + '/' + totalMissions)}  this week`,
    ``,
    `  ${anchor('─────────────────────────────────────')}`,
    `  ${C.label('GOAL        ')}  ${C.dim(goal)}`,
    `  ${C.label('PROGRESS    ')}  ${bar(progress, 20)}  ${C.mono(progress + '%')}`,
    ``,
  ]

  return boxen(lines.join('\n'), {
    padding: { top: 0, bottom: 0, left: 1, right: 2 },
    borderStyle: 'round',
    borderColor: score >= 70 ? '#4ADE80' : score >= 40 ? '#E8A84A' : '#F87171',
    dimBorder: false,
  })
}

// ── STATUS TABLE ──────────────────────────────────────────────
export const table = (headers, rows) => {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i] || '').length)) + 2
  )
  const headerRow = headers.map((h, i) =>
    C.ghost(h.toUpperCase().padEnd(widths[i]))
  ).join('  ')
  const divider = C.ghost(widths.map(w => '─'.repeat(w)).join('  '))
  const dataRows = rows.map(row =>
    row.map((cell, i) => String(cell).padEnd(widths[i])).join('  ')
  )
  return [headerRow, divider, ...dataRows].join('\n')
}

// ── MISSION ITEM ──────────────────────────────────────────────
export const missionItem = (mission, num) => {
  const numStr = C.ghost(String(num).padStart(2, '0'))
  if (mission.status === 'complete') {
    return `  ${numStr}  ${C.positive('[✓]')}  ${C.dim(mission.title)}`
  }
  if (mission.status === 'missed') {
    return `  ${numStr}  ${C.negative('[✗]')}  ${C.negative(mission.title)}`
  }
  return `  ${numStr}  ${C.ghost('[ ]')}  ${C.primary(mission.title)}`
}

// ── INFO BOX ──────────────────────────────────────────────────
export const infoBox = (lines, color = '#E8F4E8') => boxen(
  lines.join('\n'),
  { padding: { top: 0, bottom: 0, left: 2, right: 2 }, borderStyle: 'round', borderColor: color }
)

// ── ERROR ─────────────────────────────────────────────────────
export const error = (msg) => console.log(C.negative(`✗ ${msg}`))
export const warn  = (msg) => console.log(C.neutral(`⚠ ${msg}`))
export const ok    = (msg) => console.log(C.positive(`✓ ${msg}`))
