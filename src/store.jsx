import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  LANG_KEY, SIDEBAR_KEY, STORE_KEY, THEME_KEY, WELCOME_KEY,
} from "./constants.js";
import { I18N, translate } from "./i18n.js";
import { addDays, parseDate, toISODate, uid } from "./utils.js";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

function loadData() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.courses) && Array.isArray(parsed.assignments)) {
        return parsed;
      }
    } catch { /* fall through to empty */ }
  }
  return { courses: [], assignments: [] };
}

function initialLang() {
  const stored = localStorage.getItem(LANG_KEY);
  return I18N[stored] ? stored : "fi";
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadData);
  const [lang, setLangState] = useState(initialLang);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === "1"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(
    () => localStorage.getItem(WELCOME_KEY) === "1"
  );

  const [view, setViewState] = useState("calendar");
  const [calMode, setCalMode] = useState("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const lastCourseId = useRef(null);

  const [assignmentModal, setAssignmentModal] = useState(null); // { id, presetDate } | null
  const [courseModal, setCourseModal] = useState(null);         // { id } | null

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  /* ---------- Persistence side effects ---------- */
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate(lang, "brand");
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  /* ---------- Toast ---------- */
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------- Navigation ---------- */
  const setView = useCallback((next) => {
    setViewState(next);
    setSidebarOpen(false);
  }, []);

  /* ---------- Language / theme / sidebar ---------- */
  const setLang = useCallback((next) => {
    setLangState(I18N[next] ? next : "fi");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const dismissWelcome = useCallback(() => {
    localStorage.setItem(WELCOME_KEY, "1");
    setWelcomeDismissed(true);
  }, []);

  /* ---------- Lookups ---------- */
  const courseById = useCallback(
    (id) => data.courses.find((c) => c.id === id),
    [data.courses]
  );

  /* ---------- Assignment actions ---------- */
  const toggleDone = useCallback((id) => {
    let msg = "";
    setData((prev) => {
      const assignments = prev.assignments.map((a) => {
        if (a.id !== id) return a;
        const status = a.status === "done" ? "todo" : "done";
        msg = status === "done" ? "task.markDone" : "task.markUndone";
        return { ...a, status };
      });
      return { ...prev, assignments };
    });
    if (msg) showToast(t(msg));
  }, [showToast, t]);

  const saveAssignment = useCallback((form) => {
    const base = {
      title: form.title.trim(),
      courseId: form.courseId,
      date: form.date,
      time: form.time || "23:59",
      priority: form.priority,
      status: form.status,
      description: (form.description || "").trim(),
    };
    if (!base.title || !base.date) return;
    lastCourseId.current = base.courseId;

    if (form.id) {
      setData((prev) => ({
        ...prev,
        assignments: prev.assignments.map((a) =>
          a.id === form.id ? { ...a, ...base } : a
        ),
      }));
      showToast(t("toast.taskSaved"));
    } else if (form.repeat === "none" || !form.repeat) {
      setData((prev) => ({
        ...prev,
        assignments: [...prev.assignments, { id: uid(), ...base, repeatGroup: null }],
      }));
      showToast(t("toast.taskAdded"));
    } else {
      const count = Math.min(30, Math.max(1, parseInt(form.repeatCount, 10) || 1));
      const step = form.repeat === "weekly" ? 7 : 14;
      const groupId = uid();
      const start = parseDate(base.date);
      const created = [];
      for (let i = 0; i < count; i++) {
        created.push({
          id: uid(), ...base,
          date: toISODate(addDays(start, i * step)),
          repeatGroup: groupId,
        });
      }
      setData((prev) => ({ ...prev, assignments: [...prev.assignments, ...created] }));
      showToast(t("toast.recurringCreated", { count }));
    }
    setAssignmentModal(null);
  }, [showToast, t]);

  const deleteAssignment = useCallback((id) => {
    const a = data.assignments.find((x) => x.id === id);
    if (!a) return;
    if (a.repeatGroup) {
      if (window.confirm(t("confirm.deleteRecurring"))) {
        setData((prev) => ({
          ...prev,
          assignments: prev.assignments.filter((x) => x.repeatGroup !== a.repeatGroup),
        }));
      } else {
        setData((prev) => ({
          ...prev,
          assignments: prev.assignments.filter((x) => x.id !== id),
        }));
      }
    } else {
      setData((prev) => ({
        ...prev,
        assignments: prev.assignments.filter((x) => x.id !== id),
      }));
    }
    setAssignmentModal(null);
    showToast(t("toast.taskDeleted"));
  }, [data.assignments, showToast, t]);

  /* ---------- Course actions ---------- */
  const saveCourse = useCallback((form) => {
    const payload = {
      name: form.name.trim(),
      term: form.term.trim(),
      color: form.color,
    };
    if (!payload.name) return;
    if (form.id) {
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => (c.id === form.id ? { ...c, ...payload } : c)),
      }));
      showToast(t("toast.courseSaved"));
    } else {
      setData((prev) => ({
        ...prev,
        courses: [...prev.courses, { id: uid(), ...payload }],
      }));
      showToast(t("toast.courseAdded"));
    }
    setCourseModal(null);
  }, [showToast, t]);

  const deleteCourse = useCallback((id) => {
    const count = data.assignments.filter((a) => a.courseId === id).length;
    const msg = count
      ? t("confirm.deleteCourseWithTasks", { count })
      : t("confirm.deleteCourse");
    if (!window.confirm(msg)) return;
    setData((prev) => ({
      courses: prev.courses.filter((c) => c.id !== id),
      assignments: prev.assignments.filter((a) => a.courseId !== id),
    }));
    setCourseModal(null);
    showToast(t("toast.courseDeleted"));
  }, [data.assignments, showToast, t]);

  /* ---------- Data-wide actions ---------- */
  const clearAllData = useCallback(() => {
    setData({ courses: [], assignments: [] });
    showToast(t("toast.dataCleared"));
  }, [showToast, t]);

  const wipeAllData = useCallback(() => {
    if (!window.confirm(t("confirm.wipeAll"))) return;
    setData({ courses: [], assignments: [] });
    showToast(t("toast.allDataCleared"));
    setView("calendar");
  }, [setView, showToast, t]);

  const importData = useCallback((imported) => {
    setData({ courses: imported.courses, assignments: imported.assignments });
    showToast(t("toast.importSuccess"));
  }, [showToast, t]);

  /* ---------- Modal openers ---------- */
  const openAssignmentModal = useCallback((id = null, presetDate = null) => {
    if (!data.courses.length) {
      showToast(t("toast.addCourseFirst"));
      setView("courses");
      return;
    }
    setAssignmentModal({ id, presetDate });
  }, [data.courses.length, setView, showToast, t]);

  const openCourseModal = useCallback((id = null) => {
    setCourseModal({ id });
  }, []);

  const value = useMemo(() => ({
    data, lang, theme, sidebarCollapsed, sidebarOpen, welcomeDismissed,
    view, calMode, cursor, selectedDate, filterCourse, filterStatus,
    lastCourseId, assignmentModal, courseModal, toast, t,
    setView, setCalMode, setCursor, setSelectedDate, setFilterCourse, setFilterStatus,
    setSidebarOpen, setLang, toggleTheme, toggleSidebar, dismissWelcome,
    courseById, toggleDone, saveAssignment, deleteAssignment,
    saveCourse, deleteCourse, clearAllData, wipeAllData, importData,
    openAssignmentModal, openCourseModal, setAssignmentModal, setCourseModal,
    showToast,
  }), [
    data, lang, theme, sidebarCollapsed, sidebarOpen, welcomeDismissed,
    view, calMode, cursor, selectedDate, filterCourse, filterStatus,
    assignmentModal, courseModal, toast, t,
    setView, setLang, toggleTheme, toggleSidebar, dismissWelcome,
    courseById, toggleDone, saveAssignment, deleteAssignment,
    saveCourse, deleteCourse, clearAllData, wipeAllData, importData,
    openAssignmentModal, openCourseModal, showToast,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
