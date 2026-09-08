import {
  Notebook, CalendarDays, ListChecks, BookOpen, Plus, Trash2, Settings,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useApp } from "../store.jsx";
import { parseDate } from "../utils.js";

const ICON_PROPS = { size: 18, strokeWidth: 1.6, "aria-hidden": "true" };

export default function Sidebar() {
  const {
    data, view, sidebarCollapsed, sidebarOpen, t,
    setView, openAssignmentModal, wipeAllData, toggleSidebar,
  } = useApp();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const badgeCount = data.assignments.filter(
    (a) => a.status !== "done" && parseDate(a.date) <= today
  ).length;

  const navItems = [
    { key: "calendar", label: t("nav.calendar"), Icon: CalendarDays },
    { key: "tasks", label: t("nav.tasks"), Icon: ListChecks, badge: true },
    { key: "courses", label: t("nav.courses"), Icon: BookOpen },
  ];

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`.trim()} id="sidebar">
      <div className="brand">
        <Notebook {...ICON_PROPS} />
        <span className="brand-text">{t("brand")}</span>
      </div>

      <nav className="nav">
        {navItems.map(({ key, label, Icon, badge }) => (
          <button
            key={key}
            type="button"
            className={`nav-btn ${view === key ? "active" : ""}`.trim()}
            title={label}
            aria-label={label}
            onClick={() => setView(key)}
          >
            <Icon {...ICON_PROPS} /> <span>{label}</span>
            {badge && badgeCount > 0 && (
              <span className="nav-badge" title={t("badge.overdueOrToday", { count: badgeCount })}>
                {badgeCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="add-btn"
        title={t("nav.addTask")}
        aria-label={t("nav.addTask")}
        onClick={() => openAssignmentModal()}
      >
        <Plus {...ICON_PROPS} /> <span>{t("nav.addTask")}</span>
      </button>

      <button
        type="button"
        className="wipe-btn"
        title={t("nav.wipeAll")}
        aria-label={t("nav.wipeAll")}
        onClick={wipeAllData}
      >
        <Trash2 {...ICON_PROPS} /> <span>{t("nav.wipeAll")}</span>
      </button>

      <div className="sidebar-footer">
        <button
          type="button"
          className={`cog-btn ${view === "settings" ? "active" : ""}`.trim()}
          title={t("nav.settings")}
          aria-label={t("nav.settings")}
          onClick={() => setView("settings")}
        >
          <Settings {...ICON_PROPS} />
        </button>
        <button
          type="button"
          className="cog-btn collapse-btn"
          title={sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          aria-label={sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <PanelLeftOpen {...ICON_PROPS} /> : <PanelLeftClose {...ICON_PROPS} />}
        </button>
      </div>
    </aside>
  );
}
