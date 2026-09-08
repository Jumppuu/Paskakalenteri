import { useApp } from "../store.jsx";

export default function LangTabs({ className = "" }) {
  const { lang, setLang } = useApp();
  const langs = ["fi", "en"];
  return (
    <div className={`lang-tabs ${className}`.trim()} role="group" aria-label="Language / Kieli">
      {langs.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-tab ${lang === code ? "active" : ""}`.trim()}
          data-lang={code}
          title={code === "fi" ? "Suomi" : "English"}
          aria-label={code === "fi" ? "Suomi" : "English"}
          aria-pressed={lang === code ? "true" : "false"}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
