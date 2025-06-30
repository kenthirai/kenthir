"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebookF } from "react-icons/fa";

const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000;
const allowCoinReset = process.env.NEXT_PUBLIC_ALLOW_COIN_RESET === "true";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userCoins, setUserCoins] = useState(0);
  const [lastReset, setLastReset] = useState(null);
  const [resetCountdown, setResetCountdown] = useState("");
  const [isFetchingCoins, setIsFetchingCoins] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const fetchUserCoins = async () => {
    setIsFetchingCoins(true);
    try {
      const res = await fetch('/api/coins');
      if (!res.ok) throw new Error('Gagal memuat saldo koin');
      const data = await res.json();
      setUserCoins(data.balance);
      setLastReset(data.lastReset);
      if (data.lastReset) updateResetCountdown(data.lastReset);
    } catch {
      setUserCoins(0);
      setLastReset(null);
    } finally {
      setIsFetchingCoins(false);
    }
  };

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

  useEffect(() => { fetchUserCoins(); }, []);
  useEffect(() => {
    if (!lastReset) return;
    const timer = setInterval(() => updateResetCountdown(lastReset), 1000);
    return () => clearInterval(timer);
  }, [lastReset]);

  const handleResetCoins = async () => {
    await fetch('/api/coins/reset', { method: 'POST' });
    fetchUserCoins();
  };

  // Animasi ripple untuk tombol
  const handleButtonClick = (provider) => {
    setLoadingProvider(provider);
    signIn(provider).finally(() => setLoadingProvider(""));
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] animate-pulse">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="neumorphic-card p-8 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-fade-in">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-yellow-200/40 to-yellow-400/10 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tr from-blue-200/40 to-blue-400/10 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <h1 className="text-2xl font-bold mb-6 text-center tracking-tight neumorphic-text">Login ke Kenthir AI</h1>
        <div className="flex items-center gap-2 justify-center mb-6">
          <span role="img" aria-label="coin" className="text-2xl">🪙</span>
          <span className="font-bold text-yellow-700 dark:text-yellow-300 text-lg neumorphic-text-shadow">{isFetchingCoins ? '...' : userCoins}</span>
          <span className="text-xs ml-2 opacity-70">{resetCountdown}</span>
        </div>
        <button
          onClick={() => handleButtonClick("google")}
          disabled={loadingProvider === "google"}
          className={`w-full py-2 px-4 mb-3 neumorphic-input flex items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl shadow font-semibold transition-all duration-150 relative overflow-hidden group ${loadingProvider === "google" ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <span className="text-xl"><FcGoogle /></span>
          {loadingProvider === "google" ? <span className="animate-spin ml-2 w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></span> : "Login dengan Google"}
        </button>
        <button
          onClick={() => handleButtonClick("github")}
          disabled={loadingProvider === "github"}
          className={`w-full py-2 px-4 mb-3 neumorphic-input flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow font-semibold transition-all duration-150 relative overflow-hidden group ${loadingProvider === "github" ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <span className="text-xl"><FaGithub /></span>
          {loadingProvider === "github" ? <span className="animate-spin ml-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : "Login dengan GitHub"}
        </button>
        <button
          onClick={() => handleButtonClick("facebook")}
          disabled={loadingProvider === "facebook"}
          className={`w-full py-2 px-4 mb-3 neumorphic-input flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow font-semibold transition-all duration-150 relative overflow-hidden group ${loadingProvider === "facebook" ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <span className="text-xl"><FaFacebookF /></span>
          {loadingProvider === "facebook" ? <span className="animate-spin ml-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : "Login dengan Facebook"}
        </button>
        <p className="text-center text-gray-500 mt-4 text-sm">Koin lebih banyak setelah login!</p>
      </div>
    </div>
  );
}
