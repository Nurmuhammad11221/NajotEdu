import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack, MoreVert, Close, CloudUpload, PlayCircleFilled } from "@mui/icons-material";
import { api } from "../utils/api";

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Ma'lumotlar");
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [videoLesson, setVideoLesson] = useState("Nodejs");
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const DB_NAME = "NajotEduGroupVideos";
  const STORE_NAME = "videos";

  const openVideoDB = () => new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "videoId" });
        store.createIndex("groupId", "groupId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const saveVideoToDB = async (groupId, videoRecord) => {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ ...videoRecord, groupId: String(groupId) });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || tx.transaction.error);
    });
  };

  const loadVideosFromDB = async (groupId) => {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("groupId");
      const request = index.getAll(String(groupId));
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  };

  // Calendar states
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [activeDarslikTab, setActiveDarslikTab] = useState("Uyga vazifa");

  useEffect(() => {
    const loadGroup = async () => {
      try {
        setLoading(true);
        const data = await api.getGroupById(id);
        setGroup(data);
      } catch (err) {
        console.error("Failed to load group details from API:", err);
        // Try localStorage
        try {
          const stored = localStorage.getItem("lms_groups");
          if (stored) {
            const list = JSON.parse(stored);
            const localGroup = list.find(g => String(g.id) === String(id));
            if (localGroup) {
              // Convert local structure to API-like structure
              setGroup({
                ...localGroup,
                name: localGroup.nomi || localGroup.name,
                course: { name: localGroup.kurs || "Dasturlash" },
                teachers: [{ name: localGroup.oqituvchi || "Mentor" }],
                max_student: 20,
                start_date: localGroup.start_date || "2026-05-15",
                week_day: typeof localGroup.kunlar === "string" ? localGroup.kunlar.split(", ") : ["MONDAY", "WEDNESDAY", "FRIDAY"],
                start_time: localGroup.vaqt || "09:00",
                duration_month: parseInt(localGroup.davomiyligi) || 6,
              });
              return;
            }
          }
        } catch (e) {}

        // Ultimate fallback
        setGroup({
          id,
          name: `Guruh #${id}`,
          course: { name: "Noma'lum" },
          teachers: [{ name: "Noma'lum", photo: null }],
          students: [{}, {}, {}], 
          max_student: 20,
          start_date: "2026-05-15",
          week_day: ["MONDAY", "WEDNESDAY", "FRIDAY"],
          start_time: "09:30",
          duration_month: 6,
        });
      } finally {
        setLoading(false);
      }
    };
    loadGroup();
  }, [id]);

  useEffect(() => {
    const loadStoredVideos = async () => {
      try {
        const stored = await loadVideosFromDB(id);
        if (stored.length) {
          setVideos(stored.map((video) => ({
            id: video.videoId,
            title: video.title,
            lesson: video.lesson,
            size: video.size,
            date: video.date,
            url: URL.createObjectURL(video.fileBlob),
            fileBlob: video.fileBlob,
          })));
        }
      } catch (err) {
        console.error("Failed to load stored group videos:", err);
      }
    };
    loadStoredVideos();
  }, [id]);

  useEffect(() => {
    return () => {
      videos.forEach((video) => {
        if (video.url) {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, [videos]);

  const safeGroup = group || {
    name: `Guruh #${id}`,
    course: { name: "Noma'lum kurs", duration_month: 6 },
    teachers: [{ name: "Noma'lum mentor", photo: null }],
    students: [],
    max_student: 20,
    start_date: "2026-05-15",
    week_day: ["MONDAY", "WEDNESDAY", "FRIDAY"],
    start_time: "09:30",
  };

  const groupName = safeGroup.name || `Guruh #${id}`;
  const courseName = safeGroup.course?.name || safeGroup.course?.title || "Noma'lum kurs";
  const teacherName = safeGroup.teachers?.[0]?.name || safeGroup.teachers?.[0]?.full_name || "Noma'lum mentor";
  const teacherPhoto = safeGroup.teachers?.[0]?.photo ? `https://najot-edu.softwareengineer.uz/${safeGroup.teachers[0].photo}` : `https://i.pravatar.cc/150?u=${teacherName}`;
  const currentStudentsCount = Array.isArray(safeGroup.students) ? safeGroup.students.length : 0;
  const maxStudents = safeGroup.max_student || 20;
  const durationMonths = safeGroup.course?.duration_month || safeGroup.duration_month || 6;

  const weekdaysMap = {
    MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Ch", THURSDAY: "Pa", FRIDAY: "Ju", SATURDAY: "Sha", SUNDAY: "Ya"
  };
  const weekDayIndexes = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
    Ya: 0, Du: 1, Se: 2, Ch: 3, Pa: 4, Ju: 5, Sha: 6,
    Yakshanba: 0, Dushanba: 1, Seshanba: 2, Chorshanba: 3, Payshanba: 4, Juma: 5, Shanba: 6
  };
  const shortMonths = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

  const groupWeekDays = Array.isArray(safeGroup.week_day) ? safeGroup.week_day : ["MONDAY", "WEDNESDAY", "FRIDAY"];
  const weekDaysStr = groupWeekDays.map(d => weekdaysMap[d] || d).join("/");
  const startTimeStr = safeGroup.start_time ? safeGroup.start_time.substring(0, 5) : "09:30";

  const normalizedStartDate = useMemo(() => {
    const date = safeGroup.start_date ? new Date(safeGroup.start_date) : new Date("2026-05-15");
    return isNaN(date.getTime()) ? new Date("2026-05-15") : date;
  }, [safeGroup.start_date]);

  const targetDays = useMemo(
    () => groupWeekDays.map(d => weekDayIndexes[d] ?? weekDayIndexes[d.toUpperCase()] ?? 1),
    [groupWeekDays.join(",")]
  );

  const lessons = useMemo(() => {
    const lessonList = [];
    const endDate = new Date(normalizedStartDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    let currentDate = new Date(normalizedStartDate);

    while (currentDate < endDate) {
      if (targetDays.includes(currentDate.getDay())) {
        lessonList.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return lessonList;
  }, [normalizedStartDate, durationMonths, targetDays]);

  const lessonMonths = useMemo(() => {
    const monthsMap = {};
    lessons.forEach((date) => {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthsMap[key]) monthsMap[key] = [];
      monthsMap[key].push(date);
    });
    return Object.keys(monthsMap)
      .sort((a, b) => {
        const [ay, am] = a.split("-").map(Number);
        const [by, bm] = b.split("-").map(Number);
        return ay === by ? am - bm : ay - by;
      })
      .map((key) => monthsMap[key]);
  }, [lessons]);

  const totalLessons = lessons.length;
  const lessonsPerMonth = lessonMonths[currentMonthIndex - 1]?.length || 0;

  const handlePrevMonth = () => {
    if (currentMonthIndex > 1) setCurrentMonthIndex(currentMonthIndex - 1);
  };
  const formatFileSize = (bytes) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index += 1;
    }
    return `${size.toFixed(1)} ${units[index]}`;
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setSelectedFiles(files);
    }
  };

  const handleUploadFiles = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    const newFiles = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      title: file.name,
      lesson: videoLesson,
      size: formatFileSize(file.size),
      date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      url: URL.createObjectURL(file),
      fileBlob: file,
    }));
    setVideos((prev) => [...newFiles, ...prev]);
    try {
      await Promise.all(
        newFiles.map((video) => saveVideoToDB(id, {
          videoId: video.id,
          title: video.title,
          lesson: video.lesson,
          size: video.size,
          date: video.date,
          fileBlob: video.fileBlob,
        }))
      );
    } catch (err) {
      console.error("Failed to persist uploaded videos:", err);
    }
    setSelectedFiles([]);
    setUploading(false);
    setShowUploadModal(false);
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < lessonMonths.length) setCurrentMonthIndex(currentMonthIndex + 1);
  };

  const displayedLessons = showAllLessons 
    ? lessons 
    : (lessonMonths[currentMonthIndex - 1] || []);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const getDateStatus = (date) => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (normalized.getTime() < today.getTime()) return "past";
    if (normalized.getTime() > today.getTime()) return "future";
    return "today";
  };

  const isSameDate = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const examRows = [
    { id: 7, title: "Examination", students: 12, missing: 0, status: "Faol", lessonTime: "22 May, 2026 09:30", givenTime: "22 May, 2026 09:28", publishedTime: "-" },
    { id: 6, title: "Examination", students: 12, missing: 0, status: "Tugagan", lessonTime: "24 Apr, 2026 09:30", givenTime: "24 Apr, 2026 09:25", publishedTime: "27 Apr, 2026 10:30" },
    { id: 5, title: "Examination", students: 14, missing: 0, status: "Tugagan", lessonTime: "26 Mart, 2026 09:30", givenTime: "26 Mart, 2026 09:23", publishedTime: "30 Mart, 2026 14:34" },
    { id: 4, title: "Examination", students: 16, missing: 0, status: "Tugagan", lessonTime: "26 Fev, 2026 09:30", givenTime: "26 Fev, 2026 09:28", publishedTime: "02 Mart, 2026 13:32" },
  ];

  if (loading) {
    return <div className="p-6 h-full flex items-center justify-center">Yuklanmoqda...</div>;
  }

  if (!group) {
    return <div className="p-6 h-full text-red-500">Guruh topilmadi!</div>;
  }

  return (
    <div className="p-6 h-full relative overflow-hidden flex flex-col bg-[#f4f5fb]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/groups")} className="text-gray-800 hover:text-[#7c3aed]">
            <ArrowBack />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{groupName}</h1>
          <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded">Aktiv</span>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Statistika
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[14px] font-semibold transition-colors ${
              activeTab === tab 
                ? "text-[#7c3aed] border-b-2 border-[#7c3aed]" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-10 custom-scrollbar">
        {activeTab === "Ma'lumotlar" && (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Guruh mentorlari */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm self-start">
              <div className="bg-[#3b82f6] text-white px-5 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-[14px]">Guruh mentorlari</h3>
                <button className="text-white/80 hover:text-white"><Close sx={{ fontSize: 18 }} /></button>
              </div>
              <div className="p-6 flex flex-col items-center">
                <img src={teacherPhoto} alt={teacherName} className="w-16 h-16 rounded-full object-cover border border-gray-200 mb-3 shadow-sm" />
                <span className="text-teal-500 text-[11px] font-bold uppercase mb-1">Teacher</span>
                <span className="text-gray-800 font-bold text-[14px]">{teacherName}</span>
              </div>
            </div>

            {/* Parametrlar */}
            <div className="flex-[2] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#3b82f6] text-white px-5 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-[14px]">Parametrlar</h3>
                <button className="text-white/80 hover:text-white"><Close sx={{ fontSize: 18 }} /></button>
              </div>
              <div className="p-0">
                <table className="w-full text-[13px] text-gray-700">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 font-medium text-gray-500">Kurs:</td>
                      <td className="py-3.5 px-5 font-bold text-right">{courseName}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 font-medium text-gray-500">O'rta yosh:</td>
                      <td className="py-3.5 px-5 font-bold text-right">21</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 font-medium text-gray-500">O'quvchilar sig'imi:</td>
                      <td className="py-3.5 px-5 font-bold text-right">{maxStudents}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 font-medium text-gray-500">Mavjud o'quvchilar:</td>
                      <td className="py-3.5 px-5 font-bold text-right">{currentStudentsCount}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 font-medium text-gray-500">O'quv oyidagi darslar soni:</td>
                      <td className="py-3.5 px-5 font-bold text-right">{lessonsPerMonth}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 font-medium text-gray-500">Kurs davomiyligi (oy):</td>
                      <td className="py-3.5 px-5 font-bold text-right">{durationMonths}.0</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-5 font-medium text-gray-500">Jami darslar soni:</td>
                      <td className="py-3.5 px-5 font-bold text-right">{totalLessons}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Ma'lumotlar" && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-5">
              <h3 className="font-bold text-gray-800 text-[16px] mb-6">Dars jadvali</h3>
              
              <div className="overflow-x-auto border rounded-xl mb-6 border-gray-100">
                <table className="w-full text-[13px] text-gray-600">
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-4 px-6 font-bold text-blue-500">{teacherName}</td>
                      <td className="py-4 px-6">{weekDaysStr}</td>
                      <td className="py-4 px-6">{startTimeStr} dan - gacha</td>
                      <td className="py-4 px-6">15 Yan, 2026 - 27 Iyun, 2026</td>
                      <td className="py-4 px-6">F2 Autodesk // {currentStudentsCount}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-blue-500">+++Yusupova Barchinoy</td>
                      <td className="py-4 px-6">Du/Se/Ch/Pa/Ju</td>
                      <td className="py-4 px-6">08:00 dan - 09:30 gacha</td>
                      <td className="py-4 px-6">15 Yan, 2026 - 27 Iyun, 2026</td>
                      <td className="py-4 px-6">F2 Autodesk // {currentStudentsCount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mb-6">
                <button className="text-[13px] text-gray-600 font-semibold py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Yana ko'rsatish (9)
                </button>
              </div>

              {/* Month calendar selection */}
              {!showAllLessons ? (
                <>
                  <div className="flex items-center gap-3 mb-4 mt-6">
                    <button 
                      onClick={handlePrevMonth}
                      disabled={currentMonthIndex === 1}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ArrowBack sx={{ fontSize: 16 }} />
                    </button>
                    <span className="font-bold text-[16px] text-gray-800">
                      {currentMonthIndex}-o'quv oyi
                      {currentMonthIndex === 1 && (
                        <span className="bg-green-50 text-green-500 text-[11px] px-2 py-0.5 rounded ml-2 font-bold uppercase tracking-wide">
                          Joriy oy
                        </span>
                      )}
                    </span>
                    <button 
                      onClick={handleNextMonth}
                      disabled={currentMonthIndex >= lessonMonths.length}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ArrowBack sx={{ fontSize: 16, transform: "rotate(180deg)" }} />
                    </button>
                  </div>

                  <div className="flex gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                    {displayedLessons.map((d, i) => {
                      const isSelected = selectedLesson && selectedLesson.getTime() === d.getTime();
                      return (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => setSelectedLesson(d)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-[58px] h-[64px] rounded-xl transition-colors ${
                            isSelected ? 'bg-[#10b981] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-[12px] font-bold">{shortMonths[d.getMonth()]}</span>
                          <span className="text-[18px] font-bold">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-8 mt-8 mb-8">
                  {lessonMonths.map((month, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-[18px] text-gray-900 mb-4 flex items-center">
                        {idx + 1}-o'quv oyi
                        {idx === 0 && (
                          <span className="bg-green-50 text-green-500 text-[11px] px-2 py-0.5 rounded ml-3 font-bold uppercase tracking-wide">
                            Joriy oy
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {month.map((d, i) => {
                          const isSelected = selectedLesson && selectedLesson.getTime() === d.getTime();
                          return (
                            <button 
                              key={i} 
                              type="button"
                              onClick={() => setSelectedLesson(d)}
                              className={`flex flex-col items-center justify-center w-[58px] h-[64px] rounded-xl transition-colors ${
                                isSelected ? 'bg-[#10b981] text-white shadow-lg' : idx === 0 
                                  ? 'bg-[#e2e8f0] text-gray-600 hover:bg-[#cbd5e1]' 
                                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-[12px] font-bold">{shortMonths[d.getMonth()]}</span>
                              <span className="text-[18px] font-bold">{d.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedLesson && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-6">
                  <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl border border-gray-100 p-5 bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#f8fafc] flex items-center justify-center text-gray-700 text-lg font-bold">
                          {teacherName[0] || "T"}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ma'lumot</p>
                          <p className="font-semibold text-gray-900">{teacherName}</p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl bg-white border border-gray-100 p-4">
                          <p className="text-xs text-gray-500">Dars kuni</p>
                          <p className="mt-1 font-semibold text-gray-900">
                            {shortMonths[selectedLesson.getMonth()]} {selectedLesson.getDate()}, {selectedLesson.getFullYear()}
                          </p>
                        </div>
                        <div className="rounded-3xl bg-white border border-gray-100 p-4">
                          <p className="text-xs text-gray-500">Holat</p>
                          <p className="mt-1 font-semibold text-gray-900">Dars o'tilmagan</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 p-5 bg-slate-50">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">O'quv reja bo'yicha</p>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1">Boshqa</span>
                      </div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mavzu</label>
                      <input type="text" placeholder="Mavzuni kiriting..." className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#10b981]" />
                      <label className="block text-sm font-semibold text-gray-700 mt-4 mb-2">Tavsif (ixtiyoriy)</label>
                      <textarea placeholder="Dars haqida qo'shimcha ma'lumot..." className="w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#10b981]" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button 
                  onClick={() => setShowAllLessons(!showAllLessons)}
                  className="text-[13px] text-gray-600 font-semibold py-2 px-6 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {showAllLessons ? "Kamroq ko'rish" : "Barchasini ko'rish"}
                </button>
              </div>

            </div>
          </div>
        )}

        {activeTab === "Guruh darsliklari" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-gray-800 text-[16px] mr-2">Guruh darsliklari</h3>
                <div className="flex bg-gray-50 rounded-lg p-1">
                  {["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"].map(t => (
                    <button 
                      key={t}
                      onClick={() => setActiveDarslikTab(t)}
                      className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                        activeDarslikTab === t 
                          ? "bg-white text-gray-800 shadow-sm" 
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  if (activeDarslikTab === "Uyga vazifa") {
                    navigate(`/dashboard/groups/${id}/homework`);
                    return;
                  }
                  if (activeDarslikTab === "Imtihonlar") {
                    // Placeholder for exam creation flow
                    return;
                  }
                  setActiveTab("Guruh darsliklari");
                  setActiveDarslikTab("Videolar");
                  setShowUploadModal(true);
                  setSelectedFiles([]);
                }}
                className="bg-[#10b981] text-white text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#059669] transition-colors"
              >
                {activeDarslikTab === "Imtihonlar" ? "Yangi imtihon" : "Qo'shish"}
              </button>
            </div>

            {activeDarslikTab === "Uyga vazifa" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-t border-gray-100">
                  <thead>
                    <tr className="text-[12px] text-gray-500 font-semibold">
                      <th className="py-4 px-4 w-12">#</th>
                      <th className="py-4 px-4">Mavzu</th>
                      <th className="py-4 px-4 w-16 text-center">Baholar</th>
                      <th className="py-4 px-4 w-16 text-center">Jayib</th>
                      <th className="py-4 px-4 w-16 text-center">Status</th>
                      <th className="py-4 px-4">Berilgan vaqt</th>
                      <th className="py-4 px-4">Tugash vaqti</th>
                      <th className="py-4 px-4">Dars sanasi</th>
                      <th className="py-4 px-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700 font-medium">
                    {[
                      { id: 1, title: "Html asoslari", given: "13 May, 2026 10:00", end: "14 May, 2026 08:00", date: "12 May, 2026" },
                      { id: 2, title: "Kirish", given: "13 May, 2026 11:52", end: "14 May, 2026 07:52", date: "9 May, 2026" },
                      { id: 3, title: "Nodejs", given: "14 May, 2026 09:47", end: "15 May, 2026 05:47", date: "14 May, 2026" },
                      { id: 4, title: "takrorlash", given: "19 May, 2026 16:22", end: "20 May, 2026 12:22", date: "19 May, 2026" },
                    ].map(lesson => (
                      <tr key={lesson.id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-4">{lesson.id}</td>
                        <td className="py-4 px-4 font-semibold">{lesson.title}</td>
                        <td className="py-4 px-4 text-center">5</td>
                        <td className="py-4 px-4 text-center">0</td>
                        <td className="py-4 px-4 text-center">0</td>
                        <td className="py-4 px-4 text-gray-500">{lesson.given}</td>
                        <td className="py-4 px-4 text-gray-500">{lesson.end}</td>
                        <td className="py-4 px-4 text-gray-500">{lesson.date}</td>
                        <td className="py-4 px-4 text-gray-400 cursor-pointer hover:text-gray-600">
                          <MoreVert sx={{ fontSize: 18 }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeDarslikTab === "Videolar" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Videolar</h4>
                    <p className="text-sm text-gray-500">{videos.length} ta video mavjud</p>
                  </div>
                </div>

                {videos.length === 0 ? (
                  <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-[#f8fafc] text-[#2563eb] flex items-center justify-center">
                      <CloudUpload sx={{ fontSize: 26 }} />
                    </div>
                    <h4 className="text-[16px] font-semibold text-gray-900 mb-2">Hozircha video yo'q</h4>
                    <p className="text-sm text-gray-500">Videoni qo'shish uchun sahifaning yuqori o'ng burchagidagi <span className="font-semibold text-gray-700">Qo'shish</span> tugmasini bosing.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">Videolar ro'yxati</h4>
                        <p className="text-xs text-gray-500">Hozirda {videos.length} ta video mavjud</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <span className="text-xs text-gray-500">Dars:</span>
                        <select value={videoLesson} onChange={(e) => setVideoLesson(e.target.value)} className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none">
                          <option>Nodejs</option>
                          <option>Html asoslari</option>
                          <option>Kirish</option>
                        </select>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[13px] text-gray-700">
                        <thead>
                          <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            <th className="px-4 py-4">#</th>
                            <th className="px-4 py-4">Video nomi</th>
                            <th className="px-4 py-4">Dars nomi</th>
                            <th className="px-4 py-4">Hajmi</th>
                            <th className="px-4 py-4">Sana</th>
                            <th className="px-4 py-4">Qo'shilgan vaqti</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {videos.map((video, index) => (
                            <tr
                              key={video.id}
                              className={`hover:bg-gray-50 ${video.url ? "cursor-pointer" : ""}`}
                              onClick={() => {
                                if (!video.url) return;
                                setSelectedVideo(video);
                                setShowVideoPlayer(true);
                              }}
                            >
                              <td className="px-4 py-4 text-sm text-gray-500">{index + 1}</td>
                              <td className="px-4 py-4 flex items-center gap-3 font-semibold text-gray-800">
                                <span className="w-9 h-9 rounded-2xl bg-[#eef2ff] text-[#7c3aed] flex items-center justify-center">
                                  <PlayCircleFilled sx={{ fontSize: 18 }} />
                                </span>
                                {video.title}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">{video.lesson}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{video.size}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{video.date}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{video.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeDarslikTab === "Imtihonlar" && (
              <div className="overflow-x-auto bg-white border border-gray-200 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Imtihonlar</h4>
                    <p className="text-sm text-gray-500">Guruhga tegishli imtihonlar ro'yxati</p>
                  </div>
                  <button
                    className="bg-[#10b981] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#059669] transition-colors"
                  >
                    Yangi imtihon
                  </button>
                </div>
                <table className="w-full text-left border-t border-gray-100">
                  <thead>
                    <tr className="text-[12px] text-gray-500 font-semibold uppercase tracking-wide">
                      <th className="py-4 px-4 w-12">#</th>
                      <th className="py-4 px-4">Mavzu</th>
                      <th className="py-4 px-4 w-16 text-center">👤</th>
                      <th className="py-4 px-4 w-16 text-center">✖</th>
                      <th className="py-4 px-4 w-24 text-center">Status</th>
                      <th className="py-4 px-4">Dars vaqti</th>
                      <th className="py-4 px-4">Berilgan vaqt</th>
                      <th className="py-4 px-4">E'lon qilingan vaqti</th>
                      <th className="py-4 px-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700 font-medium">
                    {examRows.map((exam) => (
                      <tr key={exam.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">{exam.id}</td>
                        <td className="py-4 px-4 font-semibold text-[#1d4ed8]">{exam.title}</td>
                        <td className="py-4 px-4 text-center">{exam.students}</td>
                        <td className="py-4 px-4 text-center">{exam.missing}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${exam.status === "Faol" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                            {exam.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500">{exam.lessonTime}</td>
                        <td className="py-4 px-4 text-gray-500">{exam.givenTime}</td>
                        <td className="py-4 px-4 text-gray-500">{exam.publishedTime}</td>
                        <td className="py-4 px-4 text-gray-400 cursor-pointer hover:text-gray-600">
                          <MoreVert sx={{ fontSize: 18 }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeDarslikTab === "Jurnal" && (
              <div className="bg-gray-50 rounded-3xl p-8 text-center text-gray-500">
                Jurnal bo'limi hozircha bo'sh.
              </div>
            )}
          </div>
        )}

        {activeTab === "Akademik davomati" && (
           <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center justify-center h-64">
             <p className="text-gray-500 font-medium">Akademik davomat ma'lumotlari mavjud emas</p>
           </div>
        )}

      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Qo'shish</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="border border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50">
                <div className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-[#eef2ff] text-[#047857] flex items-center justify-center">
                  <CloudUpload sx={{ fontSize: 26 }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Videofaylni yuklash uchun ushbu hududga bosing yoki faylni olib keling</h3>
                <p className="text-sm text-gray-500 mb-6">Videofayl: .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov formatlaridan biri bo'lishi kerak</p>
                <input id="modal-video-upload" type="file" accept="video/*" multiple className="hidden" onChange={handleFilesChange} />
                <label htmlFor="modal-video-upload" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Fayl tanlash
                </label>
                {selectedFiles.length > 0 && (
                  <div className="mt-5 text-left text-sm text-gray-600">
                    <div className="mb-3 font-semibold">Tanlangan fayllar:</div>
                    <ul className="space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <li key={idx} className="flex items-center justify-between rounded-2xl bg-white p-3 border border-gray-200">
                          <span>{file.name}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleUploadFiles}
                  disabled={!selectedFiles.length || uploading}
                  className="inline-flex items-center justify-center rounded-full bg-[#10b981] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Yuklanmoqda..." : "Fayllarni yuklash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedVideo.title}</h2>
                <p className="text-sm text-gray-500">{selectedVideo.lesson}</p>
              </div>
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setSelectedVideo(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <video
                controls
                autoPlay
                className="w-full rounded-3xl bg-black"
                src={selectedVideo.url}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
