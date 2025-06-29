"use client";

import { Spinner, NeumorphicButton } from '../sharedComponents.js'; // <-- INI PERBAIKANNYA
import { ImageDown, Copy } from 'lucide-react';

const ImageGeneratorResults = ({ 
    loading, activeTab, generatedImages, handleOpenEditor, 
    generatedVideoPrompt, showToast, generatedAudio 
}) => {
    return (
        <div className="p-6 rounded-2xl min-h-[50vh] flex flex-col justify-center items-center neumorphic-card">
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

            {!loading && activeTab === 'image' && generatedImages.length === 0 && <p className="text-gray-500">Hasil gambar akan muncul di sini.</p>}
            {!loading && activeTab === 'image' && generatedImages.length > 0 && 
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {generatedImages.map((img, i) => (
                        <div key={i} className="rounded-xl p-2 space-y-2 group relative" style={{boxShadow: 'var(--shadow-outset)'}}>
                            <img src={img.url} className="w-full h-auto rounded-lg"/>
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                                <button onClick={() => handleOpenEditor(img)} className="text-white font-bold py-2 px-4 rounded-lg bg-white/20 backdrop-blur-sm">Lihat & Edit</button>
                            </div>
                            <p className="text-xs text-center opacity-60">Seed: {img.seed}</p>
                        </div>
                    ))}
                </div>
            }
            {!loading && activeTab === 'video' && !generatedVideoPrompt && <p className="text-gray-500">Gunakan asisten di sebelah kiri untuk membuat prompt video profesional.</p>}
            {!loading && activeTab === 'audio' && !generatedAudio && <p className="text-gray-500">Hasil audio akan muncul di sini.</p>}
            {!loading && activeTab === 'audio' && generatedAudio && 
                <div className="w-full p-4 flex items-center gap-4">
                    <audio controls src={generatedAudio} className="w-full"></audio>
                    <a href={generatedAudio} download="generated_audio.mp3">
                        <NeumorphicButton className="!p-3"><ImageDown size={20}/></NeumorphicButton>
                    </a>
                </div>
            }
        </div>
    );
};

export default ImageGeneratorResults;