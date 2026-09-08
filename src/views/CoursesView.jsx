import { Plus } from "lucide-react";
import { useApp } from "../store.jsx";
import { formatTerm } from "../utils.js";

const ICON_PROPS = { size: 18, strokeWidth: 1.6, "aria-hidden": "true" };

export default function CoursesView() {
  const { data, lang, t, openCourseModal } = useApp();

  const sortedCourses = [...data.courses].sort((a, b) => a.name.localeCompare(b.name, lang));

  if (!sortedCourses.length) {
    return (
      <div className="empty-state">
        {t("courses.emptyState")}
        <div className="empty-actions">
          <button className="btn primary small" onClick={() => openCourseModal()}>
            <Plus {...ICON_PROPS} /> {t("courses.addCourse")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-grid">
      {sortedCourses.map((c) => {
        const total = data.assignments.filter((a) => a.courseId === c.id).length;
        const open = data.assignments.filter((a) => a.courseId === c.id && a.status !== "done").length;
        return (
          <div
            key={c.id}
            className="course-card"
            style={{ borderLeftColor: c.color }}
            onClick={() => openCourseModal(c.id)}
          >
            <div className="course-name">{c.name}</div>
            <div className="course-term">{formatTerm(t, c.term)}</div>
            <div className="course-count">{t("course.stats", { open, total })}</div>
          </div>
        );
      })}
    </div>
  );
}
