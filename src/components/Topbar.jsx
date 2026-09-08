import { Menu, Plus, Sun, Moon } from "lucide-react";
import { useApp } from "../store.jsx";
import LangTabs from "./LangTabs.jsx";

const ICON_PROPS = { size: 18, strokeWidth: 1.6, "aria-hidden": "true" };

function TopbarActions() {
  const { view, calMode, setCalMode, t, openAssignmentModal, openCourseModal } = useApp();

  if (view === "calendar") {
    return (
      <div className="view-switch">
        <button
          type="button"
          className={calMode === "month" ? "active" : ""}
          onClick={() => setCalMode("month")}
        >
          {t("cal.month")}
        </button>
        <button
          type="button"
          className={calMode === "week" ? "active" : ""}
          onClick={() => setCalMode("week")}
        >
          {t("cal.week")}
        </button>
      </div>
    );
  }

  if (view === "tasks") {
    return (
      <button type="button" className="btn primary small" onClick={() => openAssignmentModal()}>
        <Plus {...ICON_PROPS} /> {t("nav.addTask")}
      </button>
    );
  }

  if (view === "courses") {
    return (
      <button type="button" className="btn primary small" onClick={() => openCourseModal()}>
        <Plus {...ICON_PROPS} /> {t("courses.addCourse")}
      </button>
    );
  }

  return null;
}

export default function Topbar() {
  const { view, theme, t, setSidebarOpen, toggleTheme } = useApp();

  const titles = {
    calendar: t("nav.calendar"),
    tasks: t("nav.tasks"),
    courses: t("nav.courses"),
    settings: t("nav.settings"),
  };

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn menu-toggle"
        aria-label={t("aria.menu")}
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        <Menu {...ICON_PROPS} />
      </button>
      <h1 className="page-title">{titles[view]}</h1>
      <div className="topbar-actions">
        <TopbarActions />
      </div>
      <LangTabs />
      <button
        type="button"
        className="icon-btn theme-toggle"
        aria-label={t("theme.toggleAria")}
        title={t("theme.toggleTitle")}
        onClick={toggleTheme}
      >
        {theme === "dark" ? <Moon {...ICON_PROPS} /> : <Sun {...ICON_PROPS} />}
      </button>
    </header>
  );
}
