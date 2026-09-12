import React, { useEffect, useRef, useState } from 'react';
import type { ComicPage } from '../../types/comic';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Move, Sparkles } from 'lucide-react';
import { useWebtoonZoom, type WebtoonZoomControls } from '../../hooks/useWebtoonZoom';
import './WebtoonReader.css';

interface WebtoonReaderProps {
  pages: ComicPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onToggleControls: () => void;
  controlsVisible?: boolean;
  zoomControls?: WebtoonZoomControls;
  onMinimizeControls?: () => void;
}

export const WebtoonReader: React.FC<WebtoonReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  onToggleControls,
  controlsVisible = true,
  zoomControls: externalZoom,
  onMinimizeControls,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<any>(null);

  const localZoom = useWebtoonZoom();
  const zoom = externalZoom || localZoom;

  const {
    zoomPercent,
    fitMode,
    isZoomedWide,
    toastMessage,
    applyZoom,
    handleZoomIn,
    handleZoomOut,
    handleResetComfort,
    handleFitWidth,
    handleNative100,
    getFeedWidthStyle,
  } = zoom;

  const [isDragging, setIsDragging] = useState(false);

  // Drag-to-pan state
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const hasDraggedRef = useRef(false);

  // Scroll listener with IntersectionObserver to track active page
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        // Find the entry that has the highest intersection ratio or is visible near the top third
        let bestEntry: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        }

        if (bestEntry && maxRatio > 0.25) {
          const pageNum = parseInt(bestEntry.target.getAttribute('data-page') || '1', 10);
          if (!isNaN(pageNum) && pageNum !== currentPage) {
            onPageChange(pageNum);
          }
        }
      },
      {
        root: containerRef.current,
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
        rootMargin: '-10% 0px -40% 0px',
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [pages, currentPage, onPageChange]);

  // Automatically minimize controls and ensure 122% zoom on user scroll without forcing fullscreen
  const hasTriggeredInitialReadingMode = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScrollActivity = () => {
      if (isProgrammaticScroll.current) return;
      if (onMinimizeControls) {
        onMinimizeControls();
      }
      if (!hasTriggeredInitialReadingMode.current) {
        hasTriggeredInitialReadingMode.current = true;
        if (zoom.zoomPercent !== 122) {
          zoom.applyZoom(122);
        }
      }
    };

    el.addEventListener('scroll', handleScrollActivity, { passive: true });
    el.addEventListener('wheel', handleScrollActivity, { passive: true });
    el.addEventListener('touchmove', handleScrollActivity, { passive: true });

    return () => {
      el.removeEventListener('scroll', handleScrollActivity);
      el.removeEventListener('wheel', handleScrollActivity);
      el.removeEventListener('touchmove', handleScrollActivity);
    };
  }, [onMinimizeControls, zoom]);

  // Drag to pan horizontally/vertically when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only enable mouse drag if clicking background/image, not buttons
    if ((e.target as HTMLElement).closest('button, input, .webtoon-zoom-hud')) return;
    if (!containerRef.current) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }

    containerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    containerRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler: pinch / Ctrl + wheel for continuous fine zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 12 : -12;
        applyZoom(zoomPercent + delta);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [applyZoom, zoomPercent]);

  // Handle double click for quick smart zoom toggle on a page
  const handlePageDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fitMode === 'comfort' && zoomPercent === 100) {
      // Zoom in to 180% (detail view)
      applyZoom(180);
    } else {
      // Reset back to comfort reading
      handleResetComfort();
    }
  };

  // Scroll to current page when changed externally (from scrubber / thumbnails)
  useEffect(() => {
    const targetEl = pageRefs.current.get(currentPage);
    if (targetEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = targetEl.getBoundingClientRect();

      // Only scroll if page is substantially off-screen
      const isOffScreen = elRect.top < containerRect.top - 150 || elRect.bottom > containerRect.bottom + 150;
      if (isOffScreen) {
        isProgrammaticScroll.current = true;
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 700);
      }
    }
  }, [currentPage]);

  const feedWidthStyles = getFeedWidthStyle();

  return (
    <div
      className={`webtoon-container ${isDragging ? 'is-dragging' : ''} ${isZoomedWide ? 'can-pan' : ''}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e) => {
        // If user dragged to pan, don't toggle UI controls
        if (hasDraggedRef.current) {
          hasDraggedRef.current = false;
          return;
        }
        if ((e.target as HTMLElement).closest('button, input, .webtoon-zoom-hud, .sidedock-panel')) return;
        onToggleControls();
      }}
    >
      <div className="webtoon-feed" style={feedWidthStyles}>
        {pages.map((page, index) => {
          const isPriority = index < 4;
          return (
            <div
              key={page.id}
              ref={(el) => {
                if (el) pageRefs.current.set(page.pageNumber, el);
                else pageRefs.current.delete(page.pageNumber);
              }}
              data-page={page.pageNumber}
              className="webtoon-page-item"
              onDoubleClick={(e) => handlePageDoubleClick(e)}
            >
              <img
                src={page.src}
                alt={`Página ${page.pageNumber}`}
                className="webtoon-image"
                loading={isPriority ? 'eager' : 'lazy'}
                fetchPriority={isPriority ? 'high' : 'auto'}
                decoding="async"
                draggable={false}
              />
            </div>
          );
        })}

        {/* End of Webtoon footer card */}
        <div className="webtoon-end-card">
          <h3>// FIN DE LA LECTURA</h3>
          <p>Has completado las {pages.length} páginas de 'La Última Pregunta'</p>
        </div>
      </div>

      {/* Cyberpunk Floating Zoom HUD (used on mobile / fallback) */}
      <div className={`webtoon-zoom-hud glass-panel ${controlsVisible ? 'visible' : 'minimized'}`}>
        <div className="hud-header">
          <div className="hud-title">
            <Sparkles size={13} className="text-accent" />
            <span>ZOOM CONTINUO</span>
          </div>
          {isZoomedWide && (
            <div className="hud-pan-hint" title="Puedes arrastrar con el ratón o usar el trackpad para desplazarte horizontalmente">
              <Move size={12} />
              <span>ARRASTRE ACTIVO</span>
            </div>
          )}
        </div>

        <div className="hud-controls-row">
          <button
            type="button"
            className="hud-btn"
            onClick={handleZoomOut}
            disabled={fitMode === 'custom' && zoomPercent <= 50}
            title="Alejar (-) o rueda con Ctrl"
            aria-label="Alejar"
          >
            <ZoomOut size={16} />
          </button>

          <div className="hud-slider-wrap">
            <input
              type="range"
              min="50"
              max="350"
              step="5"
              value={fitMode === 'comfort' ? 100 : fitMode === 'fit-width' ? 120 : zoomPercent}
              onChange={(e) => applyZoom(Number(e.target.value))}
              className="hud-zoom-slider"
              title="Ajuste fino de zoom"
              aria-label="Porcentaje de zoom"
            />
          </div>

          <button
            type="button"
            className="hud-btn"
            onClick={handleZoomIn}
            disabled={fitMode === 'custom' && zoomPercent >= 350}
            title="Acercar (+) o rueda con Ctrl"
            aria-label="Acercar"
          >
            <ZoomIn size={16} />
          </button>

          <div className="hud-percent-badge" onClick={handleResetComfort} title="Clic para restablecer a lectura óptima (100%)">
            <span>{fitMode === 'fit-width' ? 'ANCHO' : `${zoomPercent}%`}</span>
          </div>
        </div>

        {/* Quick Mode Presets */}
        <div className="hud-presets-row">
          <button
            type="button"
            className={`hud-preset-btn ${fitMode === 'fit-width' ? 'active' : ''}`}
            onClick={handleFitWidth}
            title="Ajustar al ancho total de la pantalla (0 o botón)"
          >
            <Maximize2 size={13} />
            <span>Ajustar Ancho</span>
          </button>

          <button
            type="button"
            className={`hud-preset-btn ${fitMode === 'comfort' ? 'active' : ''}`}
            onClick={handleResetComfort}
            title="Lectura centrada cómoda (850px)"
          >
            <RotateCcw size={13} />
            <span>Lectura</span>
          </button>

          <button
            type="button"
            className={`hud-preset-btn ${fitMode === 'custom' && zoomPercent >= 180 && zoomPercent <= 195 ? 'active' : ''}`}
            onClick={handleNative100}
            title="Resolución real nativa 1:1 de los escaneos (1600px)"
          >
            <span>100% Real</span>
          </button>

          <button
            type="button"
            className={`hud-preset-btn ${fitMode === 'custom' && zoomPercent >= 240 ? 'active' : ''}`}
            onClick={() => applyZoom(250)}
            title="Super Zoom (250%) para examinar viñetas al detalle"
          >
            <span>250%</span>
          </button>
        </div>
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="webtoon-toast glass-pill">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
