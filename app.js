/* =========================================================
   Kurssikalenteri – prototyyppi
   Pelkkä frontend, tiedot tallennetaan selaimen localStorageen.
   Ei backendia / Firebasea.
   ========================================================= */

'use strict'

/* ---------- Vakiot ---------- */
const STORE_KEY = 'kurssikalenteri_v1'
const THEME_KEY = 'kurssikalenteri_theme'
const SIDEBAR_KEY = 'kurssikalenteri_sidebar'
const WELCOME_KEY = 'kurssikalenteri_welcome_seen'

const COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#64748b'
]

const WEEKDAYS = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']
const WEEKDAYS_LONG = [
  'Maanantai',
  'Tiistai',
  'Keskiviikko',
  'Torstai',
  'Perjantai',
  'Lauantai',
  'Sunnuntai'
]
const MONTHS = [
  'Tammikuu',
  'Helmikuu',
  'Maaliskuu',
  'Huhtikuu',
  'Toukokuu',
  'Kesäkuu',
  'Heinäkuu',
  'Elokuu',
  'Syyskuu',
  'Lokakuu',
  'Marraskuu',
  'Joulukuu'
]

const PRIORITY_LABELS = { low: 'Matala', normal: 'Normaali', high: 'Korkea' }
const STATUS_LABELS = { todo: 'Tekemättä', doing: 'Työn alla', done: 'Valmis' }

/* ---------- Tila ---------- */
let state = { courses: [], assignments: [] }
let ui = {
  view: 'calendar',
  calMode: 'month', // "month" | "week"
  cursor: new Date(), // kalenterin näkyvä ajanjakso
  selectedDate: null, // kalenterista valittu päivä (ISO)
  filterCourse: 'all',
  filterStatus: 'all',
  selectedColor: COLORS[0],
  lastCourseId: null // muistetaan viimeksi käytetty kurssi
}

/* ---------- Apufunktiot ---------- */
const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

function pad(n) {
  return String(n).padStart(2, '0')
}
function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfWeek(d) {
  const day = (d.getDay() + 6) % 7 // maanantai = 0
  const res = new Date(d)
  res.setDate(d.getDate() - day)
  res.setHours(0, 0, 0, 0)
  return res
}
function addDays(d, n) {
  const r = new Date(d)
  r.setDate(d.getDate() + n)
  return r
}
function sameDay(a, b) {
  return toISODate(a) === toISODate(b)
}
function isToday(d) {
  return sameDay(d, new Date())
}

// Kevät = tammi–heinä, Syksy = elo–joulu
function currentSemester() {
  const now = new Date()
  const season = now.getMonth() <= 6 ? 'Kevät' : 'Syksy'
  return `${season} ${now.getFullYear()}`
}

function semesterOptions() {
  const year = new Date().getFullYear()
  const opts = []
  for (let y = year - 1; y <= year + 2; y++) {
    opts.push(`Kevät ${y}`)
    opts.push(`Syksy ${y}`)
  }
  return opts
}

function sortedCourses() {
  return [...state.courses].sort((a, b) => a.name.localeCompare(b.name, 'fi'))
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )
}

/* ---------- Tallennus ---------- */
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state))
}

function load() {
  const raw = localStorage.getItem(STORE_KEY)
  if (raw) {
    try {
      state = JSON.parse(raw)
      return
    } catch {
      /* alustetaan uusiksi */
    }
  }
  // Uusi käyttäjä aloittaa tyhjältä pöydältä.
  state = { courses: [], assignments: [] }
  save()
}

function courseById(id) {
  return state.courses.find((c) => c.id === id)
}

/* =========================================================
   Näkymien reititys
   ========================================================= */
function setView(view) {
  ui.view = view
  $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view))
  const cog = $('#settingsBtn')
  if (cog) cog.classList.toggle('active', view === 'settings')
  $('#sidebar').classList.remove('open')
  render()
}

function render() {
  const titles = {
    calendar: 'Kalenteri',
    tasks: 'Tehtävät',
    courses: 'Kurssit',
    settings: 'Asetukset'
  }
  $('#pageTitle').textContent = titles[ui.view]
  $('#topbarActions').innerHTML = ''
  updateNavBadge()

  if (ui.view === 'calendar') renderCalendar()
  else if (ui.view === 'tasks') renderTasks()
  else if (ui.view === 'courses') renderCourses()
  else if (ui.view === 'settings') renderSettings()
}

// Näyttää myöhässä + tänään erääntyvien avointen tehtävien määrän navissa
function updateNavBadge() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const count = state.assignments.filter(
    (a) => a.status !== 'done' && parseDate(a.date) <= today
  ).length
  const badge = $('#tasksBadge')
  if (!badge) return
  badge.textContent = count
  badge.hidden = count === 0
  badge.title = `${count} myöhässä tai tänään`
}

/* =========================================================
   Tervetulo-esittely (näytetään kunnes suljetaan)
   ========================================================= */
function isNewUser() {
  return !state.courses.length && !state.assignments.length
}

function welcomeCardHtml() {
  const dismissed = localStorage.getItem(WELCOME_KEY) === '1'
  if (dismissed && !isNewUser()) return ''

  return `
    <div class="welcome-card" id="welcomeCard">
      <button class="welcome-close" id="welcomeClose" aria-label="Sulje esittely" title="Sulje">✕</button>
      <div class="welcome-title">👋 Tervetuloa Kurssikalenteriin!</div>
      <p class="welcome-lead">
        Tämä on oma kalenterisi kurssien tehtäville ja määräajoille.
        Kaikki tallentuu vain tähän selaimeen – aloitat puhtaalta pöydältä.
      </p>
      <ol class="welcome-steps">
        <li><strong>Lisää kurssi</strong> ja anna sille väri.</li>
        <li><strong>Lisää tehtävä</strong>: otsikko, kurssi ja määräaika.</li>
        <li><strong>Seuraa</strong> tehtäviä kalenterissa ja tehtävälistassa – myöhässä ja tänään erääntyvät näkyvät heti.</li>
      </ol>
      <div class="welcome-actions">
        <button class="btn primary small" id="welcomeAddCourse">＋ Lisää ensimmäinen kurssi</button>
        <button class="btn small" id="welcomeAddTask">＋ Lisää tehtävä</button>
      </div>
    </div>`
}

function dismissWelcome() {
  localStorage.setItem(WELCOME_KEY, '1')
  const card = $('#welcomeCard')
  if (card) card.remove()
}

function wireWelcomeCard() {
  const close = $('#welcomeClose')
  if (!close) return
  close.addEventListener('click', dismissWelcome)
  $('#welcomeAddCourse')?.addEventListener('click', () => {
    dismissWelcome()
    openCourseModal()
  })
  $('#welcomeAddTask')?.addEventListener('click', () => {
    dismissWelcome()
    openAssignmentModal()
  })
}

/* =========================================================
   Kalenterinäkymä
   ========================================================= */
function renderCalendar() {
  const actions = $('#topbarActions')
  actions.innerHTML = `
    <div class="view-switch">
      <button data-mode="month" class="${ui.calMode === 'month' ? 'active' : ''}">Kuukausi</button>
      <button data-mode="week" class="${ui.calMode === 'week' ? 'active' : ''}">Viikko</button>
    </div>`
  $$('.view-switch button', actions).forEach((b) =>
    b.addEventListener('click', () => {
      ui.calMode = b.dataset.mode
      render()
    })
  )

  const view = $('#view')
  const label =
    ui.calMode === 'month'
      ? `${MONTHS[ui.cursor.getMonth()]} ${ui.cursor.getFullYear()}`
      : weekLabel(ui.cursor)

  const monthLayout = ui.calMode === 'month'
  view.innerHTML = `
    ${welcomeCardHtml()}
    <div class="cal-toolbar">
      <button class="btn small" id="calPrev">‹</button>
      <button class="btn small" id="calToday">Tänään</button>
      <button class="btn small" id="calNext">›</button>
      <span class="cal-title">${label}</span>
    </div>
    ${
      monthLayout
        ? `<div class="cal-layout">
           <aside class="day-detail" id="dayDetail"></aside>
           <div id="calBody"></div>
         </div>`
        : `<div id="calBody"></div>`
    }`

  wireWelcomeCard()

  $('#calPrev').addEventListener('click', () => shiftCal(-1))
  $('#calNext').addEventListener('click', () => shiftCal(1))
  $('#calToday').addEventListener('click', () => {
    ui.cursor = new Date()
    ui.selectedDate = toISODate(new Date())
    render()
  })

  if (ui.calMode === 'month') {
    renderMonth()
    renderDayDetail()
  } else renderWeek()
}

function shiftCal(dir) {
  if (ui.calMode === 'month') ui.cursor.setMonth(ui.cursor.getMonth() + dir)
  else ui.cursor = addDays(ui.cursor, dir * 7)
  ui.cursor = new Date(ui.cursor)
  render()
}

function weekLabel(d) {
  const s = startOfWeek(d),
    e = addDays(s, 6)
  return `${s.getDate()}.${s.getMonth() + 1}. – ${e.getDate()}.${e.getMonth() + 1}.${e.getFullYear()}`
}

function assignmentsOn(dateObj) {
  const iso = toISODate(dateObj)
  return state.assignments
    .filter((a) => a.date === iso)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
}

function renderMonth() {
  const body = $('#calBody')
  const first = new Date(ui.cursor.getFullYear(), ui.cursor.getMonth(), 1)
  const gridStart = startOfWeek(first)
  const month = ui.cursor.getMonth()

  let cells = ''
  for (let i = 0; i < 42; i++) {
    const day = addDays(gridStart, i)
    const events = assignmentsOn(day)
    const shown = events.slice(0, 3)
    const extra = events.length - shown.length

    const eventsHtml = shown
      .map((a) => {
        const c = courseById(a.courseId)
        return `<div class="cal-event ${a.status === 'done' ? 'done' : ''}"
        style="background:${c ? c.color : '#888'}" data-id="${a.id}"
        title="${escapeHtml(a.title)}">${escapeHtml(a.title)}</div>`
      })
      .join('')

    cells += `
      <div class="cal-cell ${day.getMonth() !== month ? 'other-month' : ''} ${isToday(day) ? 'today' : ''} ${ui.selectedDate === toISODate(day) ? 'selected' : ''}"
           data-date="${toISODate(day)}">
        <span class="cal-daynum">${day.getDate()}</span>
        ${eventsHtml}
        ${extra > 0 ? `<span class="cal-more">+${extra} lisää</span>` : ''}
      </div>`
  }

  body.innerHTML = `
    <div class="cal-grid">
      <div class="cal-weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="cal-days">${cells}</div>
    </div>`

  wireCalendarClicks(body)
}

function renderWeek() {
  const body = $('#calBody')
  const s = startOfWeek(ui.cursor)
  let html = '<div class="week-list">'

  for (let i = 0; i < 7; i++) {
    const day = addDays(s, i)
    const events = assignmentsOn(day)
    const list = events.length
      ? events.map((a) => taskCardHtml(a)).join('')
      : `<div class="week-empty">Ei tehtäviä</div>`

    html += `
      <div class="week-day" data-date="${toISODate(day)}">
        <div class="week-day-header ${isToday(day) ? 'today' : ''}">
          <span>${WEEKDAYS_LONG[i]} ${day.getDate()}.${day.getMonth() + 1}.</span>
          <button class="btn small week-add" data-date="${toISODate(day)}">＋</button>
        </div>
        <div class="week-day-body">${list}</div>
      </div>`
  }
  html += '</div>'
  body.innerHTML = html

  $$('.week-add', body).forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation()
      openAssignmentModal(null, b.dataset.date)
    })
  )
  wireTaskCards(body)
}

function wireCalendarClicks(root) {
  $$('.cal-event', root).forEach((el) =>
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      openAssignmentModal(el.dataset.id)
    })
  )
  $$('.cal-cell', root).forEach((el) =>
    el.addEventListener('click', () => selectDay(el.dataset.date))
  )
}

// Valitsee päivän ja päivittää vasemman tietopaneelin
function selectDay(iso) {
  ui.selectedDate = iso
  renderMonth()
  renderDayDetail()
}

// Vasen paneeli: valitun päivän tehtävät täysin näkyvissä
function renderDayDetail() {
  const panel = $('#dayDetail')
  if (!panel) return
  const iso = ui.selectedDate || toISODate(new Date())
  const d = parseDate(iso)
  const weekday = WEEKDAYS_LONG[(d.getDay() + 6) % 7]
  const events = assignmentsOn(d)

  const list = events.length
    ? `<div class="task-list">${events.map(taskCardHtml).join('')}</div>`
    : `<div class="day-empty">Ei tehtäviä tälle päivälle.</div>`

  panel.innerHTML = `
    <div class="day-detail-header">
      <div>
        <div class="day-detail-weekday">${weekday}</div>
        <div class="day-detail-date">${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}</div>
      </div>
      ${isToday(d) ? `<span class="badge today">Tänään</span>` : ''}
    </div>
    <button class="btn primary small day-add" id="dayAddBtn">＋ Lisää tehtävä</button>
    ${list}`

  $('#dayAddBtn').addEventListener('click', () => openAssignmentModal(null, iso))
  wireTaskCards(panel)
}

/* =========================================================
   Tehtäväkortit (jaettu list- ja viikkonäkymässä)
   ========================================================= */
function dueBadge(a) {
  if (a.status === 'done') return ''
  const due = parseDate(a.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (due < today) return `<span class="badge overdue">Myöhässä</span>`
  if (sameDay(due, today)) return `<span class="badge today">Tänään</span>`
  return ''
}

function taskCardHtml(a) {
  const c = courseById(a.courseId)
  const color = c ? c.color : '#888'
  const done = a.status === 'done'
  return `
    <div class="task-card" style="border-left-color:${color}" data-id="${a.id}">
      <div class="task-check ${done ? 'done' : ''}" data-check="${a.id}">${done ? '✓' : ''}</div>
      <div class="task-main" data-open="${a.id}">
        <div class="task-title ${done ? 'done' : ''}">${escapeHtml(a.title)}</div>
        <div class="task-meta">
          <span><span class="task-course-dot" style="background:${color}"></span> ${c ? escapeHtml(c.name) : '–'}</span>
          <span>🕒 ${a.time || '23:59'}</span>
          ${a.repeatGroup ? '<span>🔁 toistuva</span>' : ''}
        </div>
      </div>
      ${dueBadge(a)}
      ${a.status === 'doing' ? `<span class="badge doing">Työn alla</span>` : ''}
      <span class="badge ${a.priority}">${PRIORITY_LABELS[a.priority]}</span>
    </div>`
}

function wireTaskCards(root) {
  $$('[data-check]', root).forEach((el) =>
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleDone(el.dataset.check)
    })
  )
  $$('[data-open]', root).forEach((el) =>
    el.addEventListener('click', () => openAssignmentModal(el.dataset.open))
  )
}

function toggleDone(id) {
  const a = state.assignments.find((x) => x.id === id)
  if (!a) return
  a.status = a.status === 'done' ? 'todo' : 'done'
  save()
  render()
  showToast(a.status === 'done' ? 'Merkitty valmiiksi ✓' : 'Merkitty tekemättömäksi')
}

/* =========================================================
   Tehtävälista-näkymä
   ========================================================= */
function renderTasks() {
  const actions = $('#topbarActions')
  actions.innerHTML = `<button class="btn primary small" id="listAdd">＋ Lisää tehtävä</button>`
  $('#listAdd').addEventListener('click', () => openAssignmentModal())

  const view = $('#view')
  const courseOpts = ['<option value="all">Kaikki kurssit</option>']
    .concat(sortedCourses().map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`))
    .join('')

  view.innerHTML = `
    <div class="list-controls">
      <select id="filterCourse">${courseOpts}</select>
      <select id="filterStatus">
        <option value="all">Kaikki tilat</option>
        <option value="todo">Tekemättä</option>
        <option value="doing">Työn alla</option>
        <option value="done">Valmis</option>
      </select>
    </div>
    <div id="taskGroups"></div>`

  $('#filterCourse').value = ui.filterCourse
  $('#filterStatus').value = ui.filterStatus
  $('#filterCourse').addEventListener('change', (e) => {
    ui.filterCourse = e.target.value
    renderTaskGroups()
  })
  $('#filterStatus').addEventListener('change', (e) => {
    ui.filterStatus = e.target.value
    renderTaskGroups()
  })

  renderTaskGroups()
}

function renderTaskGroups() {
  const container = $('#taskGroups')
  let items = [...state.assignments]
  if (ui.filterCourse !== 'all') items = items.filter((a) => a.courseId === ui.filterCourse)
  if (ui.filterStatus !== 'all') items = items.filter((a) => a.status === ui.filterStatus)
  items.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  if (!items.length) {
    const noneAtAll = !state.assignments.length
    if (noneAtAll) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="emoji">🌟</span>
          Ei vielä tehtäviä. Lisää ensimmäinen tehtävä ja pysy ajan tasalla määräajoista.
          <div class="empty-actions"><button class="btn primary small" id="emptyAddTask">＋ Lisää tehtävä</button></div>
        </div>`
      $('#emptyAddTask')?.addEventListener('click', () => openAssignmentModal())
    } else {
      container.innerHTML = `<div class="empty-state"><span class="emoji">🎉</span>Ei tehtäviä näillä suodattimilla.</div>`
    }
    return
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const groups = { overdue: [], today: [], week: [], later: [], done: [] }
  const weekEnd = addDays(today, 7)

  for (const a of items) {
    if (a.status === 'done') {
      groups.done.push(a)
      continue
    }
    const due = parseDate(a.date)
    if (due < today) groups.overdue.push(a)
    else if (sameDay(due, today)) groups.today.push(a)
    else if (due <= weekEnd) groups.week.push(a)
    else groups.later.push(a)
  }

  const titles = {
    overdue: '⚠️ Myöhässä',
    today: '📌 Tänään',
    week: '📅 Tämä viikko',
    later: '🗓️ Myöhemmin',
    done: '✅ Valmiit'
  }

  container.innerHTML = Object.keys(groups)
    .map((key) => {
      if (!groups[key].length) return ''
      return `
      <div class="task-group">
        <div class="task-group-title">${titles[key]} (${groups[key].length})</div>
        <div class="task-list">${groups[key].map(taskCardHtml).join('')}</div>
      </div>`
    })
    .join('')

  wireTaskCards(container)
}

/* =========================================================
   Kurssit-näkymä
   ========================================================= */
function renderCourses() {
  const actions = $('#topbarActions')
  actions.innerHTML = `<button class="btn primary small" id="courseAdd">＋ Lisää kurssi</button>`
  $('#courseAdd').addEventListener('click', () => openCourseModal())

  const view = $('#view')
  if (!state.courses.length) {
    view.innerHTML = `
      <div class="empty-state">
        <span class="emoji">🎨</span>
        Ei vielä kursseja. Luo ensimmäinen kurssi ja anna sille oma väri.
        <div class="empty-actions"><button class="btn primary small" id="emptyAddCourse">＋ Lisää kurssi</button></div>
      </div>`
    $('#emptyAddCourse')?.addEventListener('click', () => openCourseModal())
    return
  }

  view.innerHTML = `<div class="courses-grid">${sortedCourses()
    .map((c) => {
      const count = state.assignments.filter((a) => a.courseId === c.id).length
      const openCount = state.assignments.filter(
        (a) => a.courseId === c.id && a.status !== 'done'
      ).length
      return `
        <div class="course-card" style="border-top-color:${c.color}" data-id="${c.id}">
          <div class="course-name">${escapeHtml(c.name)}</div>
          <div class="course-term">${escapeHtml(c.term || '')}</div>
          <div class="course-count">${openCount} avointa / ${count} tehtävää</div>
        </div>`
    })
    .join('')}</div>`

  $$('.course-card', view).forEach((el) =>
    el.addEventListener('click', () => openCourseModal(el.dataset.id))
  )
}

/* =========================================================
   Asetukset-näkymä
   ========================================================= */
function renderSettings() {
  const view = $('#view')
  view.innerHTML = `
    <div class="settings-card">
      <h3>Muistutukset</h3>
      <p>Prototyypissä muistutukset näytetään esikatseluna. Oikeassa versiossa
         nämä lähetetään sähköpostilla ja push-ilmoituksena.</p>
      <div class="settings-row"><span>Muistuta 1 päivä ennen määräaikaa</span><input type="checkbox" checked disabled></div>
      <div class="settings-row"><span>Muistuta 1 tunti ennen määräaikaa</span><input type="checkbox" checked disabled></div>
      <div class="settings-row"><span>Sähköposti-ilmoitukset</span><input type="checkbox" disabled></div>
      <div class="settings-row"><span>Push-ilmoitukset</span><input type="checkbox" disabled></div>
    </div>
    <div class="settings-card">
      <h3>Varmuuskopiointi</h3>
      <p>Vie kopioi koodin suoraan leikepöydälle. Tuo lukee koodin leikepöydältä
         (tai tekstikentästä, jos olet liittänyt sen siihen).</p>
      <div class="settings-row">
        <span>Vie tiedot koodiksi</span>
        <button class="btn small" id="exportData">Vie</button>
      </div>
      <textarea id="backupText" class="backup-text" rows="4"
        placeholder="Vientikoodi ilmestyy tähän. Tuonti onnistuu suoraan leikepöydältä – tekstikenttää ei tarvitse käyttää."></textarea>
      <div class="settings-row">
        <span>Tuo tiedot koodista</span>
        <button class="btn small" id="importData">Tuo</button>
      </div>
    </div>
    <div class="settings-card">
      <h3>Tiedot</h3>
      <p>Tiedot tallennetaan tämän selaimen muistiin (localStorage). Ei pilvipalvelua vielä.</p>
      <div class="settings-row">
        <span>Tyhjennä kaikki tiedot</span>
        <button class="btn ghost small" id="clearData">Tyhjennä</button>
      </div>
    </div>`

  $('#exportData').addEventListener('click', () => {
    const code = exportString()
    const box = $('#backupText')
    box.value = code
    box.select()
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(() => showToast('Vientikoodi kopioitu leikepöydälle'))
        .catch(() => showToast('Vientikoodi luotu – kopioi se tekstikentästä'))
    } else {
      showToast('Vientikoodi luotu – kopioi se tekstikentästä')
    }
  })
  $('#importData').addEventListener('click', async () => {
    let code = $('#backupText').value.trim()
    // jos kenttä on tyhjä, luetaan koodi suoraan leikepöydältä
    if (!code && navigator.clipboard?.readText) {
      try {
        code = (await navigator.clipboard.readText()).trim()
      } catch {
        /* lupa evätty */
      }
      if (code) $('#backupText').value = code
    }
    if (!code) {
      showToast('Kopioi vientikoodi leikepöydälle tai liitä se tekstikenttään')
      return
    }
    importString(code)
  })

  $('#clearData').addEventListener('click', () => {
    if (confirm('Haluatko varmasti tyhjentää KAIKKI tiedot?')) {
      state = { courses: [], assignments: [] }
      save()
      showToast('Tiedot tyhjennetty')
      render()
    }
  })
}

/* =========================================================
   Vienti/tuonti tekstikoodina
   ========================================================= */
function exportString() {
  const payload = { app: 'kurssikalenteri', version: 1, data: state }
  // base64 + URI-koodaus, jotta ääkköset säilyvät
  return btoa(encodeURIComponent(JSON.stringify(payload)))
}

function importString(code) {
  let payload
  try {
    payload = JSON.parse(decodeURIComponent(atob(code)))
  } catch {
    showToast('Virheellinen vientikoodi')
    return
  }
  const data = payload?.app === 'kurssikalenteri' ? payload.data : null
  if (!data || !Array.isArray(data.courses) || !Array.isArray(data.assignments)) {
    showToast('Virheellinen vientikoodi')
    return
  }
  if (!confirm('Tuonti korvaa nykyiset tiedot. Jatketaanko?')) return
  state = { courses: data.courses, assignments: data.assignments }
  save()
  showToast('Tiedot tuotu onnistuneesti')
  render()
}

/* =========================================================
   Kaikkien tietojen tyhjennys
   ========================================================= */
function wipeAllData() {
  if (!confirm('Haluatko varmasti tyhjentää KAIKKI tiedot? Tätä ei voi perua.')) return
  state = { courses: [], assignments: [] }
  save()
  showToast('Kaikki tiedot tyhjennetty')
  setView('calendar')
}

/* =========================================================
   Tehtävä-modaali
   ========================================================= */
function openAssignmentModal(id = null, presetDate = null) {
  if (!state.courses.length) {
    showToast('Lisää ensin kurssi')
    setView('courses')
    return
  }

  const form = $('#assignmentForm')
  form.reset()

  const courseSel = $('#fCourse')
  courseSel.innerHTML = sortedCourses()
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join('')

  const repeatWrap = $('#repeatCountWrap')
  $('#fRepeat').onchange = (e) => {
    repeatWrap.hidden = e.target.value === 'none'
  }
  repeatWrap.hidden = true

  const deleteBtn = $('#deleteBtn')

  if (id) {
    const a = state.assignments.find((x) => x.id === id)
    if (!a) return
    $('#modalTitle').textContent = 'Muokkaa tehtävää'
    $('#assignmentId').value = a.id
    $('#fTitle').value = a.title
    $('#fCourse').value = a.courseId
    $('#fDate').value = a.date
    $('#fTime').value = a.time || '23:59'
    $('#fPriority').value = a.priority
    $('#fStatus').value = a.status
    $('#fDescription').value = a.description || ''
    $('#fRepeat').value = 'none'
    deleteBtn.hidden = false
  } else {
    $('#modalTitle').textContent = 'Uusi tehtävä'
    $('#assignmentId').value = ''
    $('#fDate').value = presetDate || toISODate(new Date())
    $('#fTime').value = '23:59'
    // Esivalitaan viimeksi käytetty kurssi nopeampaa lisäystä varten
    if (ui.lastCourseId && courseById(ui.lastCourseId)) {
      $('#fCourse').value = ui.lastCourseId
    }
    deleteBtn.hidden = true
  }

  showModal('#modalOverlay')
  setTimeout(() => $('#fTitle').focus(), 50)
}

function saveAssignment(e) {
  e.preventDefault()
  const id = $('#assignmentId').value
  const base = {
    title: $('#fTitle').value.trim(),
    courseId: $('#fCourse').value,
    date: $('#fDate').value,
    time: $('#fTime').value || '23:59',
    priority: $('#fPriority').value,
    status: $('#fStatus').value,
    description: $('#fDescription').value.trim()
  }
  if (!base.title || !base.date) return

  ui.lastCourseId = base.courseId
  if (id) {
    const a = state.assignments.find((x) => x.id === id)
    Object.assign(a, base)
    showToast('Tehtävä tallennettu')
  } else {
    const repeat = $('#fRepeat').value
    if (repeat === 'none') {
      state.assignments.push({ id: uid(), ...base, repeatGroup: null })
    } else {
      const count = Math.min(30, Math.max(1, parseInt($('#fRepeatCount').value) || 1))
      const step = repeat === 'weekly' ? 7 : 14
      const groupId = uid()
      const start = parseDate(base.date)
      for (let i = 0; i < count; i++) {
        state.assignments.push({
          id: uid(),
          ...base,
          date: toISODate(addDays(start, i * step)),
          repeatGroup: groupId
        })
      }
      showToast(`Luotiin ${count} toistuvaa tehtävää 🔁`)
    }
    if (repeat === 'none') showToast('Tehtävä lisätty')
  }

  save()
  hideModal('#modalOverlay')
  render()
}

function deleteAssignment() {
  const id = $('#assignmentId').value
  if (!id) return
  const a = state.assignments.find((x) => x.id === id)
  if (a && a.repeatGroup) {
    if (
      confirm(
        'Tämä on toistuva tehtävä. Poistetaanko KAIKKI saman sarjan tehtävät? (Peruuta = poista vain tämä)'
      )
    ) {
      state.assignments = state.assignments.filter((x) => x.repeatGroup !== a.repeatGroup)
    } else {
      state.assignments = state.assignments.filter((x) => x.id !== id)
    }
  } else {
    state.assignments = state.assignments.filter((x) => x.id !== id)
  }
  save()
  hideModal('#modalOverlay')
  render()
  showToast('Tehtävä poistettu')
}

/* =========================================================
   Kurssi-modaali
   ========================================================= */
function populateSemesterSelect(selected) {
  const sel = $('#cTerm')
  const opts = semesterOptions()
  // Varmistetaan ett\u00e4 mahdollinen vanha/mukautettu arvo n\u00e4kyy listassa
  if (selected && !opts.includes(selected)) opts.unshift(selected)
  sel.innerHTML = opts.map((o) => `<option value="${o}">${o}</option>`).join('')
  sel.value = selected || currentSemester()
}

function openCourseModal(id = null) {
  $('#courseForm').reset()

  const picker = $('#colorPicker')
  picker.innerHTML = COLORS.map(
    (col) => `<span class="color-swatch" data-color="${col}" style="background:${col}"></span>`
  ).join('')

  const selectColor = (col) => {
    ui.selectedColor = col
    $$('.color-swatch', picker).forEach((s) =>
      s.classList.toggle('selected', s.dataset.color === col)
    )
  }
  $$('.color-swatch', picker).forEach((s) =>
    s.addEventListener('click', () => selectColor(s.dataset.color))
  )

  const deleteBtn = $('#courseDeleteBtn')

  if (id) {
    const c = courseById(id)
    if (!c) return
    $('#courseModalTitle').textContent = 'Muokkaa kurssia'
    $('#courseId').value = c.id
    $('#cName').value = c.name
    populateSemesterSelect(c.term)
    selectColor(c.color)
    deleteBtn.hidden = false
  } else {
    $('#courseModalTitle').textContent = 'Uusi kurssi'
    $('#courseId').value = ''
    populateSemesterSelect(currentSemester())
    selectColor(COLORS[state.courses.length % COLORS.length])
    deleteBtn.hidden = true
  }

  showModal('#courseModalOverlay')
  setTimeout(() => $('#cName').focus(), 50)
}

function saveCourse(e) {
  e.preventDefault()
  const id = $('#courseId').value
  const data = {
    name: $('#cName').value.trim(),
    term: $('#cTerm').value.trim(),
    color: ui.selectedColor
  }
  if (!data.name) return

  if (id) {
    Object.assign(courseById(id), data)
    showToast('Kurssi tallennettu')
  } else {
    state.courses.push({ id: uid(), ...data })
    showToast('Kurssi lisätty')
  }
  save()
  hideModal('#courseModalOverlay')
  render()
}

function deleteCourse() {
  const id = $('#courseId').value
  if (!id) return
  const count = state.assignments.filter((a) => a.courseId === id).length
  const msg = count
    ? `Kurssilla on ${count} tehtävää. Poistetaanko kurssi ja sen tehtävät?`
    : 'Poistetaanko kurssi?'
  if (!confirm(msg)) return
  state.courses = state.courses.filter((c) => c.id !== id)
  state.assignments = state.assignments.filter((a) => a.courseId !== id)
  save()
  hideModal('#courseModalOverlay')
  render()
  showToast('Kurssi poistettu')
}

/* =========================================================
   Modaalien ja toastin apurit
   ========================================================= */
function showModal(sel) {
  $(sel).hidden = false
}
function hideModal(sel) {
  $(sel).hidden = true
}

let toastTimer = null
function showToast(msg) {
  const t = $('#toast')
  t.textContent = msg
  t.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    t.hidden = true
  }, 2200)
}

/* =========================================================
   Alustus ja tapahtumakuuntelijat
   ========================================================= */
/* =========================================================
   Teema (vaalea / tumma)
   ========================================================= */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  const btn = $('#themeToggle')
  if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️'
}

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  localStorage.setItem(THEME_KEY, next)
  applyTheme(next)
}

/* =========================================================
   Sivupalkin kutistus (vain kuvakkeet)
   ========================================================= */
function applySidebar(collapsed) {
  document.querySelector('.app').classList.toggle('sidebar-collapsed', collapsed)
  const btn = $('#collapseBtn')
  if (btn) {
    btn.textContent = collapsed ? '»' : '«'
    btn.title = collapsed ? 'Laajenna valikko' : 'Pienennä valikko'
    btn.setAttribute('aria-label', btn.title)
  }
}

function toggleSidebar() {
  const collapsed = !document.querySelector('.app').classList.contains('sidebar-collapsed')
  localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
  applySidebar(collapsed)
}

function init() {
  load()
  applyTheme(localStorage.getItem(THEME_KEY) || 'light')
  applySidebar(localStorage.getItem(SIDEBAR_KEY) === '1')
  ui.selectedDate = toISODate(new Date())

  $$('.nav-btn').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)))

  $('#quickAddBtn').addEventListener('click', () => openAssignmentModal())
  $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'))
  $('#wipeBtn').addEventListener('click', wipeAllData)
  $('#themeToggle').addEventListener('click', toggleTheme)
  $('#settingsBtn').addEventListener('click', () => setView('settings'))
  $('#collapseBtn').addEventListener('click', toggleSidebar)

  // Tehtävä-modaali
  $('#assignmentForm').addEventListener('submit', saveAssignment)
  $('#modalClose').addEventListener('click', () => hideModal('#modalOverlay'))
  $('#cancelBtn').addEventListener('click', () => hideModal('#modalOverlay'))
  $('#deleteBtn').addEventListener('click', deleteAssignment)
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') hideModal('#modalOverlay')
  })

  // Kurssi-modaali
  $('#courseForm').addEventListener('submit', saveCourse)
  $('#courseModalClose').addEventListener('click', () => hideModal('#courseModalOverlay'))
  $('#courseCancelBtn').addEventListener('click', () => hideModal('#courseModalOverlay'))
  $('#courseDeleteBtn').addEventListener('click', deleteCourse)
  $('#courseModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'courseModalOverlay') hideModal('#courseModalOverlay')
  })

  // Esc sulkee modaalit
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal('#modalOverlay')
      hideModal('#courseModalOverlay')
    }
  })

  render()
}

document.addEventListener('DOMContentLoaded', init)
