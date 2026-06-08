import React, { useState, useEffect } from "react";
import {
  Add, FileDownload, Delete, Visibility, Edit,
  FilterList, Search, Remove, CloudDownload, Archive,
  ArrowBack, ArrowForward, Close
} from "@mui/icons-material";
import { api } from "../utils/api";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const sampleTeachers = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  name: i === 0 ? "Mohirbek" : i === 1 ? "Diyorbek" : "Qwerty qwert",
  avatar: `https://i.pravatar.cc/32?img=${i + 10}`,
  guruh: i % 3 === 0 ? ["Label", "Label", "Label", "+4"] : i % 2 === 0 ? ["Label", "Label"] : ["Label"],
  phone: "+998(33)4082808",
  tug: "24 Jan 2022",
  yaratilgan: "24 Jan 2022",
  coin: 123123,
}));

const Oqituvchilar = () => {
  const [selected, setSelected] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", phone: "", email: "", password: "", address: "", photo: null });
  const [deleteItem, setDeleteItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [archiveTeachers, setArchiveTeachers] = useState([]);
  const [showArchive, setShowArchive] = useState(false);

  const formatTeacher = (t, idx) => ({
    id: t.id || idx + 1,
    name: t.full_name || t.name || "Ismsiz o'qituvchi",
    avatar: t.photo ? (t.photo.startsWith('http') ? t.photo : `https://najot-edu.softwareengineer.uz/${t.photo}`) : `https://i.pravatar.cc/32?img=${(t.id || idx) % 50 + 10}`,
    guruh: Array.isArray(t.groups) ? t.groups.map(g => typeof g === "object" ? g.name : g) : ["Yangi o'qituvchi"],
    phone: t.phone || "+998(00)000-00-00",
    email: t.email || "",
    address: t.address || "",
    tug: t.birth_date || "01 Jan 1990",
    yaratilgan: "Faol",
    coin: t.coin || 0,
  });

  const loadTeachers = async () => {
    try {
      const data = await api.getTeachers();
      const list = Array.isArray(data) ? data : data.data || [];
      const formatted = list.map(formatTeacher);
      if (formatted.length > 0) {
        setTeachers(formatted);
        localStorage.setItem("lms_teachers", JSON.stringify(formatted));
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.warn("Backend API error:", err);
      setTeachers([]);
    }
  };

  const loadArchiveTeachers = async () => {
    try {
      const data = await api.getArchiveTeachers();
      const list = Array.isArray(data) ? data : data.data || [];
      const formatted = list.map(formatTeacher);
      setArchiveTeachers(formatted);
      localStorage.setItem("lms_teachers_archive", JSON.stringify(formatted));
    } catch (err) {
      console.warn("Archive API error:", err);
      const stored = localStorage.getItem("lms_teachers_archive");
      setArchiveTeachers(stored ? JSON.parse(stored) : []);
    }
  };

  const useFallbackTeachers = () => {
    try {
      const stored = localStorage.getItem("lms_teachers");
      if (stored) {
        setTeachers(JSON.parse(stored));
      } else {
        localStorage.setItem("lms_teachers", JSON.stringify(sampleTeachers));
        setTeachers(sampleTeachers);
      }
    } catch (e) {
      setTeachers(sampleTeachers);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadArchiveTeachers();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleAll = () => {
    setSelected(selected.length === teachers.length ? [] : teachers.map((t) => t.id));
  };

  const handleDeleteClick = (id) => {
    setDeleteItem(id);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (api.deleteTeacher) {
        await api.deleteTeacher(deleteItem);
      }
      const updated = teachers.filter((t) => t.id !== deleteItem);
      const deletedTeacher = teachers.find((t) => t.id === deleteItem);
      const archived = deletedTeacher ? [deletedTeacher, ...archiveTeachers] : archiveTeachers;
      setTeachers(updated);
      setArchiveTeachers(archived);
      localStorage.setItem("lms_teachers", JSON.stringify(updated));
      localStorage.setItem("lms_teachers_archive", JSON.stringify(archived));
      setSelected((prev) => prev.filter((x) => x !== deleteItem));
      loadArchiveTeachers();
    } catch (e) {
      console.error("O'qituvchini o'chirishda xatolik:", e);
      alert(e.message || "O'qituvchini o'chirishda xatolik yuz berdi");
    } finally {
      setDeleteItem(null);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selected.map((id) => api.deleteTeacher(id)));
      const selectedTeachers = teachers.filter((t) => selected.includes(t.id));
      const updated = teachers.filter((t) => !selected.includes(t.id));
      const archived = [...selectedTeachers, ...archiveTeachers];
      setTeachers(updated);
      setArchiveTeachers(archived);
      localStorage.setItem("lms_teachers", JSON.stringify(updated));
      localStorage.setItem("lms_teachers_archive", JSON.stringify(archived));
      await loadTeachers();
      await loadArchiveTeachers();
      setSelected([]);
    } catch (e) {
      console.error("Tanlangan o'qituvchilarni o'chirishda xatolik:", e);
      alert(e.message || "Tanlangan o'qituvchilarni o'chirishda xatolik yuz berdi");
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name) {
      alert("Ismni kiriting");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("full_name", newTeacher.name);
      fd.append("phone", newTeacher.phone || "+998900000000");
      fd.append("email", newTeacher.email || "teacher@example.com");
      fd.append("password", newTeacher.password || "password123");
      fd.append("address", newTeacher.address || "Toshkent");
      if (newTeacher.photo) {
        fd.append("photo", newTeacher.photo);
      }

      let result;
      if (editItem) {
        result = await api.updateTeacher(editItem, fd);
      } else {
        result = await api.createTeacher(fd);
      }

      console.log('Teacher saved:', result);

      await loadTeachers();
      setNewTeacher({ name: "", phone: "", email: "", password: "", address: "", photo: null });
      setEditItem(null);
      setShowPanel(false);
    } catch (err) {
      console.error('Teacher save error:', err);
      alert(err.message || "O'qituvchini saqlashda xatolik yuz berdi");
    }
  };

  const handleEditClick = (teacher) => {
    setEditItem(teacher.id);
    setNewTeacher({
      name: teacher.name || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      password: "",
      address: teacher.address || "",
      photo: null,
    });
    setShowPanel(true);
  };

  const visibleTeachers = showArchive ? archiveTeachers : teachers;

  return (
    <div className="p-6 relative overflow-hidden h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-800">O'qituvchilar</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <FileDownload sx={{ fontSize: 17 }} />
            Export
          </button>
          <button 
            onClick={() => { setEditItem(null); setNewTeacher({ name: "", phone: "", email: "", password: "", address: "", photo: null }); setShowPanel(true); }}
            className="flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Add sx={{ fontSize: 17 }} />
            O'qituvchi qoshish
          </button>
        </div>
      </div>
      <p className="text-[13px] text-gray-500 mb-5">
        Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
      </p>

      {/* Filters Row */}
      <div className="flex items-center justify-between mb-4">
        <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <FilterList sx={{ fontSize: 17 }} />
          Filters
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-52">
            <Search sx={{ fontSize: 17, color: "#9ca3af" }} />
            <input type="text" placeholder="Search" className="bg-transparent text-[13px] outline-none text-gray-600 w-full" />
          </div>
          <button
            onClick={() => setShowArchive((prev) => !prev)}
            className={`flex items-center gap-1.5 border text-[13px] font-medium px-3 py-2 rounded-lg transition-colors ${
              showArchive ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Archive sx={{ fontSize: 16 }} />
            Arxiv
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-3 animate-fadeIn">
          <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-[13px] font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <FileDownload sx={{ fontSize: 16 }} />
            Export
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1.5 border border-red-200 text-red-500 text-[13px] font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Delete sx={{ fontSize: 16 }} />
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selected.length === teachers.length && teachers.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-[#7c3aed] rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Nomi ↓</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Guruh</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Telefon raqamlari</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Tug'ilgan sanasi</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Yaratilgan sana</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Coin</th>
                <th className="px-4 py-3 w-40"></th>
              </tr>
            </thead>
            <tbody>
              {visibleTeachers.map((t) => (
                <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected.includes(t.id) ? "bg-purple-50/50" : ""}`}>
                  <td className="px-4 py-3">
                    {!showArchive && (
                      <input
                        type="checkbox"
                        checked={selected.includes(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="w-4 h-4 accent-[#7c3aed] rounded"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={t.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                      <span className="text-[13px] font-semibold text-gray-800">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(t.guruh || []).map((g, gi) => (
                        <span key={gi} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{t.phone}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{t.tug}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{t.yaratilgan}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      <span className="text-[13px] font-semibold text-gray-800">{(t.coin || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {!showArchive && (
                      <div className="flex items-center gap-1.5 justify-end">
                        <button className="text-gray-400 hover:text-red-400"><Remove sx={{ fontSize: 16 }} /></button>
                        <button className="text-gray-400 hover:text-green-500"><Add sx={{ fontSize: 16 }} /></button>
                        <button className="text-gray-400 hover:text-[#7c3aed]"><Visibility sx={{ fontSize: 16 }} /></button>
                        <button className="text-gray-400 hover:text-blue-500"><CloudDownload sx={{ fontSize: 16 }} /></button>
                        <button onClick={() => handleDeleteClick(t.id)} className="text-gray-400 hover:text-red-500"><Delete sx={{ fontSize: 16 }} /></button>
                        <button onClick={() => handleEditClick(t)} className="text-gray-400 hover:text-[#7c3aed]"><Edit sx={{ fontSize: 16 }} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button className="flex items-center gap-1 text-[13px] text-gray-600 hover:text-[#7c3aed] font-medium">
            <ArrowBack sx={{ fontSize: 16 }} /> Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors ${p === page ? "bg-[#7c3aed] text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1 text-[13px] text-gray-600 hover:text-[#7c3aed] font-medium">
            Next <ArrowForward sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* ===== ADD TEACHER PANEL ===== */}
      {showPanel && (
        <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => { setShowPanel(false); setEditItem(null); setNewTeacher({ name: "", phone: "", email: "", password: "", address: "", photo: null }); }} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-[70] transition-transform duration-300 transform ${showPanel ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{editItem ? "O'qituvchini o'zgartirish" : "O'qituvchi qo'shish"}</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">Yangi o'qituvchi ma'lumotlarini kiriting</p>
            </div>
            <button onClick={() => { setShowPanel(false); setEditItem(null); setNewTeacher({ name: "", phone: "", email: "", password: "", address: "", photo: null }); }} className="text-gray-400 hover:text-gray-600">
              <Close />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">F.I.SH</label>
              <input
                type="text"
                placeholder="Ism sharifni kiriting"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:border-[#7c3aed] outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Telefon raqam</label>
              <input
                type="text"
                placeholder="+998"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:border-[#7c3aed] outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">E-pochta (Email)</label>
              <input
                type="email"
                placeholder="teacher@example.com"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:border-[#7c3aed] outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Tizimga kirish paroli</label>
              <input
                type="password"
                placeholder="Parolni kiriting"
                value={newTeacher.password}
                onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:border-[#7c3aed] outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Manzil (Address)</label>
              <input
                type="text"
                placeholder="Toshkent shahri..."
                value={newTeacher.address}
                onChange={(e) => setNewTeacher({...newTeacher, address: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:border-[#7c3aed] outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Rasm</label>
              <div className="flex items-center gap-4">
                {newTeacher.photo ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(newTeacher.photo)}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setNewTeacher({ ...newTeacher, photo: null })}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Rasm</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewTeacher({ ...newTeacher, photo: file });
                      }
                    }}
                    className="w-full text-[13px] text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#7c3aed] file:text-white hover:file:bg-[#6d28d9]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-3">
            <button onClick={() => { setShowPanel(false); setEditItem(null); setNewTeacher({ name: "", phone: "", email: "", password: "", address: "", photo: null }); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-50">
              Bekor qilish
            </button>
            <button onClick={handleAddTeacher} className="flex-1 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-[14px] font-semibold">
              {editItem ? "Yangilash" : "Saqlash"}
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="O'qituvchini o'chirish"
      />
    </div>
  );
};

export default Oqituvchilar;
