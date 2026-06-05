import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Add, Search, Archive, Delete } from "@mui/icons-material";
import { api } from "../utils/api";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const Xodimlar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [archiveEmployees, setArchiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const tabs = [
    { label: "Kurslar", path: "/dashboard/kurslar" },
    { label: "Xonalar", path: "/dashboard/xonalar" },
    { label: "Xodimlar", path: "/dashboard/xodimlar" },
  ];

  const currentPath = location.pathname;

  const loadEmployees = async () => {
    try {
      const [adminsData, teachersData] = await Promise.allSettled([
        api.getAdmins(),
        api.getTeachers(),
      ]);
      const admins = adminsData.status === "fulfilled" ? adminsData.value : [];
      const teachers = teachersData.status === "fulfilled" ? teachersData.value : [];
      const list = [
        ...admins.map((item) => ({ ...item, role: item.role || "Admin", type: "admin" })),
        ...teachers.map((item) => ({ ...item, role: item.role || "O'qituvchi", type: "teacher" })),
      ];
      setEmployees(
        list.map((item, idx) => ({
          id: item.id || idx + 1,
          name: item.full_name || item.name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Noma'lum xodim",
          phone: item.phone || "Noma'lum",
          email: item.email || "Noma'lum",
          role: item.position || item.role || "Xodim",
          status: item.is_active ? "Faol" : "Faol emas",
          type: item.type,
        }))
      );
    } catch (err) {
      console.error("Xodimlar ro'yxatini yuklashda xatolik:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadArchiveEmployees = async () => {
    try {
      const data = await api.getArchiveTeachers();
      const list = Array.isArray(data) ? data : data.data || [];
      const formatted = list.map((item, idx) => ({
        id: item.id || idx + 1,
        name: item.full_name || item.name || "Noma'lum xodim",
        phone: item.phone || "Noma'lum",
        email: item.email || "Noma'lum",
        role: item.position || item.role || "O'qituvchi",
        status: "Arxivda",
        type: "teacher",
      }));
      setArchiveEmployees(formatted);
      localStorage.setItem("lms_employees_archive", JSON.stringify(formatted));
    } catch (err) {
      console.warn("Xodimlar arxivini yuklashda xatolik:", err);
      const stored = localStorage.getItem("lms_employees_archive");
      setArchiveEmployees(stored ? JSON.parse(stored) : []);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadArchiveEmployees();
  }, []);

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.deleteTeacher(deleteItem);
      const deletedEmployee = employees.find((employee) => employee.id === deleteItem);
      const updated = employees.filter((employee) => employee.id !== deleteItem);
      const archived = deletedEmployee ? [{ ...deletedEmployee, status: "Arxivda" }, ...archiveEmployees] : archiveEmployees;
      setEmployees(updated);
      setArchiveEmployees(archived);
      localStorage.setItem("lms_employees_archive", JSON.stringify(archived));
      loadArchiveEmployees();
    } catch (err) {
      console.error("Xodimni o'chirishda xatolik:", err);
      alert(err.message || "Xodimni o'chirishda xatolik yuz berdi");
    } finally {
      setDeleteItem(null);
    }
  };

  const visibleEmployees = showArchive ? archiveEmployees : employees;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Xodimlar</h1>
            <p className="text-[13px] text-gray-500 mt-1">Bu yerda Boshqarish bo'limining xodimlari ko'rsatiladi.</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/oqituvchilar")}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2"
          >
            <Add sx={{ fontSize: 18 }} /> Yangi xodim
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 text-[13px] font-semibold transition-colors ${isActive ? "text-[#7c3aed] border-b-2 border-[#7c3aed]" : "text-gray-500 hover:text-gray-800"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-full max-w-sm">
            <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
            <input type="text" placeholder="Qidirish" className="bg-transparent outline-none w-full text-[13px] text-gray-600" />
          </div>
          <button
            onClick={() => setShowArchive((prev) => !prev)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg transition-colors ${
              showArchive ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Archive sx={{ fontSize: 18 }} /> Arxiv
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-[12px] text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Nomi</th>
                <th className="px-5 py-4">Telefon</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Holat</th>
                {!showArchive && <th className="px-5 py-4 text-right">Amal</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-gray-500">Yuklanmoqda...</td>
                </tr>
              ) : visibleEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-gray-500">{showArchive ? "Arxivda xodimlar topilmadi." : "Xodimlar topilmadi."}</td>
                </tr>
              ) : (
                visibleEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-800 font-medium">{employee.name}</td>
                    <td className="px-5 py-4 text-gray-600">{employee.phone}</td>
                    <td className="px-5 py-4 text-gray-600">{employee.email}</td>
                    <td className="px-5 py-4 text-gray-600">{employee.role}</td>
                    <td className={`px-5 py-4 text-[13px] font-semibold ${employee.status === 'Faol' ? 'text-green-600' : 'text-gray-500'}`}>{employee.status}</td>
                    {!showArchive && (
                      <td className="px-5 py-4 text-right">
                        {employee.type === "teacher" && (
                          <button onClick={() => setDeleteItem(employee.id)} className="text-gray-400 hover:text-red-500">
                            <Delete sx={{ fontSize: 17 }} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Xodimni o'chirish"
      />
    </div>
  );
};

export default Xodimlar;
