import { courseById } from './helpers'

export const NotesView = ({ state, onAdd, onOpen }) => {
  const notes = [...(state?.notes || [])].sort((a, b) =>
    (a.title || '').localeCompare(b.title || '')
  )

  const formatSavedAt = (timestamp) => {
    if (!timestamp) return null

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat('fi-FI', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date)
  }

  return (
    <div className="notes-view">
      {!notes.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>

          <h2>Ei muistiinpanoja vielä</h2>

          <p>Muistiinpanosi näkyvät täällä, kun lisäät niitä.</p>

          <button className="btn primary" onClick={onAdd}>
            ＋ Lisää muistiinpano
          </button>
        </div>
      ) : (
        <>
          <div className="notes-header">
            <div>
              <h2>Muistiinpanot</h2>
              <p>
                {notes.length} {notes.length === 1 ? 'muistiinpano' : 'muistiinpanoa'}
              </p>
            </div>

            <button className="btn primary small" onClick={onAdd}>
              ＋ Lisää muistiinpano
            </button>
          </div>
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
                      <h3>{note.title || 'Nimetön muistiinpano'}</h3>

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
                      <p className="note-empty">Ei sisältöä</p>
                    )}

                    <div className="note-meta">
                      {note.savedAt && <span>Muokattu: {formatSavedAt(note.savedAt)}</span>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
