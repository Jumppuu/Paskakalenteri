import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLang } from '../LangContext'
import { parseICS } from '../ics'
import { SCHEDULE_CACHE_KEY } from '../storage'
import { toISODate } from '../utils'

function loadCache(url) {
  try {
    const raw = localStorage.getItem(SCHEDULE_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.url === url ? parsed : null
  } catch {
    return null
  }
}

function saveCache(url, text) {
  localStorage.setItem(
    SCHEDULE_CACHE_KEY,
    JSON.stringify({ url, text, fetchedAt: new Date().toISOString() })
  )
}

export default function ScheduleView({ scheduleUrl }) {
  const { t, lang } = useLang()
  const [cache, setCache] = useState(() => loadCache(scheduleUrl))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showPast, setShowPast] = useState(false)

  async function refresh(url) {
    if (!window.api?.fetchSchedule) {
      setError(t('schedule.unsupported'))
      return
    }

    setLoading(true)
    setError('')

    const res = await window.api.fetchSchedule(url)

    setLoading(false)

    if (res?.ok) {
      saveCache(url, res.text)
      setCache({ url, text: res.text, fetchedAt: new Date().toISOString() })
    } else {
      setError(res?.error || t('schedule.fetchError'))
    }
  }

  useEffect(() => {
    setCache(loadCache(scheduleUrl))
    refresh(scheduleUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleUrl])

  const events = useMemo(() => {
    if (!cache?.text) return []
    try {
      return parseICS(cache.text)
    } catch {
      return []
    }
  }, [cache])

  const filtered = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const q = search.trim().toLowerCase()

    return events
      .filter((e) => (showPast ? true : (e.end || e.start) >= today))
      .filter((e) =>
        q
          ? (e.summary || '').toLowerCase().includes(q) ||
            (e.location || '').toLowerCase().includes(q)
          : true
      )
  }, [events, search, showPast])

  const groups = useMemo(() => {
    const map = new Map()
    for (const e of filtered) {
      const key = toISODate(e.start)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fi-FI', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
    [lang]
  )
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fi-FI', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    [lang]
  )
  const updatedFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fi-FI', {
        dateStyle: 'short',
        timeStyle: 'short'
      }),
    [lang]
  )

  return (
    <div className="schedule-view">
      <div className="list-controls">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('schedule.searchPlaceholder')}
        />

        <label className="schedule-toggle">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
          />
          {t('schedule.showPast')}
        </label>

        <button className="btn small" onClick={() => refresh(scheduleUrl)} disabled={loading}>
          <RefreshCw className={loading ? 'spin' : ''} />
          {t('schedule.refresh')}
        </button>
      </div>

      {cache?.fetchedAt && (
        <div className="schedule-updated">
          {t('schedule.lastUpdated', { time: updatedFormatter.format(new Date(cache.fetchedAt)) })}
        </div>
      )}

      {error && <div className="schedule-error">{error}</div>}

      {!groups.length ? (
        <div className="empty-state">{loading ? t('schedule.loading') : t('schedule.empty')}</div>
      ) : (
        groups.map(([dateKey, dayEvents]) => (
          <div className="task-group" key={dateKey}>
            <div className="task-group-title">
              {dateFormatter.format(new Date(dayEvents[0].start))}
            </div>

            <div className="task-list">
              {dayEvents.map((e) => (
                <div className="schedule-card" key={e.uid + e.start.toISOString()}>
                  <div className="schedule-time">
                    {timeFormatter.format(e.start)}
                    {e.end ? ` – ${timeFormatter.format(e.end)}` : ''}
                  </div>

                  <div className="schedule-main">
                    <div className="schedule-title">{e.summary}</div>
                    {e.location && <div className="schedule-location">{e.location}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
