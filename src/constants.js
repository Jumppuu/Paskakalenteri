export const STORE_KEY = "kurssikalenteri_v1";
export const THEME_KEY = "kurssikalenteri_theme";
export const SIDEBAR_KEY = "kurssikalenteri_sidebar";
export const WELCOME_KEY = "kurssikalenteri_welcome_seen";
export const LANG_KEY = "kurssikalenteri_lang";

export const COLORS = [
  "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6",
  "#f97316", "#64748b",
];

export const WEEKDAYS_BY_LANG = {
  fi: ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export const WEEKDAYS_LONG_BY_LANG = {
  fi: ["Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

export const MONTHS_BY_LANG = {
  fi: ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu",
       "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"],
  en: ["January", "February", "March", "April", "May", "June",
       "July", "August", "September", "October", "November", "December"],
};

export const PRIORITY_LABELS_BY_LANG = {
  fi: { low: "Matala", normal: "Normaali", high: "Korkea" },
  en: { low: "Low", normal: "Normal", high: "High" },
};

export const STATUS_LABELS_BY_LANG = {
  fi: { todo: "Tekemättä", doing: "Työn alla", done: "Valmis" },
  en: { todo: "To do", doing: "In progress", done: "Done" },
};
