import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Close, Refresh, Delete, Edit } from "@mui/icons-material";

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

const tabs = [
  { label: "Kurslar", path: "/dashboard/kurslar" },
  { label: "Xonalar", path: "/dashboard/xonalar" },
  { label: "Xodimlar", path: "/dashboard/xodimlar" },
];

const subTabs = [
  "AiCoder markazi",
  "Fizika va Matematika",
  "4-maktab",
  "Niner markazi",
  "IELTS full mock",
  "IELTS full mock centre",
  "Arxiv",
];

import { api } from "../utils/api";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const Xonalar = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeCenter, setActiveCenter] = useState("AiCoder markazi");
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState({ name: "", capacity: "" });
  const [deleteItem, setDeleteItem] = useState(null);

  const loadRooms = async () => {
    try {
      const data = await api.getRooms();
      const list = Array.isArray(data) ? data : data.data || [];
      const formatted = list.map((r, idx) => ({
        id: r.id || idx + 1,
        name: r.name || "Xona",
        capacity: r.capacity || 20,
        center: r.center || "AiCoder markazi",
      }));
      if (formatted.length > 0) {
        setRooms(formatted);
        localStorage.setItem("lms_rooms", JSON.stringify(formatted));
      } else {
        useFallbackRooms();
      }
    } catch (err) {
      console.warn("Backend API error, using localStorage fallback:", err);
      useFallbackRooms();
    }
  };

  const useFallbackRooms = () => {
    try {
      const stored = localStorage.getItem("lms_rooms");
      if (stored) {
        setRooms(JSON.parse(stored));
      } else {
        localStorage.setItem("lms_rooms", JSON.stringify(defaultRooms));
        setRooms(defaultRooms);
      }
    } catch (e) {
      setRooms(defaultRooms);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.capacity) return;
    try {
      const payload = {
        name: form.name,
        capacity: Number(form.capacity)
      };
      await api.createRoom(payload);
      loadRooms();
      setShowPanel(false);
      setForm({ name: "", capacity: "" });
    } catch (err) {
      console.error(err);
      // Fallback local adding
      const newRoom = {
        id: Date.now(),
        name: form.name,
        capacity: parseInt(form.capacity),
        center: activeCenter,
      };
      const updated = [...rooms, newRoom];
      setRooms(updated);
      localStorage.setItem("lms_rooms", JSON.stringify(updated));
      setShowPanel(false);
      setForm({ name: "", capacity: "" });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteItem(id);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (api.deleteRoom) {
        await api.deleteRoom(deleteItem);
      }
      const updated = rooms.filter((r) => r.id !== deleteItem);
      setRooms(updated);
      localStorage.setItem("lms_rooms", JSON.stringify(updated));
    } catch (e) {
      console.error("Xonani o'chirishda xatolik:", e);
      // Fallback local delete
      const updated = rooms.filter((r) => r.id !== deleteItem);
      setRooms(updated);
      localStorage.setItem("lms_rooms", JSON.stringify(updated));
    } finally {
      setDeleteItem(null);
    }
  };

  const handleRefresh = () => {
    loadRooms();
  };

  return (
    <div className="p-6 h-full relative overflow-hidden flex flex-col">
      {/* Boshqarish Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Boshqarish</h1>
        {/* Sub nav links */}
        <div className="flex gap-1 border-b border-gray-200 mt-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              disabled={tab.disabled}
              onClick={() => {
                if (tab.path) navigate(tab.path);
              }}
              className={`px-4 py-2.5 text-[13.5px] font-semibold transition-colors whitespace-nowrap ${
                tab.label === "Xonalar"
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
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col overflow-hidden">
        {/* Header inside card */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800">Xonalar</span>
            <button onClick={handleRefresh} className="text-gray-400 hover:text-gray-600 transition-colors">
              <Refresh sx={{ fontSize: 18 }} />
            </button>
          </div>
          <button
            onClick={() => setShowPanel(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[12px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Add sx={{ fontSize: 16 }} />
            Xonani qo'shish
          </button>
        </div>

        {/* Sub tabs (Centers) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCenter(tab)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                activeCenter === tab
                  ? "bg-purple-50 text-[#7c3aed] border-purple-100 shadow-sm"
                  : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid of rooms */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-4 gap-4">
            {rooms
              .filter((r) => !r.center || r.center === activeCenter)
              .map((room) => (
                  <div
                    key={room.id}
                    className="group bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-purple-100 rounded-xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
                  >
                  <div>
                    <h3 className="font-bold text-gray-800 text-[14px]">{room.name}</h3>
                    <p className="text-[12px] text-gray-400 mt-1 font-semibold">Sig'imi: {room.capacity}</p>
                  </div>
                  <div className="flex justify-end gap-3 transition-opacity">
                    <button onClick={() => handleDeleteClick(room.id)} className="text-red-400 hover:text-red-600">
                      <Delete sx={{ fontSize: 18 }} />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700">
                      <Edit sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showPanel && (
        <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowPanel(false)} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-[70] transition-transform duration-300 transform ${
          showPanel ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Xonani qo'shish</h2>
          <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">
            <Close />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
              Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Xona nomi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
              Sig'imi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Masalan: 20"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#7c3aed]"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => setShowPanel(false)}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-[14px] font-semibold"
          >
            Saqlash
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Xonani o'chirish"
      />
    </div>
  );
};

export default Xonalar;
