import { courseById, DueBadge } from './helpers'
import { useLang } from '../LangContext'

export default function TaskCard({ a, courses, onToggle, onOpen }) {
  const { t } = useLang()
  const c = courseById(courses, a.courseId)
  const color = c ? c.color : '#888'
  const done = a.status === 'done'
  return (
    <div className="task-card" style={{ borderLeftColor: color }}>
      <div
        className={`task-check ${done ? 'done' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(a.id)
        }}
      >
        {done ? '✓' : ''}
      </div>
      <div className="task-main" onClick={() => onOpen(a.id)}>
        <div className={`task-title ${done ? 'done' : ''}`}>{a.title}</div>
        <div className="task-meta">
          <span>
            <span className="task-course-dot" style={{ background: color }} /> {c ? c.name : '–'}
          </span>
          <span>{a.time || '23:59'}</span>
          {a.repeatGroup ? <span>{t('task.recurring')}</span> : null}
        </div>
      </div>
      <DueBadge a={a} t={t} />
      {a.status === 'doing' ? <span className="badge doing">{t('status.doing')}</span> : null}
      <span className={`badge ${a.priority}`}>{t(`priority.${a.priority}`)}</span>
    </div>
  )
}
