import { WEEKDAYS_BY_LANG } from '../i18n'
import { addDays, isToday, startOfWeek, toISODate } from '../utils'
import { assignmentsOn, courseById } from './helpers'
import { useLang } from '../LangContext'

export default function MonthGrid({
  cursor,
  selectedDate,
  assignments,
  courses,
  onSelect,
  onOpen
}) {
  const { lang, t } = useLang()
  const weekdays = WEEKDAYS_BY_LANG[lang] || WEEKDAYS_BY_LANG.fi
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = startOfWeek(first)
  const month = cursor.getMonth()
  const cells = []
  for (let i = 0; i < 42; i++) {
    const day = addDays(gridStart, i)
    const events = assignmentsOn(assignments, day)
    const shown = events.slice(0, 3)
    const extra = events.length - shown.length
    cells.push(
      <div
        key={toISODate(day)}
        className={`cal-cell ${day.getMonth() !== month ? 'other-month' : ''} ${isToday(day) ? 'today' : ''} ${selectedDate === toISODate(day) ? 'selected' : ''}`}
        onClick={() => onSelect(toISODate(day))}
      >
        <span className="cal-daynum">{day.getDate()}</span>
        {shown.map((a) => {
          const c = courseById(courses, a.courseId)
          return (
            <div
              key={a.id}
              className={`cal-event ${a.status === 'done' ? 'done' : ''}`}
              style={{ background: c ? c.color : '#888' }}
              title={a.title}
              onClick={(e) => {
                e.stopPropagation()
                onOpen(a.id)
              }}
            >
              {a.title}
            </div>
          )
        })}
        {extra > 0 && <span className="cal-more">{t('cal.more', { n: extra })}</span>}
      </div>
    )
  }
  return (
    <div className="cal-grid">
      <div className="cal-weekdays">
        {weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="cal-days">{cells}</div>
    </div>
  )
}
