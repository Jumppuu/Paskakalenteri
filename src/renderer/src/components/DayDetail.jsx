import { WEEKDAYS_LONG_BY_LANG } from '../i18n'
import { isToday, parseDate } from '../utils'
import { assignmentsOn } from './helpers'
import TaskCard from './TaskCard'
import { useLang } from '../LangContext'

export default function DayDetail({ iso, state, onAdd, onOpen, onToggle }) {
  const { lang, t } = useLang()
  const weekdays = WEEKDAYS_LONG_BY_LANG[lang] || WEEKDAYS_LONG_BY_LANG.fi
  const d = parseDate(iso)
  const weekday = weekdays[(d.getDay() + 6) % 7]
  const events = assignmentsOn(state.assignments, d)
  return (
    <>
      <div className="day-detail-header">
        <div>
          <div className="day-detail-weekday">{weekday}</div>
          <div className="day-detail-date">
            {d.getDate()}.{d.getMonth() + 1}.{d.getFullYear()}
          </div>
        </div>
        {isToday(d) ? <span className="badge today">{t('cal.today')}</span> : null}
      </div>
      <button className="btn primary small day-add" onClick={onAdd}>
        ＋ {t('nav.addTask')}
      </button>
      {events.length ? (
        <div className="task-list">
          {events.map((a) => (
            <TaskCard
              key={a.id}
              a={a}
              courses={state.courses}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="day-empty">{t('day.empty')}</div>
      )}
    </>
  )
}
