export const STORE_KEY = 'kurssikalenteri_v1'
export const THEME_KEY = 'kurssikalenteri_theme'
export const SIDEBAR_KEY = 'kurssikalenteri_sidebar'
export const WELCOME_KEY = 'kurssikalenteri_welcome_seen'
export const LANG_KEY = 'kurssikalenteri_lang'

export function loadState() {
  const raw = localStorage.getItem(STORE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (
        parsed &&
        Array.isArray(parsed.courses) &&
        Array.isArray(parsed.assignments) &&
        Array.isArray(parsed.notes)
      ) {
        return parsed
      }
    } catch {
      /* fall through */
    }
  }
  return { courses: [], assignments: [], notes: [] }
}

export function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state))
}

export function exportString(state) {
  const payload = { app: 'kurssikalenteri', version: 1, data: state }
  return btoa(encodeURIComponent(JSON.stringify(payload)))
}

export function importString(code) {
  const payload = JSON.parse(decodeURIComponent(atob(code)))
  const data = payload?.app === 'kurssikalenteri' ? payload.data : null
  if (!data || !Array.isArray(data.courses) || !Array.isArray(data.assignments)) {
    throw new Error('invalid')
  }
  return { courses: data.courses, assignments: data.assignments, notes: data.notes }
}
