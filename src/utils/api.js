const BASE_URL = "https://najot-edu.softwareengineer.uz";

const getHeaders = () => {
  const token = localStorage.getItem("lms_token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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
    if (data.accessToken) {
      localStorage.setItem("lms_token", data.accessToken);
    }
    return data;
  },

  // Teachers (O'qituvchilar)
  async getTeachers() {
    const res = await fetch(`${BASE_URL}/api/v1/teachers`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("O'qituvchilarni yuklashda xatolik");
    return res.json();
  },

  async createTeacher(fd) {
    const res = await fetch(`${BASE_URL}/api/v1/teachers`, {
      method: "POST",
      headers: getHeaders(),
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
    return res.json();
  },

  async createStudent(fd) {
    const res = await fetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: getHeaders(),
      body: fd, // FormData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Talaba qo'shishda xatolik");
    }
    return res.json();
  },

  // Groups (Guruhlar)
  async getGroups() {
    const res = await fetch(`${BASE_URL}/api/v1/groups/all`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Guruhlarni yuklashda xatolik");
    return res.json();
  },

  async getGroupById(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/groups/${id}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
    
    // Fallback: fetch all and find
    const all = await this.getGroups();
    const list = Array.isArray(all) ? all : all.data || [];
    const group = list.find(g => String(g.id) === String(id));
    if (!group) throw new Error("Guruh topilmadi");
    return group;
  },

  async createGroup(data) {
    const res = await fetch(`${BASE_URL}/api/v1/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Guruh qo'shishda xatolik");
    }
    return res.json();
  },

  // Rooms (Xonalar)
  async getRooms() {
    const res = await fetch(`${BASE_URL}/api/v1/rooms`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Xonalarni yuklashda xatolik");
    return res.json();
  },

  async createRoom(name, capacity) {
    const res = await fetch(`${BASE_URL}/api/v1/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify({ name, capacity: Number(capacity) }),
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

  // Courses (Kurslar)
  async getCourses() {
    const res = await fetch(`${BASE_URL}/api/v1/courses`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Kurslarni yuklashda xatolik");
    return res.json();
  },

  async createCourse(data) {
    const res = await fetch(`${BASE_URL}/api/v1/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Kurs qo'shishda xatolik");
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

  async deleteTeacher(id) {
    const res = await fetch(`${BASE_URL}/api/v1/teachers/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("O'qituvchini o'chirishda xatolik");
    return true;
  },

  async createHomework(payload) {
    const res = await fetch(`${BASE_URL}/api/v1/homework`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Uyga vazifa yaratishda xatolik");
    }
    return res.json();
  },
};
