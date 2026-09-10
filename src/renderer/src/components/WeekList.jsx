import { WEEKDAYS_BY_LANG } from '../i18n'
import { addDays, isToday, startOfWeek, toISODate } from '../utils'
import { assignmentsOn } from './helpers'
import TaskCard from './TaskCard'
import { useLang } from '../LangContext'

export default function WeekList({ cursor, state, onOpen, onToggle }) {
  const { lang, t } = useLang()
  const weekdays = WEEKDAYS_BY_LANG[lang] || WEEKDAYS_BY_LANG.fi
  const s = startOfWeek(cursor)
  return (
    <div className="week-list">
      {Array.from({ length: 7 }, (_, i) => {
        const day = addDays(s, i)
        const events = assignmentsOn(state.assignments, day)
        return (
          <div className={`week-day ${isToday(day) ? 'today' : ''}`} key={toISODate(day)}>
            <div className="week-day-header">
              <div className="week-day-label">
                <span className="week-day-name">{weekdays[i].toUpperCase()}</span>
                <span className="week-day-date">
                  {day.getDate()}.{day.getMonth() + 1}.
                </span>
              </div>
              <button
                className="week-add"
                onClick={() => onOpen(null, toISODate(day))}
                aria-label={t('nav.addTask')}
                title={t('nav.addTask')}
              >
                ＋
              </button>
            </div>
            <div className="week-day-body">
              {events
                .slice()
                .sort((a, b) => {
                  const toMinutes = (t) => {
                    if (!t) return Number.POSITIVE_INFINITY
                    const [h, m] = String(t).split(':').map(Number)
                    if (Number.isNaN(h)) return Number.POSITIVE_INFINITY
                    return h * 60 + (Number.isNaN(m) ? 0 : m)
                  }
                  return toMinutes(a.time) - toMinutes(b.time)
                })
                .map((a) => (
                  <TaskCard
                    key={a.id}
                    a={a}
                    courses={state.courses}
                    onToggle={onToggle}
                    onOpen={onOpen}
                  />
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
