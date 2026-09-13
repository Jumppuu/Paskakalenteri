// Fetches an ICS feed. Uses the Electron main process when available (private,
// no third party involved). Falls back to public CORS proxies on static web
// builds (e.g. GitHub Pages) where there is no backend and the feed's server
// does not send CORS headers for direct browser fetches. Public proxies are
// flaky, so several are tried in order before giving up.
const PROXIES = [
  (url) => ({
    url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    extract: (text) => text
  }),
  (url) => ({
    url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    extract: (text) => text
  }),
  (url) => ({
    url: `https://cors.eu.org/${url}`,
    extract: (text) => text
  }),
  (url) => ({
    url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    extract: (text) => JSON.parse(text).contents
  })
]

const TIMEOUT_MS = 8000

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function looksLikeIcs(text) {
  return typeof text === 'string' && text.includes('BEGIN:VCALENDAR')
}

export async function fetchScheduleText(url) {
  if (window.api?.fetchSchedule) {
    return window.api.fetchSchedule(url)
  }

  try {
    const res = await fetchWithTimeout(url)
    if (res.ok) {
      const text = await res.text()
      if (looksLikeIcs(text)) return { ok: true, text, viaProxy: false }
    }
  } catch {
    /* likely blocked by CORS – fall through to the proxies */
  }

  for (const build of PROXIES) {
    const { url: proxyUrl, extract } = build(url)
    try {
      const res = await fetchWithTimeout(proxyUrl)
      if (!res.ok) continue
      const text = extract(await res.text())
      if (looksLikeIcs(text)) return { ok: true, text, viaProxy: true }
    } catch {
      /* try the next proxy */
    }
  }

  return { ok: false, error: 'All fetch attempts failed (direct fetch and every proxy)' }
}

