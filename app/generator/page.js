"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    X, Upload, ImageDown, Trash2, ChevronUp, MessageSquare,
    Wand2, Sun, Moon // <-- Tambahkan Sun dan Moon di sini
} from 'lucide-react';
import { useTheme } from 'next-themes'; // <-- Import useTheme

import { Spinner, NeumorphicButton, Toasts, ImageAnalysisModal } from '../sharedComponents.js';
import ChatbotAssistant from '../ChatbotAssistant.js';
import { useImageGenerator } from '../hooks/useImageGenerator.js';

import { GenerationControls } from './components/GenerationControls';
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay';
import { HistoryAndFavorites } from './components/HistoryAndFavorites';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { ClearHistoryModal } from './components/modals/ClearHistoryModal';
import { MasterResetModal } from './components/modals/MasterResetModal';
import { TurboAuthModal } from './components/modals/TurboAuthModal';
import { ImageViewer } from './components/ImageViewer';

function GeneratorPageContent() {
    const {
        isMounted, prompt, setPrompt, model, setModel, quality, setQuality, sizePreset, setSizePreset,
        useCustomSize, setUseCustomSize, customWidth, setCustomWidth, customHeight, setCustomHeight, seed, setSeed,
        batchSize, setBatchSize, artStyle, setArtStyle, generatedImages, setGeneratedImages, loading, setLoading,
        isEnhancing, isBuildingPrompt, setIsBuildingPrompt, apiKey, setApiKey, generationHistory, setGenerationHistory,
        savedPrompts, setSavedPrompts, toasts, showToast, activeTab, setActiveTab, videoParams, setVideoParams,
        audioVoice, setAudioVoice, generatedAudio, generatedVideoPrompt, setGeneratedVideoPrompt, generatedImagePrompt, setGeneratedImagePrompt,
        aiSuggestions, isFetchingSuggestions, fetchAiSuggestions, handleRandomPrompt, handleEnhancePrompt,
        handleGenerate, handleBuildImagePrompt, handleBuildVideoPrompt, canvasRef
    } = useImageGenerator();

    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [modelRequiringKey, setModelRequiringKey] = useState(null);
    const [isTurboAuthModalOpen, setIsTurboAuthModalOpen] = useState(false);
    const [generatedTurboPassword, setGeneratedTurboPassword] = useState('');
    const [turboPasswordInput, setTurboPasswordInput] = useState('');
    const [turboCountdown, setTurboCountdown] = useState('');
    const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
    const [isMasterResetModalOpen, setIsMasterResetModalOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [promptCreator, setPromptCreator] = useState({ subject: '', details: '' });

    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [imageInViewer, setImageInViewer] = useState(null);

    const { theme, setTheme } = useTheme(); // <-- Dapatkan theme dan setTheme di sini

    const searchParams = useSearchParams();

    useEffect(() => {
        const promptFromUrl = searchParams.get('prompt');
        if (promptFromUrl) {
            setPrompt(promptFromUrl);
        } else {
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

    const handleApiKeySubmit = (key) => {
        if (key.trim()) {
            setApiKey(key);
            setModel(modelRequiringKey);
            showToast(`API Key tersimpan & model ${modelRequiringKey.toUpperCase()} dipilih.`, 'success');
            setIsApiModalOpen(false);
            setModelRequiringKey(null);
        } else {
            showToast('API Key tidak boleh kosong.', 'error');
        }
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
            setCustomWidth(1024); setCustomHeight(1024); setSeed(''); setBatchSize(2); setArtStyle('');
            setGeneratedImages([]); setLoading(false); setApiKey(''); setGenerationHistory([]); setSavedPrompts([]);
            setActiveTab('image'); setGeneratedAudio(null); setGeneratedVideoPrompt(''); setGeneratedImagePrompt('');

            showToast('Semua data aplikasi telah direset.', 'success');
            setIsMasterResetModalOpen(false);
        } catch (e) {
            console.error("Gagal mereset data:", e);
            showToast('Gagal mereset data.', 'error');
        }
    };

    const handleClearHistory = () => { setGenerationHistory([]); setSavedPrompts([]); setIsClearHistoryModalOpen(false); showToast('Semua riwayat telah dihapus.', 'success'); };

    const handleUseGeneratedPrompt = () => {
        if (generatedImagePrompt) {
            setPrompt(generatedImagePrompt);
            setGeneratedImagePrompt('');
            showToast('Prompt siap digunakan!', 'success');
            setIsCreatorOpen(false);
        }
    };

    const onUsePromptAndSeed = (p, s) => { setPrompt(p); setSeed(String(s)); setActiveTab('image'); showToast('Prompt & Seed dimuat.', 'success'); setIsImageViewerOpen(false); };
    const onCreateVariation = (image) => { setPrompt(image.prompt); setSeed(''); setActiveTab('image'); setTimeout(() => { handleGenerate(); }, 100); showToast('Membuat variasi baru...', 'info'); setIsImageViewerOpen(false); };
    const onDeleteImage = (imgToDelete) => { setGeneratedImages(prev => prev.filter(img => img.url !== imgToDelete.url)); setGenerationHistory(prev => prev.filter(img => img.url !== imgToDelete.url)); showToast('Gambar berhasil dihapus!', 'success'); setIsImageViewerOpen(false); };
    const onDownloadImage = (image) => {
        const link = document.createElement('a');
        link.download = `Kenthir-ai-${Date.now()}.png`;
        link.href = image.url;
        link.click();
        showToast('Gambar diunduh!', 'success');
        setIsImageViewerOpen(false);
    };

    const handleViewImage = (image) => {
        setImageInViewer(image);
        setIsImageViewerOpen(true);
    };


    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };

    if (!isMounted) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Spinner/></div>;

    return (
        <div className={`min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]`}>
            <Toasts toasts={toasts} />
            <canvas ref={canvasRef} className="hidden"></canvas>

            {isAnalysisModalOpen && <ImageAnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} onPromptGenerated={(p) => { setGeneratedImagePrompt(p); showToast("Prompt dari gambar berhasil dibuat!", "success"); setIsAnalysisModalOpen(false); }} showToast={showToast} />}

            <ClearHistoryModal isOpen={isClearHistoryModalOpen} onClose={() => setIsClearHistoryModalOpen(false)} onConfirm={handleClearHistory} />
            <ApiKeyModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} onSubmit={handleApiKeySubmit} modelRequiringKey={modelRequiringKey} initialApiKey={apiKey} />
            <TurboAuthModal
                isOpen={isTurboAuthModalOpen}
                onClose={() => {setModel('flux'); setIsTurboAuthModalOpen(false);}}
                onActivate={handleActivateTurbo}
                showToast={showToast}
                generatedTurboPassword={generatedTurboPassword}
                setGeneratedTurboPassword={setGeneratedTurboPassword}
                turboPasswordInput={turboPasswordInput}
                setTurboPasswordInput={setTurboPasswordInput}
            />
            <MasterResetModal isOpen={isMasterResetModalOpen} onClose={() => setIsMasterResetModalOpen(false)} onConfirm={handleMasterReset} />

            {isImageViewerOpen && <ImageViewer image={imageInViewer} onClose={() => setIsImageViewerOpen(false)} />}


            <div className="flex flex-col min-h-screen">
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 pt-20">
                    <header className="flex flex-col gap-4 items-center text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 md:gap-3">
                            <Wand2 className="text-yellow-500 h-8 w-8 md:h-9 md:w-9 flex-shrink-0" />
                            <span>Kenthir AI Generator</span>
                        </h1>
                        {/* Tombol ganti tema kembali di sini */}
                        <div className="flex items-center justify-center">
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
                            <GenerationControls
                                prompt={prompt} setPrompt={setPrompt}
                                model={model} setModel={setModel}
                                quality={quality} setQuality={setQuality}
                                sizePreset={sizePreset} setSizePreset={setSizePreset}
                                useCustomSize={useCustomSize} setUseCustomSize={setUseCustomSize}
                                customWidth={customWidth} setCustomWidth={setCustomWidth}
                                customHeight={customHeight} setCustomHeight={setCustomHeight}
                                seed={seed} setSeed={setSeed}
                                batchSize={batchSize} setBatchSize={setBatchSize}
                                artStyle={artStyle} setArtStyle={setArtStyle}
                                loading={loading} isEnhancing={isEnhancing} isBuildingPrompt={isBuildingPrompt}
                                apiKey={apiKey} setApiKey={setApiKey} showToast={showToast}
                                activeTab={activeTab} setActiveTab={setActiveTab}
                                videoParams={videoParams} setVideoParams={setVideoParams}
                                audioVoice={audioVoice} setAudioVoice={setAudioVoice}
                                generatedVideoPrompt={generatedVideoPrompt}
                                generatedImagePrompt={generatedImagePrompt}
                                aiSuggestions={aiSuggestions} isFetchingSuggestions={isFetchingSuggestions} fetchAiSuggestions={fetchAiSuggestions}
                                handleRandomPrompt={handleRandomPrompt} handleEnhancePrompt={handleEnhancePrompt}
                                handleGenerate={handleGenerate} handleBuildImagePrompt={handleBuildImagePrompt} handleBuildVideoPrompt={handleBuildVideoPrompt}
                                setIsApiModalOpen={setIsApiModalOpen} setModelRequiringKey={setModelRequiringKey} setIsTurboAuthModalOpen={setIsTurboAuthModalOpen}
                                turboCountdown={turboCountdown}
                                setIsCreatorOpen={setIsCreatorOpen} isCreatorOpen={isCreatorOpen}
                                promptCreator={promptCreator} setPromptCreator={setPromptCreator}
                                handleUseGeneratedPrompt={handleUseGeneratedPrompt}
                            />
                            <div className="p-6 rounded-2xl h-fit space-y-4 neumorphic-card">
                                <h3 className="font-bold text-lg">Buat Prompt dari Gambar</h3>
                                <NeumorphicButton onClick={() => setIsAnalysisModalOpen(true)} className="w-full"><Upload size={16} /> Analisis Gambar</NeumorphicButton>
                            </div>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <GeneratedContentDisplay
                                activeTab={activeTab}
                                loading={loading}
                                generatedImages={generatedImages}
                                setGeneratedImages={setGeneratedImages}
                                generatedVideoPrompt={generatedVideoPrompt}
                                generatedAudio={generatedAudio}
                                showToast={showToast}
                                setPrompt={setPrompt}
                                setSeed={setSeed}
                                setActiveTab={setActiveTab}
                                handleGenerate={handleGenerate}
                                generationHistory={generationHistory}
                                setGenerationHistory={setGenerationHistory}
                                onViewImage={handleViewImage}
                                onUsePromptAndSeed={onUsePromptAndSeed}
                                onCreateVariation={onCreateVariation}
                                onDeleteImage={onDeleteImage}
                                onDownloadImage={onDownloadImage}
                            />
                            <HistoryAndFavorites
                                generationHistory={generationHistory}
                                setGenerationHistory={setGenerationHistory}
                                savedPrompts={savedPrompts}
                                setSavedPrompts={setSavedPrompts}
                                setPrompt={setPrompt}
                                setActiveTab={setActiveTab}
                                setIsClearHistoryModalOpen={setIsClearHistoryModalOpen}
                                onSelectImageFromHistory={handleViewImage}
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