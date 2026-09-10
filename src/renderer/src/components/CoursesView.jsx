import { formatTerm } from '../utils'
import { useLang } from '../LangContext'

export default function CoursesView({ state, sortedCourses, onOpen, onAdd }) {
  const { t } = useLang()
  if (!state.courses.length) {
    return (
      <div className="empty-state">
        {t('courses.emptyState')}
        <div className="empty-actions">
          <button className="btn primary small" onClick={onAdd}>
            ＋ {t('courses.addCourse')}
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="courses-grid">
      {sortedCourses.map((c) => {
        const count = state.assignments.filter((a) => a.courseId === c.id).length
        const openCount = state.assignments.filter(
          (a) => a.courseId === c.id && a.status !== 'done'
        ).length
        return (
          <div
            key={c.id}
            className="course-card"
            style={{ borderLeftColor: c.color }}
            // onClick={() => onOpen(c.id)}
          >
            <div className="course-name">{c.name}</div>
            <div className="course-term">{formatTerm(c.term, t)}</div>
            <div className="course-count">
              {t('course.stats', { open: openCount, total: count })}
            </div>
            <button
              onClick={() => onOpen(c.id)}
            >
              Edit
            </button>
            <button
              onClick={() => onOpen(c.id)}
            >
              Edit
            </button>
          </div>
        )
      })}
    </div>
  )
}
