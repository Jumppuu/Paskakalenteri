import { useApp } from "../store.jsx";
import { PRIORITY_LABELS_BY_LANG, STATUS_LABELS_BY_LANG } from "../constants.js";
import { parseDate, sameDay } from "../utils.js";

export default function TaskCard({ assignment }) {
  const { courseById, lang, t, toggleDone, openAssignmentModal } = useApp();
  const a = assignment;
  const course = courseById(a.courseId);
  const color = course ? course.color : "#888";
  const done = a.status === "done";

  const priorityLabels = PRIORITY_LABELS_BY_LANG[lang] || PRIORITY_LABELS_BY_LANG.fi;
  const statusLabels = STATUS_LABELS_BY_LANG[lang] || STATUS_LABELS_BY_LANG.fi;

  let dueBadge = null;
  if (!done) {
    const due = parseDate(a.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) dueBadge = <span className="badge overdue">{t("badge.overdue")}</span>;
    else if (sameDay(due, today)) dueBadge = <span className="badge today">{t("cal.today")}</span>;
  }

  return (
    <div className="task-card" style={{ borderLeftColor: color }}>
      <div
        className={`task-check ${done ? "done" : ""}`.trim()}
        onClick={(e) => { e.stopPropagation(); toggleDone(a.id); }}
      >
        {done ? "✓" : ""}
      </div>
      <div className="task-main" onClick={() => openAssignmentModal(a.id)}>
        <div className={`task-title ${done ? "done" : ""}`.trim()}>{a.title}</div>
        <div className="task-meta">
          <span>
            <span className="task-course-dot" style={{ background: color }} />{" "}
            {course ? course.name : "–"}
          </span>
          <span>{a.time || "23:59"}</span>
          {a.repeatGroup && <span>{t("task.recurring")}</span>}
        </div>
      </div>
      {dueBadge}
      {a.status === "doing" && <span className="badge doing">{statusLabels.doing}</span>}
      <span className={`badge ${a.priority}`}>{priorityLabels[a.priority]}</span>
    </div>
  );
}
