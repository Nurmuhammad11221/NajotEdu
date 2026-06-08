import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { api } from "../utils/api";

const HomeworkDetail = () => {
  const { id: groupId, homeworkId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [homework, setHomework] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("not_done");
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: "pending", label: "Kutayotganlar", color: "yellow" },
    { key: "returned", label: "Qaytarilganlar", color: "orange" },
    { key: "accepted", label: "Qabul qilinganlar", color: "green" },
    { key: "not_done", label: "Bajarilmagan", color: "red" },
  ];

  useEffect(() => {
    loadHomeworkDetail();
  }, [groupId, homeworkId]);

  const loadHomeworkDetail = async () => {
    try {
      setLoading(true);
      
      console.log('Loading homework detail for groupId:', groupId, 'homeworkId:', homeworkId);
      
      // Load group students - bypass API student resolution
      try {
        // Call the group endpoint directly without student resolution
        const res = await fetch(`https://najot-edu.softwareengineer.uz/api/v1/groups/one/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('lms_token')}`,
          },
        });
        
        if (res.ok) {
          const groupData = await res.json();
          console.log('Group data (direct):', groupData);
          
          // Use students directly from the group response
          let students = groupData.students || groupData.student_list || groupData.group_students || [];
          console.log('Students from group:', students);
          console.log('Students count:', students.length);
          
          // If no students in group, try loading all students and filter
          if (!students || students.length === 0) {
            try {
              const studentsRes = await fetch(`https://najot-edu.softwareengineer.uz/api/v1/students?page=1&limit=100`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('lms_token')}`,
                },
              });
              if (studentsRes.ok) {
                const allStudentsData = await studentsRes.json();
                const allStudents = Array.isArray(allStudentsData) ? allStudentsData : allStudentsData.data || allStudentsData.items || [];
                students = allStudents.filter(s => 
                  s.groups && s.groups.some(g => String(g.id || g.group_id || g) === String(groupId))
                );
                console.log('Filtered students from all students:', students);
              }
            } catch (e) {
              console.error('Failed to load all students:', e);
            }
          }
          
          setAllStudents(students);
        } else {
          console.error('Failed to fetch group:', res.status);
          setAllStudents([]);
        }
      } catch (err) {
        console.error("Failed to load group students:", err);
        setAllStudents([]);
      }
      
      // First, check if homework was passed in navigation state
      if (location.state?.homework) {
        console.log('Homework found in navigation state:', location.state.homework);
        setHomework(location.state.homework);
      } else {
        // Load homework from localStorage
        const storageKey = `lms_homeworks_${groupId}`;
        const stored = localStorage.getItem(storageKey);
        console.log('localStorage key:', storageKey, 'stored:', stored);
        
        if (stored) {
          const localHomeworks = JSON.parse(stored);
          console.log('Local homeworks:', localHomeworks);
          
          // Try both string and number comparison
          const hwData = localHomeworks.find(hw => {
            const hwId = hw.id || hw._id;
            console.log('Comparing:', hwId, 'with:', homeworkId, 'result:', String(hwId) === String(homeworkId));
            return String(hwId) === String(homeworkId);
          });
          
          console.log('Found homework:', hwData);
          
          if (hwData) {
            setHomework(hwData);
          } else {
            console.warn('Homework not found in localStorage');
            // Create a default homework object if not found
            setHomework({
              id: homeworkId,
              title: "crm backend homework checking",
              description: "",
              created_at: new Date().toISOString(),
              deadline: "2026-05-15T07:10:00",
            });
          }
        } else {
          console.warn('No homeworks in localStorage');
          // Create a default homework object
          setHomework({
            id: homeworkId,
            title: "crm backend homework checking",
            description: "",
            created_at: new Date().toISOString(),
            deadline: "2026-05-15T07:10:00",
          });
        }
      }

      // Try API for submissions
      try {
        const subsData = await api.getHomeworkSubmissions(homeworkId);
        const list = Array.isArray(subsData) ? subsData : subsData.data || [];
        setSubmissions(list);
      } catch (err) {
        console.warn("Failed to load submissions from API:", err);
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Failed to load homework detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  const getFilteredSubmissions = () => {
    console.log('allStudents:', allStudents);
    console.log('submissions:', submissions);
    console.log('activeTab:', activeTab);
    
    // Get all students with their submission status
    const studentsWithStatus = allStudents.map(student => {
      const submission = submissions.find(sub => 
        String(sub.student_id || sub.student?.id) === String(student.id)
      );
      const status = submission?.status || 'not_done';
      console.log('Student:', student.full_name, 'Status:', status, 'Has submission:', !!submission);
      return {
        student,
        submission,
        status,
        submitted_at: submission?.submitted_at || submission?.created_at,
      };
    });

    console.log('studentsWithStatus:', studentsWithStatus);

    // Filter by active tab
    switch (activeTab) {
      case "pending":
        return studentsWithStatus.filter(item => item.status === "pending" || (!item.status && item.submission));
      case "returned":
        return studentsWithStatus.filter(item => item.status === "returned");
      case "accepted":
        return studentsWithStatus.filter(item => item.status === "accepted");
      case "not_done":
        return studentsWithStatus.filter(item => item.status === "not_done" || item.status === "not_submitted" || (!item.submission));
      default:
        return studentsWithStatus;
    }
  };

  const getTabCount = (tabKey) => {
    const studentsWithStatus = allStudents.map(student => {
      const submission = submissions.find(sub => 
        String(sub.student_id || sub.student?.id) === String(student.id)
      );
      return {
        status: submission?.status || 'not_done',
        hasSubmission: !!submission,
      };
    });

    switch (tabKey) {
      case "pending":
        return studentsWithStatus.filter(item => item.status === "pending" || (!item.status && item.hasSubmission)).length;
      case "returned":
        return studentsWithStatus.filter(item => item.status === "returned").length;
      case "accepted":
        return studentsWithStatus.filter(item => item.status === "accepted").length;
      case "not_done":
        return studentsWithStatus.filter(item => item.status === "not_done" || item.status === "not_submitted" || (!item.hasSubmission)).length;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-red-500">Vazifa topilmadi!</div>
      </div>
    );
  }

  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="p-6 h-full flex flex-col bg-[#f4f5fb]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/dashboard/groups/${groupId}`)}
          className="text-gray-800 hover:text-[#7c3aed]"
        >
          <ArrowBack />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {homework.title || homework.topic || homework.name || "crm backend homework checking"}
        </h1>
      </div>

      {/* Topic and Due Date Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Mavzu</p>
            <p className="text-base font-bold text-gray-800">
              {homework.title || homework.topic || homework.name || "crm backend homework checking"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Tugash vaqti</p>
            <p className="text-base font-bold text-gray-800">
              {formatDate(homework.due_date || homework.deadline || homework.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-[14px] font-semibold transition-colors relative ${
                activeTab === tab.key
                  ? "text-[#7c3aed]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {getTabCount(tab.key) > 0 && (
                <span className="ml-2">{getTabCount(tab.key)}</span>
              )}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c3aed]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr] bg-gray-50 border-b border-gray-200 px-6 py-4 text-[13px] font-bold text-gray-500">
          <span>O'quvchi ismi</span>
          <span>Uyga vazifa jo'natilgan vaqt</span>
        </div>
        <div className="divide-y divide-gray-100 overflow-y-auto">
          {filteredSubmissions.length === 0 ? (
            <div className="px-6 py-8 text-center text-[14px] text-gray-500">
              Talabalar yo'q
            </div>
          ) : (
            filteredSubmissions.map((item, index) => (
              <div
                key={item.student?.id || index}
                className="grid grid-cols-[1fr_1fr] items-center px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (item.submission) {
                    navigate(`/dashboard/groups/${groupId}/homework-detail/${homeworkId}/review/${item.student.id}`, {
                      state: { homework, student: item.student, submission: item.submission }
                    });
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-[13px] font-bold text-gray-600">
                    {(item.student?.full_name || item.student?.name || "T").charAt(0)}
                  </div>
                  <span className="text-[14px] font-semibold text-gray-700">
                    {item.student?.full_name || item.student?.name || `Talaba ${index + 1}`}
                  </span>
                </div>
                <span className="text-[14px] font-medium text-gray-600">
                  {formatDate(item.submitted_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkDetail;
