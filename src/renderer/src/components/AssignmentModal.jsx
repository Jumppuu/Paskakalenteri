import { useLang } from '../LangContext'

export default function AssignmentModal({
  assignmentModal,
  setAssignmentModal,
  sortedCourses,
  onSave,
  onDelete
}) {
  const { t } = useLang()
  if (!assignmentModal) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && setAssignmentModal(null)}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{assignmentModal.isEdit ? t('modal.editTask') : t('modal.newTask')}</h2>
          <button
            className="icon-btn"
            onClick={() => setAssignmentModal(null)}
            aria-label={t('aria.close')}
          >
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={onSave}>
          <label className="field">
            <span>{t('form.titleLabel')}</span>
            <input
              required
              autoFocus
              value={assignmentModal.title}
              onChange={(e) => setAssignmentModal({ ...assignmentModal, title: e.target.value })}
              placeholder={t('form.titlePlaceholder')}
            />
          </label>
          <label className="field">
            <span>{t('form.courseLabel')}</span>
            <select
              required
              value={assignmentModal.courseId}
              onChange={(e) => setAssignmentModal({ ...assignmentModal, courseId: e.target.value })}
            >
              {sortedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              <span>{t('form.dueDateLabel')}</span>
              <input
                type="date"
                required
                value={assignmentModal.date}
                onChange={(e) => setAssignmentModal({ ...assignmentModal, date: e.target.value })}
              />
            </label>
            <label className="field">
              <span>{t('form.timeLabel')}</span>
              <input
                type="time"
                value={assignmentModal.time}
                onChange={(e) => setAssignmentModal({ ...assignmentModal, time: e.target.value })}
              />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>{t('form.priorityLabel')}</span>
              <select
                value={assignmentModal.priority}
                onChange={(e) =>
                  setAssignmentModal({ ...assignmentModal, priority: e.target.value })
                }
              >
                <option value="low">{t('priority.low')}</option>
                <option value="normal">{t('priority.normal')}</option>
                <option value="high">{t('priority.high')}</option>
              </select>
            </label>
            <label className="field">
              <span>{t('form.statusLabel')}</span>
              <select
                value={assignmentModal.status}
                onChange={(e) => setAssignmentModal({ ...assignmentModal, status: e.target.value })}
              >
                <option value="todo">{t('status.todo')}</option>
                <option value="doing">{t('status.doing')}</option>
                <option value="done">{t('status.done')}</option>
              </select>
            </label>
          </div>
          {!assignmentModal.isEdit && (
            <>
              <label className="field">
                <span>{t('form.repeatLabel')}</span>
                <select
                  value={assignmentModal.repeat}
                  onChange={(e) =>
                    setAssignmentModal({ ...assignmentModal, repeat: e.target.value })
                  }
                >
                  <option value="none">{t('form.repeatNone')}</option>
                  <option value="weekly">{t('form.repeatWeekly')}</option>
                  <option value="biweekly">{t('form.repeatBiweekly')}</option>
                </select>
              </label>
              {assignmentModal.repeat !== 'none' && (
                <label className="field">
                  <span>{t('form.repeatCountLabel')}</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={assignmentModal.repeatCount}
                    onChange={(e) =>
                      setAssignmentModal({ ...assignmentModal, repeatCount: e.target.value })
                    }
                  />
                </label>
              )}
            </>
          )}
          <label className="field">
            <span>{t('form.descriptionLabel')}</span>
            <textarea
              rows="3"
              value={assignmentModal.description}
              onChange={(e) =>
                setAssignmentModal({ ...assignmentModal, description: e.target.value })
              }
              placeholder={t('form.descriptionPlaceholder')}
            />
          </label>
          <div className="modal-footer">
            {assignmentModal.isEdit && (
              <button type="button" className="btn ghost" onClick={onDelete}>
                {t('btn.delete')}
              </button>
            )}
            <div className="spacer" />
            <button type="button" className="btn" onClick={() => setAssignmentModal(null)}>
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
