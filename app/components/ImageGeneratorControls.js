"use client";

import { useState } from 'react';
import {
    Settings, X, Wand2, RefreshCw, ChevronsRight, Bookmark, Star, Upload,
    ChevronDown, ChevronUp, Sparkles, Image as ImageIcon, Video, AudioLines,
    SlidersHorizontal, Camera, CloudSun, Copy, MessageSquare, Dices
} from 'lucide-react';

import { NeumorphicButton, CollapsibleSection, Spinner } from '../sharedComponents.js'; // <-- INI PERBAIKANNYA
import { artStyles } from '../artStyles.js';

const ImageGeneratorControls = ({
    prompt, setPrompt, model, handleModelChange, quality, setQuality, sizePreset, setSizePreset,
    useCustomSize, setUseCustomSize, customWidth, setCustomWidth, customHeight, setCustomHeight,
    seed, setSeed, batchSize, setBatchSize, artStyle, setArtStyle,
    isEnhancing, isBuildingPrompt, savedPrompts, setSavedPrompts, activeTab, setActiveTab,
    videoParams, setVideoParams, audioVoice, setAudioVoice, generatedImagePrompt,
    setGeneratedImagePrompt, aiSuggestions, isFetchingSuggestions, fetchAiSuggestions,
    handleRandomPrompt, handleEnhancePrompt, handleGenerate, handleBuildImagePrompt, handleBuildVideoPrompt,
    showToast, turboCountdown
}) => {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [promptCreator, setPromptCreator] = useState({ subject: '', details: '' });

    const handlePromptCreatorChange = (e) => {
        const { name, value } = e.target;
        setPromptCreator(p => ({ ...p, [name]: value }));
    };

    const handleVideoParamsChange = (e) => {
        const { name, value, type } = e.target;
        setVideoParams(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleUseGeneratedPrompt = () => {
        if (generatedImagePrompt) {
            setPrompt(generatedImagePrompt);
            setGeneratedImagePrompt('');
            showToast('Prompt siap digunakan!', 'success');
            setIsCreatorOpen(false);
        }
    };

    const visualStyleOptions = ["Cinematic", "Anime", "Photorealistic", "Watercolor", "Pixel Art", "Cyberpunk", "Retro", "Futuristic"];
    const shotTypeOptions = ["Static", "Slow Pan", "Dolly", "Tracking", "Crane", "Steadycam", "Handheld", "Drone"];
    const cameraAngleOptions = ["Eye Level", "Low Angle", "High Angle", "Dutch Angle", "Overhead", "Point of View"];
    const lensTypeOptions = ["Standard (50mm)", "Wide Angle (24mm)", "Telephoto (85mm+)", "Fisheye", "Anamorphic", "Macro"];
    const dofOptions = ["Shallow", "Medium", "Deep"];
    const timeOfDayOptions = ["Golden Hour", "Blue Hour", "Midday", "Night", "Sunrise", "Sunset", "Twilight"];
    const weatherOptions = ["Clear", "Cloudy", "Rainy", "Foggy", "Snowy", "Stormy"];

    return (
        <div className="p-6 rounded-2xl h-fit space-y-4 neumorphic-card">
            <div className="flex gap-2">
                <NeumorphicButton onClick={() => setActiveTab('image')} active={activeTab === 'image'} className="w-full"><ImageIcon size={16}/>Gambar</NeumorphicButton>
                <NeumorphicButton onClick={() => setActiveTab('video')} active={activeTab === 'video'} className="w-full"><Video size={16}/>Video</NeumorphicButton>
                <NeumorphicButton onClick={() => setActiveTab('audio')} active={activeTab === 'audio'} className="w-full"><AudioLines size={16}/>Audio</NeumorphicButton>
            </div>

            {activeTab === 'image' && (
                <div className='space-y-4'>
                    <label htmlFor="prompt-textarea" className="font-semibold block text-xl">Prompt Gambar</label>
                    <div className="relative">
                        <textarea id="prompt-textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ketik ide gambarmu di sini..." className="w-full p-3 rounded-lg neumorphic-input h-28 resize-none pr-10"/>
                        <button aria-label="Hapus prompt" onClick={() => setPrompt('')} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={18}/></button>
                    </div>

                    <CollapsibleSection title="Butuh Inspirasi?" icon={<Wand2 size={16}/>}>
                        <div className="space-y-2">
                            <button onClick={fetchAiSuggestions} disabled={isFetchingSuggestions} className="w-full text-sm p-2 rounded-lg flex items-center justify-center gap-2" style={{boxShadow: 'var(--shadow-outset)'}}>
                                {isFetchingSuggestions ? <Spinner/> : <RefreshCw size={14}/>}
                                {isFetchingSuggestions ? 'Memuat...' : 'Muat Saran Baru'}
                            </button>
                            {aiSuggestions.map((suggestion, index) => (
                                <div key={index} onClick={() => setPrompt(suggestion)} className="text-xs p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-500/10 neumorphic-input">
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    <div className="space-y-2">
                        <NeumorphicButton onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="w-full text-sm relative !p-3">
                            <span className="flex items-center justify-center gap-2">
                                <Settings size={16} /> Pengaturan
                            </span>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isSettingsOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            </span>
                        </NeumorphicButton>
                        {isSettingsOpen && (
                            <div className="p-4 rounded-lg space-y-4" style={{boxShadow: 'var(--shadow-inset)'}}>
                                <div>
                                    <label htmlFor="art-style-select" className="font-semibold block mb-2 text-sm">Gaya Seni</label>
                                    <select id="art-style-select" value={artStyle} onChange={(e) => setArtStyle(e.target.value)} className="w-full p-3 rounded-lg neumorphic-input bg-[var(--bg-color)]">
                                        <option value="" disabled>-- Select art Style (Optional) --</option>
                                        {artStyles.map(group => (
                                            <optgroup key={group.label} label={group.label}>
                                                {group.options.map(option => (
                                                    <option key={option.value} value={option.value}>{option.name}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="model-select" className="font-semibold block mb-2 text-sm">Model</label>
                                    <select id="model-select" value={model} onChange={handleModelChange} className="w-full p-3 rounded-lg neumorphic-input bg-[var(--bg-color)]">
                                        <option value="flux">Flux</option>
                                        <option value="gptimage">GPT Image</option>
                                        <option value="turbo">Turbo (Password)</option>
                                        <option value="dalle3">DALL-E 3 (Key)</option>
                                        <option value="stability">Stability (Key)</option>
                                        <option value="ideogram">Ideogram (Key)</option>
                                    </select>
                                    {model === 'turbo' && turboCountdown && (
                                        <div className="text-xs text-center mt-2 p-2 rounded-lg" style={{boxShadow:'var(--shadow-inset)'}}>
                                            {turboCountdown !== "Kadaluarsa" ? (
                                                <span>Sisa waktu Turbo: <span className="font-mono font-bold text-green-500">{turboCountdown}</span></span>
                                            ) : (
                                                <span>Sesi Turbo: <span className="font-mono font-bold text-red-500">{turboCountdown}</span></span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="quality-select" className="font-semibold block mb-2 text-sm">Kualitas</label>
                                    <select id="quality-select" value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full p-3 rounded-lg neumorphic-input bg-[var(--bg-color)]">
                                        <option value="standard">Standard</option>
                                        <option value="hd">HD</option>
                                        <option value="ultra">Ultra</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="size-preset-select" className="font-semibold text-sm">Ukuran</label>
                                        <button onClick={() => setUseCustomSize(!useCustomSize)} className="text-sm font-medium">{useCustomSize ? 'Preset' : 'Kustom'}</button>
                                    </div>
                                    {!useCustomSize ? <select id="size-preset-select" value={sizePreset} onChange={(e) => setSizePreset(e.target.value)} className="w-full p-3 rounded-lg neumorphic-input bg-[var(--bg-color)]"><option value="1024x1024">1024x1024</option><option value="1024x1792">1024x1792</option><option value="1792x1024">1792x1024</option></select> : <div className="space-y-3 p-3 rounded-lg" style={{boxShadow: 'var(--shadow-inset)'}}><div><label className="text-sm">Width: {customWidth}px</label><input type="range" min="256" max="2048" step="64" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} className="w-full"/></div><div><label className="text-sm">Height: {customHeight}px</label><input type="range" min="256" max="2048" step="64" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))} className="w-full"/></div></div>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="batch-input" className="font-semibold block mb-2 text-sm">Batch</label>
                                        <input id="batch-input" type="number" min="1" max="10" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} className="w-full p-3 rounded-lg neumorphic-input"/>
                                    </div>
                                    <div>
                                        <label htmlFor="seed-input" className="font-semibold block mb-2 text-sm">Seed</label>
                                        <input id="seed-input" type="text" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Acak" className="w-full p-3 rounded-lg neumorphic-input"/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <NeumorphicButton onClick={() => setIsCreatorOpen(!isCreatorOpen)} className="w-full text-sm">{`Asisten Prompt Gambar`} {isCreatorOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</NeumorphicButton>
                    {isCreatorOpen && 
                        <div className="p-4 rounded-lg space-y-4" style={{boxShadow: 'var(--shadow-inset)'}}>
                            <div>
                                <label className="text-xs font-semibold block mb-1 items-center text-red-500 dark:text-red-400">Subjek (Wajib)<Star className="w-3 h-3 ml-1" fill="currentColor"/></label>
                                <input name="subject" value={promptCreator.subject} onChange={handlePromptCreatorChange} placeholder="cth: seekor kucing astronot" className="w-full p-2 rounded-lg neumorphic-input text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold block mb-1">Detail Tambahan</label>
                                <textarea name="details" value={promptCreator.details} onChange={handlePromptCreatorChange} placeholder="cth: hyperrealistic, 4k" className="w-full p-2 rounded-lg neumorphic-input text-sm h-20 resize-none" />
                            </div>
                            <NeumorphicButton onClick={() => handleBuildImagePrompt(promptCreator)} loading={isBuildingPrompt} loadingText="Membangun..." className="w-full text-sm !p-2">Kembangkan dengan AI</NeumorphicButton>
                            
                            {generatedImagePrompt && (
                                <div className="mt-4 pt-4 border-t border-[var(--shadow-dark)]/50 space-y-3 animate-fade-in">
                                    <h4 className="text-md font-semibold">Hasil Prompt dari AI:</h4>
                                    <div className="w-full p-3 rounded-lg text-sm" style={{boxShadow:'var(--shadow-inset)'}}>
                                        <p className="whitespace-pre-wrap">{generatedImagePrompt}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <NeumorphicButton onClick={() => {navigator.clipboard.writeText(generatedImagePrompt); showToast('Prompt disalin!', 'success')}} className="flex-1 !p-2 text-xs">
                                            <Copy size={14}/> Salin
                                        </NeumorphicButton>
                                        <NeumorphicButton onClick={handleUseGeneratedPrompt} className="flex-1 !p-2 text-xs font-semibold">
                                            <ChevronsRight size={14}/> Gunakan Prompt
                                        </NeumorphicButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                    <div className="flex flex-wrap gap-2">
                        <NeumorphicButton onClick={handleRandomPrompt} className="flex-1 text-sm"><Dices size={16}/>Acak</NeumorphicButton>
                        <NeumorphicButton onClick={handleEnhancePrompt} loading={isEnhancing} loadingText="Memproses..." className="flex-1 text-sm"><Wand2 size={16}/>Sempurnakan</NeumorphicButton>
                        <NeumorphicButton onClick={() => { if (!prompt.trim()) { showToast('Prompt kosong tidak bisa disimpan', 'error'); return; } if (savedPrompts.some(p => p.prompt === prompt.trim())) { showToast('Prompt ini sudah ada di favorit.', 'info'); return; } setSavedPrompts(p => [{prompt: prompt.trim(), date: new Date().toISOString()}, ...p]); showToast('Prompt disimpan!', 'success'); }} className="flex-1 text-sm"><Bookmark size={16}/> Simpan</NeumorphicButton>
                    </div>

                    <div className="pt-2 space-y-2">
                        <NeumorphicButton onClick={() => window.rrAssistantInstance?.toggleChat()} className="w-full text-sm">
                            <MessageSquare size={16} /> RR Assistant
                        </NeumorphicButton>
                    </div>

                    <NeumorphicButton onClick={handleGenerate} loading={isBuildingPrompt || isEnhancing} loadingText="Membuat Gambar..." className="w-full font-bold text-lg"><Sparkles size={18}/>Generate</NeumorphicButton>
                </div>
            )}
            
            {activeTab === 'video' && (
                <div className="space-y-4">
                    <label className="font-semibold block text-xl">Asisten Prompt Video</label>
                    <div>
                        <label className="text-sm font-semibold">Konsep Utama Video</label>
                        <textarea name="concept" value={videoParams.concept} onChange={handleVideoParamsChange} placeholder="Cth: Detektif cyberpunk di gang neon..." className="w-full p-3 mt-1 rounded-lg neumorphic-input h-28 resize-none"/>
                    </div>
                    <CollapsibleSection title="Basic Settings" icon={<SlidersHorizontal size={18}/>}>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-semibold">Gaya Visual</label><select name="visualStyle" value={videoParams.visualStyle} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{visualStyleOptions.map(o=><option key={o} value={o.toLowerCase().replace(/ /g, "-")}>{o}</option>)}</select></div>
                            <div><label className="text-sm font-semibold">Durasi (s)</label><input type="number" name="duration" value={videoParams.duration} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm"/></div>
                            <div><label className="text-sm font-semibold">Aspek Rasio</label><select name="aspectRatio" value={videoParams.aspectRatio} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{["16:9", "9:16", "1:1", "4:3", "21:9"].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                            <div><label className="text-sm font-semibold">Frame Rate</label><select name="fps" value={videoParams.fps} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{[24, 30, 60, 120].map(o=><option key={o} value={o}>{o} fps</option>)}</select></div>
                        </div>
                    </CollapsibleSection>
                    <CollapsibleSection title="Cinematography" icon={<Camera size={18}/>}>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-semibold">Gerakan Kamera</label><select name="cameraMovement" value={videoParams.cameraMovement} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{shotTypeOptions.map(o=><option key={o} value={o.toLowerCase().replace(/ /g, "-")}>{o}</option>)}</select></div>
                            <div><label className="text-sm font-semibold">Sudut Kamera</label><select name="cameraAngle" value={videoParams.cameraAngle} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{cameraAngleOptions.map(o=><option key={o} value={o.toLowerCase().replace(/ /g, "-")}>{o}</option>)}</select></div>
                            <div><label className="text-sm font-semibold">Tipe Lensa</label><select name="lensType" value={videoParams.lensType} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{lensTypeOptions.map(o=><option key={o} value={o.toLowerCase().replace(/ /g, "-")}>{o}</option>)}</select></div>
                            <div><label className="text-sm font-semibold">Depth of Field</label><select name="depthOfField" value={videoParams.depthOfField} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{dofOptions.map(o=><option key={o} value={o.toLowerCase()}>{o}</option>)}</select></div>
                        </div>
                    </CollapsibleSection>
                    <CollapsibleSection title="Visual Effects" icon={<Sparkles size={18}/>}>
                        <div><label className="text-sm font-semibold">Film Grain ({videoParams.filmGrain}%)</label><input type="range" name="filmGrain" value={videoParams.filmGrain} onChange={handleVideoParamsChange} min="0" max="100" className="w-full"/></div>
                        <div><label className="text-sm font-semibold">Chromatic Aberration ({videoParams.chromaticAberration}%)</label><input type="range" name="chromaticAberration" value={videoParams.chromaticAberration} onChange={handleVideoParamsChange} min="0" max="100" className="w-full"/></div>
                    </CollapsibleSection>
                    <CollapsibleSection title="Mood & Atmosphere" icon={<CloudSun size={18}/>}>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-semibold">Waktu</label><select name="timeOfDay" value={videoParams.timeOfDay} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{timeOfDayOptions.map(o=><option key={o} value={o.toLowerCase().replace(/ /g, "-")}>{o}</option>)}</select></div>
                            <div><label className="text-sm font-semibold">Cuaca</label><select name="weather" value={videoParams.weather} onChange={handleVideoParamsChange} className="w-full p-2 mt-1 rounded-lg neumorphic-input text-sm bg-[var(--bg-color)]">{weatherOptions.map(o=><option key={o} value={o.toLowerCase()}>{o}</option>)}</select></div>
                        </div>
                    </CollapsibleSection>
                    <NeumorphicButton onClick={handleBuildVideoPrompt} loading={isBuildingPrompt} loadingText="Membangun..." className="w-full !mt-6 font-bold text-lg"><Sparkles size={18}/>Buat Prompt Video</NeumorphicButton>
                </div>
            )}

            {activeTab === 'audio' && (
                <div className="space-y-4">
                    <label className="font-semibold block text-xl">Teks untuk Audio</label>
                    <div className="relative">
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ketik kalimat untuk diubah jadi suara..." className="w-full p-3 rounded-lg neumorphic-input h-28 resize-none pr-10"/>
                        <button onClick={() => setPrompt('')} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={18}/></button>
                    </div>
                    <div>
                        <label className="font-semibold block mb-2">Pilih Suara</label>
                        <select value={audioVoice} onChange={(e) => setAudioVoice(e.target.value)} className="w-full p-3 rounded-lg neumorphic-input bg-[var(--bg-color)]">
                            <option value="alloy">Alloy</option>
                            <option value="echo">Echo</option>
                            <option value="fable">Fable</option>
                            <option value="onyx">Onyx</option>
                            <option value="nova">Nova</option>
                            <option value="shimmer">Shimmer</option>
                        </select>
                    </div>
                    <NeumorphicButton onClick={handleGenerate} loading={isBuildingPrompt} loadingText="Membuat Audio..." className="w-full font-bold text-lg"><Sparkles size={18}/>Generate</NeumorphicButton>
                </div>
            )}
        </div>
    );
};

export default ImageGeneratorControls;