// app/generator/components/ModalExpandTextarea.js
"use client";
import React from "react";
import { X, Maximize2 } from "lucide-react";
import { NeumorphicButton } from "../../sharedComponents";

export default function ModalExpandTextarea({
  isOpen,
  onClose,
  value,
  onChange,
  label = "Edit Teks",
  placeholder = "",
  minRows = 8,
  maxRows = 20,
  disabled = false,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-2xl flex flex-col gap-4 neumorphic-card relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white bg-gray-200 dark:bg-gray-800"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
        <label className="font-bold text-lg mb-2">{label}</label>
        <textarea
          className="w-full p-4 rounded-lg neumorphic-input text-base min-h-[180px] max-h-[500px] resize-none"
          style={{ fontFamily: "inherit" }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={minRows}
          disabled={disabled}
        />
        <div className="flex justify-end gap-2 mt-2">
          <NeumorphicButton onClick={onClose} className="!px-6">Tutup</NeumorphicButton>
        </div>
      </div>
    </div>
  );
}

// Tombol expand bisa pakai <Maximize2 size={18}/>
