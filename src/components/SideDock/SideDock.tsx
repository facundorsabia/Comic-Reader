import React, { useState, useRef, useEffect } from 'react';
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
  Move,
  GripHorizontal,
  BookmarkCheck,
} from 'lucide-react';
import type { ReaderMode } from '../../types/comic';
import type { WebtoonZoomControls } from '../../hooks/useWebtoonZoom';
import './SideDock.css';
import { PanelHeader, CalibrationScale, PageOrSpreadDisplay } from './Instruments';

interface SideDockProps {
  spreadEnabled: boolean;
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
  savedPage?: number | null;
  clearSaved?: () => void;
}

export const SideDock: React.FC<SideDockProps> = ({
  spreadEnabled,
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
  savedPage,
  clearSaved,
}) => {
  const first = mode === 'book' && spreadEnabled && currentPage > 1 ? currentPage - currentPage % 2 : currentPage;
  const last = mode === 'book' && spreadEnabled && first > 1 ? Math.min(first + 1, totalPages) : first;

  // Draggable panel state
  const [dockPos, setDockPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingDock, setIsDraggingDock] = useState(false);
  const dragStartRef = useRef<{ startMouseX: number; startMouseY: number; startDockX: number; startDockY: number }>({
    startMouseX: 0,
    startMouseY: 0,
    startDockX: 0,
    startDockY: 0,
  });

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent dragging when clicking buttons, sliders, etc.
    if ((e.target as HTMLElement).closest('button, input, a')) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDraggingDock(true);
    dragStartRef.current = {
      startMouseX: clientX,
      startMouseY: clientY,
      startDockX: dockPos.x,
      startDockY: dockPos.y,
    };
  };

  useEffect(() => {
    if (!isDraggingDock) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.startMouseX;
      const deltaY = clientY - dragStartRef.current.startMouseY;

      setDockPos({
        x: Math.max(-window.innerWidth + 400, Math.min(0, dragStartRef.current.startDockX + deltaX)),
        y: Math.max(0, Math.min(24, dragStartRef.current.startDockY + deltaY)),
      });
    };

    const handleMouseUp = () => {
      setIsDraggingDock(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingDock]);

  useEffect(() => {
    const reset = () => setDockPos({ x: 0, y: 0 });
    window.addEventListener('resize', reset);
    return () => window.removeEventListener('resize', reset);
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPageChange(parseInt(e.target.value, 10));
  };

  return (
    <>
      {/* Floating Collapsed Widget with Mode Switcher (shown when dock is hidden) */}
      <div className={`sidedock-floating-widget ${!visible ? 'visible' : ''}`}>
        <button
          type="button"
          className="sidedock-floating-toggle"
          onClick={onToggleVisible}
          title="Mostrar panel de controles (Esc)"
          aria-label="Abrir controles"
        >
          <PanelRightOpen size={16} />
          <span className="floating-page-pill">Ver Controles • Pág. {currentPage}</span>
        </button>

        <div className="sidedock-floating-mode-switch">
          <span className="floating-mode-label">MODO</span>
          <div className="floating-mode-pill-group">
            <button
              type="button"
              className={`floating-mode-btn ${mode === 'webtoon' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onModeChange('webtoon');
              }}
              title="Modo Webtoon (Scroll Vertical)"
            >
              <Scroll size={12} />
              <span>WEB</span>
            </button>
            <button
              type="button"
              className={`floating-mode-btn ${mode === 'book' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onModeChange('book');
              }}
              title="Modo Libro (Páginas 3D)"
            >
              <BookOpen size={12} />
              <span>BOOK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Side Dock Panel (Draggable & Movable) */}
      <aside
        aria-label="Terminal de lectura"
        inert={!visible}
        className={`sidedock-panel glass-panel ${visible ? 'is-visible' : 'is-hidden'} ${isDraggingDock ? 'is-dragging' : ''}`}
        style={{
          transform: visible
            ? `translate3d(${dockPos.x}px, ${dockPos.y}px, 0)`
            : 'translateX(calc(100% + 40px))',
        }}
      >
        {/* Top Drag Grip Bar */}
        <div
          className="sidedock-drag-bar"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          title="Haz clic y arrastra para mover este panel por la pantalla"
        >
          <GripHorizontal size={15} className="drag-icon" />
          <span className="drag-label">ARRASTRAR / MOVER PANEL</span>
        </div>

        {/* Dock Header & Main Action Buttons */}
        <div className="sidedock-section sidedock-header-row">
          <PanelHeader title={title} />

          {/* Explicit Text Buttons: Pantalla Completa & Minimizar */}
          <div className="sidedock-main-actions-grid">
            <button
              type="button"
              className={`sidedock-action-btn ${isFullscreen ? 'active' : ''}`}
              aria-pressed={isFullscreen}
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Activar pantalla completa (F)'}
              aria-label="Pantalla completa"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              <span>{isFullscreen ? 'Salir Fullscreen' : 'Pantalla Completa'}</span>
            </button>

            <button
              type="button"
              className="sidedock-action-btn sidedock-minimize-btn"
              onClick={onToggleVisible}
              title="Minimizar / Ocultar panel de controles (Esc)"
              aria-label="Minimizar controles"
            >
              <PanelRightClose size={16} />
              <span>Minimizar</span>
            </button>
          </div>

          {/* Secondary Actions: Miniaturas y Ayuda con texto claro */}
          <div className="sidedock-sub-actions-row">
            <button
              type="button"
              className={`sidedock-sub-btn ${isDrawerOpen ? 'active' : ''}`}
              aria-pressed={isDrawerOpen}
              onClick={onToggleDrawer}
              title="Abrir índice visual de páginas (T)"
              aria-label="Selector de páginas"
            >
              <LayoutGrid size={14} />
              <span>Miniaturas</span>
            </button>
            <button
              type="button"
              className="sidedock-sub-btn"
              onClick={onOpenHelp}
              title="Ver atajos de teclado y ayuda (?)"
              aria-label="Ayuda"
            >
              <HelpCircle size={14} />
              <span>Ayuda</span>
            </button>
          </div>
        </div>

        <div className="mv-system-status"><i aria-hidden="true" /> ARCHIVO DISPONIBLE <span>MV—1138—A</span></div>

        {/* Unified Saved Reading Progress Banner */}
        {savedPage && savedPage !== currentPage && (
          <div className="sidedock-section sidedock-resume-section">
            <div className="sidedock-resume-banner">
              <div className="resume-banner-top">
                <BookmarkCheck size={15} className="text-accent" />
                <span className="resume-banner-label">LECTURA ANTERIOR</span>
              </div>
              <div className="resume-banner-text">
                Página guardada: <strong>Pág. {savedPage}</strong>
              </div>
              <div className="resume-banner-actions">
                <button
                  type="button"
                  className="cyber-resume-btn"
                  onClick={() => {
                    onPageChange(savedPage);
                    if (clearSaved) clearSaved();
                  }}
                  title={`Ir directamente a la página ${savedPage}`}
                >
                  Continuar en Pág. {savedPage}
                </button>
                <button
                  type="button"
                  className="cyber-resume-dismiss-btn"
                  onClick={clearSaved}
                  title="Descartar aviso"
                  aria-label="Descartar aviso de lectura guardada"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="sidedock-section">
          <div className="sidedock-section-title">// MODO DE LECTURA</div>
          <div className="sidedock-mode-group">
            <button
              type="button"
              className={`sidedock-mode-btn ${mode === 'webtoon' ? 'active' : ''}`}
              aria-pressed={mode === 'webtoon'}
              onClick={() => onModeChange('webtoon')}
              title="Lectura continua vertical fluida"
            >
              <Scroll size={15} />
              <span>Webtoon</span>
            </button>
            <button
              type="button"
              className={`sidedock-mode-btn ${mode === 'book' ? 'active' : ''}`}
              aria-pressed={mode === 'book'}
              onClick={() => onModeChange('book')}
              title="Páginas dobles como libro físico"
            >
              <BookOpen size={15} />
              <span>Libro</span>
            </button>
          </div>
        </div>

        {/* Navigation & Scrubber */}
        <div className="sidedock-section mv-navigation">
          <PageOrSpreadDisplay current={first} end={last} total={totalPages} />
          <CalibrationScale min={1} max={totalPages} value={currentPage} label="Selector de página" onChange={handleSliderChange} />

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
              disabled={last >= totalPages}
              title="Página siguiente (→ o D o Espacio)"
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Webtoon & Book Zoom Controls */}
        {zoomControls && (
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
                  max="400"
                  step="5"
                  value={
                    zoomControls.fitMode === 'comfort'
                      ? 100
                      : zoomControls.fitMode === 'fit-width'
                      ? (mode === 'book' ? 135 : 100)
                      : zoomControls.zoomPercent
                  }
                  onChange={(e) => zoomControls.applyZoom(Number(e.target.value))}
                  className="sidedock-zoom-slider"
                  aria-label="Nivel de zoom"
                />
                <div className="mv-zoom-ticks" aria-hidden="true">{[50, 100, 200, 300, 400].map(n => <span key={n} style={{left: `${(n - 50) / 350 * 100}%`}}>{n}</span>)}</div>
              </div>
              <button
                type="button"
                className="icon-btn-sm"
                onClick={zoomControls.handleZoomIn}
                disabled={zoomControls.fitMode === 'custom' && zoomControls.zoomPercent >= 400}
                title="Acercar (+)"
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                className="sidedock-percent-badge"
                onClick={zoomControls.handleResetComfort}
                title="Restablecer a lectura (100%)"
              >
                {zoomControls.fitMode === 'fit-width' ? 'ANCHO' : `${zoomControls.zoomPercent}%`}
              </button>
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
        <footer className="mv-footer"><span>EL CONOCIMIENTO PERDURA</span><span aria-hidden="true">MULTIVAC ∞</span></footer>
      </aside>
    </>
  );
};
