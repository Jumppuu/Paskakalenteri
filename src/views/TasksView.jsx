import { Plus } from "lucide-react";
import { useApp } from "../store.jsx";
import { STATUS_LABELS_BY_LANG } from "../constants.js";
import { addDays, parseDate, sameDay } from "../utils.js";
import TaskCard from "../components/TaskCard.jsx";

const ICON_PROPS = { size: 18, strokeWidth: 1.6, "aria-hidden": "true" };

export default function TasksView() {
  const {
    data, lang, filterCourse, filterStatus, t,
    setFilterCourse, setFilterStatus, openAssignmentModal,
  } = useApp();

  const statusLabels = STATUS_LABELS_BY_LANG[lang] || STATUS_LABELS_BY_LANG.fi;

  const sortedCourses = [...data.courses].sort((a, b) => a.name.localeCompare(b.name, lang));

  let items = [...data.assignments];
  if (filterCourse !== "all") items = items.filter((a) => a.courseId === filterCourse);
  if (filterStatus !== "all") items = items.filter((a) => a.status === filterStatus);
  items.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = addDays(today, 7);
  const groups = { overdue: [], today: [], week: [], later: [], done: [] };
  for (const a of items) {
    if (a.status === "done") { groups.done.push(a); continue; }
    const due = parseDate(a.date);
    if (due < today) groups.overdue.push(a);
    else if (sameDay(due, today)) groups.today.push(a);
    else if (due <= weekEnd) groups.week.push(a);
    else groups.later.push(a);
  }

  const titles = {
    overdue: t("group.overdue"), today: t("group.today"), week: t("group.week"),
    later: t("group.later"), done: t("group.done"),
  };

  const hasItems = items.length > 0;
  const noneAtAll = data.assignments.length === 0;

  return (
    <>
      <div className="list-controls">
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
          <option value="all">{t("tasks.filterAllCourses")}</option>
          {sortedCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">{t("tasks.filterAllStatuses")}</option>
          <option value="todo">{statusLabels.todo}</option>
          <option value="doing">{statusLabels.doing}</option>
          <option value="done">{statusLabels.done}</option>
        </select>
      </div>

      <div id="taskGroups">
        {hasItems ? (
          Object.keys(groups).map((key) =>
            groups[key].length ? (
              <div className="task-group" key={key}>
                <div className="task-group-title">{titles[key]} ({groups[key].length})</div>
                <div className="task-list">
                  {groups[key].map((a) => <TaskCard key={a.id} assignment={a} />)}
                </div>
              </div>
            ) : null
          )
        ) : noneAtAll ? (
          <div className="empty-state">
            {t("tasks.emptyNone")}
            <div className="empty-actions">
              <button className="btn primary small" onClick={() => openAssignmentModal()}>
                <Plus {...ICON_PROPS} /> {t("nav.addTask")}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">{t("tasks.emptyFiltered")}</div>
        )}
      </div>
    </>
  );
}
