import React, { useState, useEffect, useMemo } from "react";
import { useParams,
   useNavigate } from "react-router-dom";
import { ArrowBack, MoreVert, Close, CloudUpload, PlayCircleFilled } from "@mui/icons-material";
import { api, getTokenRole } from "../utils/api";

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

  // Homework / submissions
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionFilter, setSubmissionFilter] = useState("All");
  const [userRole, setUserRole] = useState(null);

  // Attendance
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendedStudents, setAttendedStudents] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  // Calendar states
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [attendance, setAttendance] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [savedLessons, setSavedLessons] = useState({});

  const [activeDarslikTab, setActiveDarslikTab] = useState("Uyga vazifa");

  const getPublicFileUrl = (file) => {
    const path = file?.url || file?.path || file?.file || file?.file_path || file?.filename || "";
    if (!path) return "";
    return path.startsWith("http") ? path : `https://najot-edu.softwareengineer.uz/${path}`;
  };

  const loadHomeworks = async () => {
    console.log('loadHomeworks called for group:', id);
    
    // Try API first
    try {
      const data = await api.getHomeworks(id);
      console.log('Homeworks data received from API:', data);
      
      // Sort by creation date (newest at bottom)
      const sorted = (data || []).sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateA - dateB; // Oldest first, newest at bottom
      });
      
      setHomeworks(sorted);
      return;
    } catch (err) {
      console.error("Failed to load homeworks from API:", err);
    }
    
    // Fallback to localStorage
    try {
      const storageKey = `lms_homeworks_${id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const localHomeworks = JSON.parse(stored);
        console.log('Loaded homeworks from localStorage:', localHomeworks);
        const sorted = localHomeworks.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateA - dateB;
        });
        setHomeworks(sorted);
      } else {
        console.log('No homeworks in localStorage');
        setHomeworks([]);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      setHomeworks([]);
    }
  };

  const loadGroupVideos = async () => {
    try {
      const data = await api.getGroupFiles(id);
      setVideos(data || []);
    } catch (err) {
      console.error("Failed to load group videos:", err);
    }
  };

  const loadGroup = async () => {
    try {
      setLoading(true);
      const data = await api.getGroupById(id);
      setGroup(data);
    } catch (err) {
      console.error("Failed to load group:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
    loadHomeworks();
    loadGroupVideos();
    
    // Force load from localStorage immediately
    const storageKey = `lms_homeworks_${id}`;
    const stored = localStorage.getItem(storageKey);
    console.log('Direct localStorage check for group', id, ':', stored);
    if (stored) {
      try {
        const localHomeworks = JSON.parse(stored);
        console.log('Setting homeworks from localStorage:', localHomeworks);
        setHomeworks(localHomeworks);
      } catch (e) {
        console.error('Failed to parse localStorage:', e);
      }
    }

    // Load videos from IndexedDB
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

  // Refresh homeworks when component gains focus (navigation back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadHomeworks();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id]);

  // Cleanup video URLs when component unmounts
  useEffect(() => {
    return () => {
      videos.forEach((video) => {
        if (video.url) {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, [videos]);

  useEffect(() => {
    return () => {
      videos.forEach((video) => {
        if (video.url?.startsWith("blob:")) {
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
    SUNDAY: "Ya", MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Ch", THURSDAY: "Pa", FRIDAY: "Ju", SATURDAY: "Sha",
    DUSHANBA: "Du", SESHANBA: "Se", CHORSHANBA: "Ch", PAYSHANBA: "Pa", JUMA: "Ju", SHANBA: "Sha", YAKSHANBA: "Ya",
    DU: "Du", SE: "Se", CH: "Ch", PA: "Pa", JU: "Ju", SHA: "Sha", YA: "Ya",
    MON: "Du", TUE: "Se", WED: "Ch", THU: "Pa", FRI: "Ju", SAT: "Sha", SUN: "Ya"
  };
  const weekDayIndexes = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
    DUSHANBA: 1, SESHANBA: 2, CHORSHANBA: 3, PAYSHANBA: 4, JUMA: 5, SHANBA: 6, YAKSHANBA: 0,
    DU: 1, SE: 2, CH: 3, PA: 4, JU: 5, SHA: 6, YA: 0,
    MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0
  };
  const normalizeWeekdayValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value.trim();
    if (typeof value === "object") {
      const candidate = value.day || value.name || value.value || value.label || value.label_text || value.week_day;
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
      if (typeof candidate === "number") return String(candidate);
      const str = Object.values(value).find((v) => typeof v === "string" && v.trim());
      return typeof str === "string" ? str.trim() : "";
    }
    return String(value).trim();
  };
  const getWeekdayKey = (value) => {
    const raw = normalizeWeekdayValue(value);
    if (!raw) return "";
    const upper = raw.toUpperCase();
    if (weekDayIndexes[upper] !== undefined) return upper;
    if (weekdaysMap[upper] !== undefined) return upper;
    const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    return capitalized;
  };
  const shortMonths = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const formatLessonDateKey = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const isSameDate = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const normalizeWeekdays = (weekDaysInput) => {
    if (!weekDaysInput) return [];
    if (Array.isArray(weekDaysInput)) return weekDaysInput;
    if (typeof weekDaysInput === "string") {
      try {
        const parsed = JSON.parse(weekDaysInput);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return weekDaysInput.split(",").map(d => d.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const groupWeekDays = normalizeWeekdays(safeGroup.week_day);
  const resolvedGroupWeekDays = groupWeekDays.length ? groupWeekDays : ["MONDAY", "WEDNESDAY", "FRIDAY"];
  const weekDaysStr = resolvedGroupWeekDays
    .map((d) => {
      const key = getWeekdayKey(d);
      return weekdaysMap[key] || String(normalizeWeekdayValue(d)).trim();
    })
    .filter(Boolean)
    .join("/");
  const startTimeStr = safeGroup.start_time ? safeGroup.start_time.substring(0, 5) : "09:30";

  // Safe local date parser: avoids UTC offset bug ("2026-05-15" parses as UTC midnight)
  const parseLocalDate = (str) => {
    if (!str) return null;
    if (str instanceof Date) return str;
    const parts = String(str).split("-");
    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2].substring(0, 2));
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return new Date(str);
  };

  const formatDateLabel = (value) => {
    if (!value) return "-";
    const date = value instanceof Date ? value : parseLocalDate(value);
    if (!date || Number.isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = shortMonths[date.getMonth()] || date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const normalizedStartDate = useMemo(() => {
    const fallback = new Date(2026, 4, 15); // 15 May 2026 local
    if (!safeGroup.start_date) return fallback;
    const date = parseLocalDate(safeGroup.start_date);
    return (!date || Number.isNaN(date.getTime())) ? fallback : date;
  }, [safeGroup.start_date]);

  const courseEndDate = useMemo(() => {
    const end = new Date(normalizedStartDate);
    end.setMonth(end.getMonth() + durationMonths);
    end.setDate(end.getDate() - 1);
    return end;
  }, [normalizedStartDate, durationMonths]);

  const targetDays = useMemo(
    () => resolvedGroupWeekDays
      .map((d) => {
        const key = getWeekdayKey(d);
        return weekDayIndexes[key];
      })
      .filter((day, index, arr) => typeof day === "number" && !arr.includes(day, index + 1)),
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

  const currentMonthLabel = useMemo(() => {
    const monthList = lessonMonths[currentMonthIndex - 1];
    if (!monthList?.length) return "";
    const date = monthList[0];
    return `${shortMonths[date.getMonth()] || date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
  }, [lessonMonths, currentMonthIndex]);

  const totalLessons = lessons.length;
  const lessonsPerMonth = lessonMonths[currentMonthIndex - 1]?.length || 0;

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const currentLessonMonthIndex = useMemo(() => {
    if (!lessonMonths.length) return 1;
    const sameDateIndex = lessonMonths.findIndex((month) => month.some((date) => isSameDate(date, today)));
    if (sameDateIndex >= 0) return sameDateIndex + 1;

    const sameCalendarMonthIndex = lessonMonths.findIndex((month) =>
      month.some((date) => date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth())
    );
    if (sameCalendarMonthIndex >= 0) return sameCalendarMonthIndex + 1;

    const nextMonthIndex = lessonMonths.findIndex((month) => month.some((date) => date.getTime() > today.getTime()));
    return nextMonthIndex >= 0 ? nextMonthIndex + 1 : lessonMonths.length;
  }, [lessonMonths, today]);

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

  const handleUpdateSubmissionStatus = async (submissionId, status) => {
    try {
      await api.updateSubmissionStatus(submissionId, { status });
      // refresh
      if (selectedHomework) {
        const subs = await api.getHomeworkSubmissions(selectedHomework.id);
        const list = Array.isArray(subs) ? subs : subs.data || [];
        setSubmissions(list);
      }
    } catch (e) {
      console.error('Failed to update submission status', e);
      alert('Status yangilanmadi');
    }
  };

  const resolveStudentId = (student) => {
    const raw = student?.id ?? student?._id ?? student?.student_id ?? student?.uid;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num : null;
  };

  const getGroupStudents = () => {
    if (!Array.isArray(safeGroup.students) || safeGroup.students.length === 0) {
      return [];
    }
    return safeGroup.students
      .map((student, index) => {
        if (typeof student === "number" || (typeof student === "string" && /^\d+$/.test(String(student).trim()))) {
          const studentId = Number(student);
          return { id: studentId, full_name: `Talaba #${studentId}`, name: `Talaba #${studentId}` };
        }
        if (typeof student === "object" && student !== null) {
          const studentId = resolveStudentId(student);
          const name = student.full_name || student.name || student.fullName || `Talaba ${index + 1}`;
          return studentId ? { ...student, id: studentId, full_name: name, name } : null;
        }
        return null;
      })
      .filter(Boolean);
  };

  const saveAttendanceForStudents = async (attendanceMap) => {
    const students = getGroupStudents();
    if (!students.length) {
      throw new Error("Guruhda talabalar topilmadi");
    }
    await Promise.all(
      students.map((student) => {
        const studentId = resolveStudentId(student);
        if (!studentId) return Promise.resolve();
        const key = String(studentId);
        return api.createAttendance({
          group_id: Number(id),
          student_id: studentId,
          isPresent: Boolean(attendanceMap?.[studentId] ?? attendanceMap?.[key]),
        });
      })
    );
  };

  const handleSaveAttendanceByDate = async () => {
    if (!attendanceDate) {
      showToast("Sana tanlang", "error");
      return;
    }
    const students = getGroupStudents();
    if (!students.length) {
      showToast("Guruhda talabalar yo'q", "error");
      return;
    }
    setSavingAttendance(true);
    try {
      await saveAttendanceForStudents(attendedStudents);
      showToast("Davomat saqlandi", "success");
      setAttendanceDate("");
      setAttendedStudents({});
    } catch (e) {
      console.error('Failed to save attendance', e);
      showToast('Davomatni saqlashda xatolik: ' + (e.message || ''), "error");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < lessonMonths.length) setCurrentMonthIndex(currentMonthIndex + 1);
  };

  const displayedLessons = showAllLessons 
    ? lessons 
    : (lessonMonths[currentMonthIndex - 1] || []);

  const getDateStatus = (date) => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (normalized.getTime() < today.getTime()) return "past";
    if (normalized.getTime() > today.getTime()) return "future";
    return "today";
  };

      const getLessonButtonClass = (date, isSelected, isCurrentMonth = false) => {
      const status = getDateStatus(date);
      if (isSelected) return "bg-[#10b981] text-white shadow-lg border border-[#10b981]";
      if (status === "today") return "bg-white border border-[#10b981] text-[#047857] hover:bg-emerald-50";

      // Treat past and future dates the same (clickable)
      if (status === "past" || status === "future") {
        return `${isCurrentMonth ? "bg-[#edf2f7] hover:bg-[#e2e8f0]" : "bg-gray-100 hover:bg-gray-200"} text-gray-700 border border-gray-200 cursor-pointer`;
      }
      // Fallback (should not happen)
      return "bg-white border border-gray-200 text-gray-400 cursor-not-allowed opacity-60";
    };

  const handleLessonSelect = (date) => {
    setSelectedLesson(date);
  };

  const toggleAttendance = (studentId) => {
    const key = String(studentId);
    setAttendance((prev) => ({ ...prev, [key]: !prev[key], [studentId]: !prev[studentId] }));
  };

  const selectedLessonKey = selectedLesson ? formatLessonDateKey(selectedLesson) : "";
  const selectedSavedLesson = selectedLessonKey ? savedLessons[selectedLessonKey] : null;
  const selectedLessonStatus = selectedLesson ? getDateStatus(selectedLesson) : null;
  const selectedLessonIsPast = selectedLessonStatus === "past";
  const selectedLessonIsFuture = selectedLessonStatus === "future";
  const selectedLessonIsToday = selectedLessonStatus === "today";
  const canEditLesson = selectedLesson && !selectedLessonIsFuture;
  const lessonStatusLabel = selectedLessonIsFuture
    ? "Dars vaqti hali kelmagan"
    : selectedLessonIsPast
      ? "Dars o'tib ketgan"
      : "Joriy dars";
  const lastLesson = Object.values(savedLessons).at(-1);
  const scheduleTopic = selectedSavedLesson?.topic || (typeof lastLesson === 'object' && lastLesson?.topic) || "Mavzu belgilanmagan";

  const handleSaveAttendance = async () => {
    if (!selectedLesson) {
      showToast("Avvalo darsni tanlang", "error");
      return;
    }
    if (selectedLessonIsFuture) {
      showToast("Dars vaqti hali kelmagan", "error");
      return;
    }
    if (!lessonTopic.trim()) {
      showToast("Dars mavzusi bo'sh bo'lishi mumkin emas", "error");
      return;
    }
    const students = getGroupStudents();
    if (!students.length) {
      showToast("Guruhda talabalar yo'q", "error");
      return;
    }
    setSavingAttendance(true);
    try {
      const lessonPayload = {
        group_id: Number(id),
        topic: lessonTopic.trim(),
        description: lessonDescription.trim(),
      };
      const lessonResult = await api.createLesson(lessonPayload);
      await saveAttendanceForStudents(attendance);

      const updatedSavedLessons = {
        ...savedLessons,
        [selectedLessonKey]: {
          ...lessonPayload,
          id: lessonResult?.id || lessonResult?.data?.id,
          attendance,
          savedAt: new Date().toISOString(),
        },
      };
      setSavedLessons(updatedSavedLessons);
      localStorage.setItem(`lms_group_${id}_lessons`, JSON.stringify(updatedSavedLessons));
      showToast("Dars va davomat muvaffaqiyatli saqlandi!", "success");
    } catch (err) {
      console.error("Davomatni saqlashda xatolik:", err);
      showToast(err.message || "Davomatni saqlashda xatolik yuz berdi", "error");
    } finally {
      setSavingAttendance(false);
    }
  };

  useEffect(() => {
    setCurrentMonthIndex(currentLessonMonthIndex);
  }, [currentLessonMonthIndex]);

  useEffect(() => {
    const stored = localStorage.getItem(`lms_group_${id}_lessons`);
    setSavedLessons(stored ? JSON.parse(stored) : {});
  }, [id]);

  useEffect(() => {
    if (!selectedLesson) return;
    const key = formatLessonDateKey(selectedLesson);
    const storedLesson = savedLessons[key];
    setLessonTopic(storedLesson?.topic || "");
    setLessonDescription(storedLesson?.description || "");
    setAttendance(storedLesson?.attendance || {});

    api.getGroupLessonByDate(id, key)
      .then((data) => {
        const lesson = data?.data || data;
        if (lesson?.topic || lesson?.description || lesson?.attendance) {
          setLessonTopic(lesson.topic || storedLesson?.topic || "");
          setLessonDescription(lesson.description || storedLesson?.description || "");
          setAttendance(lesson.attendance || storedLesson?.attendance || {});
        }
      })
      .catch(() => {});
  }, [id, selectedLesson]);

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
      {toastVisible && (
        <div className={`fixed top-8 left-1/2 z-50 w-[420px] max-w-[90vw] -translate-x-1/2 transform rounded-xl px-5 py-4 shadow-2xl transition-all duration-300 ${toastType === "success" ? "bg-[#2e7d32] text-white" : "bg-red-600 text-white"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {toastType === "success" ? (
                <span className="bx bx-check-circle text-[22px]"></span>
              ) : (
                <span className="bx bx-error-circle text-[22px]"></span>
              )}
              <span className="text-[15px] font-bold tracking-wide">{toastMessage}</span>
            </div>
            <button onClick={() => setToastVisible(false)} className="text-white/80 hover:text-white transition-colors">
              <span className="bx bx-x text-[24px]"></span>
            </button>
          </div>
        </div>
      )}
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

      {savedMessage && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-semibold text-emerald-700">
          {savedMessage}
        </div>
      )}

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
                      <td className="py-4 px-6">{formatDateLabel(normalizedStartDate)} - {formatDateLabel(courseEndDate)}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">Mavzu: {scheduleTopic}</td>
                      <td className="py-4 px-6">F2 Autodesk // {currentStudentsCount}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-blue-500">+++Yusupova Barchinoy</td>
                      <td className="py-4 px-6">Du/Se/Ch/Pa/Ju</td>
                      <td className="py-4 px-6">08:00 dan - 09:30 gacha</td>
                      <td className="py-4 px-6">{formatDateLabel(normalizedStartDate)} - {formatDateLabel(courseEndDate)}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">Mavzu: -</td>
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
                      {currentMonthLabel || `${currentMonthIndex}-o'quv oyi`}
                      {currentMonthIndex === currentLessonMonthIndex && currentMonthLabel && (
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
                      const isTodayLesson = getDateStatus(d) === "today";
                      return (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => handleLessonSelect(d)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-[58px] h-[64px] rounded-xl transition-colors ${getLessonButtonClass(d, isSelected, true)}`}
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
                        {month.length > 0 ? `${shortMonths[month[0].getMonth()] || month[0].toLocaleString("default", { month: "short" })} ${month[0].getFullYear()}` : `${idx + 1}-o'quv oyi`}
                        {idx + 1 === currentLessonMonthIndex && (
                          <span className="bg-green-50 text-green-500 text-[11px] px-2 py-0.5 rounded ml-3 font-bold uppercase tracking-wide">
                            Joriy oy
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {month.map((d, i) => {
                          const isSelected = selectedLesson && selectedLesson.getTime() === d.getTime();
                          const isTodayLesson = getDateStatus(d) === "today";
                          return (
                            <button 
                              key={i} 
                              type="button"
                              onClick={() => handleLessonSelect(d)}
                              className={`flex flex-col items-center justify-center w-[58px] h-[64px] rounded-xl transition-colors ${getLessonButtonClass(d, isSelected, idx + 1 === currentLessonMonthIndex)}`}
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
                <div className="mt-8">
                  {/* Assistant / Teacher tabs */}
                  <div className="flex gap-6 border-b border-gray-100 mb-6 px-2">
                    <button className="pb-3 text-[14px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                      Assistant
                    </button>
                    <button className="pb-3 text-[14px] font-semibold text-[#10b981] border-b-[3px] border-[#10b981]">
                      Teacher
                    </button>
                  </div>

                  {/* Ma'lumot card */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm relative">
                    <h4 className="text-[14px] font-bold text-gray-800 mb-5">Ma'lumot</h4>
                    <div className="flex items-center gap-12">
                      <div className="flex items-center gap-4">
                        <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-medium">
                          {teacherName[0] || "T"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[15px]">{teacherName}</p>
                          <p className="text-[13px] text-gray-500 font-medium">Teacher</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[12px] text-gray-400 font-semibold mb-1">Dars kuni</p>
                        <p className="font-bold text-gray-800 text-[14px]">
                          {selectedLesson.getFullYear()} {shortMonths[selectedLesson.getMonth()]} {selectedLesson.getDate() < 10 ? '0'+selectedLesson.getDate() : selectedLesson.getDate()}
                        </p>
                      </div>

                      <div>
                        <p className="text-[12px] text-gray-400 font-semibold mb-1">Holat</p>
                        <p className={`font-bold text-[14px] ${selectedLessonIsToday ? "text-[#10b981]" : "text-gray-500"}`}>{lessonStatusLabel}</p>
                      </div>
                    </div>
                    {/* Right arrow icon */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200">
                      <span className="bx bx-chevron-right text-3xl"></span>
                    </div>
                  </div>

                  {/* Yo'qlama va mavzu kiritish */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
                    <h4 className="text-[15px] font-bold text-gray-800 mb-6">Yo'qlama va mavzu kiritish</h4>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"></div>
                        <span className="text-[14px] font-semibold text-gray-500">O'quv reja bo'yicha</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-[#10b981] flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                        </div>
                        <span className="text-[14px] font-bold text-[#10b981]">Boshqa</span>
                      </label>
                    </div>

                    <div className="mb-6">
                      <label className="block text-[13px] font-bold text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>Mavzu
                      </label>
                      <input
                        type="text"
                        placeholder="Mavzuni kiriting..."
                        value={lessonTopic}
                        onChange={(e) => setLessonTopic(e.target.value)}
                        disabled={!canEditLesson}
                        className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none font-medium text-gray-800 placeholder-gray-400 ${!canEditLesson ? "bg-gray-50 cursor-not-allowed" : "bg-gray-50/50 focus:border-[#10b981] focus:bg-white"}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-2">Tavsif (ixtiyoriy)</label>
                      <textarea
                        placeholder="Dars haqida qo'shimcha ma'lumot..."
                        value={lessonDescription}
                        onChange={(e) => setLessonDescription(e.target.value)}
                        disabled={!canEditLesson}
                        className={`w-full min-h-[100px] rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none font-medium text-gray-800 placeholder-gray-400 resize-none ${!canEditLesson ? "bg-gray-50 cursor-not-allowed" : "bg-gray-50/50 focus:border-[#10b981] focus:bg-white"}`}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
                    <div className="grid grid-cols-[80px_1fr_120px] bg-white border-b border-gray-100 px-6 py-4 text-[13px] font-bold text-gray-500">
                      <span>#</span>
                      <span>O'quvchi ismi</span>
                      <span className="text-right">Keldi</span>
                    </div>
                    {selectedLessonIsFuture && (
                      <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 text-[13px] font-medium text-blue-700">
                        Bu kun uchun dars vaqti hali kelmagan.
                      </div>
                    )}
                    <div className="divide-y divide-gray-100/60">
                      {getGroupStudents().length === 0 ? (
                        <div className="px-6 py-8 text-center text-[14px] text-gray-500">
                          Guruhda talabalar topilmadi. Guruh yaratishda talabalarni qo'shing.
                        </div>
                      ) : (
                        getGroupStudents().map((student, index) => {
                          const studentId = resolveStudentId(student);
                          const studentName = student.full_name || student.name || `Talaba ${index + 1}`;
                          const isPresent = Boolean(attendance[studentId] ?? attendance[String(studentId)]);
                          return (
                            <div key={studentId || index} className="grid grid-cols-[80px_1fr_120px] items-center px-6 py-4 bg-white">
                              <span className="text-[14px] font-bold text-gray-800">{index + 1}</span>
                              <div className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-[13px] font-bold text-gray-600">
                                  {studentName.charAt(0)}
                                </div>
                                <span className="text-[14px] font-semibold text-gray-600">{studentName}</span>
                              </div>
                              <div className="flex justify-end pr-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!canEditLesson || !studentId) return;
                                    toggleAttendance(studentId);
                                  }}
                                  disabled={!canEditLesson || !studentId}
                                  className={`relative h-[22px] w-[38px] rounded-full transition-colors ${isPresent ? "bg-[#10b981]" : "bg-gray-300"} ${!canEditLesson ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                  <span className={`absolute top-[2px] left-[2px] block h-[18px] w-[18px] rounded-full bg-white transition-transform ${isPresent ? "translate-x-[16px]" : "translate-x-0"}`} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Saqlash Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={savingAttendance || !lessonTopic.trim() || !canEditLesson}
                      className={`rounded-lg px-10 py-3 text-[14px] font-bold text-white shadow-sm ${!canEditLesson ? "bg-gray-400 cursor-not-allowed" : "bg-[#7c3aed] hover:bg-[#6d28d9]"} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {savingAttendance ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
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
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">Jami: {homeworks.length} ta vazifa</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        // Add test homework for debugging
                        const storageKey = `lms_homeworks_${id}`;
                        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                        const testHomework = {
                          id: Date.now(),
                          title: 'Test vazifa',
                          description: 'Bu test vazifadir',
                          group_id: Number(id),
                          created_at: new Date().toISOString(),
                          status: 'active',
                          max_score: 5,
                          pass_score: 0,
                        };
                        existing.push(testHomework);
                        localStorage.setItem(storageKey, JSON.stringify(existing));
                        console.log('Test homework added:', testHomework);
                        loadHomeworks();
                      }}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Test qo'shish
                    </button>
                    <button 
                      onClick={() => loadHomeworks()}
                      className="text-xs text-[#7c3aed] font-semibold hover:underline"
                    >
                      Yangilash
                    </button>
                  </div>
                </div>
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
                    {homeworks.map((hw, index) => {
                      console.log('Rendering homework:', hw);
                      return (
                        <tr 
                          key={hw.id || hw._id || index} 
                          className="hover:bg-gray-50/50 cursor-pointer"
                          onClick={async () => {
                            const hwObj = { id: hw.id || hw._id, title: hw.title || hw.topic || hw.name };
                            setSelectedHomework(hwObj);
                            setShowSubmissionsModal(true);
                            try {
                              const subs = await api.getHomeworkSubmissions(hwObj.id);
                              const list = Array.isArray(subs) ? subs : subs.data || [];
                              setSubmissions(list);
                            } catch (e) {
                              console.error('Failed to load submissions', e);
                              setSubmissions([]);
                            }
                          }}
                        >
                          <td className="py-4 px-4">{index + 1}</td>
                          <td className="py-4 px-4 font-semibold">{hw.title || hw.topic || hw.name || hw.description || 'Noma\'lum'}</td>
                          <td className="py-4 px-4 text-center">{hw.max_score || hw.score || 5}</td>
                          <td className="py-4 px-4 text-center">{hw.pass_score || hw.jayib || 0}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              hw.status === 'active' || hw.status === 'published' ? 'bg-green-100 text-green-700' : 
                              hw.status === 'draft' ? 'bg-gray-100 text-gray-600' : 
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {hw.status === 'active' || hw.status === 'published' ? 'Faol' : hw.status || 'Noma\'lum'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-500">{hw.created_at ? new Date(hw.created_at).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : hw.given_time || '-'}</td>
                          <td className="py-4 px-4 text-gray-500">{hw.deadline ? new Date(hw.deadline).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : hw.end_time || '-'}</td>
                          <td className="py-4 px-4 text-gray-500">{hw.lesson_date ? new Date(hw.lesson_date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' }) : hw.date || '-'}</td>
                          <td className="py-4 px-4 text-gray-400 hover:text-gray-600">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const hwObj = { id: hw.id || hw._id, title: hw.title || hw.topic || hw.name };
                                setSelectedHomework(hwObj);
                                setShowSubmissionsModal(true);
                                api.getHomeworkSubmissions(hwObj.id)
                                  .then(subs => {
                                    const list = Array.isArray(subs) ? subs : subs.data || [];
                                    setSubmissions(list);
                                  })
                                  .catch(e => {
                                    console.error('Failed to load submissions', e);
                                    setSubmissions([]);
                                  });
                              }}
                              className="p-1"
                              title="Topshiruvlarni ko'rish"
                            >
                              <MoreVert sx={{ fontSize: 18 }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {homeworks.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">
                          Hozircha uyga vazifalar yo'q. Yangi vazifa qo'shish uchun "Qo'shish" tugmasini bosing.
                        </td>
                      </tr>
                    )}
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
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="max-w-2xl mx-auto">
              <h3 className="font-bold text-gray-800 text-[16px] mb-6">Davomat qayd etish</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dars sanasi</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#7c3aed]"
                />
              </div>

              {attendanceDate && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Talabalar ({getGroupStudents().length})</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {getGroupStudents().length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Guruhda talabalar topilmadi</p>
                    ) : (
                      getGroupStudents().map((student, idx) => {
                        const studentId = resolveStudentId(student);
                        const studentKey = String(studentId ?? idx + 1);
                        const isChecked = attendedStudents[studentKey] || attendedStudents[studentId] || false;
                        return (
                          <label key={studentKey} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setAttendedStudents((prev) => ({
                                  ...prev,
                                  [studentKey]: e.target.checked,
                                  ...(studentId ? { [studentId]: e.target.checked } : {}),
                                }));
                              }}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700 font-medium">{student.name || student.full_name || `Talaba ${idx + 1}`}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Tanlangan: <strong>{Object.values(attendedStudents).filter(Boolean).length}</strong>
                  </div>
                </div>
              )}

              {attendanceDate && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAttendanceByDate}
                    disabled={!attendanceDate || savingAttendance}
                    className="flex-1 bg-[#7c3aed] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingAttendance ? "Saqlanmoqda..." : "Davomatni saqlash"}
                  </button>
                  <button
                    onClick={() => {
                      setAttendanceDate("");
                      setAttendedStudents({});
                    }}
                    className="px-6 py-2.5 rounded-lg border border-gray-200 font-semibold text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Tozalash
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {showSubmissionsModal && selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800">Topshiruvlar — {selectedHomework.title}</h2>
              <button
                onClick={() => {
                  setShowSubmissionsModal(false);
                  setSelectedHomework(null);
                  setSubmissions([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Bajarmaganlar - Not submitted */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Bajarmaganlar ({(submissions || []).filter(sub => !sub.status || sub.status === 'not_done' || sub.status === 'not_submitted').length})
                  </h3>
                  <div className="space-y-2">
                    {(submissions || []).filter(sub => !sub.status || sub.status === 'not_done' || sub.status === 'not_submitted').length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">Bajarmagan talabalar yo'q</p>
                    ) : (
                      (submissions || []).filter(sub => !sub.status || sub.status === 'not_done' || sub.status === 'not_submitted').map((sub) => (
                        <div key={sub.id || sub._id || sub.student_id} className="rounded-xl bg-red-50 border border-red-100 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white border border-red-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                              {(sub.student && sub.student.name) ? sub.student.name[0] : (sub.student_name ? sub.student_name[0] : '?')}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">{(sub.student && (sub.student.name || sub.student.full_name)) || sub.student_name || 'Noma\'lum'}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Kutyotganlar - Pending */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    Kutyotganlar ({(submissions || []).filter(sub => sub.status === 'pending' || sub.status === 'kutayotgan').length})
                  </h3>
                  <div className="space-y-2">
                    {(submissions || []).filter(sub => sub.status === 'pending' || sub.status === 'kutayotgan').length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">Kutyotgan talabalar yo'q</p>
                    ) : (
                      (submissions || []).filter(sub => sub.status === 'pending' || sub.status === 'kutayotgan').map((sub) => (
                        <div key={sub.id || sub._id} className="rounded-xl bg-yellow-50 border border-yellow-100 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white border border-yellow-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                              {(sub.student && sub.student.name) ? sub.student.name[0] : (sub.student_name ? sub.student_name[0] : '?')}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">{(sub.student && (sub.student.name || sub.student.full_name)) || sub.student_name || 'Noma\'lum'}</div>
                              <div className="text-xs text-gray-500">Topshirilgan: {new Date(sub.created_at || sub.submitted_at || Date.now()).toLocaleString('uz-UZ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600">Fayllar: <strong>{Array.isArray(sub.files) ? sub.files.length : (sub.files_count || 0)}</strong></div>
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateSubmissionStatus(sub.id || sub._id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-600">Qabul qilish</button>
                              <button onClick={() => handleUpdateSubmissionStatus(sub.id || sub._id, 'returned')} className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-red-600">Qaytarish</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* O'tganlar - Passed/Accepted */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    O'tganlar ({(submissions || []).filter(sub => sub.status === 'accepted' || sub.status === 'passed' || sub.status === 'qabul_qilingan').length})
                  </h3>
                  <div className="space-y-2">
                    {(submissions || []).filter(sub => sub.status === 'accepted' || sub.status === 'passed' || sub.status === 'qabul_qilingan').length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">O'tgan talabalar yo'q</p>
                    ) : (
                      (submissions || []).filter(sub => sub.status === 'accepted' || sub.status === 'passed' || sub.status === 'qabul_qilingan').map((sub) => (
                        <div key={sub.id || sub._id} className="rounded-xl bg-green-50 border border-green-100 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white border border-green-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                              {(sub.student && sub.student.name) ? sub.student.name[0] : (sub.student_name ? sub.student_name[0] : '?')}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">{(sub.student && (sub.student.name || sub.student.full_name)) || sub.student_name || 'Noma\'lum'}</div>
                              <div className="text-xs text-gray-500">Topshirilgan: {new Date(sub.created_at || sub.submitted_at || Date.now()).toLocaleString('uz-UZ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600">Fayllar: <strong>{Array.isArray(sub.files) ? sub.files.length : (sub.files_count || 0)}</strong></div>
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">Qabul qilingan</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* O'tmaganlar - Failed/Returned */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    O'tmaganlar ({(submissions || []).filter(sub => sub.status === 'returned' || sub.status === 'failed' || sub.status === 'qaytarilgan').length})
                  </h3>
                  <div className="space-y-2">
                    {(submissions || []).filter(sub => sub.status === 'returned' || sub.status === 'failed' || sub.status === 'qaytarilgan').length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">O'tmagan talabalar yo'q</p>
                    ) : (
                      (submissions || []).filter(sub => sub.status === 'returned' || sub.status === 'failed' || sub.status === 'qaytarilgan').map((sub) => (
                        <div key={sub.id || sub._id} className="rounded-xl bg-orange-50 border border-orange-100 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white border border-orange-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                              {(sub.student && sub.student.name) ? sub.student.name[0] : (sub.student_name ? sub.student_name[0] : '?')}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">{(sub.student && (sub.student.name || sub.student.full_name)) || sub.student_name || 'Noma\'lum'}</div>
                              <div className="text-xs text-gray-500">Topshirilgan: {new Date(sub.created_at || sub.submitted_at || Date.now()).toLocaleString('uz-UZ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600">Fayllar: <strong>{Array.isArray(sub.files) ? sub.files.length : (sub.files_count || 0)}</strong></div>
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateSubmissionStatus(sub.id || sub._id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-600">Qabul qilish</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
