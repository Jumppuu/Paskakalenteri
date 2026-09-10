import { addDays, parseDate, sameDay } from '../utils'
import TaskCard from './TaskCard'
import { useLang } from '../LangContext'

export default function TasksView({
  state,
  sortedCourses,
  filterCourse,
  filterStatus,
  setFilterCourse,
  setFilterStatus,
  onOpen,
  onToggle,
  onAdd
}) {
  const { t } = useLang()
  let items = [...state.assignments]
  if (filterCourse !== 'all') items = items.filter((a) => a.courseId === filterCourse)
  if (filterStatus !== 'all') items = items.filter((a) => a.status === filterStatus)
  items.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekEnd = addDays(today, 7)
  const groups = { overdue: [], today: [], week: [], later: [], done: [] }
  for (const a of items) {
    if (a.status === 'done') {
      groups.done.push(a)
      continue
    }
    const due = parseDate(a.date)
    if (due < today) groups.overdue.push(a)
    else if (sameDay(due, today)) groups.today.push(a)
    else if (due <= weekEnd) groups.week.push(a)
    else groups.later.push(a)
  }
  const titles = {
    overdue: t('group.overdue'),
    today: t('group.today'),
    week: t('group.week'),
    later: t('group.later'),
    done: t('group.done')
  }

  return (
    <>
      <div className="list-controls">
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
          <option value="all">{t('tasks.filterAllCourses')}</option>
          {sortedCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">{t('tasks.filterAllStatuses')}</option>
          <option value="todo">{t('status.todo')}</option>
          <option value="doing">{t('status.doing')}</option>
          <option value="done">{t('status.done')}</option>
        </select>
      </div>
      {!items.length ? (
        !state.assignments.length ? (
          <div className="empty-state">
            {t('tasks.emptyNone')}
            <div className="empty-actions">
              <button className="btn primary small" onClick={onAdd}>
                ＋ {t('nav.addTask')}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">{t('tasks.emptyFiltered')}</div>
        )
      ) : (
        Object.keys(groups).map((key) =>
          groups[key].length ? (
            <div className="task-group" key={key}>
              <div className="task-group-title">
                {titles[key]} ({groups[key].length})
              </div>
              <div className="task-list">
                {groups[key].map((a) => (
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
          ) : null
        )
      )}
    </>
  )
}
