import React from "react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[350px]">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">Rostdan ham o'chirishni xohlaysizmi?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#dc2626] hover:bg-[#b91c1c] transition-colors"
          >
            Ha
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
