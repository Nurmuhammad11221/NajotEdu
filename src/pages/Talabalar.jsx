import React, { useState, useEffect } from "react";
import {
  Add, Close, Search, ArrowBack, ArrowForward, MoreVert
} from "@mui/icons-material";

const sampleStudents = [
  {
    id: 1,
    name: "Ali Valiyev",
    guruh: ["N26", "n105"],
    phone: "+998976541223",
    email: "ali@gmail.com",
    tug: "12.12.2010",
    manzil: "Sirdaryo",
    avatarColor: "bg-blue-100 text-blue-600"
  },
  {
    id: 2,
    name: "Salim Qodirov",
    guruh: ["n105"],
    phone: "+998977777777",
    email: "salim@gmail.com",
    tug: "14.01.2007",
    manzil: "Buxoro",
    avatarColor: "bg-purple-100 text-purple-600"
  },
  {
    id: 3,
    name: "Bobur",
    guruh: ["n105"],
    phone: "+998999999999",
    email: "bobur@gmail.com",
    tug: "14.03.2002",
    manzil: "Toshkent",
    avatarColor: "bg-indigo-100 text-indigo-600"
  },
  {
    id: 4,
    name: "Qodir Salimov",
    guruh: ["n105"],
    phone: "+998911111111",
    email: "qodir@gmail.com",
    tug: "29.04.2026",
    manzil: "O'zbekcha",
    avatarColor: "bg-cyan-100 text-cyan-600"
  }
];

const Talabalar = () => {
  const [students, setStudents] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState({
    phone: "+998",
    mail: "",
    fio: "",
    tug: "",
    manzil: "",
    parol: "",
    file: null
  });

  useEffect(() => {
    const stored = localStorage.getItem("lms_students");
    if (stored) {
      setStudents(JSON.parse(stored));
    } else {
      localStorage.setItem("lms_students", JSON.stringify(sampleStudents));
      setStudents(sampleStudents);
    }
  }, []);

  const handleAdd = () => {
    if (!form.fio) return;
    const newStudent = {
      id: Date.now(),
      name: form.fio,
      guruh: ["n105"],
      phone: form.phone,
      email: form.mail,
      tug: form.tug || "01.01.2000",
      manzil: form.manzil || "Noma'lum",
      avatarColor: "bg-gray-100 text-gray-600"
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("lms_students", JSON.stringify(updated));
    setShowPanel(false);
    setForm({ phone: "+998", mail: "", fio: "", tug: "", manzil: "", parol: "", file: null });
  };

  return (
    <div className="p-6 h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Talabalar</h1>
          <p className="text-[13px] text-gray-500">Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Search */}
        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-72">
            <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
            <input type="text" placeholder="Search" className="bg-transparent text-[13px] outline-none w-full" />
          </div>
          <button 
            onClick={() => setShowPanel(true)}
            className="bg-[#7c3aed] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#6d28d9] transition-colors flex items-center gap-2"
          >
            <Add sx={{ fontSize: 18 }} />
            Qo'shish
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[12px] text-gray-500 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="w-4 h-4 accent-[#7c3aed] rounded" />
                </th>
                <th className="px-6 py-4">Nomi ↓</th>
                <th className="px-6 py-4">Guruh</th>
                <th className="px-6 py-4">Telefon raqamlari</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Tug'ilgan sanasi</th>
                <th className="px-6 py-4">Manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4 accent-[#7c3aed] rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${s.avatarColor}`}>
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {s.guruh.map((g, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">{s.phone}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">{s.email}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">{s.tug}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">{s.manzil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
          <button className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-[#7c3aed] font-medium border border-gray-200 px-3 py-1.5 rounded-lg">
            <ArrowBack sx={{ fontSize: 16 }} /> Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-[13px] font-medium ${p === 1 ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:bg-gray-50"}`}>{p}</button>
            ))}
          </div>
          <button className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-[#7c3aed] font-medium border border-gray-200 px-3 py-1.5 rounded-lg">
            Next <ArrowForward sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* ===== ADD STUDENT PANEL ===== */}
      {showPanel && (
        <div className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setShowPanel(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-[110] transition-transform duration-300 transform ${showPanel ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">Talaba qo'shish</h2>
            <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">
              <Close />
            </button>
          </div>
          <p className="text-[12px] text-gray-400 mb-8">Bu yerda siz yangi Talaba qo'shishingiz mumkin.</p>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Telefon raqam</label>
              <input 
                type="text" 
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Mail</label>
              <input 
                type="email" 
                placeholder="Elektron pochtani kiriting"
                value={form.mail}
                onChange={(e) => setForm({...form, mail: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Talaba FIO</label>
              <input 
                type="text" 
                placeholder="Ma'lumotni kiriting"
                value={form.fio}
                onChange={(e) => setForm({...form, fio: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Tug'ilgan sanasi</label>
              <input 
                type="date" 
                value={form.tug}
                onChange={(e) => setForm({...form, tug: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Manzil</label>
              <input 
                type="text" 
                placeholder="Manzilini kiriting"
                value={form.manzil}
                onChange={(e) => setForm({...form, manzil: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Parol</label>
              <input 
                type="password" 
                placeholder="Parolni kiriting"
                value={form.parol}
                onChange={(e) => setForm({...form, parol: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Guruh</label>
              <button className="w-full border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-1.5 text-[#7c3aed] text-[13.5px] font-bold hover:bg-purple-50 transition-colors">
                <Add sx={{ fontSize: 18 }} /> Guruh qo'shish
              </button>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Surati</label>
              <input 
                type="file" 
                id="student-photo-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setForm({ ...form, file: e.target.files[0] });
                  }
                }}
              />
              <label 
                htmlFor="student-photo-upload"
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50/50 hover:border-[#7c3aed] transition-all"
              >
                {form.file ? (
                  <div className="flex flex-col items-center gap-1">
                    <img 
                      src={URL.createObjectURL(form.file)} 
                      alt="preview" 
                      className="w-16 h-16 rounded-full object-cover border border-purple-100 shadow-sm" 
                    />
                    <span className="text-[12px] font-semibold text-gray-700">{form.file.name}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setForm({ ...form, file: null });
                      }}
                      className="text-[11px] text-red-500 hover:underline font-bold mt-1"
                    >
                      O'chirish
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-bold text-gray-700">
                      <span className="text-[#7c3aed] hover:underline">Click to upload</span> or drag and drop
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">JPG or PNG (max. 2 MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-3">
            <button onClick={() => setShowPanel(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-50">
              Bekor qilish
            </button>
            <button onClick={handleAdd} className="flex-1 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-[14px] font-semibold">
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Talabalar;
