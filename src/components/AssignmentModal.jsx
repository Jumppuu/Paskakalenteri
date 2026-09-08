import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../store.jsx";
import { toISODate } from "../utils.js";

const ICON_PROPS = { size: 18, strokeWidth: 1.6, "aria-hidden": "true" };

export default function AssignmentModal() {
  const {
    data, lang, assignmentModal, lastCourseId, t,
    courseById, saveAssignment, deleteAssignment, setAssignmentModal,
  } = useApp();

  const editing = assignmentModal.id
    ? data.assignments.find((a) => a.id === assignmentModal.id)
    : null;

  const sortedCourses = [...data.courses].sort((a, b) => a.name.localeCompare(b.name, lang));

  const defaultCourse = () => {
    if (editing) return editing.courseId;
    if (lastCourseId.current && courseById(lastCourseId.current)) return lastCourseId.current;
    return sortedCourses[0]?.id || "";
  };

  const [form, setForm] = useState(() => ({
    title: editing?.title || "",
    courseId: defaultCourse(),
    date: editing?.date || assignmentModal.presetDate || toISODate(new Date()),
    time: editing?.time || "23:59",
    priority: editing?.priority || "normal",
    status: editing?.status || "todo",
    repeat: "none",
    repeatCount: 8,
    description: editing?.description || "",
  }));

  const close = () => setAssignmentModal(null);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const onSubmit = (e) => {
    e.preventDefault();
    saveAssignment({ ...form, id: editing?.id || null });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{editing ? t("modal.editTask") : t("modal.newTask")}</h2>
          <button type="button" className="icon-btn" aria-label={t("aria.close")} onClick={close}>
            <X {...ICON_PROPS} />
          </button>
        </div>
        <form className="modal-body" onSubmit={onSubmit}>
          <label className="field">
            <span>{t("form.titleLabel")}</span>
            <input
              type="text"
              required
              autoFocus
              value={form.title}
              onChange={update("title")}
              placeholder={t("form.titlePlaceholder")}
            />
          </label>

          <label className="field">
            <span>{t("form.courseLabel")}</span>
            <select required value={form.courseId} onChange={update("courseId")}>
              {sortedCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div className="field-row">
            <label className="field">
              <span>{t("form.dueDateLabel")}</span>
              <input type="date" required value={form.date} onChange={update("date")} />
            </label>
            <label className="field">
              <span>{t("form.timeLabel")}</span>
              <input type="time" value={form.time} onChange={update("time")} />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>{t("form.priorityLabel")}</span>
              <select value={form.priority} onChange={update("priority")}>
                <option value="low">{t("priority.low")}</option>
                <option value="normal">{t("priority.normal")}</option>
                <option value="high">{t("priority.high")}</option>
              </select>
            </label>
            <label className="field">
              <span>{t("form.statusLabel")}</span>
              <select value={form.status} onChange={update("status")}>
                <option value="todo">{t("status.todo")}</option>
                <option value="doing">{t("status.doing")}</option>
                <option value="done">{t("status.done")}</option>
              </select>
            </label>
          </div>

          {!editing && (
            <>
              <label className="field">
                <span>{t("form.repeatLabel")}</span>
                <select value={form.repeat} onChange={update("repeat")}>
                  <option value="none">{t("form.repeatNone")}</option>
                  <option value="weekly">{t("form.repeatWeekly")}</option>
                  <option value="biweekly">{t("form.repeatBiweekly")}</option>
                </select>
              </label>

              {form.repeat !== "none" && (
                <label className="field">
                  <span>{t("form.repeatCountLabel")}</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={form.repeatCount}
                    onChange={update("repeatCount")}
                  />
                </label>
              )}
            </>
          )}

          <label className="field">
            <span>{t("form.descriptionLabel")}</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
              placeholder={t("form.descriptionPlaceholder")}
            />
          </label>

          <div className="modal-footer">
            {editing && (
              <button type="button" className="btn ghost" onClick={() => deleteAssignment(editing.id)}>
                {t("btn.delete")}
              </button>
            )}
            <div className="spacer" />
            <button type="button" className="btn" onClick={close}>{t("btn.cancel")}</button>
            <button type="submit" className="btn primary">{t("btn.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
