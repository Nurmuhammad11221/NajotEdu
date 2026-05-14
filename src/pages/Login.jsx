import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Chap taraf - Rasm qismi */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e2a5e] items-center justify-center relative">
        <div className="w-4/5 h-4/5 flex items-center justify-center">
          {/* Bu yerga siz tashlagan rasmdagi illustratsiya tushadi */}
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
            <div className="flex flex-col space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-600 ml-1">Login</label>
              <input
                type="text"
                placeholder="Loginni kiriting"
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
              className="w-full bg-[#1e2a5e] hover:bg-[#161f46] text-white py-2 rounded text-[15px] font-semibold transition-colors mt-6 shadow-md"
            >
              Kirish
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
