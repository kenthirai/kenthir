"use client";

import React from 'react';
import { NeumorphicButton } from '../../../sharedComponents';
import { Trash2 } from 'lucide-react';

export const MasterResetModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="p-8 rounded-2xl w-full max-w-md" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-outset)' }}>
                <h2 className="text-xl font-bold mb-4">Konfirmasi Reset Data</h2>
                <p className="mb-2 text-sm">Anda yakin ingin menghapus semua data aplikasi dari browser ini? Tindakan ini tidak dapat diurungkan.</p>
                <div className="text-sm p-3 my-4 rounded-lg" style={{boxShadow: 'var(--shadow-inset)'}}>
                    Data yang akan dihapus:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Riwayat Generasi Gambar</li>
                        <li>Prompt Favorit</li>
                        <li>Kunci API yang Tersimpan</li>
                        <li>Password Turbo yang Tersimpan</li>
                        <li>Semua Pengaturan Pengguna</li>
                    </ul>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <NeumorphicButton onClick={onClose}>Batal</NeumorphicButton>
                    <NeumorphicButton onClick={onConfirm} className="font-bold bg-red-500 text-white">Ya, Hapus Semua</NeumorphicButton>
                </div>
            </div>
        </div>
    );
};