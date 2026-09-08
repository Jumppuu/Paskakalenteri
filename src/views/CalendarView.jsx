import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useApp } from "../store.jsx";
import { WEEKDAYS_BY_LANG, WEEKDAYS_LONG_BY_LANG, MONTHS_BY_LANG } from "../constants.js";
import { addDays, isToday, parseDate, sameDay, startOfWeek, toISODate } from "../utils.js";
import TaskCard from "../components/TaskCard.jsx";

const ICON_PROPS = { size: 18, strokeWidth: 1.6, "aria-hidden": "true" };

function weekLabel(d) {
  const s = startOfWeek(d);
  const e = addDays(s, 6);
  return `${s.getDate()}.${s.getMonth() + 1}. – ${e.getDate()}.${e.getMonth() + 1}.${e.getFullYear()}`;
}

export default function CalendarView() {
  const {
    data, lang, calMode, cursor, selectedDate, t, courseById,
    setCursor, setSelectedDate, openAssignmentModal,
  } = useApp();

  const weekdaysShort = WEEKDAYS_BY_LANG[lang] || WEEKDAYS_BY_LANG.fi;
  const weekdaysLong = WEEKDAYS_LONG_BY_LANG[lang] || WEEKDAYS_LONG_BY_LANG.fi;
  const months = MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.fi;

  const assignmentsOn = (dateObj) => {
    const iso = toISODate(dateObj);
    return data.assignments
      .filter((a) => a.date === iso)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  };

  const shiftCal = (dir) => {
    const next = new Date(cursor);
    if (calMode === "month") next.setMonth(next.getMonth() + dir);
    else next.setDate(next.getDate() + dir * 7);
    setCursor(next);
  };

  const goToday = () => {
    setCursor(new Date());
    setSelectedDate(toISODate(new Date()));
  };

  const label = calMode === "month"
    ? `${months[cursor.getMonth()]} ${cursor.getFullYear()}`
    : weekLabel(cursor);

  const prevLabel = lang === "fi" ? "Edellinen" : "Previous";
  const nextLabel = lang === "fi" ? "Seuraava" : "Next";

  return (
    <>
      <div className="cal-toolbar">
        <button className="btn small" aria-label={prevLabel} title={prevLabel} onClick={() => shiftCal(-1)}>
          <ChevronLeft {...ICON_PROPS} />
        </button>
        <button className="btn small" onClick={goToday}>{t("cal.today")}</button>
        <button className="btn small" aria-label={nextLabel} title={nextLabel} onClick={() => shiftCal(1)}>
          <ChevronRight {...ICON_PROPS} />
        </button>
        <span className="cal-title">{label}</span>
      </div>

      {calMode === "month" ? (
        <div className="cal-layout">
          <DayDetail
            assignmentsOn={assignmentsOn}
            weekdaysLong={weekdaysLong}
          />
          <div id="calBody">
            <MonthGrid
              cursor={cursor}
              selectedDate={selectedDate}
              weekdaysShort={weekdaysShort}
              assignmentsOn={assignmentsOn}
              courseById={courseById}
              onSelectDay={setSelectedDate}
              onOpen={openAssignmentModal}
              t={t}
            />
          </div>
        </div>
      ) : (
        <div id="calBody">
          <WeekList
            cursor={cursor}
            weekdaysLong={weekdaysLong}
            assignmentsOn={assignmentsOn}
            onAdd={openAssignmentModal}
            t={t}
          />
        </div>
      )}
    </>
  );
}

function MonthGrid({ cursor, selectedDate, weekdaysShort, assignmentsOn, courseById, onSelectDay, onOpen, t }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const month = cursor.getMonth();

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const day = addDays(gridStart, i);
    const iso = toISODate(day);
    const events = assignmentsOn(day);
    const shown = events.slice(0, 3);
    const extra = events.length - shown.length;

    cells.push(
      <div
        key={iso + i}
        className={[
          "cal-cell",
          day.getMonth() !== month ? "other-month" : "",
          isToday(day) ? "today" : "",
          selectedDate === iso ? "selected" : "",
        ].filter(Boolean).join(" ")}
        onClick={() => onSelectDay(iso)}
      >
        <span className="cal-daynum">{day.getDate()}</span>
        {shown.map((a) => {
          const c = courseById(a.courseId);
          return (
            <div
              key={a.id}
              className={`cal-event ${a.status === "done" ? "done" : ""}`.trim()}
              style={{ background: c ? c.color : "#888" }}
              title={a.title}
              onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}
            >
              {a.title}
            </div>
          );
        })}
        {extra > 0 && <span className="cal-more">{t("cal.more", { n: extra })}</span>}
      </div>
    );
  }

  return (
    <div className="cal-grid">
      <div className="cal-weekdays">
        {weekdaysShort.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-days">{cells}</div>
    </div>
  );
}

function DayDetail({ assignmentsOn, weekdaysLong }) {
  const { selectedDate, t, openAssignmentModal } = useApp();
  const iso = selectedDate || toISODate(new Date());
  const d = parseDate(iso);
  const weekday = weekdaysLong[(d.getDay() + 6) % 7];
  const events = assignmentsOn(d);

  return (
    <aside className="day-detail" id="dayDetail">
      <div className="day-detail-header">
        <div>
          <div className="day-detail-weekday">{weekday}</div>
          <div className="day-detail-date">{d.getDate()}.{d.getMonth() + 1}.{d.getFullYear()}</div>
        </div>
        {isToday(d) && <span className="badge today">{t("cal.today")}</span>}
      </div>
      <button className="btn primary small day-add" onClick={() => openAssignmentModal(null, iso)}>
        <Plus {...ICON_PROPS} /> {t("nav.addTask")}
      </button>
      {events.length ? (
        <div className="task-list">
          {events.map((a) => <TaskCard key={a.id} assignment={a} />)}
        </div>
      ) : (
        <div className="day-empty">{t("day.empty")}</div>
      )}
    </aside>
  );
}

function WeekList({ cursor, weekdaysLong, assignmentsOn, onAdd, t }) {
  const s = startOfWeek(cursor);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(s, i);
    const iso = toISODate(day);
    const events = assignmentsOn(day);
    days.push(
      <div className="week-day" key={iso}>
        <div className={`week-day-header ${isToday(day) ? "today" : ""}`.trim()}>
          <span>{weekdaysLong[i]} {day.getDate()}.{day.getMonth() + 1}.</span>
          <button
            className="btn small week-add"
            aria-label={t("nav.addTask")}
            title={t("nav.addTask")}
            onClick={(e) => { e.stopPropagation(); onAdd(null, iso); }}
          >
            <Plus {...ICON_PROPS} />
          </button>
        </div>
        <div className="week-day-body">
          {events.length ? (
            events.map((a) => <TaskCard key={a.id} assignment={a} />)
          ) : (
            <div className="week-empty">{t("week.empty")}</div>
          )}
        </div>
      </div>
    );
  }
  return <div className="week-list">{days}</div>;
}
