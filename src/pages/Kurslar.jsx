import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Delete, Edit, Add, Close, AttachMoney } from "@mui/icons-material";

const tabs = [
  { label: "Kurslar", path: "/dashboard/kurslar" },
  { label: "Xonalar", path: "/dashboard/xonalar" },
  { label: "Filiallar", disabled: true },
  { label: "Xodimlar", disabled: true },
  { label: "Sabablar", disabled: true },
  { label: "Rollar", disabled: true },
  { label: "Coin", disabled: true },
  { label: "Xabar yuborish", disabled: true },
  { label: "Tekshiruv", disabled: true }
];

const filialTabs = ["Filial 1", "Filial 2", "Arxiv"];

const darsVaqtlar = ["30 min", "45 min", "60 min", "90 min", "120 min"];
const kursOylar = ["1 oy", "2 oy", "3 oy", "6 oy", "12 oy"];

const rangli = [
  "#1e3a5f", "#7c3aed", "#dc2626", "#ea580c",
  "#15803d", "#0891b2", "#2563eb", "#7c3aed", "#db2777"
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

  useEffect(() => {
    const stored = localStorage.getItem("lms_courses");
    if (stored) {
      setCourses(JSON.parse(stored));
    } else {
      localStorage.setItem("lms_courses", JSON.stringify(sampleCourses));
      setCourses(sampleCourses);
    }
  }, []);

  const toggleFilial = (f) => {
    setForm((prev) => ({
      ...prev,
      filiallar: prev.filiallar.includes(f)
        ? prev.filiallar.filter((x) => x !== f)
        : [...prev, f],
    }));
  };

  const handleSave = () => {
    if (!form.nomi.trim()) return;
    const newCourse = {
      id: Date.now(),
      title: form.nomi,
      description: form.description || "A little about the company and the team that you'll be working with. A li...",
      duration: form.darsVaqt || "90 min",
      period: form.kursOy || "3 oy",
      price: form.narx ? `${form.narx} mln` : "1 000 000 mln",
      rang: form.rang,
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem("lms_courses", JSON.stringify(updated));
    setForm(defaultForm);
    setShowPanel(false);
  };

  const handleDelete = (id) => {
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    localStorage.setItem("lms_courses", JSON.stringify(updated));
  };

  const getCardColor = (i) => cardColors[i % cardColors.length];

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
            <button
              onClick={() => setShowPanel(true)}
              className="flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Add sx={{ fontSize: 17 }} />
              Kurslar qoshish
            </button>
          </div>

          {/* Filial Tabs */}
          <div className="flex gap-2 mb-5">
            {filialTabs.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilial(f)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                  activeFilial === f
                    ? "bg-gray-800 text-white border-gray-800"
                    : "text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Course Cards Grid */}
          {courses.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-[14px]">
              Hozircha kurslar mavjud emas. "Kurslar qoshish" tugmasini bosing.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {courses.map((course, i) => (
                <div key={course.id} className={`rounded-xl p-4 ${getCardColor(i)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 pr-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course.rang }}
                      />
                      <h3 className="text-[13px] font-semibold text-gray-800 leading-tight">{course.title}</h3>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </button>
                      <button className="text-gray-400 hover:text-[#7c3aed] transition-colors">
                        <Edit sx={{ fontSize: 16 }} />
                      </button>
                    </div>
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
            <h2 className="text-[17px] font-bold text-gray-800">Kurs qoshish</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Bu yerda siz yangi Sovg'a qo'shishingiz mumkin.</p>
          </div>
          <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
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

          {/* Filiallar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-semibold text-gray-700">Kurs mavjud boledigon filiallar</label>
              <button
                onClick={() => setForm({ ...form, filiallar: [...filialOptions] })}
                className="text-[12px] text-[#7c3aed] font-semibold hover:underline"
              >
                Hammasini tanlash
              </button>
            </div>
            {filialOptions.map((f) => (
              <label key={f} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.filiallar.includes(f)}
                  onChange={() => toggleFilial(f)}
                  className="w-4 h-4 accent-[#7c3aed] rounded"
                />
                <span className="text-[13px] text-gray-700">{f}</span>
              </label>
            ))}
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
            onClick={() => { setShowPanel(false); setForm(defaultForm); }}
            className="px-6 py-2 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[13px] font-semibold transition-colors"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default Kurslar;
