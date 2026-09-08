import { useApp } from "../store.jsx";

export default function WelcomeCard() {
  const { data, welcomeDismissed, t, dismissWelcome, openCourseModal, openAssignmentModal } = useApp();

  const isNewUser = !data.courses.length && !data.assignments.length;
  if (welcomeDismissed && !isNewUser) return null;

  return (
    <div className="welcome-card">
      <button
        className="welcome-close"
        aria-label={t("welcome.closeAria")}
        title={t("aria.close")}
        onClick={dismissWelcome}
      >
        ✕
      </button>
      <div className="welcome-title">{t("welcome.title")}</div>
      <p className="welcome-lead">{t("welcome.lead")}</p>
      <ol className="welcome-steps">
        <li dangerouslySetInnerHTML={{ __html: t("welcome.step1") }} />
        <li dangerouslySetInnerHTML={{ __html: t("welcome.step2") }} />
        <li dangerouslySetInnerHTML={{ __html: t("welcome.step3") }} />
      </ol>
      <div className="welcome-actions">
        <button
          className="btn primary small"
          onClick={() => { dismissWelcome(); openCourseModal(); }}
        >
          ＋ {t("welcome.addCourse")}
        </button>
        <button
          className="btn small"
          onClick={() => { dismissWelcome(); openAssignmentModal(); }}
        >
          ＋ {t("nav.addTask")}
        </button>
      </div>
    </div>
  );
}
