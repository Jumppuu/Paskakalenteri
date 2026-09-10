import { useEffect, useMemo, useState } from 'react'
import { COLORS, addDays, currentSemester, parseDate, toISODate, uid } from './utils'
import { THEME_KEY, SIDEBAR_KEY, WELCOME_KEY, LANG_KEY, loadState, saveState } from './storage'
import { I18N, makeT } from './i18n'
import { LangContext } from './LangContext'
import { courseById } from './components/helpers'
import CalendarView from './components/CalendarView'
import TasksView from './components/TasksView'
import { NotesView } from './components/NotesView'
import CoursesView from './components/CoursesView'
import SettingsView from './components/SettingsView'
import AssignmentModal from './components/AssignmentModal'
import CourseModal from './components/CourseModal'
import NotesModal from './components/NotesModal'
import {
  Notebook,
  CalendarDays,
  ListChecks,
  BookOpen,
  Plus,
  Trash2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  Book
} from 'lucide-react'

export default function App() {
  const [state, setState] = useState(() => loadState())
  const [view, setView] = useState('calendar')
  const [calMode, setCalMode] = useState('month')
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()))
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === '1'
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [welcomeDismissed, setWelcomeDismissed] = useState(
    () => localStorage.getItem(WELCOME_KEY) === '1'
  )
  const [lastCourseId, setLastCourseId] = useState(null)
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY)
    return I18N[saved] ? saved : 'fi'
  })

  const [assignmentModal, setAssignmentModal] = useState(null)
  const [notesModal, setNotesModal] = useState(null)
  const [courseModal, setCourseModal] = useState(null)

  const t = useMemo(() => makeT(lang), [lang])

  function setLang(next) {
    const value = I18N[next] ? next : 'fi'
    setLangState(value)
    localStorage.setItem(LANG_KEY, value)
    document.documentElement.lang = value
  }

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('brand')
  }, [lang, t])

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => setToast(''), 2200)

    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setAssignmentModal(null)
        setCourseModal(null)
        setNotesModal(null)
      }
    }

    document.addEventListener('keydown', onKey)

    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const sortedCourses = useMemo(
    () => [...state.courses].sort((a, b) => a.name.localeCompare(b.name, lang)),
    [state.courses, lang]
  )

  const sortedNotes = useMemo(
    () =>
      [...(state.notes || [])].sort((a, b) => (a.title || '').localeCompare(b.title || '', lang)),
    [state.notes, lang]
  )

  const overdueCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return state.assignments.filter((a) => a.status !== 'done' && parseDate(a.date) <= today).length
  }, [state.assignments])

  const isNewUser = !state.courses.length && !state.assignments.length && !state.notes.length

  const showWelcome = !welcomeDismissed && isNewUser

  function showToast(msg) {
    setToast(msg)
  }

  function goView(v) {
    setView(v)
    setSidebarOpen(false)
  }

  // =========================
  // NOTES
  // =========================

  function openNote(id = null, presetDate = null) {
    if (id) {
      const n = state.notes.find((x) => x.id === id)

      if (!n) return

      setNotesModal({
        ...n,
        courseId: n.courseId || '',
        color: n.color || courseById(state.courses, n.courseId)?.color || COLORS[0],
        savedAt: n.savedAt || null,
        isEdit: true
      })

      return
    }

    const defaultCourse =
      lastCourseId && courseById(state.courses, lastCourseId)
        ? lastCourseId
        : state.courses[0]?.id || ''

    const defaultCourseObject = courseById(state.courses, defaultCourse)

    setNotesModal({
      id: '',
      title: '',
      courseId: defaultCourse,
      color: defaultCourseObject?.color || COLORS[0],
      date: presetDate || toISODate(new Date()),
      time: '23:59',
      description: '',
      savedAt: null,
      isEdit: false
    })
  }

  function saveNote(e) {
    e.preventDefault()

    const form = notesModal

    if (!form?.title?.trim() || !form.date) return

    const now = new Date().toISOString()

    const selectedCourse = courseById(state.courses, form.courseId)

    const noteData = {
      title: form.title.trim(),
      courseId: form.courseId || '',
      color: selectedCourse?.color || form.color || COLORS[0],
      date: form.date,
      time: form.time || '23:59',
      description: (form.description || '').trim(),
      savedAt: now
    }

    if (form.isEdit) {
      setState((s) => ({
        ...s,
        notes: s.notes.map((n) =>
          n.id === form.id
            ? {
                ...n,
                ...noteData
              }
            : n
        )
      }))

      showToast(t('toast.noteSaved'))
    } else {
      const note = {
        id: uid(),
        ...noteData
      }

      setState((s) => ({
        ...s,
        notes: [...s.notes, note]
      }))

      showToast(t('toast.noteAdded'))
    }

    if (form.courseId) {
      setLastCourseId(form.courseId)
    }

    setNotesModal(null)
  }

  function deleteNote() {
    const form = notesModal

    if (!form?.id) return

    setState((s) => ({
      ...s,
      notes: s.notes.filter((n) => n.id !== form.id)
    }))

    setNotesModal(null)

    showToast(t('toast.noteDeleted'))
  }

  // =========================
  // ASSIGNMENTS
  // =========================

  function openAssignment(id = null, presetDate = null) {
    if (!state.courses.length) {
      showToast(t('toast.addCourseFirst'))
      goView('courses')
      return
    }

    if (id) {
      const a = state.assignments.find((x) => x.id === id)

      if (!a) return

      setAssignmentModal({
        ...a,
        repeat: 'none',
        repeatCount: 8,
        isEdit: true
      })
    } else {
      setAssignmentModal({
        id: '',
        title: '',
        courseId:
          lastCourseId && courseById(state.courses, lastCourseId)
            ? lastCourseId
            : state.courses[0].id,
        date: presetDate || toISODate(new Date()),
        time: '23:59',
        priority: 'normal',
        status: 'todo',
        description: '',
        repeat: 'none',
        repeatCount: 8,
        isEdit: false
      })
    }
  }

  function saveAssignment(e) {
    e.preventDefault()

    const form = assignmentModal

    if (!form.title.trim() || !form.date) return

    setLastCourseId(form.courseId)

    if (form.isEdit) {
      setState((s) => ({
        ...s,
        assignments: s.assignments.map((a) =>
          a.id === form.id
            ? {
                ...a,
                title: form.title.trim(),
                courseId: form.courseId,
                date: form.date,
                time: form.time || '23:59',
                priority: form.priority,
                status: form.status,
                description: form.description.trim()
              }
            : a
        )
      }))

      showToast(t('toast.taskSaved'))
    } else {
      const base = {
        title: form.title.trim(),
        courseId: form.courseId,
        date: form.date,
        time: form.time || '23:59',
        priority: form.priority,
        status: form.status,
        description: form.description.trim()
      }

      if (form.repeat === 'none') {
        setState((s) => ({
          ...s,
          assignments: [
            ...s.assignments,
            {
              id: uid(),
              ...base,
              repeatGroup: null
            }
          ]
        }))

        showToast(t('toast.taskAdded'))
      } else {
        const count = Math.min(30, Math.max(1, parseInt(form.repeatCount, 10) || 1))

        const step = form.repeat === 'weekly' ? 7 : 14
        const groupId = uid()
        const start = parseDate(base.date)

        const created = Array.from({ length: count }, (_, i) => ({
          id: uid(),
          ...base,
          date: toISODate(addDays(start, i * step)),
          repeatGroup: groupId
        }))

        setState((s) => ({
          ...s,
          assignments: [...s.assignments, ...created]
        }))

        showToast(t('toast.recurringCreated', { count }))
      }
    }

    setAssignmentModal(null)
  }

  function deleteAssignment() {
    const form = assignmentModal

    if (!form?.id) return

    const a = state.assignments.find((x) => x.id === form.id)

    if (a?.repeatGroup) {
      if (confirm(t('confirm.deleteRecurring'))) {
        setState((s) => ({
          ...s,
          assignments: s.assignments.filter((x) => x.repeatGroup !== a.repeatGroup)
        }))
      } else {
        setState((s) => ({
          ...s,
          assignments: s.assignments.filter((x) => x.id !== form.id)
        }))
      }
    } else {
      setState((s) => ({
        ...s,
        assignments: s.assignments.filter((x) => x.id !== form.id)
      }))
    }

    setAssignmentModal(null)

    showToast(t('toast.taskDeleted'))
  }

  function toggleDone(id) {
    setState((s) => ({
      ...s,
      assignments: s.assignments.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === 'done' ? 'todo' : 'done'
            }
          : a
      )
    }))

    const a = state.assignments.find((x) => x.id === id)

    showToast(a?.status === 'done' ? t('task.markUndone') : t('task.markDone'))
  }

  // =========================
  // COURSES
  // =========================

  function openCourse(id = null) {
    if (id) {
      const c = courseById(state.courses, id)

      if (!c) return

      setCourseModal({
        ...c,
        isEdit: true
      })
    } else {
      setCourseModal({
        id: '',
        name: '',
        term: currentSemester(),
        color: COLORS[state.courses.length % COLORS.length],
        isEdit: false
      })
    }
  }

  function saveCourse(e) {
    e.preventDefault()

    const form = courseModal

    if (!form.name.trim()) return

    if (form.isEdit) {
      setState((s) => ({
        ...s,
        courses: s.courses.map((c) =>
          c.id === form.id
            ? {
                ...c,
                name: form.name.trim(),
                term: form.term,
                color: form.color
              }
            : c
        )
      }))

      showToast(t('toast.courseSaved'))
    } else {
      setState((s) => ({
        ...s,
        courses: [
          ...s.courses,
          {
            id: uid(),
            name: form.name.trim(),
            term: form.term,
            color: form.color
          }
        ]
      }))

      showToast(t('toast.courseAdded'))
    }

    setCourseModal(null)
  }

  function deleteCourse() {
    const form = courseModal

    if (!form?.id) return

    const count = state.assignments.filter((a) => a.courseId === form.id).length

    if (
      !confirm(count ? t('confirm.deleteCourseWithTasks', { count }) : t('confirm.deleteCourse'))
    ) {
      return
    }

    setState((s) => ({
      ...s,
      courses: s.courses.filter((c) => c.id !== form.id),
      assignments: s.assignments.filter((a) => a.courseId !== form.id)
    }))

    setCourseModal(null)

    showToast(t('toast.courseDeleted'))
  }

  // =========================
  // CALENDAR
  // =========================

  function shiftCal(dir) {
    const next = new Date(cursor)

    if (calMode === 'month') {
      next.setMonth(next.getMonth() + dir)
    } else {
      next.setDate(next.getDate() + dir * 7)
    }

    setCursor(next)
  }

  const titles = {
    calendar: t('nav.calendar'),
    tasks: t('nav.tasks'),
    courses: t('nav.courses'),
    notes: t('nav.notes'),
    settings: t('nav.settings')
  }

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="brand">
            <span className="brand-icon"></span>
            <Notebook />
            <span className="brand-text">{t('brand')}</span>
          </div>

          <nav className="nav">
            <button
              className={`nav-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => goView('calendar')}
            >
              <CalendarDays />
              <span>{t('nav.calendar')}</span>
            </button>

            <button
              className={`nav-btn ${view === 'tasks' ? 'active' : ''}`}
              onClick={() => goView('tasks')}
            >
              <ListChecks />
              <span>{t('nav.tasks')}</span>

              <span
                className="nav-badge"
                hidden={overdueCount === 0}
                title={t('badge.overdueOrToday', {
                  count: overdueCount
                })}
              >
                {overdueCount}
              </span>
            </button>

            <button
              className={`nav-btn ${view === 'courses' ? 'active' : ''}`}
              onClick={() => goView('courses')}
            >
              <BookOpen />
              <span>{t('nav.courses')}</span>
            </button>

            <button
              className={`nav-btn ${view === 'notes' ? 'active' : ''}`}
              onClick={() => goView('notes')}
            >
              <Notebook />
              <span>{t('nav.notes')}</span>
            </button>
          </nav>

          <button className="add-btn" onClick={() => openAssignment()}>
            <span>＋</span>
            <span>{t('nav.addTask')}</span>
          </button>

          <div className="sidebar-footer">
            <button
              className={`cog-btn ${view === 'settings' ? 'active' : ''}`}
              title={t('nav.settings')}
              aria-label={t('nav.settings')}
              onClick={() => goView('settings')}
            >
              ⚙️
            </button>

            <button
              className="cog-btn collapse-btn"
              title={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              aria-label={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              {sidebarCollapsed ? '»' : '«'}
            </button>
          </div>
        </aside>

        <main className="content">
          <header className="topbar">
            <button
              className="icon-btn menu-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={t('aria.menu')}
            >
              ☰
            </button>

            <h1 className="page-title">{titles[view]}</h1>

            <div className="topbar-actions">
              {view === 'calendar' && (
                <div className="view-switch">
                  <button
                    className={calMode === 'month' ? 'active' : ''}
                    onClick={() => setCalMode('month')}
                  >
                    {t('cal.month')}
                  </button>

                  <button
                    className={calMode === 'week' ? 'active' : ''}
                    onClick={() => setCalMode('week')}
                  >
                    {t('cal.week')}
                  </button>
                </div>
              )}

              {view === 'tasks' && (
                <button className="btn primary small" onClick={() => openAssignment()}>
                  ＋ {t('nav.addTask')}
                </button>
              )}

              {view === 'courses' && (
                <button className="btn primary small" onClick={() => openCourse()}>
                  ＋ {t('courses.addCourse')}
                </button>
              )}

              {view === 'notes' && (
                <button className="btn primary small" onClick={() => openNote()}>
                  ＋ Lisää muistiinpano
                </button>
              )}
            </div>

            <div className="lang-tabs" role="group" aria-label="Language / Kieli">
              <button
                type="button"
                className={`lang-tab ${lang === 'fi' ? 'active' : ''}`}
                onClick={() => setLang('fi')}
                title="Suomi"
                aria-pressed={lang === 'fi'}
              >
                FI
              </button>

              <button
                type="button"
                className={`lang-tab ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                title="English"
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>

            <button
              className="icon-btn theme-toggle"
              title={t('theme.toggleTitle')}
              aria-label={t('theme.toggleAria')}
              onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </header>

          <section className="view">
            {view === 'calendar' && (
              <CalendarView
                state={state}
                calMode={calMode}
                cursor={cursor}
                selectedDate={selectedDate}
                showWelcome={showWelcome}
                onDismissWelcome={() => {
                  localStorage.setItem(WELCOME_KEY, '1')
                  setWelcomeDismissed(true)
                }}
                onAddCourse={() => {
                  localStorage.setItem(WELCOME_KEY, '1')
                  setWelcomeDismissed(true)
                  openCourse()
                }}
                onAddTask={() => {
                  localStorage.setItem(WELCOME_KEY, '1')
                  setWelcomeDismissed(true)
                  openAssignment()
                }}
                onPrev={() => shiftCal(-1)}
                onNext={() => shiftCal(1)}
                onToday={() => {
                  setCursor(new Date())
                  setSelectedDate(toISODate(new Date()))
                }}
                onSelectDay={setSelectedDate}
                onOpenAssignment={openAssignment}
                onToggle={toggleDone}
              />
            )}

            {view === 'tasks' && (
              <TasksView
                state={state}
                sortedCourses={sortedCourses}
                filterCourse={filterCourse}
                filterStatus={filterStatus}
                setFilterCourse={setFilterCourse}
                setFilterStatus={setFilterStatus}
                onOpen={openAssignment}
                onToggle={toggleDone}
                onAdd={() => openAssignment()}
              />
            )}

            {view === 'courses' && (
              <CoursesView
                state={state}
                sortedCourses={sortedCourses}
                onOpen={openCourse}
                onAdd={() => openCourse()}
              />
            )}

            {view === 'notes' && (
              <NotesView
                state={state}
                sortedNotes={sortedNotes}
                onAdd={() => openNote()}
                onOpen={openNote}
                onDelete={deleteNote}
              />
            )}

            {view === 'settings' && (
              <SettingsView
                state={state}
                setState={setState}
                showToast={showToast}
                lang={lang}
                setLang={setLang}
              />
            )}
          </section>
        </main>

        <AssignmentModal
          assignmentModal={assignmentModal}
          setAssignmentModal={setAssignmentModal}
          sortedCourses={sortedCourses}
          onSave={saveAssignment}
          onDelete={deleteAssignment}
        />

        <CourseModal
          courseModal={courseModal}
          setCourseModal={setCourseModal}
          onSave={saveCourse}
          onDelete={deleteCourse}
        />

        <NotesModal
          notesModal={notesModal}
          setNotesModal={setNotesModal}
          sortedCourses={sortedCourses}
          onSave={saveNote}
          onDelete={deleteNote}
        />

        {toast && <div className="toast">{toast}</div>}
      </div>
    </LangContext.Provider>
  )
}
