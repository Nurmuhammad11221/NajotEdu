import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { api } from "../utils/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("lms_token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedPhone = () => {
      let cleanedPhone = phone.replace(/\D/g, "");
      if (cleanedPhone.startsWith("998") && cleanedPhone.length === 12) {
        return cleanedPhone.substring(3);
      }
      if (cleanedPhone.length === 10 && cleanedPhone.startsWith("0")) {
        return cleanedPhone.substring(1);
      }
      return cleanedPhone;
    };

    const cleanedPhone = normalizedPhone();
    const alternatePhone = cleanedPhone.length === 9 && !cleanedPhone.startsWith("998") ? `998${cleanedPhone}` : cleanedPhone;

    try {
      await api.login(cleanedPhone, password);
      navigate("/");
    } catch (err) {
      if (alternatePhone !== cleanedPhone) {
        try {
          await api.login(alternatePhone, password);
          navigate("/");
          return;
        } catch (innerErr) {
          // ignore; show original error below
        }
      }
      setError(err.message || "Tizimga kirishda xatolik yuz berdi. Iltimos telefon va parolni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Chap taraf - Rasm qismi */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e2a5e] items-center justify-center relative">
        <div className="w-4/5 h-4/5 flex items-center justify-center">
          <img
            src="/study.svg"
            alt="Student Illustration"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      {/* O'ng taraf - Form qismi */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between items-center py-12 px-8 sm:px-20">
        <div className="w-full max-w-[400px] flex flex-col items-center mt-10">

          {/* Logo va Universitet nomi */}
          <div className="flex flex-col items-center text-center mb-10">
            <p className="text-[10px] font-bold text-gray-700 leading-tight mb-4 uppercase tracking-tighter">
              MUHAMMAD AL-XORAZMIY NOMIDAGI <br />
              TOSHKENT AXBOROT TEXNOLOGIYALARI <br />
              UNIVERSITETI
            </p>
          </div>

          <h1 className="text-[18px] font-bold text-[#333] mb-8 uppercase tracking-wide">
            LEARNING MANAGEMENT SYSTEM
          </h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-2.5 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-600 ml-1">Telefon</label>
              <input
                type="text"
                placeholder="Masalan: +998 97 566 1099"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#1e2a5e] text-[14px]"
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5 relative">
              <label className="text-[13px] font-semibold text-gray-600 ml-1">Parol</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Parolni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#1e2a5e] text-[14px] pr-10"
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                  </IconButton>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e2a5e] hover:bg-[#161f46] disabled:bg-gray-400 text-white py-2 rounded text-[15px] font-semibold transition-colors mt-6 shadow-md"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="w-full text-center text-[11px] text-gray-400 mt-auto pt-10">
          Copyright © 2021 of Tashkent University of Information Technologies
        </div>
      </div>
    </div>
  );
};

export default Login;
