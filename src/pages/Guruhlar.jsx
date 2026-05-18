import React, { useState, useEffect } from "react";
import { Add, Close, MoreVert, Search, Class } from "@mui/icons-material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

const sampleGroups = [
  {
    id: 1,
    status: true,
    nomi: "N26",
    kurs: "Backend",
    davomiyligi: "6 oy",
    vaqt: "09:30",
    kunlar: "Du, Se, Chor, Pay, Ju",
    xona: "Autodesk",
    oqituvchi: "Mohirbek",
    talabalar: 1,
  },
  {
    id: 2,
    status: true,
    nomi: "n105",
    kurs: "Backend",
    davomiyligi: "6 oy",
    vaqt: "16:00",
    kunlar: "Se, Pay, Shan",
    xona: "Autodesk",
    oqituvchi: "Mohirbek",
    talabalar: 4,
  },
];

const sampleStudents = [
  { id: 1, name: "Ali Valiyev" },
  { id: 2, name: "Salim Qodirov" },
  { id: 3, name: "Bobur" },
  { id: 4, name: "Qodir Salimov" },
];

const darsKunlariList = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

const defaultRooms = [
  { id: 1, name: "genious room", capacity: 15, center: "AiCoder markazi" },
  { id: 2, name: "Impact room", capacity: 12, center: "AiCoder markazi" },
  { id: 3, name: "1A", capacity: 25, center: "AiCoder markazi" },
  { id: 4, name: "205-xona", capacity: 32, center: "AiCoder markazi" },
  { id: 5, name: "16-xona", capacity: 18, center: "AiCoder markazi" },
  { id: 6, name: "5 xona", capacity: 30, center: "AiCoder markazi" },
  { id: 7, name: "IELTS with Islombek", capacity: 20, center: "AiCoder markazi" },
  { id: 8, name: "Beginner", capacity: 18, center: "AiCoder markazi" },
  { id: 9, name: "99", capacity: 25, center: "AiCoder markazi" },
];

const Guruhlar = () => {
  const [activeTab, setActiveTab] = useState("Guruhlar");
  const [groups, setGroups] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showTalabaModal, setShowTalabaModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    try {
      // Groups
      const storedGroups = localStorage.getItem("lms_groups");
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      } else {
        localStorage.setItem("lms_groups", JSON.stringify(sampleGroups));
        setGroups(sampleGroups);
      }
    } catch (e) {
      setGroups(sampleGroups);
    }

    try {
      // Rooms
      const storedRooms = localStorage.getItem("lms_rooms");
      if (storedRooms) {
        setRooms(JSON.parse(storedRooms));
      } else {
        localStorage.setItem("lms_rooms", JSON.stringify(defaultRooms));
        setRooms(defaultRooms);
      }
    } catch (e) {
      setRooms(defaultRooms);
    }

    try {
      // Courses
      const storedCourses = localStorage.getItem("lms_courses");
      if (storedCourses) {
        setCourses(JSON.parse(storedCourses));
      } else {
        const defaultCourses = [
          { id: 1, title: "Frontend Bootcamp" },
          { id: 2, title: "Backend Node.js" }
        ];
        localStorage.setItem("lms_courses", JSON.stringify(defaultCourses));
        setCourses(defaultCourses);
      }
    } catch (e) {
      setCourses([]);
    }

    try {
      // Teachers
      const storedTeachers = localStorage.getItem("lms_teachers");
      if (storedTeachers) {
        setTeachers(JSON.parse(storedTeachers));
      } else {
        const defaultTeachers = [
          { id: 1, name: "Mohirbek" },
          { id: 2, name: "Diyorbek" }
        ];
        localStorage.setItem("lms_teachers", JSON.stringify(defaultTeachers));
        setTeachers(defaultTeachers);
      }
    } catch (e) {
      setTeachers([]);
    }

    try {
      // Students
      const storedStudents = localStorage.getItem("lms_students");
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        localStorage.setItem("lms_students", JSON.stringify(sampleStudents));
        setStudents(sampleStudents);
      }
    } catch (e) {
      setStudents(sampleStudents);
    }
  }, [showPanel]); // Re-load when the create group panel opens/closes so newly created records in other pages are updated!

  const [form, setForm] = useState({
    nomi: "",
    kurs: "",
    xona: "",
    kunlar: [],
    vaqt: "09:00",
    sana: "",
    tavsif: "",
    oqituvchi: "",
    talabalarIds: [],
  });

  const [talabaSearch, setTalabaSearch] = useState("");

  const toggleKun = (kun) => {
    setForm((prev) => ({
      ...prev,
      kunlar: prev.kunlar.includes(kun)
        ? prev.kunlar.filter((k) => k !== kun)
        : [...prev.kunlar, kun],
    }));
  };

  const toggleTalaba = (id) => {
    setForm((prev) => ({
      ...prev,
      talabalarIds: prev.talabalarIds.includes(id)
        ? prev.talabalarIds.filter((tId) => tId !== id)
        : [...prev.talabalarIds, id],
    }));
  };

  const toggleStatus = (id) => {
    const updated = groups.map(g => g.id === id ? { ...g, status: !g.status } : g);
    setGroups(updated);
    localStorage.setItem("lms_groups", JSON.stringify(updated));
  };

  const handleSaveGroup = () => {
    if (!form.nomi) return;
    const newGroup = {
      id: Date.now(),
      status: true,
      nomi: form.nomi,
      kurs: form.kurs || "Noma'lum",
      davomiyligi: "6 oy", // default
      vaqt: form.vaqt,
      kunlar: form.kunlar.map(k => k.substring(0, 2)).join(", ") || "Belgilanmagan",
      xona: form.xona || "Noma'lum",
      oqituvchi: form.oqituvchi || "Noma'lum",
      talabalar: form.talabalarIds.length,
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    localStorage.setItem("lms_groups", JSON.stringify(updated));
    setShowPanel(false);
    setForm({ nomi: "", kurs: "", xona: "", kunlar: [], vaqt: "09:00", sana: "", tavsif: "", oqituvchi: "", talabalarIds: [] });
  };

  return (
    <div className="p-6 h-full relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Guruhlar</h1>
        <button
          onClick={() => setShowPanel(true)}
          className="bg-[#7c3aed] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#6d28d9] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Add sx={{ fontSize: 18 }} />
          Guruh qo'shish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {["Guruhlar", "Arxiv"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[13px] font-semibold transition-colors rounded-t-lg ${activeTab === tab
              ? "bg-white text-gray-800 shadow-sm border border-b-0 border-gray-100"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab === "Guruhlar" && <Class sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />}
            {tab === "Arxiv" && <i className="bx bx-archive mr-1"></i>}
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <PeopleIcon sx={{ fontSize: 20 }} />
            <span className="text-[13px] font-semibold">Jami guruhlar</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{groups.length}</div>
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <MoreVert sx={{ fontSize: 20 }} />
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <PeopleIcon sx={{ fontSize: 20 }} />
            <span className="text-[13px] font-semibold">O'qituvchilar</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">0</div>
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <MoreVert sx={{ fontSize: 20 }} />
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <SchoolIcon sx={{ fontSize: 20 }} />
            <span className="text-[13px] font-semibold">O'quvchilar</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {groups.reduce((acc, g) => acc + g.talabalar, 0)}
          </div>
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <MoreVert sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[13px]">
            <thead>
              <tr className="bg-gray-50/50 text-[12px] text-gray-500 font-semibold border-b border-gray-100">
                <th className="px-4 py-4 font-semibold text-center">Status</th>
                <th className="px-4 py-4 font-semibold text-center">Guruh nomi</th>
                <th className="px-4 py-4 font-semibold text-center">Kurs</th>
                <th className="px-4 py-4 font-semibold text-center">Davomiyligi</th>
                <th className="px-4 py-4 font-semibold text-center">Dars vaqti</th>
                <th className="px-4 py-4 font-semibold text-center">Xona</th>
                <th className="px-4 py-4 font-semibold text-center">O'qituvchi</th>
                <th className="px-4 py-4 font-semibold text-center">Talabalar</th>
                <th className="px-4 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(g.id)}
                        className={`w-9 h-5 rounded-full relative transition-colors ${g.status ? 'bg-[#7c3aed]' : 'bg-gray-300'}`}
                      >
                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${g.status ? 'left-[18px]' : 'left-1'}`}></div>
                      </button>
                      <span className={`text-[10px] font-bold ${g.status ? 'text-green-500' : 'text-gray-400'}`}>
                        {g.status ? 'FAOL' : 'FAOL EMAS'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-bold text-gray-800">{g.nomi}</td>
                  <td className="px-4 py-4">
                    <span className="text-[11px] bg-pink-50 text-pink-500 font-bold px-2 py-1 rounded-full border border-pink-100">{g.kurs}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 font-medium">{g.davomiyligi}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-800">{g.vaqt}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{g.kunlar}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 font-medium">{g.xona}</td>
                  <td className="px-4 py-4 font-bold text-gray-800">{g.oqituvchi}</td>
                  <td className="px-4 py-4 font-bold text-gray-800">{g.talabalar}</td>
                  <td className="px-4 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVert sx={{ fontSize: 18 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD GROUP PANEL ===== */}
      {showPanel && (
        <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowPanel(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-[70] transition-transform duration-300 transform ${showPanel ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Guruh qo'shish</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.</p>
          </div>
          <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">
            <Close />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Guruh nomi <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Frontend 2024"
              value={form.nomi}
              onChange={(e) => setForm({ ...form, nomi: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Kurs <span className="text-red-500">*</span></label>
            <select
              value={form.kurs}
              onChange={(e) => setForm({ ...form, kurs: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed] bg-white text-gray-600"
            >
              <option value="">Tanlang</option>
              {courses.map((course) => (
                <option key={course.id} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Xona <span className="text-red-500">*</span></label>
            <select
              value={form.xona}
              onChange={(e) => setForm({ ...form, xona: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed] bg-white text-gray-600"
            >
              <option value="">Tanlang</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name} ({room.center})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">Dars kunlari <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {darsKunlariList.map(kun => (
                <label key={kun} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.kunlar.includes(kun)}
                    onChange={() => toggleKun(kun)}
                    className="w-4 h-4 accent-[#7c3aed] rounded"
                  />
                  <span className="text-[13px] font-semibold text-gray-700">{kun}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Dars vaqti <span className="text-red-500">*</span></label>
            <input
              type="time"
              value={form.vaqt}
              onChange={(e) => setForm({ ...form, vaqt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed] text-gray-600"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Boshlanish sanasi <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.sana}
              onChange={(e) => setForm({ ...form, sana: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed] text-gray-600"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Tavsif</label>
            <textarea
              placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)"
              value={form.tavsif}
              onChange={(e) => setForm({ ...form, tavsif: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed] resize-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">O'qituvchi <span className="text-red-500">*</span></label>
            <select
              value={form.oqituvchi}
              onChange={(e) => setForm({ ...form, oqituvchi: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed] bg-white text-gray-600"
            >
              <option value="">Tanlang</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Talabalar</label>
            <button
              onClick={() => setShowTalabaModal(true)}
              className="w-full border border-gray-200 border-dashed rounded-lg py-3 text-[#7c3aed] text-[13px] font-bold flex items-center justify-center gap-1 hover:bg-purple-50 transition-colors"
            >
              <Add sx={{ fontSize: 18 }} /> Qo'shish
            </button>
            {form.talabalarIds.length > 0 && (
              <p className="text-[12px] text-green-600 font-semibold mt-2 text-center">
                {form.talabalarIds.length} ta talaba tanlandi
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={() => setShowPanel(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-[14px] font-semibold text-gray-700 hover:bg-gray-50">
            Bekor qilish
          </button>
          <button onClick={handleSaveGroup} className="flex-1 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-[14px] font-semibold">
            Saqlash
          </button>
        </div>
      </div>

      {/* ===== ADD TALABA MODAL (Inside Panel) ===== */}
      {showTalabaModal && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Talaba qo'shish</h3>
                <p className="text-[11px] text-gray-400">Bitta yoki bir nechta talabani tanlang</p>
              </div>
              <button onClick={() => setShowTalabaModal(false)} className="text-gray-400 hover:text-gray-600">
                <Close sx={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 gap-2 mb-4">
                <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Talaba qidirish..."
                  value={talabaSearch}
                  onChange={(e) => setTalabaSearch(e.target.value)}
                  className="bg-transparent text-[13px] outline-none text-gray-700 w-full"
                />
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                {students.filter(s => s.name.toLowerCase().includes(talabaSearch.toLowerCase())).map(student => (
                  <label key={student.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={form.talabalarIds.includes(student.id)}
                      onChange={() => toggleTalaba(student.id)}
                      className="w-4 h-4 accent-[#7c3aed] rounded"
                    />
                    <span className="text-[13px] font-semibold text-gray-700">{student.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowTalabaModal(false)} className="text-[13px] font-bold text-gray-600 hover:text-gray-800 px-4">
                Bekor qilish
              </button>
              <button onClick={() => setShowTalabaModal(false)} className="bg-[#7c3aed] text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-[#6d28d9]">
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guruhlar;
