// app/generator/components/ImageViewer.js
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, Minus, Plus, Search } from 'lucide-react';
import { useTheme } from 'next-themes'; // <-- Import useTheme

export const ImageViewer = ({ image, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startDragPos = useRef({ x: 0, y: 0 });
  const viewerImageRef = useRef(null);
  const { theme } = useTheme(); // <-- Dapatkan tema saat ini

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [image]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      startDragPos.current = {
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      };
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setImagePosition({
      x: e.clientX - startDragPos.current.x,
      y: e.clientY - startDragPos.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] animate-fade-in">
      {/* Tombol Tutup - Warna seragam dengan transparansi */}
      <button onClick={onClose}
              className={`absolute top-4 right-4 p-3 rounded-full flex items-center justify-center transition-colors z-10
                ${theme === 'dark' ? 'bg-white/30 text-black hover:bg-white/50' : 'bg-black/30 text-white hover:bg-black/50'}`}>
        <X size={24} />
      </button>

      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          ref={viewerImageRef}
          src={image.url}
          alt={image.prompt}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
            transition: 'transform 0.1s ease-out',
            userSelect: 'none',
            MozUserSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Kontrol Zoom - Warna seragam dengan transparansi */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl
            ${theme === 'dark' ? 'bg-white/30 text-black' : 'bg-black/30 text-white'}`}>
        <button onClick={handleZoomOut}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors
                    ${theme === 'dark' ? 'bg-white/40 hover:bg-white/60' : 'bg-black/40 hover:bg-black/60'}`}>
            <Minus size={16}/>
        </button>
        <button onClick={handleResetZoom}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors
                    ${theme === 'dark' ? 'bg-white/40 hover:bg-white/60' : 'bg-black/40 hover:bg-black/60'}`}>
            <Search size={16}/>
        </button>
        <button onClick={handleZoomIn}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors
                    ${theme === 'dark' ? 'bg-white/40 hover:bg-white/60' : 'bg-black/40 hover:bg-black/60'}`}>
            <Plus size={16}/>
        </button>
      </div>
    </div>
  );
};