export const COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#64748b'
]

const SEASON_WORDS = {
  kevät: 'spring',
  kevat: 'spring',
  spring: 'spring',
  syksy: 'fall',
  fall: 'fall'
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfWeek(d) {
  const day = (d.getDay() + 6) % 7
  const res = new Date(d)
  res.setDate(d.getDate() - day)
  res.setHours(0, 0, 0, 0)
  return res
}

export function addDays(d, n) {
  const r = new Date(d)
  r.setDate(d.getDate() + n)
  return r
}

export function sameDay(a, b) {
  return toISODate(a) === toISODate(b)
}

export function isToday(d) {
  return sameDay(d, new Date())
}

export function termValue(seasonKey, year) {
  return `${seasonKey}:${year}`
}

export function parseTermValue(term) {
  if (!term) return null
  const canonical = /^(spring|fall):(\d{4})$/.exec(term)
  if (canonical) return { season: canonical[1], year: canonical[2] }
  const legacy = /^(\S+)\s+(\d{4})$/.exec(term.trim())
  if (legacy) {
    const season = SEASON_WORDS[legacy[1].toLowerCase()]
    if (season) return { season, year: legacy[2] }
  }
  return null
}

export function formatTerm(term, t) {
  const parsed = parseTermValue(term)
  return parsed ? `${t('season.' + parsed.season)} ${parsed.year}` : term || ''
}

export function currentSemester() {
  const now = new Date()
  const seasonKey = now.getMonth() <= 6 ? 'spring' : 'fall'
  return termValue(seasonKey, now.getFullYear())
}

export function semesterOptions() {
  const year = new Date().getFullYear()
  const opts = []
  for (let y = year - 1; y <= year + 2; y++) {
    opts.push(termValue('spring', y))
    opts.push(termValue('fall', y))
  }
  return opts
}
