import React, { useState } from 'react';
import {
  BookOpen,
  Scroll,
  Maximize,
  Minimize,
  LayoutGrid,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Move
} from 'lucide-react';
import type { ReaderMode } from '../../types/comic';
import type { WebtoonZoomControls } from '../../hooks/useWebtoonZoom';
import './SideDock.css';

interface SideDockProps {
  title: string;
  currentPage: number;
  totalPages: number;
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onOpenHelp: () => void;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  visible: boolean;
  onToggleVisible: () => void;
  zoomControls?: WebtoonZoomControls;
}

export const SideDock: React.FC<SideDockProps> = ({
  title,
  currentPage,
  totalPages,
  mode,
  onModeChange,
  isFullscreen,
  onToggleFullscreen,
  isDrawerOpen,
  onToggleDrawer,
  onOpenHelp,
  onPageChange,
  onPrev,
  onNext,
  visible,
  onToggleVisible,
  zoomControls,
}) => {
  const percent = Math.round((currentPage / totalPages) * 100) || 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPageChange(parseInt(e.target.value, 10));
  };

  return (
    <>
      {/* Floating Collapsed Button (shown when dock is hidden) */}
      <button
        type="button"
        className={`sidedock-floating-toggle ${!visible ? 'visible' : ''}`}
        onClick={onToggleVisible}
        title="Mostrar panel de controles lateral (M)"
        aria-label="Abrir controles"
      >
        <PanelRightOpen size={18} />
        <span className="floating-page-pill">Pág. {currentPage}</span>
      </button>

      {/* Main Side Dock Panel */}
      <aside className={`sidedock-panel glass-panel ${visible ? 'is-visible' : 'is-hidden'}`}>
        {/* Dock Header */}
        <div className="sidedock-section sidedock-header-row">
          <div className="sidedock-brand" title={title}>
            <span className="sidedock-dot" />
            <span className="sidedock-title">{title}</span>
          </div>

          <div className="sidedock-top-actions">
            <button
              type="button"
              className={`icon-btn-sm ${isDrawerOpen ? 'active' : ''}`}
              onClick={onToggleDrawer}
              title="Miniaturas / Páginas (T)"
              aria-label="Selector de páginas"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className="icon-btn-sm"
              onClick={onOpenHelp}
              title="Ayuda y atajos (?)"
              aria-label="Ayuda"
            >
              <HelpCircle size={16} />
            </button>
            <button
              type="button"
              className="icon-btn-sm"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Salir pantalla completa (F)' : 'Pantalla completa (F)'}
              aria-label="Pantalla completa"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
            <button
              type="button"
              className="icon-btn-sm collapse-btn"
              onClick={onToggleVisible}
              title="Ocultar panel lateral (para lectura 100% inmersiva)"
              aria-label="Ocultar panel"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="sidedock-section">
          <div className="sidedock-section-title">// MODO DE LECTURA</div>
          <div className="sidedock-mode-group">
            <button
              type="button"
              className={`sidedock-mode-btn ${mode === 'webtoon' ? 'active' : ''}`}
              onClick={() => onModeChange('webtoon')}
              title="Lectura continua vertical fluida"
            >
              <Scroll size={15} />
              <span>Webtoon</span>
            </button>
            <button
              type="button"
              className={`sidedock-mode-btn ${mode === 'book' ? 'active' : ''}`}
              onClick={() => onModeChange('book')}
              title="Páginas dobles como libro físico"
            >
              <BookOpen size={15} />
              <span>Libro</span>
            </button>
          </div>
        </div>

        {/* Navigation & Scrubber */}
        <div className="sidedock-section">
          <div className="sidedock-nav-header">
            <div className="sidedock-page-readout">
              <span className="readout-prefix">// PÁGINA</span>
              <span className="readout-current">{String(currentPage).padStart(2, '0')}</span>
              <span className="readout-total">/ {totalPages}</span>
            </div>
            <div className="sidedock-sync-badge">{percent}% SYNC</div>
          </div>

          {/* Scrubber slider */}
          <div className="sidedock-slider-container">
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handleSliderChange}
              className="sidedock-page-slider"
              aria-label="Selector de página"
            />
            <div
              className="sidedock-slider-fill"
              style={{ width: `${((currentPage - 1) / Math.max(1, totalPages - 1)) * 100}%` }}
            />
          </div>

          {/* Prev / Next Buttons */}
          <div className="sidedock-nav-buttons">
            <button
              type="button"
              className="cyber-btn prev-btn"
              onClick={onPrev}
              disabled={currentPage <= 1}
              title="Página anterior (← o A)"
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              className="cyber-btn cyber-btn-pink next-btn"
              onClick={onNext}
              disabled={currentPage >= totalPages}
              title="Página siguiente (→ o D o Espacio)"
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Webtoon Zoom & Fit Controls (Only in Webtoon mode) */}
        {mode === 'webtoon' && zoomControls && (
          <div className="sidedock-section sidedock-zoom-section">
            <div className="sidedock-section-title">
              <div className="title-with-icon">
                <Sparkles size={13} className="text-accent" />
                <span>ZOOM & ENFOQUE</span>
              </div>
              {zoomControls.isZoomedWide && (
                <div className="sidedock-pan-pill">
                  <Move size={11} />
                  <span>ARRASTRE</span>
                </div>
              )}
            </div>

            {/* Slider zoom */}
            <div className="sidedock-zoom-row">
              <button
                type="button"
                className="icon-btn-sm"
                onClick={zoomControls.handleZoomOut}
                disabled={zoomControls.fitMode === 'custom' && zoomControls.zoomPercent <= 50}
                title="Alejar (-)"
              >
                <ZoomOut size={15} />
              </button>
              <div className="zoom-slider-wrap">
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="5"
                  value={
                    zoomControls.fitMode === 'comfort'
                      ? 100
                      : zoomControls.fitMode === 'fit-width'
                      ? 120
                      : zoomControls.zoomPercent
                  }
                  onChange={(e) => zoomControls.applyZoom(Number(e.target.value))}
                  className="sidedock-zoom-slider"
                  aria-label="Nivel de zoom"
                />
              </div>
              <button
                type="button"
                className="icon-btn-sm"
                onClick={zoomControls.handleZoomIn}
                disabled={zoomControls.fitMode === 'custom' && zoomControls.zoomPercent >= 350}
                title="Acercar (+)"
              >
                <ZoomIn size={15} />
              </button>
              <div
                className="sidedock-percent-badge"
                onClick={zoomControls.handleResetComfort}
                title="Restablecer a lectura (100%)"
              >
                {zoomControls.fitMode === 'fit-width' ? 'ANCHO' : `${zoomControls.zoomPercent}%`}
              </div>
            </div>

            {/* Presets */}
            <div className="sidedock-presets-grid">
              <button
                type="button"
                className={`preset-pill ${zoomControls.fitMode === 'fit-width' ? 'active' : ''}`}
                onClick={zoomControls.handleFitWidth}
                title="Ajustar al ancho de pantalla"
              >
                <Maximize2 size={12} />
                <span>Ajustar Ancho</span>
              </button>
              <button
                type="button"
                className={`preset-pill ${zoomControls.fitMode === 'comfort' ? 'active' : ''}`}
                onClick={zoomControls.handleResetComfort}
                title="Lectura óptima (850px)"
              >
                <RotateCcw size={12} />
                <span>Lectura</span>
              </button>
              <button
                type="button"
                className={`preset-pill ${
                  zoomControls.fitMode === 'custom' &&
                  zoomControls.zoomPercent >= 180 &&
                  zoomControls.zoomPercent <= 195
                    ? 'active'
                    : ''
                }`}
                onClick={zoomControls.handleNative100}
                title="Resolución real nativa 1:1"
              >
                <span>100% Real</span>
              </button>
              <button
                type="button"
                className={`preset-pill ${
                  zoomControls.fitMode === 'custom' && zoomControls.zoomPercent >= 240 ? 'active' : ''
                }`}
                onClick={() => zoomControls.applyZoom(250)}
                title="Super Zoom (250%)"
              >
                <span>250%</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
