import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PeopleAlt,
  MenuBook,
  Class,
  CardGiftcard,
  ManageAccounts,
  Dashboard as DashboardIcon,
  Notifications,
  DarkMode,
  LightMode,
  Search,
  ExpandMore,
  ExpandLess,
  ChevronLeft,
  ChevronRight,
  Refresh,
} from "@mui/icons-material";

const navItems = [
  { icon: <DashboardIcon fontSize="small" />, label: "Asosiy", active: true },
  { icon: <PeopleAlt fontSize="small" />, label: "O'qituvchilar" },
  { icon: <Class fontSize="small" />, label: "Sinflar" },
  { icon: <PeopleAlt fontSize="small" />, label: "Talabalar" },
  { icon: <CardGiftcard fontSize="small" />, label: "Sovg'alar" },
  { icon: <ManageAccounts fontSize="small" />, label: "Boshqarish" },
];

const stats = [
  { icon: <Class sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Sinflar", value: 0 },
  { icon: <MenuBook sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Fanlar", value: 0 },
  { icon: <PeopleAlt sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Talabalar", value: 1 },
  { icon: <CardGiftcard sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Sovg'alar", value: 3 },
  { icon: <PeopleAlt sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "O'qituvchilar", value: 0 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("Asosiy");

  return (
    <div className={`flex h-screen w-full overflow-hidden ${darkMode ? "bg-gray-900" : "bg-[#f4f5fb]"}`}>
      
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`flex flex-col justify-between transition-all duration-300 ${
          sidebarOpen ? "w-56" : "w-16"
        } bg-white shadow-md flex-shrink-0`}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            {sidebarOpen && (
              <span className="text-[#7c3aed] font-bold text-lg tracking-tight">
                EduCoin
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-[#7c3aed] transition-colors ml-auto"
            >
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="mt-4 px-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                  activeNav === item.label
                    ? "bg-[#7c3aed] text-white shadow-sm"
                    : "text-gray-600 hover:bg-purple-50 hover:text-[#7c3aed]"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Obuna section */}
        <div className="p-3 mb-2">
          {sidebarOpen ? (
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  O
                </div>
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
            <button
              onClick={() => navigate("/login")}
              className="w-full flex justify-center text-red-500"
            >
              <Refresh />
            </button>
          )}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ===== HEADER ===== */}
        <header className="bg-white shadow-sm flex items-center justify-between px-6 py-3 flex-shrink-0">
          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-64">
            <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Qidirish..."
              className="bg-transparent text-[13px] outline-none text-gray-600 w-full"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Language */}
            <select className="text-[13px] text-gray-600 bg-gray-100 rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option>O'zbekcha</option>
              <option>Русский</option>
              <option>English</option>
            </select>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600"
            >
              {darkMode ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
            </button>

            {/* Notifications */}
            <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 relative">
              <Notifications sx={{ fontSize: 18 }} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer">
              A
            </div>
          </div>
        </header>

        {/* ===== PAGE BODY ===== */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Salom, creator!</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">EduCoin platformasiga xush kelibsiz!</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
              >
                {stat.icon}
                <span className="text-[12px] text-gray-500 font-medium">{stat.label}</span>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Dars Jadvali */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setScheduleOpen(!scheduleOpen)}
              className="w-full flex items-center justify-between px-6 py-4 text-gray-700 font-semibold text-[15px] hover:bg-gray-50 transition-colors"
            >
              <span>Dars Jadvali</span>
              {scheduleOpen ? (
                <ExpandLess sx={{ color: "#9ca3af" }} />
              ) : (
                <ExpandMore sx={{ color: "#9ca3af" }} />
              )}
            </button>

            {scheduleOpen && (
              <div className="px-6 py-8 text-center text-gray-400 text-[13px] border-t border-gray-100">
                Hozircha dars jadvali mavjud emas
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
