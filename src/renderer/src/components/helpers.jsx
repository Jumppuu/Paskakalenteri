import { parseDate, sameDay, toISODate } from '../utils'

export function courseById(courses, id) {
  return courses.find((c) => c.id === id)
}

export function assignmentsOn(assignments, dateObj) {
  const iso = toISODate(dateObj)
  return assignments
    .filter((a) => a.date === iso)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
}

export function DueBadge({ a, t }) {
  if (a.status === 'done') return null
  const due = parseDate(a.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (due < today) return <span className="badge overdue">{t('badge.overdue')}</span>
  if (sameDay(due, today)) return <span className="badge today">{t('cal.today')}</span>
  return null
}
