import { MONTHS_BY_LANG } from '../i18n'
import { addDays, startOfWeek } from '../utils'
import DayDetail from './DayDetail'
import MonthGrid from './MonthGrid'
import WeekList from './WeekList'
import { useLang } from '../LangContext'

function weekLabel(d) {
  const s = startOfWeek(d)
  const e = addDays(s, 6)
  return `${s.getDate()}.${s.getMonth() + 1}. – ${e.getDate()}.${e.getMonth() + 1}.${e.getFullYear()}`
}

export default function CalendarView({
  state,
  calMode,
  cursor,
  selectedDate,
  showWelcome,
  onDismissWelcome,
  onAddCourse,
  onAddTask,
  onPrev,
  onNext,
  onToday,
  onSelectDay,
  onOpenAssignment,
  onToggle
}) {
  const { lang, t } = useLang()
  const months = MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.fi
  const label =
    calMode === 'month' ? `${months[cursor.getMonth()]} ${cursor.getFullYear()}` : weekLabel(cursor)

  return (
    <>
      {showWelcome && (
        <div className="welcome-card">
          <button
            className="welcome-close"
            onClick={onDismissWelcome}
            aria-label={t('welcome.closeAria')}
          >
            ✕
          </button>
          <div className="welcome-title">{t('welcome.title')}</div>
          <p className="welcome-lead">{t('welcome.lead')}</p>
          <ol className="welcome-steps">
            <li dangerouslySetInnerHTML={{ __html: t('welcome.step1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('welcome.step2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('welcome.step3') }} />
          </ol>
          <div className="welcome-actions">
            <button className="btn primary small" onClick={onAddCourse}>
              ＋ {t('welcome.addCourse')}
            </button>
            <button className="btn small" onClick={onAddTask}>
              ＋ {t('nav.addTask')}
            </button>
          </div>
        </div>
      )}
      <div className="cal-toolbar">
        <button
          className="btn small"
          onClick={onPrev}
          aria-label={t('cal.prev')}
          title={t('cal.prev')}
        >
          ‹
        </button>
        <button className="btn small" onClick={onToday}>
          {t('cal.today')}
        </button>
        <button
          className="btn small"
          onClick={onNext}
          aria-label={t('cal.next')}
          title={t('cal.next')}
        >
          ›
        </button>
        <span className="cal-title">{label}</span>
      </div>
      {calMode === 'month' ? (
        <div className="cal-layout">
          <aside className="day-detail">
            <DayDetail
              iso={selectedDate}
              state={state}
              onAdd={() => onOpenAssignment(null, selectedDate)}
              onOpen={onOpenAssignment}
              onToggle={onToggle}
            />
          </aside>
          <MonthGrid
            cursor={cursor}
            selectedDate={selectedDate}
            assignments={state.assignments}
            courses={state.courses}
            onSelect={onSelectDay}
            onOpen={onOpenAssignment}
          />
        </div>
      ) : (
        <WeekList cursor={cursor} state={state} onOpen={onOpenAssignment} onToggle={onToggle} />
      )}
    </>
  )
}
