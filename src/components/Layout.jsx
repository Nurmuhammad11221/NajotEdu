import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  PeopleAlt,
  CardGiftcard,
  Class,
  ManageAccounts,
  Dashboard as DashboardIcon,
  Notifications,
  DarkMode,
  LightMode,
  Search,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Refresh,
  School,
  PlayLesson,
  LocationOn,
  AccountBalance,
  Badge,
  Report,
  AdminPanelSettings,
  MonetizationOn,
  Message,
  Help,
  VerifiedUser,
  PhotoLibrary,
} from "@mui/icons-material";

const translations = {
  uz: {
    dashboard: "Asosiy",
    teachers: "O'qituvchilar",
    groups: "Guruhlar",
    students: "Talabalar",
    gifts: "Sovg'alar",
    media: "Mediya",
    management: "Boshqarish",
    courses: "Kurslar",
    rooms: "Xonalar",
    staff: "Xodimlar",
    coin: "Coin",
    sendMessage: "Xabar yuborish",
    searchPlaceholder: "Qidirish...",
    searchResults: "Qidiruv natijalari",
    noResults: "Topilmadi",
    aiCenter: "AiCoder markazi",
    language: "Til",
    uzbek: "O'zbekcha",
    russian: "Русский",
    english: "English",
    subscription: "Obuna",
    renewSubscription: "Obunani yangilash",
  },
  ru: {
    dashboard: "Главная",
    teachers: "Учителя",
    groups: "Группы",
    students: "Студенты",
    gifts: "Подарки",
    media: "Медиа",
    management: "Управление",
    courses: "Курсы",
    rooms: "Аудитории",
    staff: "Сотрудники",
    coin: "Коин",
    sendMessage: "Отправить сообщение",
    searchPlaceholder: "Поиск...",
    searchResults: "Результаты поиска",
    noResults: "Не найдено",
    aiCenter: "AiCoder центр",
    language: "Язык",
    uzbek: "O'zbekcha",
    russian: "Русский",
    english: "English",
    subscription: "Подписка",
    renewSubscription: "Обновить подписку",
  },
  en: {
    dashboard: "Dashboard",
    teachers: "Teachers",
    groups: "Groups",
    students: "Students",
    gifts: "Gifts",
    media: "Media",
    management: "Management",
    courses: "Courses",
    rooms: "Rooms",
    staff: "Staff",
    coin: "Coin",
    sendMessage: "Send message",
    searchPlaceholder: "Search...",
    searchResults: "Search results",
    noResults: "No results",
    aiCenter: "AiCoder hub",
    language: "Language",
    uzbek: "O'zbekcha",
    russian: "Русский",
    english: "English",
    subscription: "Subscription",
    renewSubscription: "Renew subscription",
  },
};

const boshqarishItems = [
  { icon: <PlayLesson sx={{ fontSize: 17 }} />, labelKey: "courses", path: "/dashboard/kurslar" },
  { icon: <LocationOn sx={{ fontSize: 17 }} />, labelKey: "rooms", path: "/dashboard/xonalar" },
  { icon: <ManageAccounts sx={{ fontSize: 17 }} />, labelKey: "staff", path: "/dashboard/xodimlar" },
  { icon: <MonetizationOn sx={{ fontSize: 17 }} />, labelKey: "coin" },
  { icon: <Message sx={{ fontSize: 17 }} />, labelKey: "sendMessage" },
];

const navItems = [
  { icon: <DashboardIcon fontSize="small" />, labelKey: "dashboard", path: "/dashboard" },
  { icon: <School fontSize="small" />, labelKey: "teachers", path: "/dashboard/oqituvchilar" },
  { icon: <Class fontSize="small" />, labelKey: "groups", path: "/dashboard/groups" },
  { icon: <PeopleAlt fontSize="small" />, labelKey: "students", path: "/dashboard/students" },
  { icon: <CardGiftcard fontSize="small" />, labelKey: "gifts", path: "/dashboard/sovgalar" },
  { icon: <PhotoLibrary fontSize="small" />, labelKey: "media", path: "/dashboard/mediya", badge: true },
  { icon: <ManageAccounts fontSize="small" />, labelKey: "management", hasSubmenu: true },
];

const Layout = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState("uz");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ students: [], teachers: [], groups: [], courses: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const leaveTimer = useRef(null);
  const searchRef = useRef(null);

  const toggleSubmenu = () => {
    setShowSubmenu((prev) => !prev);
  };

  const location = useLocation();
  const currentPath = location.pathname;

  const t = (key) => translations[lang]?.[key] || translations.uz[key] || key;

  useEffect(() => {
    const storedLang = localStorage.getItem("lms_lang");
    let storedTheme = localStorage.getItem("lms_theme");
    if (storedLang && translations[storedLang]) {
      setLang(storedLang);
    }
    if (storedTheme === "dark") {
      setDarkMode(true);
    } else if (!storedTheme) {
      localStorage.setItem("lms_theme", "light");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("lms_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("lms_theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("lms_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (!localStorage.getItem("lms_token")) {
      navigate("/login");
    }
  }, [navigate]);

  // Global search: debounce and fetch lists then filter
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults({ students: [], teachers: [], groups: [] });
      setShowSearchDropdown(false);
      return;
    }

    setShowSearchDropdown(true);
    setSearchLoading(true);
    const id = setTimeout(async () => {
      try {
        const q = searchQuery.trim().toLowerCase();
        const [stuResp, teaResp, grpResp, courseResp] = await Promise.allSettled([
          import("../utils/api").then(m => m.api.getStudents()),
          import("../utils/api").then(m => m.api.getTeachers()),
          import("../utils/api").then(m => m.api.getGroups()),
          import("../utils/api").then(m => m.api.getCourses()),
        ]);

        const allStudents = stuResp.status === 'fulfilled' ? (Array.isArray(stuResp.value) ? stuResp.value : stuResp.value.data || []) : [];
        const allTeachers = teaResp.status === 'fulfilled' ? (Array.isArray(teaResp.value) ? teaResp.value : teaResp.value.data || []) : [];
        const allGroups = grpResp.status === 'fulfilled' ? (Array.isArray(grpResp.value) ? grpResp.value : grpResp.value.data || []) : [];
        const allCourses = courseResp.status === 'fulfilled' ? (Array.isArray(courseResp.value) ? courseResp.value : courseResp.value.data || []) : [];

        const students = (allStudents || []).filter(s => (s.full_name || s.name || '').toLowerCase().includes(q)).slice(0,8).map(s => ({ id: s.id, name: s.full_name || s.name }));
        const teachers = (allTeachers || []).filter(t => (t.full_name || t.name || '').toLowerCase().includes(q)).slice(0,6).map(t => ({ id: t.id, name: t.full_name || t.name }));
        const groups = (allGroups || []).filter(g => (g.name || g.nomi || '').toLowerCase().includes(q)).slice(0,8).map(g => ({ id: g.id, name: g.name || g.nomi }));
        const courses = (allCourses || []).filter(c => (c.title || c.name || '').toLowerCase().includes(q)).slice(0,8).map(c => ({ id: c.id, name: c.title || c.name }));

        setSearchResults({ students, teachers, groups, courses });
      } catch (e) {
        setSearchResults({ students: [], teachers: [], groups: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [searchQuery, navigate]);

  // close dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lms_token");
    navigate("/login");
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f5fb] text-slate-900'}`}>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`relative flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? "w-56" : "w-16"
          } bg-white dark:bg-slate-900 shadow-md dark:shadow-slate-950/50 flex-shrink-0 z-40`}
      >
        {/* Submenu Panel */}
        <div
          className={`absolute top-0 left-full z-50 h-full transform transition-transform duration-300 ease-out ${showSubmenu ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}
          style={{ width: "250px" }}
        >
          <div className="bg-white dark:bg-slate-900 shadow-xl dark:shadow-slate-950/30 border-l border-gray-100 dark:border-slate-700 h-full flex flex-col py-3">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSubmenu(false)}
                    className="w-9 h-9 rounded-full bg-[#7c3aed] text-white flex items-center justify-center shadow-sm transition-colors hover:bg-[#5b21b6]"
                  >
                    <ChevronLeft sx={{ fontSize: 18 }} />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{t("management")}</span>
                </div>                                                                                                                           
                <button onClick={() => setShowSubmenu(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ✕
                </button>
              </div>
              <div className="px-3 py-2 space-y-1.5">
                {boshqarishItems.map((sub) => {
                  const cleanPath = (currentPath || window.location.pathname || "").replace(/\/$/, "").toLowerCase();
                  const cleanSubPath = (sub.path || "").replace(/\/$/, "").toLowerCase();
                  const isActive = sub.path ? cleanPath === cleanSubPath : false;
                  const isClickable = Boolean(sub.path);
                  return (
                    <button
                      key={sub.labelKey}
                      onClick={() => {
                        if (isClickable) {
                          navigate(sub.path);
                          setShowSubmenu(false);
                        }
                      }}
                      className={`flex items-center w-full gap-3 rounded-[18px] px-4 py-2.5 text-[13px] font-medium transition-all duration-200 ${isActive ? "bg-[#7c3aed] text-white shadow-sm border border-transparent" : isClickable ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border border-gray-100 dark:border-slate-700 hover:bg-[#f3e8ff] dark:hover:bg-slate-800 hover:text-[#7c3aed]" : "bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"}`}
                      disabled={!isClickable}
                    >
                      <span className={`flex items-center justify-center w-10 h-10 rounded-2xl ${isActive ? "bg-white text-[#7c3aed]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                        {sub.icon}
                      </span>
                      <span className="text-[13px]">{t(sub.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        

        {/* Logo */}
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">E</div>
                <span className="text-[#7c3aed] font-bold text-lg tracking-tight">EduCoin</span>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-[#7c3aed] transition-colors ml-auto">
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="mt-4 px-2 space-y-1">
            {navItems.map((item) => {
              const cleanPath = (currentPath || window.location.pathname || "").replace(/\/$/, "").toLowerCase();
              const cleanItemPath = (item.path || "").replace(/\/$/, "").toLowerCase();

              const isActive = item.path && (
                cleanPath === cleanItemPath ||
                (cleanItemPath === "/dashboard" && cleanPath === "/dashboard")
              );

              const childRouteActive = item.hasSubmenu && boshqarishItems.some(sub => {
                const cleanSubPath = (sub.path || "").replace(/\/$/, "").toLowerCase();
                return cleanPath === cleanSubPath;
              });

              const isSubmenuParentActive = item.hasSubmenu && showSubmenu && !childRouteActive;
              const trulyActive = isActive || isSubmenuParentActive;

              return (
                <button
                  key={item.labelKey}
                  onClick={() => {
                    if (item.hasSubmenu) {
                      toggleSubmenu();
                    } else {
                      setShowSubmenu(false);
                      navigate(item.path);
                    }
                  }}
                  className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all relative ${trulyActive
                      ? "bg-[#7c3aed] text-white shadow-md shadow-purple-500/10"
                      : "text-gray-600 hover:bg-purple-50 hover:text-[#7c3aed]"
                    }`}
                >
                  <span className={`flex-shrink-0 flex items-center justify-center transition-colors ${trulyActive ? "text-white" : "text-gray-500"}`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && <span className="font-semibold">{t(item.labelKey)}</span>}
                  {item.badge && sidebarOpen && (
                    <span className="ml-auto bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Obuna */}
        <div className="p-3 mb-2">
          {sidebarOpen ? (
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">O</div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-100">{t("subscription")}</p>
                  <p className="text-[10px] text-orange-500">{lang === 'ru' ? 'Подписка истекла' : lang === 'en' ? 'Subscription expired' : 'Obunangiz tugagan'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Refresh sx={{ fontSize: 13 }} />
                {t("renewSubscription")}
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="w-full flex justify-center text-red-500">
              <Refresh />
            </button>
          )}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors duration-500">
          <div className="relative" ref={searchRef}>
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 gap-2 w-72 shadow-sm dark:shadow-slate-950/30 border border-gray-100 dark:border-slate-700 border-opacity-50 transition-colors duration-300">
              <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim().length) setShowSearchDropdown(true); }}
                type="text"
                placeholder={t("searchPlaceholder")}
                className="bg-transparent text-[13px] outline-none text-gray-600 dark:text-slate-200 w-full"
              />
            </div>

            {showSearchDropdown && (
              <div className="absolute left-0 mt-2 w-[520px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-slate-950/30 z-50 p-3 transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-100">{t("searchResults")}</h4>
                  <div className="text-xs text-gray-500">{searchLoading ? (lang === 'ru' ? 'Загрузка...' : lang === 'en' ? 'Loading...' : 'Yuklanmoqda...') : ''}</div>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {/* Teachers */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <School sx={{ fontSize: 16, color: '#94a3b8' }} />
                      <div className="text-sm text-gray-700 dark:text-slate-100 font-semibold">{t("teachers")}</div>
                    </div>
                    {(searchResults.teachers || []).length === 0 ? (
                      <div className="text-sm text-gray-400 dark:text-slate-400">{t("noResults")}</div>
                    ) : (
                      (searchResults.teachers || []).map(t => (
                        <div key={t.id} onClick={() => { navigate('/dashboard/oqituvchilar'); setShowSearchDropdown(false); }} className="p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <div className="text-sm text-gray-700">{t.name}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Groups */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Class sx={{ fontSize: 16, color: '#94a3b8' }} />
                      <div className="text-sm text-gray-700 dark:text-slate-100 font-semibold">{t("groups")}</div>
                    </div>
                    {(searchResults.groups || []).length === 0 ? (
                      <div className="text-sm text-gray-400 dark:text-slate-400">{t("noResults")}</div>
                    ) : (
                      (searchResults.groups || []).map(g => (
                        <div key={g.id} onClick={() => { navigate('/dashboard/groups'); setShowSearchDropdown(false); }} className="p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <div className="text-sm text-gray-700">{g.name}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Courses */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <PlayLesson sx={{ fontSize: 16, color: '#94a3b8' }} />
                      <div className="text-sm text-gray-700 dark:text-slate-100 font-semibold">{t("courses")}</div>
                    </div>
                    {(searchResults.courses || []).length === 0 ? (
                      <div className="text-sm text-gray-400 dark:text-slate-400">{t("noResults")}</div>
                    ) : (
                      (searchResults.courses || []).map(c => (
                        <div key={c.id} onClick={() => { navigate('/dashboard/kurslar'); setShowSearchDropdown(false); }} className="p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <div className="text-sm text-gray-700">{c.name}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Students */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <PeopleAlt sx={{ fontSize: 16, color: '#94a3b8' }} />
                      <div className="text-sm text-gray-700 dark:text-slate-100 font-semibold">{t("students")}</div>
                    </div>
                    {(searchResults.students || []).length === 0 ? (
                      <div className="text-sm text-gray-400 dark:text-slate-400">{t("noResults")}</div>
                    ) : (
                      (searchResults.students || []).map(s => (
                        <div key={s.id} onClick={() => { navigate('/dashboard/students'); setShowSearchDropdown(false); }} className="p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <div className="text-sm text-gray-700">{s.name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 border-opacity-50 shadow-sm rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <span className="text-[13px] text-gray-600 dark:text-slate-100 font-medium">{t("aiCenter")}</span>
              <ExpandMore sx={{ fontSize: 16, color: "#9ca3af" }} />
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="text-[13px] text-gray-600 bg-white dark:bg-slate-800 dark:text-slate-100 border border-gray-100 border-opacity-50 shadow-sm rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <option value="uz">🇺🇿 {t("uzbek")}</option>
              <option value="ru">🇷🇺 {t("russian")}</option>
              <option value="en">🇬🇧 {t("english")}</option>
            </select>
            <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 border-opacity-50 shadow-sm dark:shadow-slate-950/30 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-slate-100">
              {darkMode ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
            </button>
            <button className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 border-opacity-50 shadow-sm dark:shadow-slate-950/30 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-slate-100 relative">
              <Notifications sx={{ fontSize: 18 }} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-sm overflow-hidden">
              <img src="https://i.pravatar.cc/100" alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT — Outlet orqali har bir sahifa shu yerga chiqadi */}
        <main className={`flex-1 overflow-y-auto relative transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f5fb] text-slate-900'}`}>
          {/* Boshqarish submenu ochilganda orqa fon qorayadi */}
          {showSubmenu && (
            <div
              className="absolute inset-0 bg-black bg-opacity-20 z-30 transition-opacity duration-200"
              onMouseEnter={() => {
                clearTimeout(leaveTimer.current);
                setShowSubmenu(true);
              }}
              onMouseLeave={() => {
                leaveTimer.current = setTimeout(() => setShowSubmenu(false), 150);
              }}ms-appid:undefined
            />
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
