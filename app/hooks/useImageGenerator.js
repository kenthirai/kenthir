"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export const useImageGenerator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux');
  const [quality, setQuality] = useState('hd');
  const [sizePreset, setSizePreset] = useState('1024x1024');
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [customWidth, setCustomWidth] = useState(1024);
  const [customHeight, setCustomHeight] = useState(1024);
  const [seed, setSeed] = useState('');
  const [batchSize, setBatchSize] = useState(1);
  const [artStyle, setArtStyle] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isBuildingPrompt, setIsBuildingPrompt] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [generationHistory, setGenerationHistory] = useState([]);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('image');
  const [videoParams, setVideoParams] = useState({
      concept: '', visualStyle: 'cinematic', duration: 10, aspectRatio: '16:9',
      fps: 24, cameraMovement: 'static', cameraAngle: 'eye-level', lensType: 'standard',
      depthOfField: 'medium', filmGrain: 20, chromaticAberration: 10,
      colorGrading: 'neutral', timeOfDay: 'midday', weather: 'clear'
  });
  const [audioVoice, setAudioVoice] = useState('alloy');
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [generatedVideoPrompt, setGeneratedVideoPrompt] = useState('');
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const canvasRef = useRef(null);

  const { width, height } = useMemo(() => {
    if (useCustomSize) return { width: customWidth, height: customHeight };
    const [w, h] = sizePreset.split('x').map(Number);
    return { width: w, height: h };
  }, [useCustomSize, customWidth, customHeight, sizePreset]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), duration);
  }, []);

  const fetchAiSuggestions = useCallback(async () => {
    setIsFetchingSuggestions(true);
    try {
        const res = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                seed: Math.floor(Math.random() * 1000000),
                messages: [{
                    role: 'system',
                    content: 'You are a creative prompt generator. Generate 3 diverse, creative, and detailed prompts for an AI image generator. Each prompt must be on a new line. Do not number them.'
                }, {
                    role: 'user',
                    content: 'Give me 3 creative prompts.'
                }]
            })
        });
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const data = await res.json();
        const suggestionsText = data.choices[0]?.message?.content;
        if (suggestionsText) {
            const suggestions = suggestionsText.split('\n').filter(p => p.trim() !== '');
            setAiSuggestions(suggestions);
        } else {
            throw new Error('No suggestions in response');
        }
    } catch (err) {
        showToast('Gagal memuat saran prompt AI.', 'error');
        setAiSuggestions([
            "A majestic lion wearing a crown in a futuristic city",
            "A serene japanese garden with a koi pond and cherry blossoms",
            "An astronaut playing a guitar on the moon, with Earth in the background",
        ]);
    } finally {
        setIsFetchingSuggestions(false);
    }
  }, [showToast]);

  const handleRandomPrompt = () => {
    if (aiSuggestions.length === 0) {
      showToast('Saran prompt sedang dimuat, coba lagi sesaat.', 'info');
      if (!isFetchingSuggestions) {
          fetchAiSuggestions();
      }
      return;
    }
    const randomIndex = Math.floor(Math.random() * aiSuggestions.length);
    setPrompt(aiSuggestions[randomIndex]);
    showToast('Prompt acak telah dimuat!', 'success');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
        try {
            const savedState = JSON.parse(localStorage.getItem('aiImageGeneratorState_v18') || '{}');
            if (savedState) {
                // HAPUS LOGIKA PROMPT DARI SINI
                setModel(savedState.model || 'flux'); 
                setQuality(savedState.quality || 'hd'); 
                setSizePreset(savedState.sizePreset || '1024x1024'); 
                setApiKey(savedState.apiKey || ''); 
                setGenerationHistory(savedState.generationHistory || []); 
                setSavedPrompts(savedState.savedPrompts || []); 
                setBatchSize(savedState.batchSize || 1); 
                setSeed(savedState.seed || ''); 
                setUseCustomSize(savedState.useCustomSize || false); 
                setCustomWidth(savedState.customWidth || 1024); 
                setCustomHeight(savedState.customHeight || 1024); 
                setArtStyle(savedState.artStyle || '');
            }
        } catch (e) { console.error("Gagal memuat state:", e); }
        fetchAiSuggestions();
    }
  }, [isMounted, fetchAiSuggestions]);

  useEffect(() => {
    if (!isMounted) return;
    try {
        const stateToSave = { prompt, model, quality, sizePreset, apiKey, generationHistory, savedPrompts, batchSize, seed, useCustomSize, customWidth, customHeight, artStyle };
        localStorage.setItem('aiImageGeneratorState_v18', JSON.stringify(stateToSave));
    } catch(e) { console.error("Gagal menyimpan state:", e); }
  }, [isMounted, prompt, model, quality, sizePreset, apiKey, generationHistory, savedPrompts, batchSize, seed, useCustomSize, customWidth, customHeight, artStyle]);

  const handleEnhancePrompt = async () => { if (!prompt.trim()) { showToast('Prompt tidak boleh kosong.', 'error'); return; } setIsEnhancing(true); try { const res = await fetch('https://text.pollinations.ai/openai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: 'Rewrite the user prompt to be more vivid and artistic for an AI image generator. Respond only with the enhanced prompt.' },{ role: 'user', content: prompt }] }) }); if (!res.ok) throw new Error(`API Error: ${res.statusText}`); const data = await res.json(); const enhanced = data.choices[0]?.message?.content; if (enhanced) { setPrompt(enhanced.trim()); showToast('Prompt berhasil disempurnakan!', 'success'); } else { throw new Error('Gagal memproses respons API.'); } } catch (err) { showToast(err.message, 'error'); } finally { setIsEnhancing(false); } };

  const handleGenerate = async () => {
    if (activeTab === 'video') { showToast('Gunakan tombol "Buat Prompt Video" di dalam Asisten.', 'info'); return; }
    if (!prompt.trim()) { showToast('Prompt tidak boleh kosong.', 'error'); return; }
    setLoading(true);
    if (activeTab === 'image') await handleGenerateImage();
    else if (activeTab === 'audio') await handleGenerateAudio();
    setLoading(false);
  };

  const handleGenerateImage = async () => {
    setGeneratedImages([]);
    const finalPrompt = `${artStyle} ${prompt}`;
    const promises = Array.from({ length: batchSize }, () => {
        const currentSeed = seed || Math.floor(Math.random() * 1e9);
        let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?model=${model}&width=${width}&height=${height}&quality=${quality}&seed=${currentSeed}&nologo=true&safe=false&referrer=ruangriung.my.id`;
        if (apiKey) url += `&apikey=${apiKey}`;
        return fetch(url).then(res => res.ok ? { url: res.url, seed: currentSeed, prompt: finalPrompt, date: new Date().toISOString() } : Promise.reject(new Error(`Gagal membuat gambar (status: ${res.status})`)));
    });
    try {
        const results = await Promise.all(promises);
        setGeneratedImages(results);
        setGenerationHistory(prev => [...results, ...prev]);
        showToast(`Berhasil!`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
  };

  const handleGenerateAudio = async () => {
    setGeneratedAudio(null);
    try {
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-audio&voice=${audioVoice}`);
        if (!res.ok) throw new Error(`Gagal membuat audio (status: ${res.status})`);
        const blob = await res.blob();
        setGeneratedAudio(URL.createObjectURL(blob));
        showToast(`Audio berhasil dibuat!`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
  };

  const handleBuildImagePrompt = async (promptCreator) => { if (!promptCreator.subject.trim()) { showToast('Subjek tidak boleh kosong.', 'error'); return; } setIsBuildingPrompt(true); setGeneratedImagePrompt(''); setGeneratedVideoPrompt(''); try { const userInput = `Main subject: ${promptCreator.subject}. Additional details: ${promptCreator.details || 'None'}.`; const res = await fetch('https://text.pollinations.ai/openai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [ { role: 'system', content: 'You are a prompt engineer who creates detailed, artistic prompts for image generation. Respond only with the final prompt.' }, { role: 'user', content: userInput }]}) }); if (!res.ok) throw new Error(`API Error: ${res.statusText}`); const data = await res.json(); const newPrompt = data.choices[0]?.message?.content; if (newPrompt) { setGeneratedImagePrompt(newPrompt.trim()); showToast('Prompt gambar dikembangkan oleh AI!', 'success'); } else { throw new Error('Gagal memproses respons API.'); } } catch (err) { showToast(err.message, 'error'); } finally { setIsBuildingPrompt(false); } };
  
  const handleBuildVideoPrompt = async () => { if (!videoParams.concept.trim()) { showToast('Konsep utama video tidak boleh kosong.', 'error'); return; } setIsBuildingPrompt(true); setGeneratedVideoPrompt(''); setGeneratedImagePrompt(''); const allParams = Object.entries(videoParams).map(([key, value]) => (value ? `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}` : null)).filter(Boolean).join('. '); try { const res = await fetch('https://text.pollinations.ai/openai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [ { role: 'system', content: 'You are a professional cinematographer. Based on these parameters, write a complete, coherent, and inspiring video prompt for a text-to-video AI. Combine all elements into a natural paragraph.' }, { role: 'user', content: allParams }]}) }); if (!res.ok) throw new Error(`API Error: ${res.statusText}`); const data = await res.json(); const videoPrompt = data.choices[0]?.message?.content; if (videoPrompt) { setGeneratedVideoPrompt(videoPrompt.trim()); showToast('Prompt video profesional berhasil dibuat!', 'success'); } else { throw new Error('Gagal memproses respons API.'); } } catch (err) { showToast(err.message, 'error'); } finally { setIsBuildingPrompt(false); } };

  return {
    isMounted, prompt, setPrompt, model, setModel, quality, setQuality, sizePreset, setSizePreset,
    useCustomSize, setUseCustomSize, customWidth, setCustomWidth, customHeight, setCustomHeight, seed, setSeed,
    batchSize, setBatchSize, artStyle, setArtStyle, generatedImages, setGeneratedImages, loading, setLoading,
    isEnhancing, isBuildingPrompt, apiKey, setApiKey, generationHistory, setGenerationHistory,
    savedPrompts, setSavedPrompts, toasts, showToast, activeTab, setActiveTab, videoParams, setVideoParams,
    audioVoice, setAudioVoice, generatedAudio, generatedVideoPrompt, generatedImagePrompt, setGeneratedImagePrompt,
    aiSuggestions, isFetchingSuggestions, fetchAiSuggestions, handleRandomPrompt, handleEnhancePrompt,
    handleGenerate, handleBuildImagePrompt, handleBuildVideoPrompt, canvasRef
  };
};