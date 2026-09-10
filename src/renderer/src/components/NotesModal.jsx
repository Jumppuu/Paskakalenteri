import { useContext } from 'react'
import { X, Trash2, Save } from 'lucide-react'
import { COLORS } from '../utils'
import { LangContext } from '../LangContext'

export default function NotesModal({
  notesModal,
  setNotesModal,
  sortedCourses = [],
  onSave,
  onDelete
}) {
  const { t } = useContext(LangContext)

  if (!notesModal) return null

  const isEdit = !!notesModal.isEdit

  function update(field, value) {
    setNotesModal((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  function handleCourseChange(e) {
    const courseId = e.target.value
    const course = sortedCourses.find((c) => c.id === courseId)

    setNotesModal((prev) => ({
      ...prev,
      courseId,
      color: course?.color || COLORS[0]
    }))
  }

  const selectedCourse = sortedCourses.find((course) => course.id === notesModal.courseId)

  const noteColor = notesModal.color || selectedCourse?.color || COLORS[0]

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setNotesModal(null)
        }
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-modal-title"
        style={{
          borderTop: `4px solid ${noteColor}`
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="notes-modal-title">{isEdit ? t('notes.editNote') : t('notes.newNote')}</h2>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setNotesModal(null)}
            aria-label={t('notes.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave}>
          <div className="modal-body">
            {/* Title */}
            <div className="field">
              <label htmlFor="note-title">{t('notes.title')}</label>

              <input
                id="note-title"
                type="text"
                value={notesModal.title || ''}
                onChange={(e) => update('title', e.target.value)}
                placeholder={t('notes.titlePlaceholder')}
                autoFocus
                required
              />
            </div>

            {/* Course */}
            <div className="field">
              <label htmlFor="note-course">{t('notes.course')}</label>

              <select
                id="note-course"
                value={notesModal.courseId || ''}
                onChange={handleCourseChange}
              >
                <option value="">{t('notes.noCourse')}</option>

                {sortedCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              {/* Selected course indicator */}
              {selectedCourse && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: noteColor,
                      display: 'inline-block',
                      flexShrink: 0
                    }}
                  />

                  {selectedCourse.name}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="field">
              <label htmlFor="note-description">{t('notes.description')}</label>

              <textarea
                id="note-description"
                value={notesModal.description || ''}
                onChange={(e) => update('description', e.target.value)}
                placeholder={t('notes.descriptionPlaceholder')}
                rows={7}
              />
            </div>

            {/* Last saved */}
            {isEdit && notesModal.savedAt && (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}
              >
                {t('notes.lastSaved')}: {new Date(notesModal.savedAt).toLocaleString()}
              </div>
            )}

            {/* Footer */}
            <div className="modal-footer">
              {/* Delete */}
              {isEdit && (
                <button type="button" className="btn ghost" onClick={onDelete}>
                  <Trash2 size={16} />
                  {t('notes.delete')}
                </button>
              )}

              <div className="spacer" />

              {/* Cancel */}
              <button type="button" className="btn" onClick={() => setNotesModal(null)}>
                {t('notes.cancel')}
              </button>

              {/* Save */}
              <button type="submit" className="btn primary">
                <Save size={16} />

                {isEdit ? t('notes.saveChanges') : t('notes.save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
