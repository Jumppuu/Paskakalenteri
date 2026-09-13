import { useState } from 'react'
import { exportString, importString } from '../storage'
import { useLang } from '../LangContext'

export default function SettingsView({
  state,
  setState,
  showToast,
  lang,
  setLang,
  scheduleUrl,
  setScheduleUrl
}) {
  const { t } = useLang()
  const [backup, setBackup] = useState('')
  const [urlDraft, setUrlDraft] = useState(scheduleUrl)

  function saveScheduleUrl() {
    const value = urlDraft.trim()
    if (!value) return
    setScheduleUrl(value)
    showToast(t('toast.scheduleUrlSaved'))
  }

  async function doExport() {
    const code = exportString(state)
    setBackup(code)
    try {
      await navigator.clipboard.writeText(code)
      showToast(t('toast.exportCopied'))
    } catch {
      showToast(t('toast.exportCreated'))
    }
  }

  async function doImport() {
    let code = backup.trim()
    if (!code && navigator.clipboard?.readText) {
      try {
        code = (await navigator.clipboard.readText()).trim()
        if (code) setBackup(code)
      } catch {
        /* denied */
      }
    }
    if (!code) {
      showToast(t('toast.importPaste'))
      return
    }
    try {
      const data = importString(code)
      if (!confirm(t('confirm.importOverwrite'))) return
      setState(data)
      showToast(t('toast.importSuccess'))
    } catch {
      showToast(t('toast.invalidCode'))
    }
  }

  return (
    <>
      <div className="settings-card">
        <h3>{t('settings.languageTitle')}</h3>
        <div className="settings-row">
          <span>{t('settings.languageTitle')}</span>
          <div className="lang-tabs settings-lang-tabs" role="group" aria-label="Language / Kieli">
            <button
              type="button"
              className={`lang-tab ${lang === 'fi' ? 'active' : ''}`}
              onClick={() => setLang('fi')}
              aria-pressed={lang === 'fi'}
            >
              FI
            </button>
            <button
              type="button"
              className={`lang-tab ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      </div>
      <div className="settings-card">
        <h3>{t('settings.remindersTitle')}</h3>
        <p>{t('settings.remindersDesc')}</p>
        <div className="settings-row">
          <span>{t('settings.remindDayBefore')}</span>
          <input type="checkbox" checked disabled readOnly />
        </div>
        <div className="settings-row">
          <span>{t('settings.remindHourBefore')}</span>
          <input type="checkbox" checked disabled readOnly />
        </div>
        <div className="settings-row">
          <span>{t('settings.emailNotifications')}</span>
          <input type="checkbox" disabled />
        </div>
        <div className="settings-row">
          <span>{t('settings.pushNotifications')}</span>
          <input type="checkbox" disabled />
        </div>
      </div>
      <div className="settings-card">
        <h3>{t('settings.scheduleTitle')}</h3>
        <p>{t('settings.scheduleDesc')}</p>
        <input
          type="text"
          className="schedule-url-input"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder={t('settings.scheduleUrlPlaceholder')}
        />
        <div className="settings-row">
          <span>{t('settings.scheduleUrlLabel')}</span>
          <button className="btn small" onClick={saveScheduleUrl}>
            {t('settings.scheduleSaveBtn')}
          </button>
        </div>
      </div>
      <div className="settings-card">
        <h3>{t('settings.backupTitle')}</h3>
        <div className="settings-row">
          <span>{t('settings.exportLabel')}</span>
          <button className="btn small" onClick={doExport}>
            {t('settings.exportBtn')}
          </button>
        </div>
        <textarea
          className="backup-text"
          rows="4"
          value={backup}
          onChange={(e) => setBackup(e.target.value)}
          placeholder={t('settings.backupPlaceholder')}
        />
        <div className="settings-row">
          <span>{t('settings.importLabel')}</span>
          <button className="btn small" onClick={doImport}>
            {t('settings.importBtn')}
          </button>
        </div>
      </div>
      <div className="settings-card">
        <h3>{t('settings.dataTitle')}</h3>
        <p>{t('settings.dataDesc')}</p>
        <div className="settings-row">
          <span>{t('settings.clearAllLabel')}</span>
          <button
            className="btn ghost small"
            onClick={() => {
              if (confirm(t('confirm.clearAll'))) {
                setState({ courses: [], assignments: [] })
                showToast(t('toast.dataCleared'))
              }
            }}
          >
            {t('settings.clearBtn')}
          </button>
        </div>
      </div>
    </>
  )
}
