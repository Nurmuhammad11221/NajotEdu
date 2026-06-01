import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Add, Search, Archive } from "@mui/icons-material";
import { api } from "../utils/api";

const Xodimlar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const tabs = [
    { label: "Kurslar", path: "/dashboard/kurslar" },
    { label: "Xonalar", path: "/dashboard/xonalar" },
    { label: "Xodimlar", path: "/dashboard/xodimlar" },
  ];

  const currentPath = location.pathname;

  const loadEmployees = async () => {
    try {
      const data = await api.getTeachers();
      const list = Array.isArray(data) ? data : data.data || [];
      setEmployees(
        list.map((item, idx) => ({
          id: item.id || idx + 1,
          name: item.full_name || item.name || "Noma'lum xodim",
          phone: item.phone || "Noma'lum",
          email: item.email || "Noma'lum",
          role: item.position || item.role || "Xodim",
          status: item.is_active ? "Faol" : "Faol emas",
        }))
      );
    } catch (err) {
      console.error("Xodimlar ro'yxatini yuklashda xatolik:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

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
          <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-gray-500">Yuklanmoqda...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-gray-500">Xodimlar topilmadi.</td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-800 font-medium">{employee.name}</td>
                    <td className="px-5 py-4 text-gray-600">{employee.phone}</td>
                    <td className="px-5 py-4 text-gray-600">{employee.email}</td>
                    <td className="px-5 py-4 text-gray-600">{employee.role}</td>
                    <td className={`px-5 py-4 text-[13px] font-semibold ${employee.status === 'Faol' ? 'text-green-600' : 'text-gray-500'}`}>{employee.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Xodimlar;
