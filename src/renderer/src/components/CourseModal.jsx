import { COLORS, formatTerm, parseTermValue, semesterOptions, termValue } from '../utils'
import { useLang } from '../LangContext'

export default function CourseModal({ courseModal, setCourseModal, onSave, onDelete }) {
  const { t } = useLang()
  if (!courseModal) return null

  const opts = semesterOptions()
  const parsed = parseTermValue(courseModal.term)
  const normalized = parsed ? termValue(parsed.season, parsed.year) : courseModal.term
  if (normalized && !opts.includes(normalized)) opts.unshift(normalized)

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && setCourseModal(null)}
    >
      <div className="modal small" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{courseModal.isEdit ? t('modal.editCourse') : t('modal.newCourse')}</h2>
          <button
            className="icon-btn"
            onClick={() => setCourseModal(null)}
            aria-label={t('aria.close')}
          >
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={onSave}>
          <label className="field">
            <span>{t('course.nameLabel')}</span>
            <input
              required
              autoFocus
              value={courseModal.name}
              onChange={(e) => setCourseModal({ ...courseModal, name: e.target.value })}
              placeholder={t('course.namePlaceholder')}
            />
          </label>
          <label className="field">
            <span>{t('course.termLabel')}</span>
            <select
              value={normalized || courseModal.term}
              onChange={(e) => setCourseModal({ ...courseModal, term: e.target.value })}
            >
              {opts.map((o) => (
                <option key={o} value={o}>
                  {formatTerm(o, t)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('course.colorLabel')}</span>
            <div className="color-picker">
              {COLORS.map((col) => (
                <span
                  key={col}
                  className={`color-swatch ${courseModal.color === col ? 'selected' : ''}`}
                  style={{ background: col }}
                  onClick={() => setCourseModal({ ...courseModal, color: col })}
                />
              ))}
            </div>
          </label>
          <div className="modal-footer">
            {courseModal.isEdit && (
              <button type="button" className="btn ghost" onClick={onDelete}>
                {t('btn.delete')}
              </button>
            )}
            <div className="spacer" />
            <button type="button" className="btn" onClick={() => setCourseModal(null)}>
              {t('btn.cancel')}
            </button>
            <button type="submit" className="btn primary">
              {t('btn.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
