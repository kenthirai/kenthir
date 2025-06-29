"use client";

import React from 'react';
import { NeumorphicButton } from '../../../sharedComponents';

export const ClearHistoryModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="p-8 rounded-2xl w-full max-w-md" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-outset)' }}>
                <h2 className="text-xl font-bold mb-4">Konfirmasi</h2>
                <p className="mb-6">Yakin ingin menghapus semua riwayat & favorit?</p>
                <div className="flex justify-end gap-4">
                    <NeumorphicButton onClick={onClose}>Batal</NeumorphicButton>
                    <NeumorphicButton onClick={onConfirm} className="font-bold bg-red-500 text-white">Hapus</NeumorphicButton>
                </div>
            </div>
        </div>
    );
};