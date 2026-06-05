import React, { useState, useEffect } from "react";
import { Class, MenuBook, PeopleAlt, CardGiftcard } from "@mui/icons-material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { api } from "../utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState([
    { icon: <Class sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Sinflar", value: 0 },
    { icon: <MenuBook sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Fanlar", value: 0 },
    { icon: <PeopleAlt sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Talabalar", value: 0 },
    { icon: <CardGiftcard sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Sovg'alar", value: 0 },
    { icon: <PeopleAlt sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "O'qituvchilar", value: 0 },
  ]);
  const [scheduleOpen, setScheduleOpen] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [groupsData, coursesData, studentsData, teachersData] = await Promise.all([
          api.getGroups(),
          api.getCourses(),
          api.getStudents(),
          api.getTeachers(),
        ]);

        const groups = Array.isArray(groupsData) ? groupsData : groupsData.data || [];
        const courses = Array.isArray(coursesData) ? coursesData : coursesData.data || [];
        const students = Array.isArray(studentsData) ? studentsData : studentsData.data || [];
        const teachers = Array.isArray(teachersData) ? teachersData : teachersData.data || [];

        setStats([
          { icon: <Class sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Sinflar", value: groups.length },
          { icon: <MenuBook sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Fanlar", value: courses.length },
          { icon: <PeopleAlt sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Talabalar", value: students.length },
          { icon: <CardGiftcard sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "Sovg'alar", value: 0 },
          { icon: <PeopleAlt sx={{ fontSize: 28, color: "#7c3aed" }} />, label: "O'qituvchilar", value: teachers.length },
        ]);
      } catch (err) {
        console.error("Dashboard statistikani yuklashda xatolik:", err);
      }
    };

    loadStats();
  }, []); 
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Salom, creator!</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">EduCoin platformasiga xush kelibsiz!</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            {stat.icon}
            <span className="text-[12px] text-gray-500 font-medium">{stat.label}</span>
            <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Dars Jadvali */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setScheduleOpen(!scheduleOpen)}
          className="w-full flex items-center justify-between px-6 py-4 text-gray-700 font-semibold text-[15px] hover:bg-gray-50 transition-colors"
        >
          <span>Dars Jadvali</span>
          {scheduleOpen ? <ExpandLess sx={{ color: "#9ca3af" }} /> : <ExpandMore sx={{ color: "#9ca3af" }} />}
        </button>
        {scheduleOpen && (
          <div className="px-6 py-8 text-center text-gray-400 text-[13px] border-t border-gray-100">
            Hozircha dars jadvali mavjud emas
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
