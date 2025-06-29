"use client";

import React, { useState } from 'react';
import { NeumorphicButton, Spinner } from '../../../sharedComponents';
import { X, Eye, EyeOff } from 'lucide-react';

export const ApiKeyModal = ({ isOpen, onClose, onSubmit, modelRequiringKey, initialApiKey }) => {
    const [tempApiKey, setTempApiKey] = useState(initialApiKey || '');
    const [showApiKey, setShowApiKey] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="p-8 rounded-2xl w-full max-w-md" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-outset)' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">API Key untuk {modelRequiringKey?.toUpperCase()}</h2>
                    <NeumorphicButton onClick={onClose} className="!p-2"><X size={20} /></NeumorphicButton>
                </div>
                <p className="mb-4 text-sm">Model ini memerlukan API key yang valid.</p>
                <div className="relative w-full mb-4">
                    <input
                        type={showApiKey ? "text" : "password"}
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder="Masukkan API Key Anda"
                        className="w-full p-3 rounded-lg neumorphic-input pr-12"
                    />
                    <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="flex justify-end gap-4">
                    <NeumorphicButton onClick={onClose}>Batal</NeumorphicButton>
                    <NeumorphicButton onClick={() => onSubmit(tempApiKey)} className="font-bold">Simpan</NeumorphicButton>
                </div>
            </div>
        </div>
    );
};