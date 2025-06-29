"use client";

import React, { useState } from 'react';
import { NeumorphicButton, Spinner } from '../../../sharedComponents';
import { X, KeyRound, RefreshCw, Check } from 'lucide-react';

export const TurboAuthModal = ({
    isOpen, onClose, onActivate, showToast,
    generatedTurboPassword, setGeneratedTurboPassword, turboPasswordInput, setTurboPasswordInput,
}) => {
    if (!isOpen) return null;

    const handleGenerateModalPassword = () => {
        const randomChars = Array(5).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
        const newPassword = `Kenthir-${randomChars}`;
        setGeneratedTurboPassword(newPassword);
        setTurboPasswordInput('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="p-6 rounded-2xl w-full max-w-md flex flex-col gap-4 neumorphic-card" style={{ background: 'var(--bg-color)' }}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><KeyRound size={22}/> Akses Model Turbo</h2>
                    <NeumorphicButton onClick={onClose} className="!p-2"><X size={20} /></NeumorphicButton>
                </div>
                <div className="p-4 rounded-lg space-y-3" style={{boxShadow: 'var(--shadow-inset)'}}>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">Password Dibuat:</span>
                        <span className="font-mono text-lg font-bold text-indigo-500">{generatedTurboPassword || '---'}</span>
                    </div>
                    <NeumorphicButton onClick={handleGenerateModalPassword} className="w-full !p-2 text-sm"><RefreshCw size={14}/> Buat Password Baru</NeumorphicButton>
                </div>
                <div>
                    <label className="font-semibold text-sm mb-2 block">Verifikasi Password</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={turboPasswordInput}
                            onChange={(e) => setTurboPasswordInput(e.target.value)}
                            placeholder="Ketik atau tempel password di sini"
                            className="w-full p-3 rounded-lg neumorphic-input pr-24"
                            disabled={!generatedTurboPassword}
                        />
                        <NeumorphicButton onClick={() => setTurboPasswordInput(generatedTurboPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 !p-2 text-xs" disabled={!generatedTurboPassword}>Autofill</NeumorphicButton>
                    </div>
                </div>
                <div className="text-xs p-3 rounded-lg space-y-2" style={{boxShadow:'var(--shadow-inset)', opacity: 0.8}}>
                    <p>Model Turbo tidak memiliki filter keamanan. Anda bertanggung jawab penuh atas konten yang dihasilkan.</p>
                    <p>Password hanya berlaku selama 24 jam.</p>
                </div>
                <NeumorphicButton onClick={onActivate} className="w-full font-bold !p-3" disabled={!generatedTurboPassword || turboPasswordInput !== generatedTurboPassword}>
                    <Check size={18}/> Aktifkan Turbo
                </NeumorphicButton>
            </div>
        </div>
    );
};