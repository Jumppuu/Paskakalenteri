import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../store.jsx";
import { COLORS } from "../constants.js";
import {
  currentSemester, formatTerm, parseTermValue, semesterOptions, termValue,
} from "../utils.js";

const ICON_PROPS = { size: 18, strokeWidth: 1.6, "aria-hidden": "true" };

export default function CourseModal() {
  const {
    data, courseModal, t, courseById, saveCourse, deleteCourse, setCourseModal,
  } = useApp();

  const editing = courseModal.id ? courseById(courseModal.id) : null;

  const termOptions = () => {
    const opts = semesterOptions();
    const selected = editing ? editing.term : currentSemester();
    const parsed = parseTermValue(selected);
    const normalized = parsed ? termValue(parsed.season, parsed.year) : selected;
    if (normalized && !opts.includes(normalized)) opts.unshift(normalized);
    return { opts, normalized: normalized || currentSemester() };
  };

  const { opts, normalized } = termOptions();

  const [form, setForm] = useState(() => ({
    name: editing?.name || "",
    term: normalized,
    color: editing?.color || COLORS[data.courses.length % COLORS.length],
  }));

  const close = () => setCourseModal(null);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const onSubmit = (e) => {
    e.preventDefault();
    saveCourse({ ...form, id: editing?.id || null });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="modal small" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{editing ? t("modal.editCourse") : t("modal.newCourse")}</h2>
          <button type="button" className="icon-btn" aria-label={t("aria.close")} onClick={close}>
            <X {...ICON_PROPS} />
          </button>
        </div>
        <form className="modal-body" onSubmit={onSubmit}>
          <label className="field">
            <span>{t("course.nameLabel")}</span>
            <input
              type="text"
              required
              autoFocus
              value={form.name}
              onChange={update("name")}
              placeholder={t("course.namePlaceholder")}
            />
          </label>

          <label className="field">
            <span>{t("course.termLabel")}</span>
            <select value={form.term} onChange={update("term")}>
              {opts.map((o) => (
                <option key={o} value={o}>{formatTerm(t, o)}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t("course.colorLabel")}</span>
            <div className="color-picker">
              {COLORS.map((col) => (
                <span
                  key={col}
                  className={`color-swatch ${form.color === col ? "selected" : ""}`.trim()}
                  style={{ background: col }}
                  onClick={() => setForm((f) => ({ ...f, color: col }))}
                />
              ))}
            </div>
          </label>

          <div className="modal-footer">
            {editing && (
              <button type="button" className="btn ghost" onClick={() => deleteCourse(editing.id)}>
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
