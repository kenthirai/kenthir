"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, Minus, Plus, X, Layers, ImageDown,
    Repeat, Sparkles, ChevronUp, ChevronDown, ZoomIn, ImageIcon as FileImage, Upload, Wand2, Text, Image as ImageIconLucide, Move, Grid3x3
} from 'lucide-react';

// Komponen untuk bagian yang bisa ditutup/buka
export const CollapsibleSection = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-gray-500/20 pt-2 mt-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-2 text-left">
                <h4 className="font-semibold flex items-center gap-2">{icon} {title}</h4>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && <div className="py-2 space-y-4">{children}</div>}
        </div>
    );
};

export const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const NeumorphicButton = ({ children, onClick, className = '', as = 'button', loading, loadingText = "Processing...", active, ...props }) => {
  const Component = as;
  const activeStyle = active ? { boxShadow: 'var(--shadow-inset)' } : {};
  return (
    <Component
      onClick={onClick}
      disabled={loading || props.disabled}
      className={`p-3 rounded-xl transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 ${className} ${loading || props.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-outset)', ...activeStyle }}
      onMouseDown={(e) => !loading && !props.disabled && !active && (e.currentTarget.style.boxShadow = 'var(--shadow-inset)')}
      onMouseUp={(e) => !loading && !props.disabled && !active && (e.currentTarget.style.boxShadow = 'var(--shadow-outset)')}
      onMouseLeave={(e) => !loading && !props.disabled && !active && (e.currentTarget.style.boxShadow = 'var(--shadow-outset)')}
      {...props}
    >
      {loading ? <><Spinner /> {loadingText}</> : children}
    </Component>
  );
};

export const Toasts = ({ toasts }) => {
  return (
    <div className="fixed bottom-5 left-5 z-[100] flex flex-col items-start space-y-2">
      {toasts.map((toast) => {
        const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
        return (
          <div key={toast.id} className={`p-4 rounded-xl text-white shadow-lg animate-fade-in-up ${colors[toast.type]}`}>
            {toast.message}
          </div>
        );
      })}
    </div>
  );
};

// ImageEditorModal Dihapus dari sini karena sudah diintegrasikan ke GeneratedContentDisplay

const compressImage = (file, maxWidth = 800, quality = 0.7) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = event => { const img = new Image(); img.src = event.target.result; img.onload = () => { const canvas = document.createElement('canvas'); let { width, height } = img; if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } } else { if (height > maxWidth) { width *= maxWidth / height; height = maxWidth; } } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', quality)); }; img.onerror = reject; }; reader.onerror = reject; });

export const ImageAnalysisModal = ({ isOpen, onClose, onPromptGenerated, showToast }) => {
    const [previewSrc, setPreviewSrc] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 2 * 1024 * 1024) { // 2MB limit
                showToast('Ukuran file tidak boleh melebihi 2MB.', 'error');
                return;
            }
            try {
                const compressedImageSrc = await compressImage(file);
                setPreviewSrc(compressedImageSrc);
                setAnalysisResult('');
            } catch (error) { showToast('Gagal memproses gambar.', 'error'); console.error(error); }
        }
    };

    const handleAnalyze = async () => {
        if (!previewSrc) { showToast('Silakan unggah gambar terlebih dahulu.', 'error'); return; }
        setIsAnalyzing(true); setAnalysisResult('');
        try {
            const response = await fetch('/api/analyze-image', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: previewSrc })
            });
            if (!response.ok || !response.body) { const errorData = await response.json(); throw new Error(errorData.error || 'Analisis gagal.'); }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.substring(6).trim();
                        if (dataStr === "[DONE]") continue;
                        try {
                            const jsonData = JSON.parse(dataStr);
                            const textChunk = jsonData?.choices?.[0]?.delta?.content;
                            if (textChunk) { setAnalysisResult(prev => prev + textChunk); }
                        } catch (e) { console.error("Error parsing stream chunk:", e); }
                    }
                }
            }
        } catch (error) { showToast(error.message, 'error'); setAnalysisResult('Gagal menganalisis gambar. Silakan coba lagi.'); }
        finally { setIsAnalyzing(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="p-6 rounded-2xl w-full max-w-2xl flex flex-col gap-4 neumorphic-card" style={{ background: 'var(--bg-color)' }}>
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold flex items-center gap-2"><FileImage size={22}/> Analisis Gambar untuk Prompt</h2><NeumorphicButton onClick={onClose} className="!p-2"><X size={20} /></NeumorphicButton></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg flex flex-col items-center justify-center gap-3" style={{boxShadow:'var(--shadow-inset)'}}><input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>{previewSrc ? (<img src={previewSrc} alt="Pratinjau Gambar" className="max-h-48 w-auto rounded-lg" />) : (<div className="text-center opacity-70"><FileImage size={48} className="mx-auto"/> <p>Pilih gambar</p></div>)}<NeumorphicButton onClick={() => fileInputRef.current.click()} className="w-full text-sm !p-2"><Upload size={16}/> {previewSrc ? 'Ganti Gambar' : 'Unggah Gambar'}</NeumorphicButton></div>
                    <div className="p-4 rounded-lg flex flex-col" style={{boxShadow:'var(--shadow-inset)'}}><h4 className="font-semibold mb-2">Hasil Analisis</h4><div className="flex-grow min-h-[100px] text-sm overflow-y-auto pr-2">{isAnalyzing && <div className="flex items-center gap-2"><Spinner/> Menganalisis...</div>}{analysisResult && <p className="whitespace-pre-wrap">{analysisResult}</p>}{!isAnalyzing && !analysisResult && <p className="opacity-60">Deskripsi gambar akan muncul di sini.</p>}</div></div>
                </div>
                <div className="flex gap-4">
                    <NeumorphicButton onClick={handleAnalyze} loading={isAnalyzing} loadingText="Menganalisis..." className="w-full font-bold" disabled={!previewSrc}><Sparkles size={18}/> Analisis</NeumorphicButton>
                    <NeumorphicButton onClick={() => onPromptGenerated(analysisResult)} className="w-full font-bold" disabled={!analysisResult || isAnalyzing}><Wand2 size={18}/> Gunakan Prompt Ini</NeumorphicButton>
                </div>
            </div>
        </div>
    );
};