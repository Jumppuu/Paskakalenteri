import { useMemo, useState } from 'react'
import { courseById } from './helpers'
import { useLang } from '../LangContext'

export const NotesView = ({ state, sortedCourses = [], onAdd, onOpen }) => {
  const { t, lang } = useLang()
  const [filterCourse, setFilterCourse] = useState('all')

  const allNotes = useMemo(
    () =>
      [...(state?.notes || [])].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', lang)
      ),
    [state?.notes, lang]
  )

  const notes =
    filterCourse === 'all' ? allNotes : allNotes.filter((n) => n.courseId === filterCourse)

  const formatSavedAt = (timestamp) => {
    if (!timestamp) return null

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fi-FI', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date)
  }

  return (
    <div className="notes-view">
      {!allNotes.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>

          <h2>{t('notes.emptyTitle')}</h2>

          <p>{t('notes.emptyLead')}</p>

          <button className="btn primary" onClick={onAdd}>
            ＋ {t('notes.addNote')}
          </button>
        </div>
      ) : (
        <>
          <div className="notes-header">
            <div>
              <h2>{t('nav.notes')}</h2>
              <p>
                {t(notes.length === 1 ? 'notes.countOne' : 'notes.countOther', {
                  count: notes.length
                })}
              </p>
            </div>
          </div>

          <div className="list-controls">
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              <option value="all">{t('notes.filterAllCourses')}</option>
              {sortedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {!notes.length ? (
            <div className="empty-state">{t('notes.emptyFiltered')}</div>
          ) : (
            <div className="notes-list">
              {notes.map((note) => {
                const course = courseById(state.courses, note.courseId)

                const color = note.color || course?.color || '#888'

                return (
                  <article
                    className="note-card"
                    key={note.id}
                    onClick={() => onOpen?.(note.id)}
                    style={{
                      cursor: onOpen ? 'pointer' : 'default',
                      borderLeft: `5px solid ${color}`
                    }}
                  >
                    <div className="note-card-content">
                      <div className="note-card-top">
                        <h3>{note.title || t('notes.untitled')}</h3>

                        {course && (
                          <span
                            className="note-course"
                            style={{
                              borderColor: color
                            }}
                          >
                            <span
                              style={{
                                width: '9px',
                                height: '9px',
                                borderRadius: '50%',
                                backgroundColor: color,
                                display: 'inline-block',
                                flexShrink: 0
                              }}
                            />

                            {' ' + course.name}
                          </span>
                        )}
                      </div>

                      {note.description ? (
                        <p>{note.description}</p>
                      ) : (
                        <p className="note-empty">{t('notes.emptyContent')}</p>
                      )}

                      <div className="note-meta">
                        {note.savedAt && (
                          <span>
                            {t('notes.modified')}: {formatSavedAt(note.savedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
