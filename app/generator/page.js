"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    Sun, Moon, X, Wand2, RefreshCw,
    ImageDown, Trash2, Upload,
    ChevronUp, KeyRound, Check, Download, EyeOff
} from 'lucide-react';

import { Spinner, NeumorphicButton, Toasts, ImageEditorModal, ImageAnalysisModal } from '../sharedComponents.js';
import ChatbotAssistant from '../ChatbotAssistant.js';
import ImageGeneratorControls from '../components/ImageGeneratorControls.js';
import ImageGeneratorResults from '../components/ImageGeneratorResults.js';
import HistoryAndFavorites from '../components/HistoryAndFavorites.js';
import { useImageGenerator } from '../hooks/useImageGenerator.js';

function GeneratorPageContent() {
    const {
        isMounted, prompt, setPrompt, model, setModel, quality, setQuality, sizePreset, setSizePreset,
        useCustomSize, setUseCustomSize, customWidth, setCustomWidth, customHeight, setCustomHeight, seed, setSeed,
        batchSize, setBatchSize, artStyle, setArtStyle, generatedImages, loading, setLoading,
        isEnhancing, isBuildingPrompt, apiKey, setApiKey, generationHistory, setGenerationHistory,
        savedPrompts, setSavedPrompts, toasts, showToast, activeTab, setActiveTab, videoParams, setVideoParams,
        audioVoice, setAudioVoice, generatedAudio, generatedVideoPrompt, generatedImagePrompt, setGeneratedImagePrompt,
        aiSuggestions, isFetchingSuggestions, fetchAiSuggestions, handleRandomPrompt, handleEnhancePrompt,
        handleGenerate, handleBuildImagePrompt, handleBuildVideoPrompt, canvasRef
    } = useImageGenerator();
    
    const { theme, setTheme } = useTheme();
    
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [tempApiKey, setTempApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [modelRequiringKey, setModelRequiringKey] = useState(null);
    const [isTurboAuthModalOpen, setIsTurboAuthModalOpen] = useState(false);
    const [generatedTurboPassword, setGeneratedTurboPassword] = useState('');
    const [turboPasswordInput, setTurboPasswordInput] = useState('');
    const [turboCountdown, setTurboCountdown] = useState('');
    const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
    const [isMasterResetModalOpen, setIsMasterResetModalOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    const searchParams = useSearchParams();

    // LOGIKA BARU UNTUK MENGATUR PROMPT AWAL
    useEffect(() => {
        const promptFromUrl = searchParams.get('prompt');
        if (promptFromUrl) {
            // Prioritas 1: Gunakan prompt dari URL jika ada
            setPrompt(promptFromUrl);
        } else {
            // Prioritas 2: Jika tidak ada, coba ambil dari localStorage
            try {
                const savedState = JSON.parse(localStorage.getItem('aiImageGeneratorState_v18') || '{}');
                if (savedState && savedState.prompt) {
                    setPrompt(savedState.prompt);
                }
            } catch (e) {
                console.error("Gagal memuat prompt dari localStorage:", e);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) { setShowBackToTop(true); } else { setShowBackToTop(false); }
        };
        
        window.addEventListener('scroll', handleScroll);

        const timer = setInterval(() => {
            try {
                const turboDataString = localStorage.getItem('turboPasswordData');
                if(turboDataString){
                    const turboData = JSON.parse(turboDataString);
                    if(turboData.password && turboData.expiry){
                        const now = new Date().getTime();
                        const turboDiff = turboData.expiry - now;
                        if(turboDiff > 0){
                            setTurboCountdown(`${String(Math.floor((turboDiff/(1000*60*60))%24)).padStart(2,'0')}:${String(Math.floor((turboDiff/1000/60)%60)).padStart(2,'0')}:${String(Math.floor((turboDiff/1000)%60)).padStart(2,'0')}`);
                        } else {
                            setTurboCountdown("Kadaluarsa");
                            if (model === 'turbo') {
                                setModel('flux');
                                showToast('Sesi Turbo telah berakhir.', 'info');
                            }
                        }
                    }
                } else {
                    setTurboCountdown('');
                }
            } catch (e) { console.error("Gagal memproses timer:", e); }
        }, 1000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(timer);
        };
    }, [model, showToast]);

    const handleModelChange = (e) => {
        const selected = e.target.value;
        if (['dalle3', 'stability', 'ideogram'].includes(selected) && !apiKey) {
            setModelRequiringKey(selected);
            setTempApiKey('');
            setIsApiModalOpen(true);
        } else if (selected === 'turbo') {
            const turboDataString = localStorage.getItem('turboPasswordData');
            let isValid = false;
            if (turboDataString) {
              try {
                const turboData = JSON.parse(turboDataString);
                if(turboData.password && turboData.expiry > new Date().getTime()){
                  isValid = true;
                }
              } catch(e) { /* ignore parse error */ }
            }

            if (isValid) {
                setModel('turbo');
                showToast('Model Turbo aktif dengan password tersimpan.', 'info');
            } else {
                setGeneratedTurboPassword('');
                setTurboPasswordInput('');
                setIsTurboAuthModalOpen(true);
            }
        } else {
            setModel(selected);
        }
    };

    const handleApiKeySubmit = () => { if (tempApiKey.trim()) { setApiKey(tempApiKey); setModel(modelRequiringKey); showToast(`API Key tersimpan & model ${modelRequiringKey.toUpperCase()} dipilih.`, 'success'); setIsApiModalOpen(false); setTempApiKey(''); setModelRequiringKey(null); } else { showToast('API Key tidak boleh kosong.', 'error'); } };
    
    const handleGenerateModalPassword = () => {
        const randomChars = Array(5).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
        const newPassword = `Kenthir-${randomChars}`;
        setGeneratedTurboPassword(newPassword);
        setTurboPasswordInput('');
    };

    const handleActivateTurbo = () => {
        const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
        try {
            localStorage.setItem('turboPasswordData', JSON.stringify({ password: generatedTurboPassword, expiry }));
            setModel('turbo');
            showToast('Otentikasi berhasil! Model Turbo aktif.', 'success');
            setIsTurboAuthModalOpen(false);
            setGeneratedTurboPassword('');
            setTurboPasswordInput('');
        } catch (e) {
            showToast('Gagal menyimpan dan mengaktifkan Turbo.', 'error');
        }
    };
    
    const handleMasterReset = () => {
        try {
            const theme = localStorage.getItem('theme'); 
            localStorage.clear();
            if (theme) localStorage.setItem('theme', theme);
            
            setPrompt(''); setModel('flux'); setQuality('hd'); setSizePreset('1024x1024'); setUseCustomSize(false);
            setCustomWidth(1024); setCustomHeight(1024); setSeed(''); setBatchSize(1); setArtStyle('');
            setGeneratedImages([]); setLoading(false); setApiKey(''); setGenerationHistory([]); setSavedPrompts([]);
            setActiveTab('image'); setGeneratedAudio(null); setGeneratedVideoPrompt(''); setGeneratedImagePrompt('');

            showToast('Semua data aplikasi telah direset.', 'success');
            setIsMasterResetModalOpen(false);
        } catch (e) {
            console.error("Gagal mereset data:", e);
            showToast('Gagal mereset data.', 'error');
        }
    };

    const handleOpenEditor = (image) => { setEditingImage(image); setIsEditorOpen(true); };
    
    const handleDownload = (image, filter, watermark) => {
        const mainImage = new Image();
        mainImage.crossOrigin = 'anonymous';
        mainImage.src = image.url;
        mainImage.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = mainImage.width;
            canvas.height = mainImage.height;
            if (filter) ctx.filter = filter;
            ctx.drawImage(mainImage, 0, 0);
            ctx.filter = 'none';
            const finalizeDownload = () => {
                const link = document.createElement('a');
                link.download = `Kenthir-ai-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('Gambar diunduh...', 'success');
            };
            if (watermark && (watermark.text || watermark.imageUrl)) {
                ctx.globalAlpha = watermark.opacity;
                const x = (watermark.position.x / 100) * canvas.width;
                const y = (watermark.position.y / 100) * canvas.height;
                if (watermark.type === 'text' && watermark.text) {
                    const fontSize = (watermark.size / 100) * (canvas.width * 0.2);
                    ctx.font = `bold ${fontSize}px Arial`;
                    ctx.fillStyle = watermark.color;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(watermark.text, x, y);
                    finalizeDownload();
                } else if (watermark.type === 'image' && watermark.imageUrl) {
                    const wmImage = new Image();
                    wmImage.crossOrigin = 'anonymous';
                    wmImage.src = watermark.imageUrl;
                    wmImage.onload = () => {
                        const wmWidth = (watermark.size / 100) * canvas.width;
                        const wmHeight = wmImage.height * (wmWidth / wmImage.width);
                        ctx.drawImage(wmImage, x - wmWidth / 2, y - wmHeight / 2, wmWidth, wmHeight);
                        finalizeDownload();
                    };
                    wmImage.onerror = () => { showToast('Gagal memuat gambar watermark.', 'error'); finalizeDownload(); };
                } else {
                    finalizeDownload();
                }
            } else {
                finalizeDownload();
            }
        };
        mainImage.onerror = () => { showToast('Gagal memuat gambar utama untuk diunduh.', 'error'); };
    };
    
    const handleClearHistory = () => { setGenerationHistory([]); setSavedPrompts([]); setIsClearHistoryModalOpen(false); showToast('Semua riwayat telah dihapus.', 'success'); };
    const usePromptAndSeed = (p, s) => { setPrompt(p); setSeed(String(s)); setActiveTab('image'); setIsEditorOpen(false); showToast('Prompt & Seed dimuat.', 'success'); };
    const handleCreateVariation = (image) => { setPrompt(image.prompt); setSeed(''); setActiveTab('image'); setIsEditorOpen(false); setTimeout(() => { handleGenerate(); }, 100); showToast('Membuat variasi baru...', 'info'); };
    
    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };

    if (!isMounted) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Spinner/></div>;

    return (
        <div className={`min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]`}>
            <Toasts toasts={toasts} />
            <canvas ref={canvasRef} className="hidden"></canvas>

            {isEditorOpen && <ImageEditorModal image={editingImage} onClose={() => setIsEditorOpen(false)} onUsePromptAndSeed={usePromptAndSeed} onDownload={handleDownload} onCreateVariation={handleCreateVariation} showToast={showToast} />}
            {isAnalysisModalOpen && <ImageAnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} onPromptGenerated={(p) => { setGeneratedImagePrompt(p); showToast("Prompt dari gambar berhasil dibuat!", "success"); setIsAnalysisModalOpen(false); }} showToast={showToast} />}
            {isClearHistoryModalOpen && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"><div className="p-8 rounded-2xl w-full max-w-md" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-outset)' }}><h2 className="text-xl font-bold mb-4">Konfirmasi</h2><p className="mb-6">Yakin ingin menghapus semua riwayat & favorit?</p><div className="flex justify-end gap-4"><NeumorphicButton onClick={() => setIsClearHistoryModalOpen(false)}>Batal</NeumorphicButton><NeumorphicButton onClick={handleClearHistory} className="font-bold bg-red-500 text-white">Hapus</NeumorphicButton></div></div></div>}
            {isApiModalOpen && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"><div className="p-8 rounded-2xl w-full max-w-md" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-outset)' }}><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">API Key untuk {modelRequiringKey?.toUpperCase()}</h2><NeumorphicButton onClick={() => setIsApiModalOpen(false)} className="!p-2"><X size={20} /></NeumorphicButton></div><p className="mb-4 text-sm">Model ini memerlukan API key yang valid.</p><div className="relative w-full mb-4"><input type={showApiKey ? "text" : "password"} value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} placeholder="Masukkan API Key Anda" className="w-full p-3 rounded-lg neumorphic-input pr-12"/><button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}</button></div><div className="flex justify-end gap-4"><NeumorphicButton onClick={() => setIsApiModalOpen(false)}>Batal</NeumorphicButton><NeumorphicButton onClick={handleApiKeySubmit} className="font-bold">Simpan</NeumorphicButton></div></div></div>}
            {isTurboAuthModalOpen && <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"><div className="p-6 rounded-2xl w-full max-w-md flex flex-col gap-4 neumorphic-card" style={{ background: 'var(--bg-color)' }}><div className="flex justify-between items-center"><h2 className="text-xl font-bold flex items-center gap-2"><KeyRound size={22}/> Akses Model Turbo</h2><NeumorphicButton onClick={() => {setModel('flux'); setIsTurboAuthModalOpen(false);}} className="!p-2"><X size={20} /></NeumorphicButton></div><div className="p-4 rounded-lg space-y-3" style={{boxShadow: 'var(--shadow-inset)'}}><div className="flex justify-between items-center"><span className="font-semibold text-sm">Password Dibuat:</span><span className="font-mono text-lg font-bold text-indigo-500">{generatedTurboPassword || '---'}</span></div><NeumorphicButton onClick={handleGenerateModalPassword} className="w-full !p-2 text-sm"><RefreshCw size={14}/> Buat Password Baru</NeumorphicButton></div><div><label className="font-semibold text-sm mb-2 block">Verifikasi Password</label><div className="relative"><input type="text" value={turboPasswordInput} onChange={(e) => setTurboPasswordInput(e.target.value)} placeholder="Ketik atau tempel password di sini" className="w-full p-3 rounded-lg neumorphic-input pr-24" disabled={!generatedTurboPassword}/><NeumorphicButton onClick={() => setTurboPasswordInput(generatedTurboPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 !p-2 text-xs" disabled={!generatedTurboPassword}>Autofill</NeumorphicButton></div></div><div className="text-xs p-3 rounded-lg space-y-2" style={{boxShadow:'var(--shadow-inset)', opacity: 0.8}}><p>Model Turbo tidak memiliki filter keamanan. Anda bertanggung jawab penuh atas konten yang dihasilkan.</p><p>Password hanya berlaku selama 24 jam.</p></div><NeumorphicButton onClick={handleActivateTurbo} className="w-full font-bold !p-3" disabled={!generatedTurboPassword || turboPasswordInput !== generatedTurboPassword}><Check size={18}/> Aktifkan Turbo</NeumorphicButton></div></div>}
            {isMasterResetModalOpen && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"><div className="p-8 rounded-2xl w-full max-w-md" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-outset)' }}><h2 className="text-xl font-bold mb-4">Konfirmasi Reset Data</h2><p className="mb-2 text-sm">Anda yakin ingin menghapus semua data aplikasi dari browser ini? Tindakan ini tidak dapat diurungkan.</p><div className="text-sm p-3 my-4 rounded-lg" style={{boxShadow: 'var(--shadow-inset)'}}>Data yang akan dihapus:<ul className="list-disc list-inside mt-2 space-y-1"><li>Riwayat Generasi Gambar</li><li>Prompt Favorit</li><li>Kunci API yang Tersimpan</li><li>Password Turbo yang Tersimpan</li><li>Semua Pengaturan Pengguna</li></ul></div><div className="flex justify-end gap-4 mt-6"><NeumorphicButton onClick={() => setIsMasterResetModalOpen(false)}>Batal</NeumorphicButton><NeumorphicButton onClick={handleMasterReset} className="font-bold bg-red-500 text-white">Ya, Hapus Semua</NeumorphicButton></div></div></div>}
            
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 pt-20">
                    <header className="flex flex-col gap-4 items-center text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 md:gap-3">
                            <Wand2 className="text-yellow-500 h-8 w-8 md:h-9 md:w-9 flex-shrink-0" />
                            <span>Kenthir AI Generator</span>
                        </h1>
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                            <NeumorphicButton 
                                aria-label={theme === 'dark' ? "Ganti ke mode terang" : "Ganti ke mode gelap"} 
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="!p-3"
                            >
                                {theme === 'dark' ? <Sun /> : <Moon />}
                            </NeumorphicButton>
                        </div>
                    </header>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-6">
                            <ImageGeneratorControls 
                                prompt={prompt} setPrompt={setPrompt} model={model} handleModelChange={handleModelChange} quality={quality} setQuality={setQuality}
                                sizePreset={sizePreset} setSizePreset={setSizePreset} useCustomSize={useCustomSize} setUseCustomSize={setUseCustomSize}
                                customWidth={customWidth} setCustomWidth={setCustomWidth} customHeight={customHeight} setCustomHeight={setCustomHeight}
                                seed={seed} setSeed={setSeed} batchSize={batchSize} setBatchSize={setBatchSize} artStyle={artStyle} setArtStyle={setArtStyle}
                                isEnhancing={isEnhancing} isBuildingPrompt={isBuildingPrompt} savedPrompts={savedPrompts} setSavedPrompts={setSavedPrompts}
                                activeTab={activeTab} setActiveTab={setActiveTab} videoParams={videoParams} setVideoParams={setVideoParams} audioVoice={audioVoice}
                                setAudioVoice={setAudioVoice} generatedImagePrompt={generatedImagePrompt} setGeneratedImagePrompt={setGeneratedImagePrompt}
                                aiSuggestions={aiSuggestions} isFetchingSuggestions={isFetchingSuggestions} fetchAiSuggestions={fetchAiSuggestions}
                                handleRandomPrompt={handleRandomPrompt} handleEnhancePrompt={handleEnhancePrompt} handleGenerate={handleGenerate}
                                handleBuildImagePrompt={handleBuildImagePrompt} handleBuildVideoPrompt={handleBuildVideoPrompt} showToast={showToast}
                                turboCountdown={turboCountdown}
                            />
                            <div className="p-6 rounded-2xl h-fit space-y-4 neumorphic-card">
                                <h3 className="font-bold text-lg">Buat Prompt dari Gambar</h3>
                                <NeumorphicButton onClick={() => setIsAnalysisModalOpen(true)} className="w-full"><Upload size={16} /> Analisis Gambar</NeumorphicButton>
                            </div>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <ImageGeneratorResults 
                                loading={loading} activeTab={activeTab} generatedImages={generatedImages} handleOpenEditor={handleOpenEditor}
                                generatedVideoPrompt={generatedVideoPrompt} showToast={showToast} generatedAudio={generatedAudio}
                            />
                            <HistoryAndFavorites 
                                generationHistory={generationHistory} setGenerationHistory={setGenerationHistory} savedPrompts={savedPrompts}
                                setSavedPrompts={setSavedPrompts} handleOpenEditor={handleOpenEditor} setPrompt={setPrompt}
                                setIsClearHistoryModalOpen={setIsClearHistoryModalOpen}
                            />
                        </div>
                    </div>
                </main>

                <div className="container mx-auto px-4 sm:px-6 lg:p-8 flex justify-center mt-8">
                    <NeumorphicButton onClick={() => setIsMasterResetModalOpen(true)} className="w-full max-w-md !text-red-500 !font-semibold">
                        <Trash2 size={16}/> Reset Semua Data Aplikasi
                    </NeumorphicButton>
                </div>

                <footer className="text-center p-4 mt-8 border-t border-gray-500/20 text-sm opacity-70">
                    <p>&copy; {new Date().getFullYear()} Kenthir AI Generator - Developed with ❤️ by{' '}
                      <a
                        href="https://ariftirtana.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Arif Tirtana
                      </a>
                    </p>
                </footer>
            </div>
            {showBackToTop && (
                <NeumorphicButton onClick={scrollToTop} className="!p-3 fixed bottom-5 right-5 z-50 !rounded-full animate-fade-in" title="Back to Top">
                    <ChevronUp size={24} />
                </NeumorphicButton>
            )}

            <ChatbotAssistant />
        </div>
    );
}

export default function GeneratorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100"><Spinner/></div>}>
            <GeneratorPageContent />
        </Suspense>
    );
}