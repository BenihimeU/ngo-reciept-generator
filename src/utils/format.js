export const money = value => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value || 0))

export function financialYear(date) {
  if (!date) return '—'
  const [year, month] = date.split('-').map(Number)
  const start = month < 4 ? year - 1 : year
  return `${start}–${String(start + 1).slice(-2)}`
}

export const dateLabel = date => date
  ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  : '—'
