import { useState } from "react";
import { useApp } from "../store.jsx";
import LangTabs from "../components/LangTabs.jsx";

function exportString(data) {
  const payload = { app: "kurssikalenteri", version: 1, data };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

function parseImport(code) {
  let payload;
  try {
    payload = JSON.parse(decodeURIComponent(atob(code)));
  } catch {
    return null;
  }
  const data = payload?.app === "kurssikalenteri" ? payload.data : null;
  if (!data || !Array.isArray(data.courses) || !Array.isArray(data.assignments)) return null;
  return data;
}

export default function SettingsView() {
  const { data, lang, t, clearAllData, importData, showToast } = useApp();
  const [backupText, setBackupText] = useState("");

  const handleExport = () => {
    const code = exportString(data);
    setBackupText(code);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => showToast(t("toast.exportCopied")))
        .catch(() => showToast(t("toast.exportCreated")));
    } else {
      showToast(t("toast.exportCreated"));
    }
  };

  const handleImport = async () => {
    let code = backupText.trim();
    if (!code && navigator.clipboard?.readText) {
      try { code = (await navigator.clipboard.readText()).trim(); } catch { /* permission denied */ }
      if (code) setBackupText(code);
    }
    if (!code) { showToast(t("toast.importPaste")); return; }
    const imported = parseImport(code);
    if (!imported) { showToast(t("toast.invalidCode")); return; }
    if (!window.confirm(t("confirm.importOverwrite"))) return;
    importData(imported);
  };

  const handleClear = () => {
    if (window.confirm(t("confirm.clearAll"))) clearAllData();
  };

  return (
    <>
      <div className="settings-card">
        <h3>{t("settings.languageTitle")}</h3>
        <div className="settings-row">
          <span>{t("settings.languageTitle")}</span>
          <LangTabs className="settings-lang-tabs" />
        </div>
      </div>

      <div className="settings-card">
        <h3>{t("settings.remindersTitle")}</h3>
        <p>{lang === "fi" ? "Ei vielä käytössä" : "Not yet available"}</p>
        <div className="settings-row"><span>{t("settings.remindDayBefore")}</span><input type="checkbox" defaultChecked disabled /></div>
        <div className="settings-row"><span>{t("settings.remindHourBefore")}</span><input type="checkbox" defaultChecked disabled /></div>
        <div className="settings-row"><span>{t("settings.emailNotifications")}</span><input type="checkbox" disabled /></div>
        <div className="settings-row"><span>{t("settings.pushNotifications")}</span><input type="checkbox" disabled /></div>
      </div>

      <div className="settings-card">
        <h3>{t("settings.backupTitle")}</h3>
        <div className="settings-row">
          <span>{t("settings.exportLabel")}</span>
          <button className="btn small" onClick={handleExport}>{t("settings.exportBtn")}</button>
        </div>
        <textarea
          className="backup-text"
          rows={4}
          value={backupText}
          onChange={(e) => setBackupText(e.target.value)}
          placeholder={t("settings.backupPlaceholder")}
        />
        <div className="settings-row">
          <span>{t("settings.importLabel")}</span>
          <button className="btn small" onClick={handleImport}>{t("settings.importBtn")}</button>
        </div>
      </div>

      <div className="settings-card">
        <h3>{t("settings.dataTitle")}</h3>
        <p>{t("settings.dataDesc")}</p>
        <div className="settings-row">
          <span>{t("settings.clearAllLabel")}</span>
          <button className="btn ghost small" onClick={handleClear}>{t("settings.clearBtn")}</button>
        </div>
      </div>
    </>
  );
}
