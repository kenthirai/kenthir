// app/generator/components/GeneratedContentDisplay.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Spinner, NeumorphicButton } from '../../sharedComponents';
import { Copy, Trash2, Search, Repeat, Wand2, ImageDown, ChevronsRight, Minus, Plus, ZoomIn } from 'lucide-react';
import { useTheme } from 'next-themes'; // <-- Import useTheme

export const GeneratedContentDisplay = ({
    activeTab, loading, generatedImages, generatedVideoPrompt, generatedAudio,
    showToast, setPrompt, setSeed, setActiveTab, handleGenerate,
    generationHistory, setGenerationHistory,
    onViewImage,
    onUsePromptAndSeed, onCreateVariation, onDeleteImage, onDownloadImage
}) => {
    const [selectedImageForActions, setSelectedImageForActions] = useState(null);
    const { theme } = useTheme(); // <-- Dapatkan tema saat ini

    const handleUsePrompt = (image) => { onUsePromptAndSeed(image.prompt, image.seed); setSelectedImageForActions(null); };
    const handleCreateVar = (image) => { onCreateVariation(image); setSelectedImageForActions(null); };
    const handleDelete = (image) => { onDeleteImage(image); setSelectedImageForActions(null); };
    const handleDownload = (image) => { onDownloadImage(image); setSelectedImageForActions(null); };


    return (
        <div id="generated-content-display" className="p-6 rounded-2xl min-h-[50vh] flex flex-col justify-center items-center neumorphic-card">
            <h2 className="text-2xl font-bold mb-4">
                {activeTab === 'image' ? 'Hasil Generasi Gambar' : (activeTab === 'video' ? 'Hasil Prompt Video' : 'Hasil Generasi Audio')}
            </h2>
            {loading && <div className="text-center"><Spinner /><p className="mt-4">{activeTab === 'image' ? 'Membuat Gambar...' : (activeTab === 'video' ? 'Membuat Prompt...' : 'Membuat Audio...')}</p></div>}

            {!loading && activeTab === 'video' && generatedVideoPrompt && (
                <div className="w-full p-4 rounded-lg text-left relative" style={{boxShadow:'var(--shadow-inset)'}}>
                    <button onClick={()=>{navigator.clipboard.writeText(generatedVideoPrompt); showToast('Prompt disalin!', 'success')}} className="absolute top-2 right-2 p-1.5 opacity-60 hover:opacity-100">
                        <Copy size={16}/>
                    </button>
                    <p className="whitespace-pre-wrap pr-8">{generatedVideoPrompt}</p>
                </div>
            )}

            {!loading && activeTab === 'audio' && generatedAudio && (
                <div className="w-full flex flex-col items-center gap-4">
                    <audio controls src={generatedAudio} className="w-full max-w-md"/>
                    <NeumorphicButton onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedAudio;
                        link.download = `Kenthir-audio-${Date.now()}.mp3`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast('Audio diunduh...', 'success');
                    }} className="w-full max-w-md">
                        <ImageDown size={16}/> Unduh Audio
                    </NeumorphicButton>
                </div>
            )}

            {!loading && activeTab === 'image' && generatedImages.length > 0 &&
                <div className={`w-full p-4 ${generatedImages.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'flex justify-center items-center'}`}>
                    {generatedImages.map((img, i) => (
                        <div
                            key={img.url}
                            className={`relative space-y-2 group overflow-hidden ${generatedImages.length === 1 ? 'w-full max-w-xl' : ''}`}
                            onClick={() => setSelectedImageForActions(img)}
                            style={{cursor: 'pointer'}}
                        >
                            <img src={img.url} alt={img.prompt} className="w-full h-auto rounded-lg"/>

                            {/* Overlay Aksi pada Gambar */}
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                                {/* Ikon Zoom (Top-Right) - Warna seragam dengan transparansi */}
                                <div className="absolute top-2 right-2">
                                    <button onClick={(e) => { e.stopPropagation(); onViewImage(img); }}
                                            className={`p-2 rounded-full flex items-center justify-center transition-colors
                                                ${theme === 'dark' ? 'bg-white/30 text-black hover:bg-white/50' : 'bg-black/30 text-white hover:bg-black/50'}`}>
                                        <ZoomIn size={18}/>
                                    </button>
                                </div>

                                {/* Tombol Aksi di bagian bawah tengah overlay - Warna seragam dengan transparansi */}
                                <div className="flex flex-wrap justify-center gap-2 p-2 w-full max-w-xs">
                                    <button onClick={(e) => { e.stopPropagation(); handleUsePrompt(img); }}
                                            className={`rounded-lg px-3 py-1 text-xs flex-1 flex items-center justify-center gap-1 transition-colors
                                                ${theme === 'dark' ? 'bg-white/30 text-black hover:bg-white/50' : 'bg-black/30 text-white hover:bg-black/50'}`}>
                                        <ChevronsRight size={14}/> Gunakan
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleCreateVar(img); }}
                                            className={`rounded-lg px-3 py-1 text-xs flex-1 flex items-center justify-center gap-1 transition-colors
                                                ${theme === 'dark' ? 'bg-white/30 text-black hover:bg-white/50' : 'bg-black/30 text-white hover:bg-black/50'}`}>
                                        <Repeat size={14}/> Variasi
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload(img); }}
                                            className={`rounded-lg px-3 py-1 text-xs flex-1 flex items-center justify-center gap-1 transition-colors
                                                ${theme === 'dark' ? 'bg-white/30 text-black hover:bg-white/50' : 'bg-black/30 text-white hover:bg-black/50'}`}>
                                        <ImageDown size={14}/> Unduh
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                                            className={`rounded-lg px-3 py-1 text-xs flex-1 flex items-center justify-center gap-1 transition-colors
                                                ${theme === 'dark' ? 'bg-red-500/50 text-white hover:bg-red-600/70' : 'bg-red-500/50 text-white hover:bg-red-600/70'}`}> {/* Merah tetap, tapi dengan transparansi */}
                                        <Trash2 size={14}/> Hapus
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-center opacity-60">Seed: {img.seed}</p>
                        </div>
                    ))}
                </div>
            }

            {/* Bagian untuk menampilkan teks prompt dan seed dari gambar yang dipilih untuk aksi, di bawah grid */}
            {selectedImageForActions && activeTab === 'image' && (
                <div className="w-full text-center mt-4 p-4 rounded-lg" style={{boxShadow:'var(--shadow-inset)'}}>
                    <h3 className="text-lg font-semibold mb-2">Gambar Dipilih:</h3>
                    <p className="text-sm opacity-70">Prompt: {selectedImageForActions.prompt}</p>
                    <p className="text-sm opacity-70">Seed: {selectedImageForActions.seed}</p>
                </div>
            )}


            {!loading && !generatedImages.length && !generatedVideoPrompt && !generatedAudio && (
                <p className="text-lg opacity-70">Mulai generate karya AI Anda!</p>
            )}
        </div>
    );
};