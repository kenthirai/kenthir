"use client";

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    X, Upload, ImageDown, Trash2, ChevronUp, MessageSquare,
    Wand2, Sun, Moon, DollarSign, KeyRound, LogIn,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession, signIn } from 'next-auth/react'; // <-- Hapus SessionProvider dari import ini

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

// Custom CoinIcon SVG component
function CoinIcon({ size = 26, className = "", ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`lucide lucide-coins-icon ${className}`}
            {...props}
        >
            <circle cx="8" cy="8" r="6" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
            <path d="M7 6h1v4" />
            <path d="m16.71 13.88.7.71-2.82 2.82" />
        </svg>
    );
}

// Komponen utama GeneratorPageContent
function GeneratorPageContent() {
    const {
        isMounted, prompt, setPrompt, model, setModel, quality, setQuality, sizePreset, setSizePreset,
        useCustomSize, setUseCustomSize, customWidth, setCustomWidth, customHeight, setCustomHeight, seed, setSeed,
        batchSize, setBatchSize, artStyle, setArtStyle, generatedImages, setGeneratedImages, loading, setLoading,
        isEnhancing, isBuildingPrompt, setIsBuildingPrompt, apiKey, setApiKey, generationHistory, setGenerationHistory,
        savedPrompts, setSavedPrompts, toasts, showToast, activeTab, setActiveTab, videoParams, setVideoParams,
        audioVoice, setAudioVoice, generatedAudio, generatedVideoPrompt, setGeneratedVideoPrompt, generatedImagePrompt, setGeneratedImagePrompt,
        aiSuggestions, isFetchingSuggestions, fetchAiSuggestions, handleRandomPrompt, handleEnhancePrompt,
        handleGenerate,
        handleBuildImagePrompt, handleBuildVideoPrompt, canvasRef
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

    // Tambahkan deklarasi passwordInputRef dan showPassword
    const passwordInputRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    const { theme, setTheme } = useTheme();
    const { data: session, status } = useSession(); // Dapatkan sesi pengguna dan status otentikasi

    const [userCoins, setUserCoins] = useState(0);
    const [isFetchingCoins, setIsFetchingCoins] = useState(false);
    const [resetCountdown, setResetCountdown] = useState("");
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPassword, setResetPassword] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000;

    // Tambahkan fungsi handleAdminReset di sini
    const handleAdminReset = async () => {
        setResetLoading(true);
        try {
            const res = await fetch('/api/coins/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: resetPassword })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Koin berhasil direset oleh admin.', 'success');
                setShowResetModal(false);
                setResetPassword('');
                // Tambahkan ini agar saldo koin langsung update dari server
                fetchUserCoins();
            } else {
                showToast(data.error || 'Gagal reset koin.', 'error');
            }
        } catch (e) {
            showToast('Gagal reset koin.', 'error');
        } finally {
            setResetLoading(false);
        }
    };

    const searchParams = useSearchParams();

    const fetchUserCoins = async () => {
        setIsFetchingCoins(true);
        try {
            const res = await fetch('/api/coins');
            if (!res.ok) {
                throw new Error('Gagal memuat saldo koin');
            }
            const data = await res.json();
            setUserCoins(data.balance);
            if (data.lastReset) {
                updateResetCountdown(data.lastReset);
            }
        } catch (error) {
            console.error("Error fetching coins:", error);
            showToast('Gagal memuat saldo koin.', 'error');
        } finally {
            setIsFetchingCoins(false);
        }
    };

    // Fungsi update waktu mundur reset koin
    const updateResetCountdown = (lastReset) => {
        const last = new Date(lastReset).getTime();
        const nextReset = last + RESET_INTERVAL_MS;
        const now = Date.now();
        let diff = nextReset - now;
        if (diff < 0) diff = 0;
        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        setResetCountdown(`${hours}:${minutes}:${seconds}`);
    };

    // Update countdown setiap detik
    useEffect(() => {
        const timer = setInterval(() => {
            fetch('/api/coins').then(res => res.json()).then(data => {
                if (data.lastReset) updateResetCountdown(data.lastReset);
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchUserCoins();
        }
    }, [isMounted, session]);

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
    const onCreateVariation = (image) => { setPrompt(image.prompt); setSeed(''); setActiveTab('image'); setTimeout(() => { handleGenerateWithCoins(); }, 100); showToast('Membuat variasi baru...', 'info'); setIsImageViewerOpen(false); };

    const deductCoins = async (amount = 1) => {
        try {
            const res = await fetch('/api/coins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Gagal mengurangi koin');
            }
            const data = await res.json();
            setUserCoins(data.balance);
            return true;
        } catch (error) {
            console.error("Error deducting coins:", error);
            showToast(`Koin tidak cukup! ${error.message}`, 'error');
            return false;
        }
    };

    // Fungsi refund koin jika generate gagal
    const refundCoins = async (amount = 1) => {
        try {
            const res = await fetch('/api/coins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-REFUND': '1' },
                body: JSON.stringify({ amount: -amount }) // Refund = tambah koin
            });
            if (res.ok) {
                const data = await res.json();
                setUserCoins(data.balance);
            }
        } catch (e) { /* ignore */ }
    };

    const handleGenerateWithCoins = async () => {
        if (userCoins <= 0) {
            showToast('Koin Anda tidak cukup! Silakan login untuk mendapatkan lebih banyak koin.', 'error');
            return;
        }
        // Deduct koin dulu
        const deductionSuccess = await deductCoins();
        if (!deductionSuccess) return;
        try {
            await handleGenerate();
        } catch (error) {
            showToast('Gagal generate gambar. Koin dikembalikan.', 'error');
            await refundCoins();
        }
    };


    const onDeleteImage = (imgToDelete) => {
        setGeneratedImages(prev => prev.filter(img => img.url !== imgToDelete.url));
        setGenerationHistory(prev => prev.filter(img => img.url !== imgToDelete.url));
        showToast('Gambar berhasil dihapus!', 'success');
        setIsImageViewerOpen(false);
    };
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
        <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
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
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 pt-16">
                    {/* Header is now outside of neumorphic card */}
                    <header className="flex flex-col gap-4 items-center text-center mb-8 rounded-b-2xl py-4">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 md:gap-3">
                            <Wand2 className="text-yellow-500 h-8 w-8 md:h-9 md:w-9 flex-shrink-0" />
                            <span>Kenthir AI Generator</span>
                        </h1>
                        <div className="flex items-center gap-4 justify-center">
                            <div className="flex items-center gap-2 px-6 py-3 rounded-full neumorphic-card text-yellow-700 dark:text-yellow-300 font-semibold relative">
                                <CoinIcon size={26} className="text-yellow-500" />
                                <span className="font-bold text-xl">{isFetchingCoins ? <Spinner size={16}/> : userCoins}</span>
                                <span className="text-xs ml-2 opacity-70">{resetCountdown}</span>
                                {process.env.NEXT_PUBLIC_ALLOW_COIN_RESET === "true" && (
                                    <button 
                                        onClick={() => setShowResetModal(true)} 
                                        className="ml-2 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl transition"
                                        aria-label="Reset Koin Admin"
                                        style={{ background: 'var(--bg-color)', color: 'var(--text-color)', boxShadow: 'var(--shadow-outset)' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .66.38 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.66 0 1.26.38 1.51 1H21a2 2 0 0 1 0 4h-.09c-.66 0-1.26.38-1.51 1z"/></svg>
                                    </button>
                                )}
                            </div>
                            <button
                                aria-label={theme === 'dark' ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-3 rounded-full neumorphic-card text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                {theme === 'dark' ? <Sun /> : <Moon />}
                            </button>
                            {status === 'authenticated' && session?.user?.image && (
                                <img src={session.user.image} alt="User Profile" className="w-10 h-10 rounded-full border-2 border-yellow-400 neumorphic-card ml-2" title={session.user.name || session.user.email} />
                            )}
                        </div>
                        {/* Ajakan login jika belum login */}
                        {status !== 'authenticated' && (
                            <div className="flex flex-col items-center mt-6 w-full">
                                <div className="flex items-center gap-2 text-yellow-600 font-bold text-base mb-4 neumorphic-card rounded-xl px-4 py-2">
                                    <CoinIcon className="w-6 h-6 text-yellow-500" />
                                    <span>Login untuk klaim <span className="text-yellow-500 font-extrabold">1000 Koin Gratis</span>!</span>
                                </div>
                                <span className="block md:hidden text-xs mb-2 font-semibold text-black">Login dengan:</span>
                                <div className="flex flex-row w-full gap-2 md:gap-4 justify-center">
                                    <button
                                        onClick={() => signIn('google')}
                                        className="flex items-center justify-center gap-2 rounded-xl neumorphic-card font-semibold px-4 h-12 min-w-fit bg-yellow-400 text-white transition text-base"
                                        style={{ boxShadow: 'var(--shadow-outset)' }}
                                    >
                                        {/* Google SVG icon */}
                                        <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.13 30.18 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.66 7.01l7.2 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.98 16.18 0 19.97 0 24c0 4.03.98 7.82 2.69 11.9l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.64-2.05 15.54-5.59l-7.2-5.6c-2.01 1.35-4.59 2.15-8.34 2.15-6.38 0-11.87-3.63-14.33-8.85l-7.98 6.2C6.73 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                                        <span className="hidden md:inline">Login dengan Google</span>
                                    </button>
                                    <button
                                        onClick={() => signIn('github')}
                                        className="flex items-center justify-center gap-2 rounded-xl neumorphic-card font-semibold px-4 h-12 min-w-fit bg-gray-800 text-white transition text-base"
                                        style={{ boxShadow: 'var(--shadow-outset)' }}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98.01 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/></svg>
                                        <span className="hidden md:inline">Login dengan GitHub</span>
                                    </button>
                                    <button
                                        onClick={() => signIn('facebook')}
                                        className="flex items-center justify-center gap-2 rounded-xl neumorphic-card font-semibold px-4 h-12 min-w-fit bg-blue-600 text-white transition text-base"
                                        style={{ boxShadow: 'var(--shadow-outset)' }}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0"/></svg>
                                        <span className="hidden md:inline">Login dengan Facebook</span>
                                    </button>
                                </div>
                                <span className="text-xs opacity-70 mt-4">Login untuk mulai menggunakan generator & klaim koin gratis!</span>
                            </div>
                        )}
                    </header>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-6">
                            <GenerationControls
                                prompt={prompt} setPrompt={setPrompt}
                                model={model} setModel={setModel}
                                quality={quality} setQuality={setQuality}
                                sizePreset={sizePreset} setSizePreset={setSizePreset}
                                useCustomSize={useCustomSize} setUseCustomSize={setUseCustomSize}
                                customWidth={customWidth} setCustomWidth={customWidth}
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
                                handleGenerate={handleGenerateWithCoins}
                                handleBuildImagePrompt={handleBuildImagePrompt} handleBuildVideoPrompt={handleBuildVideoPrompt}
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
                                handleGenerate={handleGenerateWithCoins}
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
                                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg p-4"
                            />
                        </div>
                    </div>
                </main>

                <div className="container mx-auto px-4 sm:px-6 lg:p-8 flex justify-center mt-8">
                    <NeumorphicButton onClick={() => setIsMasterResetModalOpen(true)} className="w-full max-w-md !font-semibold" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
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
                <NeumorphicButton onClick={scrollToTop} className="!p-3 fixed bottom-5 right-5 z-50 !rounded-full animate-fade-in shadow-xl hover:scale-110 transition-transform" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} title="Back to Top">
                    <ChevronUp size={24} />
                </NeumorphicButton>
            )}

            <ChatbotAssistant />

            {showResetModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl neumorphic-card w-full max-w-xs flex flex-col gap-4">
                        <h2 className="font-bold text-lg flex items-center gap-2"><KeyRound size={18}/> Reset Koin Admin</h2>
                        <div className="relative w-full">
                            <input
                                ref={passwordInputRef}
                                type={showPassword ? "text" : "password"}
                                className="neumorphic-input w-full p-2 rounded pr-10"
                                placeholder="Password admin"
                                value={resetPassword}
                                onChange={e => setResetPassword(e.target.value)}
                                disabled={resetLoading}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c.74-1.32 2.1-3.31 4.06-5.06M9.5 9.5a3 3 0 0 1 4.24 4.24"/><path d="M12 5c3.31 0 6.31 2.69 8.06 5.06a16.88 16.88 0 0 1-1.69 2.36"/></svg>
                                ) : (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12C2.73 15.11 7 19 12 19s9.27-3.89 11-7c-1.73-3.11-6-7-11-7S2.73 8.89 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAdminReset} disabled={resetLoading || !resetPassword} className="flex-1 neumorphic-input rounded py-2 font-semibold transition-colors" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>{resetLoading ? 'Resetting...' : 'Reset'}</button>
                            <button onClick={()=>setShowResetModal(false)} className="flex-1 neumorphic-input rounded py-2 font-semibold transition-colors" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>Batal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Komponen GeneratorPage yang membungkus GeneratorPageContent dengan SessionProvider
export default function GeneratorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100"><Spinner/></div>}>
            <GeneratorPageContent />
        </Suspense>
    );
}