import React, { useState, useEffect } from "react";
import {
  Add, FileDownload, Delete, Visibility, Edit,
  FilterList, Search, Remove, CloudDownload, Archive,
  ArrowBack, ArrowForward, Close
} from "@mui/icons-material";

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
  const [newTeacher, setNewTeacher] = useState({ name: "", phone: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lms_teachers");
      if (stored) {
        setTeachers(JSON.parse(stored));
      } else {
        localStorage.setItem("lms_teachers", JSON.stringify(sampleTeachers));
        setTeachers(sampleTeachers);
      }
    } catch (e) {
      localStorage.setItem("lms_teachers", JSON.stringify(sampleTeachers));
      setTeachers(sampleTeachers);
    }
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleAll = () => {
    setSelected(selected.length === teachers.length ? [] : teachers.map((t) => t.id));
  };

  const handleDelete = (id) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    localStorage.setItem("lms_teachers", JSON.stringify(updated));
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  const handleDeleteSelected = () => {
    const updated = teachers.filter((t) => !selected.includes(t.id));
    setTeachers(updated);
    localStorage.setItem("lms_teachers", JSON.stringify(updated));
    setSelected([]);
  };

  const handleAddTeacher = () => {
    if (!newTeacher.name) return;
    const teacher = {
      id: Date.now(),
      name: newTeacher.name,
      avatar: `https://i.pravatar.cc/32?img=${Math.floor(Math.random() * 50)}`,
      guruh: ["Yangi"],
      phone: newTeacher.phone || "+998(00)0000000",
      tug: "01 Jan 2024",
      yaratilgan: "01 Jan 2024",
      coin: 0,
    };
    const updated = [teacher, ...teachers];
    setTeachers(updated);
    localStorage.setItem("lms_teachers", JSON.stringify(updated));
    setNewTeacher({ name: "", phone: "" });
    setShowPanel(false);
  };

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
            onClick={() => setShowPanel(true)}
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
          <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-[13px] font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
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
              {teachers.map((t) => (
                <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected.includes(t.id) ? "bg-purple-50/50" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      className="w-4 h-4 accent-[#7c3aed] rounded"
                    />
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
                    <div className="flex items-center gap-1.5 justify-end">
                      <button className="text-gray-400 hover:text-red-400"><Remove sx={{ fontSize: 16 }} /></button>
                      <button className="text-gray-400 hover:text-green-500"><Add sx={{ fontSize: 16 }} /></button>
                      <button className="text-gray-400 hover:text-[#7c3aed]"><Visibility sx={{ fontSize: 16 }} /></button>
                      <button className="text-gray-400 hover:text-blue-500"><CloudDownload sx={{ fontSize: 16 }} /></button>
                      <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500"><Delete sx={{ fontSize: 16 }} /></button>
                      <button className="text-gray-400 hover:text-[#7c3aed]"><Edit sx={{ fontSize: 16 }} /></button>
                    </div>
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
        <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowPanel(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[70] transition-transform duration-300 transform ${showPanel ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800">O'qituvchi qoshish</h2>
            <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">
              <Close />
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">F.I.SH</label>
              <input 
                type="text" 
                placeholder="Ism sharifni kiriting"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:border-[#7c3aed] outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Telefon raqam</label>
              <input 
                type="text" 
                placeholder="+998"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:border-[#7c3aed] outline-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-3">
            <button onClick={() => setShowPanel(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-50">
              Bekor qilish
            </button>
            <button onClick={handleAddTeacher} className="flex-1 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-[14px] font-semibold">
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Oqituvchilar;
