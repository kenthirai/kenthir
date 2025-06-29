"use client";

import React from 'react';
import { NeumorphicButton } from '../../sharedComponents';
import { History, Trash2, ChevronsRight, Bookmark } from 'lucide-react';

export const HistoryAndFavorites = ({
    generationHistory, setGenerationHistory, savedPrompts, setSavedPrompts,
    setPrompt, setActiveTab, setIsClearHistoryModalOpen,
    onSelectImageFromHistory // <-- Terima prop baru ini
}) => {
    return (
        <div className="p-6 rounded-2xl h-fit neumorphic-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><History size={20}/> Riwayat & Favorit</h3>
                <NeumorphicButton onClick={() => setIsClearHistoryModalOpen(true)} className="!p-2" title="Hapus Riwayat & Favorit"><Trash2 size={16}/></NeumorphicButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2">Riwayat Gambar</h4>
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                        {generationHistory.length === 0 ? <p className="text-sm opacity-60">Kosong</p> :
                            generationHistory.map((h) => (
                                <div key={h.date} className="flex items-center gap-2 p-2 rounded-lg" style={{boxShadow:'var(--shadow-inset)'}}>
                                    {/* Perbarui onClick untuk memanggil onSelectImageFromHistory */}
                                    <img src={h.url} className="w-16 h-16 rounded-md object-cover cursor-pointer flex-shrink-0" onClick={() => onSelectImageFromHistory(h)}/>
                                    <p className="text-xs line-clamp-3 flex-grow cursor-pointer" onClick={() => onSelectImageFromHistory(h)}>{h.prompt}</p>
                                    <NeumorphicButton aria-label={`Hapus riwayat untuk prompt: ${h.prompt.substring(0, 30)}...`} onClick={() => setGenerationHistory(prev => prev.filter(item => item.date !== h.date))} className="!p-2 flex-shrink-0"><Trash2 size={14}/></NeumorphicButton>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Prompt Favorit</h4>
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                        {savedPrompts.length === 0 ? <p className="text-sm opacity-60">Kosong</p> :
                            savedPrompts.map((p) => (
                                <div key={p.date} className="flex items-center gap-2 p-2 rounded-lg" style={{boxShadow:'var(--shadow-inset)'}}>
                                    <p className="text-sm flex-grow truncate">{p.prompt}</p>
                                    <NeumorphicButton onClick={() => { setPrompt(p.prompt); setActiveTab('image'); }} className="!p-1.5"><ChevronsRight size={14}/></NeumorphicButton>
                                    <NeumorphicButton aria-label={`Hapus favorit: ${p.prompt.substring(0, 30)}...`} onClick={() => setSavedPrompts(prev => prev.filter(sp => sp.date !== p.date))} className="!p-1.5"><Trash2 size={14}/></NeumorphicButton>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};