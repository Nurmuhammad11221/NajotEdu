import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { api } from "../utils/api";

const HomeworkReview = () => {
  const { groupId, homeworkId, studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [homework, setHomework] = useState(location.state?.homework || null);
  const [student, setStudent] = useState(location.state?.student || null);
  const [submission, setSubmission] = useState(location.state?.submission || null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleStatusChange = async (newStatus) => {
    if (!submission?.id) return;
    
    setUpdating(true);
    try {
      await api.submitHomeworkResult({
        homework_id: Number(homeworkId),
        student_id: Number(studentId),
        status: newStatus,
      });
      
      // Update local submission state
      setSubmission({ ...submission, status: newStatus });
      
      // Navigate back
      navigate(`/dashboard/groups/${groupId}/homework-detail/${homeworkId}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Status yangilanmadi: " + (err.message || ""));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    returned: "bg-orange-100 text-orange-700",
    not_done: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    pending: "Kutayabti",
    accepted: "Qabul qilingan",
    returned: "Qaytarilgan",
    not_done: "Bajarilmagan",
  };

  return (
    <div className="p-6 h-full flex flex-col bg-[#f4f5fb]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/dashboard/groups/${groupId}/homework-detail/${homeworkId}`)}
          className="text-gray-800 hover:text-[#7c3aed]"
        >
          <ArrowBack />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Kutayotganlar &gt; Uyga vazifa
        </h1>
      </div>

      {/* Homework Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Uy vazifasi</h2>
        <p className="text-base text-gray-700">
          {homework?.title || homework?.topic || homework?.description || "Homework tekshirish qismini qilish backend"}
        </p>
      </div>

      {/* Student Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
            {(student?.full_name || student?.name || "T").charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {student?.full_name || student?.name || "Nosirxon Ziyovutdinov"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Vaqti</p>
            <p className="text-base font-medium text-gray-800">
              {formatDate(submission?.submitted_at || submission?.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Fayllar soni</p>
            <p className="text-base font-medium text-gray-800">
              {submission?.files?.length || 3}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 font-semibold mb-1">Status</p>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            statusColors[submission?.status] || statusColors.pending
          }`}>
            {statusLabels[submission?.status] || statusLabels.pending}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 font-semibold mb-1">Fayl</p>
          <p className="text-base font-medium text-gray-800">
            {submission?.files?.length || 3}
          </p>
        </div>

        {/* File Previews */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs"
            >
              Fayl {i}
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm text-gray-500 font-semibold mb-1">Uyga vazifa izohi:</p>
          <p className="text-base text-gray-700 break-all">
            {submission?.comment || submission?.description || "https://github.com/Nosirhon-01/CRM_Fullsatck:"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleStatusChange("accepted")}
          disabled={updating}
          className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {updating ? "Yangilanmoqda..." : "Qabul qilish"}
        </button>
        <button
          onClick={() => handleStatusChange("returned")}
          disabled={updating}
          className="flex-1 bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {updating ? "Yangilanmoqda..." : "Qaytarish"}
        </button>
      </div>
    </div>
  );
};

export default HomeworkReview;
