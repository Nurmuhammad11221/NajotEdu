import React, { useState, useRef } from "react";
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

const boshqarishItems = [
  { icon: <PlayLesson sx={{ fontSize: 17 }} />, label: "Kurslar", path: "/dashboard/kurslar" },
  { icon: <LocationOn sx={{ fontSize: 17 }} />, label: "Xonalar", path: "/dashboard/xonalar" },
  { icon: <AccountBalance sx={{ fontSize: 17 }} />, label: "Filial", path: "/dashboard/filial" },
  { icon: <Badge sx={{ fontSize: 17 }} />, label: "Hodimlar", path: "/dashboard/hodimlar" },
  { icon: <Report sx={{ fontSize: 17 }} />, label: "Sabablar", path: "/dashboard/sabablar" },
  { icon: <AdminPanelSettings sx={{ fontSize: 17 }} />, label: "Rollar", path: "/dashboard/rollar" },
  { icon: <MonetizationOn sx={{ fontSize: 17 }} />, label: "Coin", path: "/dashboard/coin" },
  { icon: <Message sx={{ fontSize: 17 }} />, label: "Xabar Yuborish", path: "/dashboard/xabar" },
  { icon: <Help sx={{ fontSize: 17 }} />, label: "FAQ", path: "/dashboard/faq" },
  { icon: <VerifiedUser sx={{ fontSize: 17 }} />, label: "Tekshiruv", path: "/dashboard/tekshiruv" },
];

const navItems = [
  { icon: <DashboardIcon fontSize="small" />, label: "Asosiy", path: "/dashboard" },
  { icon: <School fontSize="small" />, label: "O'qituvchilar", path: "/dashboard/oqituvchilar" },
  { icon: <Class fontSize="small" />, label: "Guruhlar", path: "/dashboard/groups" },
  { icon: <PeopleAlt fontSize="small" />, label: "Talabalar", path: "/dashboard/students" },
  { icon: <CardGiftcard fontSize="small" />, label: "Sovg'alar", path: "/dashboard/sovgalar" },
  { icon: <PhotoLibrary fontSize="small" />, label: "Mediya", path: "/dashboard/mediya", badge: true },
  { icon: <ManageAccounts fontSize="small" />, label: "Boshqarish", hasSubmenu: true },
];

const Layout = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const leaveTimer = useRef(null);

  const handleEnter = () => {
    clearTimeout(leaveTimer.current);
    setShowSubmenu(true);
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setShowSubmenu(false), 150);
  };

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f5fb]">

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`relative flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? "w-56" : "w-16"
          } bg-white shadow-md flex-shrink-0 z-40`}
      >
        {/* Submenu Panel */}
        {showSubmenu && (
          <div
            className="absolute top-0 left-full z-50 h-full"
            style={{ width: "208px" }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave} zzyyyyyyyyyyyyyyyyyyyyyyyyyyzzyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
          >
            <div className="bg-white shadow-2xl border-r border-gray-100 h-full flex flex-col py-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-2">
                Menu
              </p>
              {boshqarishItems.map((sub) => {
                const cleanPath = (currentPath || window.location.pathname || "").replace(/\/$/, "").toLowerCase();
                const cleanSubPath = (sub.path || "").replace(/\/$/, "").toLowerCase();
                const isActive = cleanPath === cleanSubPath;
                return (
                  <button
                    key={sub.label}
                    onClick={() => { navigate(sub.path); setShowSubmenu(false); }}
                    className={`flex items-center w-full gap-3 px-4 py-2.5 text-[13px] transition-colors ${isActive ? "bg-[#7c3aed] text-white font-semibold animate-pulse-subtle" : "text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed]"
                      }`}
                  >
                    <span className={isActive ? "text-white" : "text-gray-400"}>{sub.icon}</span>
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

              // Maxsus holat: Boshqarish menyusining o'zi active bo'lishi agar ichidagi sahifalar faol bo'lsa
              const isSubmenuActive = item.hasSubmenu && boshqarishItems.some(sub => {
                const cleanSubPath = (sub.path || "").replace(/\/$/, "").toLowerCase();
                return cleanPath === cleanSubPath;
              });

              const trulyActive = isActive || isSubmenuActive;

              return (
                <button
                  key={item.label}
                  onClick={() => !item.hasSubmenu && navigate(item.path)}
                  onMouseEnter={item.hasSubmenu ? handleEnter : undefined}
                  onMouseLeave={item.hasSubmenu ? handleLeave : undefined}
                  className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all relative ${trulyActive
                      ? "bg-[#7c3aed] text-white shadow-md shadow-purple-500/10"
                      : "text-gray-600 hover:bg-purple-50 hover:text-[#7c3aed]"
                    }`}
                >
                  <span className={`flex-shrink-0 flex items-center justify-center transition-colors ${trulyActive ? "text-white" : "text-gray-500"}`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && <span className="font-semibold">{item.label}</span>}
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
                  <p className="text-xs font-semibold text-gray-700">Obuna</p>
                  <p className="text-[10px] text-orange-500">Obunangit tugagan</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Refresh sx={{ fontSize: 13 }} />
                Obunani yangilash
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
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-20">
          <div className="flex items-center bg-white rounded-xl px-4 py-2.5 gap-2 w-72 shadow-sm border border-gray-100 border-opacity-50">
            <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
            <input type="text" placeholder="Qidirish..." className="bg-transparent text-[13px] outline-none text-gray-600 w-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-gray-100 border-opacity-50 shadow-sm rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-[13px] text-gray-600 font-medium">AiCoder markazi</span>
              <ExpandMore sx={{ fontSize: 16, color: "#9ca3af" }} />
            </div>
            <select className="text-[13px] text-gray-600 bg-white border border-gray-100 border-opacity-50 shadow-sm rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-gray-50">
              <option>O'zbekcha</option>
              <option>Русский</option>
              <option>English</option>
            </select>
            <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 bg-white border border-gray-100 border-opacity-50 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
              {darkMode ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
            </button>
            <button className="w-10 h-10 bg-white border border-gray-100 border-opacity-50 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 relative">
              <Notifications sx={{ fontSize: 18 }} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-sm overflow-hidden">
              <img src="https://i.pravatar.cc/100" alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT — Outlet orqali har bir sahifa shu yerga chiqadi */}
        <main className="flex-1 overflow-y-auto relative">
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
              }}
            />
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
