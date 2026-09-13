// Minimal RFC5545 (iCalendar) parser – only what the schedule view needs.

function unfold(text) {
  // Continuation lines start with a space or tab and must be joined to the previous line.
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
}

function unescapeText(value) {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function parseICSDate(value) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/.exec(value)
  if (!m) return null
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = m
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s))
}

export function parseICS(raw) {
  const lines = unfold(String(raw || '')).split('\n')
  const events = []
  let cur = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line === 'BEGIN:VEVENT') {
      cur = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (cur?.start) events.push(cur)
      cur = null
      continue
    }
    if (!cur) continue

    const sep = line.indexOf(':')
    if (sep === -1) continue

    const name = line.slice(0, sep).split(';')[0]
    const value = line.slice(sep + 1)

    switch (name) {
      case 'UID':
        cur.uid = value
        break
      case 'SUMMARY':
        cur.summary = unescapeText(value)
        break
      case 'DESCRIPTION':
        cur.description = unescapeText(value)
        break
      case 'LOCATION':
        cur.location = unescapeText(value)
        break
      case 'DTSTART':
        cur.start = parseICSDate(value)
        break
      case 'DTEND':
        cur.end = parseICSDate(value)
        break
    }
  }

  return events.sort((a, b) => a.start - b.start)
}
