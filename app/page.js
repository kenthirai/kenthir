"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2, Settings, BrainCircuit, Sparkles } from 'lucide-react';
import { NeumorphicButton, Spinner } from './sharedComponents'; // Pastikan Spinner diimpor
import ChatbotAssistant from './ChatbotAssistant.js';

export default function LandingPage() {
    const [prompt, setPrompt] = useState('');
    const [isGeneratingLoadingPage, setIsGeneratingLoadingPage] = useState(false); // State baru untuk loading di halaman ini
    const [loadingProgress, setLoadingProgress] = useState(0); // State baru untuk persentase loading
    const router = useRouter();

    const handleGenerateRedirect = () => {
        console.log("Tombol Generate diklik! Mencoba mengarahkan dengan prompt:", prompt);

        setIsGeneratingLoadingPage(true); // Mulai loading
        setLoadingProgress(0); // Reset progress

        let progress = 0;
        const interval = setInterval(() => {
            progress += 5; // Tambah progres
            if (progress <= 100) {
                setLoadingProgress(progress);
            }

            // Arahkan setelah mencapai 90% atau lebih, untuk memastikan progres terlihat
            if (progress >= 100) {
                clearInterval(interval); // Hentikan interval
                const params = new URLSearchParams({ prompt });
                router.push(`/generator?${params.toString()}`);
            }
        }, 150); // Setiap 150ms
    };

    const onFormSubmit = (e) => {
        e.preventDefault();
        handleGenerateRedirect();
    };

    const benefits = [
        {
            icon: <Wand2 className="w-10 h-10 text-indigo-400" />,
            title: "Generator Multi-Modal",
            description: "Hasilkan tidak hanya gambar, tetapi juga prompt video sinematik dan audio realistis dari teks."
        },
        {
            icon: <Settings className="w-10 h-10 text-green-400" />,
            title: "Kustomisasi Tingkat Lanjut",
            description: "Kontrol penuh atas gaya seni, resolusi, kualitas, dan parameter lainnya untuk hasil yang sempurna."
        },
        {
            icon: <BrainCircuit className="w-10 h-10 text-yellow-400" />,
            title: "Asisten Cerdas Berbasis AI",
            description: "Dapatkan bantuan untuk menyempurnakan ide, menganalisis gambar, dan menemukan inspirasi prompt baru."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full flex flex-col items-center text-center py-20 sm:py-28 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Ubah Imajinasi Menjadi Karya Seni
                    </h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-80">
                        Gunakan kekuatan AI untuk menciptakan gambar, prompt video, dan audio yang menakjubkan dari deskripsi teks sederhana.
                    </p>
                    <form
                        onSubmit={onFormSubmit}
                        className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-center"
                    >
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Contoh: Kucing astronot di planet Mars..."
                            className="w-full p-4 text-lg rounded-xl neumorphic-input flex-grow"
                            disabled={isGeneratingLoadingPage} // Nonaktifkan input saat loading
                        />
                        <NeumorphicButton
                            type="button"
                            onClick={handleGenerateRedirect}
                            className="!p-4 !font-bold !text-lg flex items-center justify-center"
                            loading={isGeneratingLoadingPage} // Mengaktifkan tampilan loading
                            loadingText="Generate" // Hanya teks "Generate" atau "Memuat..." tanpa persentase
                            disabled={isGeneratingLoadingPage} // Nonaktifkan tombol saat loading
                        >
                            {/* Jika loading, Spinner akan otomatis muncul dari NeumorphicButton */}
                            <Sparkles size={24} />
                            <span className="ml-2">Generate</span>
                        </NeumorphicButton>
                    </form>
                    {/* Spinner loading dengan persentase di bawah form */}
                    {isGeneratingLoadingPage && (
                        <div className="mt-6 flex items-center justify-center gap-3 text-lg font-semibold animate-fade-in-up">
                            <Spinner />
                            <span>Memuat... {loadingProgress}%</span>
                        </div>
                    )}
                </section>

                {/* Benefits Section */}
                <section className="w-full py-20 flex flex-col items-center">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold">Fitur Unggulan</h2>
                        <p className="text-lg opacity-80 mt-2">Semua yang Anda butuhkan untuk berkreasi tanpa batas.</p>
                    </div>
                    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-2xl text-center neumorphic-card animate-fade-in flex flex-col items-center"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="flex justify-center mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{benefit.title}</h3>
                                <p className="opacity-80">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full flex flex-col items-center text-center py-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap untuk Memulai?</h2>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-80">
                        Jangan biarkan ide brilian Anda hanya menjadi angan-angan. Wujudkan sekarang juga dengan satu klik.
                    </p>
                    <NeumorphicButton
                        onClick={() => router.push('/generator')}
                        className="!p-5 !font-bold !text-xl !px-10 flex items-center justify-center"
                        disabled={isGeneratingLoadingPage} // Nonaktifkan tombol saat loading
                    >
                        Buka Generator Sekarang
                    </NeumorphicButton>
                </section>
            </main>

            <footer className="text-center p-4 mt-8 border-t border-gray-500/20 text-sm opacity-70">
                <p>
                    &copy; {new Date().getFullYear()} Kenthir AI - Developed with ❤️ by{' '}
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
            <ChatbotAssistant />
        </div>
    );
}