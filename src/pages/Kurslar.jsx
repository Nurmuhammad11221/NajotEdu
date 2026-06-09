import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Delete, Edit, Add, Close, AttachMoney } from "@mui/icons-material";
import { api } from "../utils/api";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const tabs = [
  { label: "Kurslar", path: "/dashboard/kurslar" },
  { label: "Xonalar", path: "/dashboard/xonalar" },
  { label: "Xodimlar", path: "/dashboard/xodimlar" },
];

const filialTabs = ["Filial 1", "Filial 2"];

const darsVaqtlar = ["30 min", "45 min", "60 min", "90 min", "120 min"];
const kursOylar = ["1 oy", "2 oy", "3 oy", "6 oy", "12 oy"];

const rangli = [
  "#1e3a5f", "#7c3aed", "#dc2626", "#ea580c",
  "#15803d", "#0891b2", "#2563eb", "#db2777"
];

const cardColors = [
  "bg-white border border-gray-200",
  "bg-rose-50 border border-rose-100",
  "bg-yellow-50 border border-yellow-100",
  "bg-green-50 border border-green-100",
  "bg-blue-50 border border-blue-100",
  "bg-purple-50 border border-purple-100",
];

const defaultForm = {
  nomi: "",
  filiallar: ["Filial 1", "Filial 2"],
  darsVaqt: "",
  kursOy: "",
  narx: "",
  description: "A little about the company and the team that you'll be working with.",
  rang: "#7c3aed",
};

const sampleCourses = [
  {
    id: 1,
    title: "Frontend Bootcamp",
    description: "Zamonaviy Frontend texnologiyalarini noldan mukammal darajagacha o'rganing (React, TailwindCSS, JS).",
    duration: "90 min",
    period: "6 oy",
    price: "1 200 000 so'm",
    rang: "#7c3aed",
  },
  {
    id: 2,
    title: "Backend Node.js",
    description: "Katta yuklamali serverlar va ma'lumotlar ombori bilan ishlashni o'rganing (Node.js, Express, MongoDB).",
    duration: "90 min",
    period: "6 oy",
    price: "1 500 000 so'm",
    rang: "#2563eb",
  }
];

const Kurslar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Kurslar");
  const [activeFilial, setActiveFilial] = useState("Filial 1");
  const [courses, setCourses] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [filialOptions] = useState(["Filial 1", "Filial 2"]);
  const [deleteItem, setDeleteItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [archiveCourses, setArchiveCourses] = useState([]);

  const formatCourse = (c, idx) => ({
    id: c.id || idx + 1,
    title: c.name || c.title || "Dasturlash",
    description: c.description || "Tavsif berilmagan.",
    duration: c.duration || `${c.duration_hours || 90} min`,
    period: c.period || `${c.duration_month || 6} oy`,
    price: c.price && typeof c.price === "string" ? c.price : `${Number(c.price || 1200000).toLocaleString()} so'm`,
    rang: c.rang || rangli[idx % rangli.length] || "#7c3aed",
  });

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      const list = Array.isArray(data) ? data : data.data || [];
      const formatted = list.map(formatCourse);
      if (formatted.length > 0) {
        setCourses(formatted);
        localStorage.setItem("lms_courses", JSON.stringify(formatted));
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.warn("Backend API error:", err);
      setCourses([]);
    }
  };

  const loadArchiveCourses = async () => {
    try {
      const data = await api.getArchiveCourses();
      const list = Array.isArray(data) ? data : data.data || [];
      const formatted = list.map(formatCourse);
      setArchiveCourses(formatted);
      localStorage.setItem("lms_courses_archive", JSON.stringify(formatted));
    } catch (err) {
      console.warn("Archive API error:", err);
      const stored = localStorage.getItem("lms_courses_archive");
      setArchiveCourses(stored ? JSON.parse(stored) : []);
    }
  };

  const useFallbackCourses = () => {
    try {
      const stored = localStorage.getItem("lms_courses");
      if (stored) {
        setCourses(JSON.parse(stored));
      } else {
        localStorage.setItem("lms_courses", JSON.stringify(sampleCourses));
        setCourses(sampleCourses);
      }
    } catch (e) {
      setCourses(sampleCourses);
    }
  };

  useEffect(() => {
    loadCourses();
    loadArchiveCourses();
  }, []);

  const toggleFilial = (f) => {
    setForm((prev) => ({
      ...prev,
      filiallar: prev.filiallar.includes(f)
        ? prev.filiallar.filter((x) => x !== f)
        : [...prev, f],
    }));
  };

  const handleSave = async () => {
    if (!form.nomi.trim()) {
      alert("Kurs nomini kiriting");
      return;
    }
    if (!form.narx.trim() || !form.kursOy.trim() || !form.darsVaqt.trim()) {
      alert("Iltimos kurs narxi, davomiyligi va dars vaqtini kiriting.");
      return;
    }
    try {
      const payload = {
        name: form.nomi,
        description: form.description || "Tavsif berilmagan.",
        price: Number(form.narx.replace(/\D/g, "")),
        duration_month: Number(form.kursOy.replace(/\D/g, "")),
        duration_hours: Number(form.darsVaqt.replace(/\D/g, ""))
      };
      if (editItem) {
        await api.updateCourse(editItem, payload);
      } else {
        await api.createCourse(payload);
      }
      loadCourses();
      setForm(defaultForm);
      setEditItem(null);
      setShowPanel(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Kursni saqlashda xatolik yuz berdi");
    }
  };

  const handleEditClick = (course) => {
    setEditItem(course.id);
    setForm({
      nomi: course.title || "",
      filiallar: ["Filial 1", "Filial 2"],
      darsVaqt: course.duration || "",
      kursOy: course.period || "",
      narx: String(course.price || "").replace(/\D/g, ""),
      description: course.description || "",
      rang: course.rang || "#7c3aed",
    });
    setShowPanel(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteItem(id);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (api.deleteCourse) {
        await api.deleteCourse(deleteItem);
      }
      const updated = courses.filter((c) => c.id !== deleteItem);
      const deletedCourse = courses.find((c) => c.id === deleteItem);
      const archived = deletedCourse ? [deletedCourse, ...archiveCourses] : archiveCourses;
      setCourses(updated);
      setArchiveCourses(archived);
      localStorage.setItem("lms_courses", JSON.stringify(updated));
      localStorage.setItem("lms_courses_archive", JSON.stringify(archived));
      loadArchiveCourses();
    } catch (e) {
      console.error("Kursni o'chirishda xatolik:", e);
      alert(e.message || "Kursni o'chirishda xatolik yuz berdi");
    } finally {
      setDeleteItem(null);
    }
  };

  const getCardColor = (i) => cardColors[i % cardColors.length];
  const visibleCourses = activeFilial === "Arxiv" ? archiveCourses : courses;

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Boshqarish</h1>
        <p className="text-[13px] text-gray-500 mb-5">
          Ushbu sahifada siz sovg'alarni boshqarish imkoniyatiga ega bo'lasiz. Har bir sovg'a haqida batafsil ma'lumot va yangi sovg'a qo'shish imkoniyat bor.
        </p>

        {/* Top Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              disabled={tab.disabled}
              onClick={() => {
                if (tab.path) navigate(tab.path);
              }}
              className={`px-4 py-2 text-[13.5px] font-semibold transition-colors whitespace-nowrap ${
                tab.label === "Kurslar"
                  ? "text-[#7c3aed] border-b-2 border-[#7c3aed]"
                  : tab.disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-gray-800">Kurslar</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFilial("Arxiv")}
                className={`text-[13px] font-semibold px-4 py-2 rounded-lg border transition-colors ${
                  activeFilial === "Arxiv"
                    ? "bg-gray-800 text-white border-gray-800"
                    : "text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Arxiv
              </button>
              <button
                onClick={() => { setEditItem(null); setForm(defaultForm); setShowPanel(true); }}
                className="flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Add sx={{ fontSize: 17 }} />
                Kurslar qoshish
              </button>
            </div>
          </div>

          {/* Course Cards Grid */}
          {visibleCourses.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-[14px]">
              {activeFilial === "Arxiv" ? "Arxivda kurslar mavjud emas." : "Hozircha kurslar mavjud emas. \"Kurslar qoshish\" tugmasini bosing."}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {visibleCourses.map((course, i) => (
                <div key={course.id} className={`rounded-xl p-4 ${getCardColor(i)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 pr-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course.rang }}
                      />
                      <h3 className="text-[13px] font-semibold text-gray-800 leading-tight">{course.title}</h3>
                    </div>
                    {activeFilial !== "Arxiv" && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleDeleteClick(course.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-white rounded p-1 transition-colors"
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </button>
                        <button
                          onClick={() => handleEditClick(course)}
                          className="text-gray-400 hover:text-blue-500 hover:bg-white rounded p-1 transition-colors"
                        >
                          <Edit sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-gray-500 bg-white bg-opacity-70 border border-gray-200 rounded px-2 py-0.5">{course.duration}</span>
                    <span className="text-[11px] text-gray-500 bg-white bg-opacity-70 border border-gray-200 rounded px-2 py-0.5">{course.period}</span>
                    <span className="text-[11px] text-gray-500 bg-white bg-opacity-70 border border-gray-200 rounded px-2 py-0.5">{course.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== SLIDE-OUT PANEL ===== */}
      {/* Overlay */}
      {showPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-bold text-gray-800">{editItem ? "Kursni o'zgartirish" : "Kurs qoshish"}</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Bu yerda siz kurs ma'lumotlarini saqlashingiz mumkin.</p>
          </div>
          <button onClick={() => { setShowPanel(false); setEditItem(null); setForm(defaultForm); }} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
            <Close sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Nomi */}
          <div>
            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Nomi</label>
            <input
              type="text"
              placeholder="HR Manager..."
              value={form.nomi}
              onChange={(e) => setForm({ ...form, nomi: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          {/* Dars davomiyligi */}
          <div>
            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Dars davomiyligi</label>
            <select
              value={form.darsVaqt}
              onChange={(e) => setForm({ ...form, darsVaqt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] text-gray-500 outline-none focus:border-[#7c3aed] transition-colors appearance-none bg-white"
            >
              <option value="">Tanlang</option>
              {darsVaqtlar.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Kurs davomiyligi */}
          <div>
            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Kurs davomiyligi (oylarda)</label>
            <select
              value={form.kursOy}
              onChange={(e) => setForm({ ...form, kursOy: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] text-gray-500 outline-none focus:border-[#7c3aed] transition-colors appearance-none bg-white"
            >
              <option value="">Tanlang</option>
              {kursOylar.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Narx */}
          <div>
            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Narx</label>
            <div className="relative">
              <AttachMoney sx={{ fontSize: 18, color: "#9ca3af" }} className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                placeholder="Narxini kiriting"
                value={form.narx}
                onChange={(e) => setForm({ ...form, narx: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#7c3aed] transition-colors resize-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">This is a hint text to help user.</p>
          </div>

          {/* Rangi */}
          <div>
            <label className="text-[13px] font-semibold text-gray-700 block">Rangi</label>
            <p className="text-[11px] text-gray-400 mb-3">The color you choose will be displayed to users and in the list of roles.</p>
            <div className="flex gap-2 flex-wrap">
              {rangli.map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, rang: r })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.rang === r ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: r }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => { setShowPanel(false); setForm(defaultForm); setEditItem(null); }}
            className="px-6 py-2 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[13px] font-semibold transition-colors"
          >
            {editItem ? "Yangilash" : "Saqlash"}
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Kursni o'chirish"
      />
    </div>
  );
};

export default Kurslar;
