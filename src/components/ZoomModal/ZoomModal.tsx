import React, { useState, useRef } from 'react';
import type { ComicPage } from '../../types/comic';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import './ZoomModal.css';

interface ZoomModalProps {
  page: ComicPage | null;
  onClose: () => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ page, onClose }) => {
  const [scale, setScale] = useState<number>(1.2);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!page) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.4, 4.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.4, 0.8));
  const handleReset = () => {
    setScale(1.2);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.2, 4.0));
    } else {
      setScale((prev) => Math.max(prev - 0.2, 0.8));
    }
  };

  return (
    <div className="zoom-backdrop" onClick={onClose}>
      <div
        className="zoom-stage"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <img
          src={page.src}
          alt={`Página ${page.pageNumber}`}
          className="zoom-image"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          draggable={false}
        />
      </div>

      {/* Floating Zoom Controls */}
      <div className="zoom-controls glass-pill" onClick={(e) => e.stopPropagation()}>
        <span className="zoom-label">Pág. {page.pageNumber} • {Math.round(scale * 100)}%</span>
        <div className="zoom-divider" />
        <button type="button" className="icon-btn-sm" onClick={handleZoomOut} title="Alejar (-)">
          <ZoomOut size={16} />
        </button>
        <button type="button" className="icon-btn-sm" onClick={handleReset} title="Restablecer (100%)">
          <RotateCcw size={15} />
        </button>
        <button type="button" className="icon-btn-sm" onClick={handleZoomIn} title="Acercar (+)">
          <ZoomIn size={16} />
        </button>
        <div className="zoom-divider" />
        <button type="button" className="icon-btn-sm close-accent" onClick={onClose} title="Cerrar visor (Esc)">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
