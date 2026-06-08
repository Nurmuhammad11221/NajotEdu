const BASE_URL = "https://najot-edu.softwareengineer.uz";

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.data,
    payload?.items,
    payload?.result,
    payload?.results,
    payload?.rows,
    payload?.list,
    payload?.data?.data,
    payload?.data?.items,
    payload?.data?.rows,
    payload?.result?.data,
    payload?.result?.items,
  ];
  return candidates.find(Array.isArray) || [];
};

const unwrapEntity = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  if (payload.id !== undefined || payload.name !== undefined) return payload;
  return payload.data ?? payload.result ?? payload.group ?? payload.item ?? payload;
};

const studentBelongsToGroup = (student, groupId) => {
  const groups = student?.groups ?? student?.group ?? student?.group_ids ?? student?.groupIds;
  if (!groups) return false;
  const list = Array.isArray(groups) ? groups : [groups];
  return list.some((g) => {
    if (g === null || g === undefined) return false;
    if (typeof g === "number" || typeof g === "string") return String(g) === String(groupId);
    return String(g.id ?? g.group_id ?? g._id) === String(groupId);
  });
};

const normalizeGroupStudent = (entry, studentsById = new Map()) => {
  if (entry === null || entry === undefined) return null;

  if (typeof entry === "number" || (typeof entry === "string" && /^\d+$/.test(entry.trim()))) {
    const id = Number(entry);
    const found = studentsById.get(id);
    return {
      id,
      full_name: found?.full_name || found?.name || `Talaba #${id}`,
      name: found?.name || found?.full_name || `Talaba #${id}`,
      ...(found || {}),
    };
  }

  if (typeof entry === "object") {
    const nested = entry.student ?? entry.user ?? entry.profile;
    const id = Number(
      entry.id ?? entry._id ?? entry.student_id ?? entry.studentId ?? nested?.id ?? nested?._id
    );
    if (!Number.isFinite(id) || id <= 0) return null;
    const found = studentsById.get(id);
    const fullName =
      entry.full_name ||
      entry.name ||
      entry.fullName ||
      nested?.full_name ||
      nested?.name ||
      found?.full_name ||
      found?.name ||
      `Talaba #${id}`;
    return {
      ...(found || {}),
      ...entry,
      id,
      full_name: fullName,
      name: fullName,
    };
  }

  return null;
};

const resolveGroupStudents = (group, allStudents = []) => {
  const groupId = group?.id;
  const studentsById = new Map();
  (Array.isArray(allStudents) ? allStudents : []).forEach((student) => {
    const id = Number(student?.id ?? student?._id ?? student?.student_id);
    if (Number.isFinite(id) && id > 0) studentsById.set(id, student);
  });

  const rawStudents =
    group?.students ??
    group?.student_list ??
    group?.group_students ??
    group?.members ??
    group?.student_ids ??
    [];

  let normalized = (Array.isArray(rawStudents) ? rawStudents : [])
    .map((entry) => normalizeGroupStudent(entry, studentsById))
    .filter(Boolean);

  if (!normalized.length && groupId) {
    normalized = (Array.isArray(allStudents) ? allStudents : [])
      .filter((student) => studentBelongsToGroup(student, groupId))
      .map((student) => normalizeGroupStudent(student, studentsById))
      .filter(Boolean);
  }

  const unique = new Map();
  normalized.forEach((student) => {
    if (student?.id) unique.set(student.id, student);
  });
  return Array.from(unique.values());
};

const resolveGroupTeachers = (group, allTeachers = []) => {
  const teachersById = new Map();
  (Array.isArray(allTeachers) ? allTeachers : []).forEach((teacher) => {
    const id = Number(teacher?.id ?? teacher?._id);
    if (Number.isFinite(id) && id > 0) teachersById.set(id, teacher);
  });

  const rawTeachers = group?.teachers ?? group?.teacher_ids ?? group?.teacher_list ?? [];

  const normalized = (Array.isArray(rawTeachers) ? rawTeachers : [])
    .map((entry) => {
      if (typeof entry === "number" || (typeof entry === "string" && /^\d+$/.test(entry.trim()))) {
        const id = Number(entry);
        const found = teachersById.get(id);
        if (found) {
          return {
            id: found.id,
            full_name: found.full_name || found.name,
            name: found.name || found.full_name,
          };
        }
        return null;
      }

      if (typeof entry === "object") {
        return {
          id: entry.id ?? entry._id,
          full_name: entry.full_name || entry.name,
          name: entry.name || entry.full_name,
        };
      }

      return null;
    })
    .filter(Boolean);

  const unique = new Map();
  normalized.forEach((teacher) => {
    if (teacher?.id) unique.set(teacher.id, teacher);
  });
  return Array.from(unique.values());
};

const normalizeToken = (value) => {
  if (typeof value !== "string") return "";
  const token = value.trim();
  if (!token) return "";
  if (token.toLowerCase().startsWith("bearer ")) {
    return token.slice(7).trim();
  }
  return token;
};

const getHeaders = () => {
  const token = normalizeToken(localStorage.getItem("lms_token") || "");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const isJwtToken = (value) => {
  if (typeof value !== "string") return false;
  const token = normalizeToken(value);
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
};

const findTokenInObject = (obj, seen = new Set()) => {
  if (!obj || typeof obj !== "object" || seen.has(obj)) return null;
  seen.add(obj);
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (isJwtToken(value)) {
      return value.trim();
    }
    if (typeof value === "object") {
      const nested = findTokenInObject(value, seen);
      if (nested) return nested;
    }
  }
  return null;
};

const throwApiError = async (res, fallbackMessage) => {
  if (res.status === 401) {
    localStorage.removeItem("lms_token");
    throw new Error("Avtorizatsiya kerak. Iltimos qaytadan tizimga kiring.");
  }

  let err = null;
  try {
    err = await res.json();
  } catch (jsonErr) {
    const text = await res.text().catch(() => "");
    throw new Error(text || fallbackMessage);
  }

  if (err) {
    if (typeof err === "string") {
      throw new Error(err || fallbackMessage);
    }
    if (err.message) {
      throw new Error(err.message);
    }
    if (err.error) {
      throw new Error(typeof err.error === "string" ? err.error : JSON.stringify(err.error));
    }
    if (err.errors) {
      if (typeof err.errors === "string") {
        throw new Error(err.errors);
      }
      if (Array.isArray(err.errors)) {
        throw new Error(err.errors.join(", ") || fallbackMessage);
      }
      throw new Error(JSON.stringify(err.errors));
    }
  }

  throw new Error(fallbackMessage);
};

export const api = {
  // Auth
  async login(phone, password) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Kirishda xatolik yuz berdi");
    }
    const data = await res.json();
    const token = data.accessToken || data.access_token || data.token || data.data?.accessToken || data.data?.access_token || data.data?.token || findTokenInObject(data);
    const normalizedToken = normalizeToken(token || "");
    if (!normalizedToken) {
      throw new Error("Tizimga kirishda token topilmadi");
    }
    localStorage.setItem("lms_token", normalizedToken);
    return data;
  },

  // Teachers (O'qituvchilar)
  async getTeachers() {
    const res = await fetch(`${BASE_URL}/api/v1/teachers`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("O'qituvchilarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async getAdmins() {
    const res = await fetch(`${BASE_URL}/api/v1/users/admin/all`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Xodimlarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async createTeacher(fd) {
    const res = await fetch(`${BASE_URL}/api/v1/teachers`, {
      method: "POST",
      headers: {
        Authorization: getHeaders().Authorization,
      },
      body: fd, // FormData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "O'qituvchi qo'shishda xatolik");
    }
    return res.json();
  },

  // Students (Talabalar)
  async getStudents() {
    const res = await fetch(`${BASE_URL}/api/v1/students?page=1&limit=100`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Talabalarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async createStudent(data) {
    // data can be FormData (with file) or plain object (JSON)
    const isForm = data instanceof FormData;
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('api.createStudent headers:', getHeaders());
      if (isForm) {
        try {
          const dbg = {};
          for (const [k, v] of data.entries()) {
            dbg[k] = v && v.name ? v.name : v;
          }
          console.log('api.createStudent formdata:', dbg);
        } catch (e) {}
      } else {
        try { console.log('api.createStudent json:', data); } catch (e) {}
      } 
    }

    const res = await fetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: isForm ? getHeaders() : { "Content-Type": "application/json", ...getHeaders() },
      body: isForm ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      await throwApiError(res, "Talaba qo'shishda xatolik");
    }
    return res.json();
  },

  // Groups (Guruhlar)
  async getGroups() {
    const res = await fetch(`${BASE_URL}/api/v1/groups/all`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Guruhlarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async getGroupById(id) {
    let group = null;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/groups/one/${id}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        group = unwrapEntity(await res.json());
      }
    } catch (e) {
      // ignore
    }

    if (!group) {
      const all = await this.getGroups();
      const list = Array.isArray(all) ? all : all.data || [];
      group = list.find((g) => String(g.id) === String(id));
    }

    if (!group) throw new Error("Guruh topilmadi");

    try {
      const allStudents = await this.getStudents();
      const allTeachers = await this.getTeachers();
      return {
        ...group,
        students: resolveGroupStudents(group, allStudents),
        teachers: resolveGroupTeachers(group, allTeachers),
      };
    } catch (e) {
      return {
        ...group,
        students: resolveGroupStudents(group, []),
        teachers: resolveGroupTeachers(group, []),
      };
    }
  },

  async createGroup(data) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('api.createGroup headers:', getHeaders());
      console.log('api.createGroup payload:', data);
    }
    const res = await fetch(`${BASE_URL}/api/v1/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      await throwApiError(res, "Guruh qo'shishda xatolik");
    }
    return res.json();
  },

  async createLesson({ group_id, topic, description = "" }) {
    const payload = {
      group_id: Number(group_id),
      topic: String(topic || "").trim(),
      description: String(description || "").trim(),
    };
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('api.createLesson payload:', payload);
    }
    const res = await fetch(`${BASE_URL}/api/v1/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      await throwApiError(res, "Dars yaratishda xatolik");
    }
    return res.json();
  },

  /** @deprecated use createLesson */
  async createGroupLesson(groupId, data) {
    return this.createLesson({
      group_id: Number(groupId),
      topic: data.topic,
      description: data.description,
    });
  },

  async getGroupLessonByDate(groupId, date) {
    const res = await fetch(`${BASE_URL}/api/v1/groups/${groupId}/lesson?date=${encodeURIComponent(date)}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Dars ma'lumotini yuklashda xatolik");
    return res.json();
  },

  async createAttendance({ group_id, student_id, isPresent }) {
    const payload = {
      group_id: Number(group_id),
      student_id: Number(student_id),
      isPresent: Boolean(isPresent),
    };
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('api.createAttendance payload:', payload);
    }
    const res = await fetch(`${BASE_URL}/api/v1/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      await throwApiError(res, "Davomatni saqlashda xatolik");
    }
    return res.json();
  },

  // Rooms (Xonalar)
  async getRooms() {
    const res = await fetch(`${BASE_URL}/api/v1/rooms`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Xonalarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async createRoom(nameOrData, capacity) {
    const payload = typeof nameOrData === "object"
      ? { name: nameOrData.name, capacity: Number(nameOrData.capacity) }
      : { name: nameOrData, capacity: Number(capacity) };

    const res = await fetch(`${BASE_URL}/api/v1/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Xona qo'shishda xatolik");
    }
    return res.json();
  },

  async deleteRoom(id) {
    const res = await fetch(`${BASE_URL}/api/v1/rooms/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Xonani o'chirishda xatolik");
    return true;
  },

  async updateRoom(id, data) {
    const res = await fetch(`${BASE_URL}/api/v1/rooms/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Xonani yangilashda xatolik");
    }
    return res.json();
  },

  async getArchiveRooms() {
    const res = await fetch(`${BASE_URL}/api/v1/rooms/arxive`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Arxiv xonalarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  // Courses (Kurslar)
  async getCourses() {
    const res = await fetch(`${BASE_URL}/api/v1/courses`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Kurslarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async createCourse(data) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('api.createCourse headers:', getHeaders());
      console.log('api.createCourse payload:', data);
    }
    const res = await fetch(`${BASE_URL}/api/v1/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      await throwApiError(res, "Kurs qo'shishda xatolik");
    }
    return res.json();
  },

  async deleteCourse(id) {
    const res = await fetch(`${BASE_URL}/api/v1/courses/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Kursni o'chirishda xatolik");
    return true;
  },

  async updateCourse(id, data) {
    const res = await fetch(`${BASE_URL}/api/v1/courses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Kursni yangilashda xatolik");
    }
    return res.json();
  },

  async getArchiveCourses() {
    const res = await fetch(`${BASE_URL}/api/v1/courses/archive`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Arxiv kurslarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async deleteTeacher(id) {
    const res = await fetch(`${BASE_URL}/api/v1/teachers/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("O'qituvchini o'chirishda xatolik");
    return true;
  },

  async updateTeacher(id, fd) {
    const res = await fetch(`${BASE_URL}/api/v1/teachers/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: getHeaders().Authorization,
      },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "O'qituvchini yangilashda xatolik");
    }
    return res.json();
  },

  async getArchiveTeachers() {
    const res = await fetch(`${BASE_URL}/api/v1/teachers/archive`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Arxiv o'qituvchilarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async createHomework(payload) {
    console.log('Creating homework with payload:', payload);
    
    // Try JSON first (most APIs expect JSON for homework creation)
    try {
      const jsonPayload = {
        lesson_id: Number(payload.lesson_id || payload.lessonId || 1),
        group_id: Number(payload.group_id || payload.groupId),
        title: payload.title || payload.description || "Uyga vazifa",
        description: payload.description || "",
      };
      
      console.log('Trying JSON payload:', jsonPayload);
      const res = await fetch(`${BASE_URL}/api/v1/homework`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(jsonPayload),
      });
      
      if (res.ok) {
        console.log('Homework created with JSON');
        return res.json();
      }
      
      const err = await res.json().catch(() => ({}));
      console.error('JSON creation failed, trying FormData:', err);
    } catch (e) {
      console.error('JSON request failed:', e);
    }
    
    // Fallback to FormData
    const fd = payload instanceof FormData ? payload : new FormData();
    if (!(payload instanceof FormData)) {
      fd.append("lesson_id", Number(payload.lesson_id || payload.lessonId || 1));
      fd.append("group_id", Number(payload.group_id || payload.groupId));
      fd.append("title", payload.title || payload.description || "Uyga vazifa");
      fd.append("description", payload.description || "");
      if (payload.file) fd.append("file", payload.file);
    }

    console.log('Trying FormData payload');
    const res = await fetch(`${BASE_URL}/api/v1/homework`, {
      method: "POST",
      headers: getHeaders(),
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Homework creation error:', err);
      throw new Error(err.message || err.error || "Uyga vazifa yaratishda xatolik");
    }
    return res.json();
  },

  // Homework & submissions
  async getHomeworks(groupId) {
    console.log('Fetching homeworks for group:', groupId);
    
    // Try basic homework endpoint and filter by group_id
    try {
      const res = await fetch(`${BASE_URL}/api/v1/homework`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('All homeworks response:', data);
        const all = Array.isArray(data) ? data : data.data || [];
        console.log('All homeworks array:', all);
        const filtered = all.filter(h => String(h.group_id || h.group || h.groupId) === String(groupId));
        console.log('Filtered homeworks for group:', groupId, ':', filtered);
        return filtered;
      } else {
        console.error('Homework endpoint returned:', res.status);
      }
    } catch (e) {
      console.error('Homework endpoint failed:', e);
    }
    
    // Try group-scoped endpoint as fallback
    try {
      const res = await fetch(`${BASE_URL}/api/v1/homework/${groupId}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Homeworks from group endpoint:', data);
        return unwrapList(data);
      }
    } catch (e) {
      console.error('Group homework endpoint failed:', e);
    }
    
    console.warn('All homework endpoints failed, returning empty array');
    return [];
  },

  async getHomeworkSubmissions(homeworkId) {
    const tryEndpoints = [
      `${BASE_URL}/api/v1/homework/${homeworkId}/submissions`,
      `${BASE_URL}/api/v1/homework/submissions?homework=${homeworkId}`,
    ];
    for (const url of tryEndpoints) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (res.ok) return res.json();
      } catch (e) {}
    }
    // As a last resort return empty
    return [];
  },

  async submitHomework(homeworkId, formData) {
    const res = await fetch(`${BASE_URL}/api/v1/students/homeworkAnswer/${homeworkId}`, {
      method: "POST",
      headers: getHeaders(), // do not set Content-Type for FormData
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Uyga vazifa topshirishda xatolik");
    }
    return res.json();
  },

  async updateSubmissionStatus(submissionId, payload) {
    const res = await fetch(`${BASE_URL}/api/v1/homework/submission/${submissionId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Submission status yangilashda xatolik");
    }
    return res.json();
  },

  async submitHomeworkResult(payload) {
    const res = await fetch(`${BASE_URL}/api/v1/homework/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Homework result yuborishda xatolik");
    }
    return res.json();
  },

  async getGroupFiles(groupId) {
    const res = await fetch(`${BASE_URL}/api/v1/files/${groupId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Fayllarni yuklashda xatolik");
    return unwrapList(await res.json());
  },

  async uploadGroupFile(groupId, file, lessonId = 1) {
    console.log('Uploading file to group:', groupId, 'file:', file.name, 'size:', file.size, 'type:', file.type);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("lesson_id", lessonId);

    const res = await fetch(`${BASE_URL}/api/v1/files/group/${groupId}/upload?lessonId=${lessonId}`, {
      method: "POST",
      headers: getHeaders(),
      body: fd,
    });
    console.log('Upload response status:', res.status);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Upload error:', err);
      throw new Error(err.message || err.error || "Fayl yuklashda xatolik");
    }
    const result = await res.json();
    console.log('Upload success:', result);
    return result;
  },
};

// Utility: decode JWT role (best-effort)
export function getTokenRole() {
  try {
    const token = localStorage.getItem("lms_token");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role || payload.roles || payload.authorities || null;
  } catch (e) {
    return null;
  }
}

export { unwrapList, unwrapEntity, resolveGroupStudents, resolveGroupTeachers };
