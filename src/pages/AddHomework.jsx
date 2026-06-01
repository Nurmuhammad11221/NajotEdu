import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const AddHomework = () => {
  const { id } = useParams(); // group id
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!topic) return alert("Mavzu kiritilmagan");
    setSaving(true);
    try {
      // Try real API first
      if (api.createHomework) {
        await api.createHomework({ groupId: id, title: topic, description: comment });
      } else {
        // Fallback: store in localStorage
        const stored = localStorage.getItem("lms_homeworks") || "[]";
        const list = JSON.parse(stored);
        list.push({ id: Date.now(), groupId: id, title: topic, description: comment, due_date: new Date().toISOString() });
        localStorage.setItem("lms_homeworks", JSON.stringify(list));
      }
      navigate(`/dashboard/groups/${id}`);
    } catch (e) {
      console.error("Homework saqlashda xatolik", e);
      alert("Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <div className="max-w-4xl">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 mr-4"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-gray-800">Yangi uyga vazifa yaratish</h2>
        </div>

        <div className="space-y-6">
          {/* Mavzu */}
          <div>
            <label className="block text-[14px] font-bold text-gray-800 mb-2">
              <span className="text-red-500 mr-1">*</span>Mavzu
            </label>
            <div className="relative">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-600 outline-none focus:border-[#7c3aed] bg-white cursor-pointer"
              >
                <option value="" disabled>Mavzulardan birini tanlang</option>
                <option value="HTML asoslari">HTML asoslari</option>
                <option value="CSS ga kirish">CSS ga kirish</option>
                <option value="Javascript asoslari">Javascript asoslari</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Izoh */}
          <div>
            <label className="block text-[14px] font-bold text-gray-800 mb-2">
              <span className="text-red-500 mr-1">*</span>Izoh
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white flex-wrap">
                <button className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded text-sm font-semibold">H1</button>
                <button className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded text-sm font-semibold">H2</button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                  <span className="text-sm text-gray-600">Sans Serif</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                  <span className="text-sm text-gray-600">Normal</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded font-bold">B</button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded italic">I</button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded underline">U</button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded line-through">S</button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"><span className="text-xs">" "</span></button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"><span className="text-xs font-mono">{'<>'}</span></button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
                </button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </button>
              </div>
              <textarea
                rows={6}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
                className="w-full p-4 outline-none text-[14px] text-gray-700 resize-none"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-[14px] text-gray-500 font-medium">Faylni tanlash yoki shu yerga tashlang</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-[14px] hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#10b981] text-white font-semibold text-[14px] hover:bg-[#059669] transition-colors shadow-sm shadow-green-500/20 disabled:opacity-50"
          >
            {saving ? "Saqlanmoqda..." : "E'lon qilish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHomework;

