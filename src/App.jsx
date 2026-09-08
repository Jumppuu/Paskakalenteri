import { useApp } from "./store.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Toast from "./components/Toast.jsx";
import WelcomeCard from "./components/WelcomeCard.jsx";
import AssignmentModal from "./components/AssignmentModal.jsx";
import CourseModal from "./components/CourseModal.jsx";
import CalendarView from "./views/CalendarView.jsx";
import TasksView from "./views/TasksView.jsx";
import CoursesView from "./views/CoursesView.jsx";
import SettingsView from "./views/SettingsView.jsx";

const VIEWS = {
  calendar: CalendarView,
  tasks: TasksView,
  courses: CoursesView,
  settings: SettingsView,
};

export default function App() {
  const { view, sidebarCollapsed, assignmentModal, courseModal } = useApp();
  const ViewComponent = VIEWS[view] || CalendarView;

  return (
    <>
      <div className={`app ${sidebarCollapsed ? "sidebar-collapsed" : ""}`.trim()}>
        <Sidebar />
        <main className="content">
          <Topbar />
          <section className="view">
            {view === "calendar" && <WelcomeCard />}
            <ViewComponent />
          </section>
        </main>
      </div>

      {assignmentModal && <AssignmentModal />}
      {courseModal && <CourseModal />}
      <Toast />
    </>
  );
}
