import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ComicPage } from '../../types/comic';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Move, Sparkles } from 'lucide-react';
import './WebtoonReader.css';

interface WebtoonReaderProps {
  pages: ComicPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onToggleControls: () => void;
  controlsVisible?: boolean;
}

export const WebtoonReader: React.FC<WebtoonReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  onToggleControls,
  controlsVisible = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<any>(null);

  // Zoom state: 50% to 400%
  // fitMode: 'fit-width' (100% screen width), 'comfort' (standard reading ~850px), or 'custom' (percentage zoom)
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [fitMode, setFitMode] = useState<'fit-width' | 'comfort' | 'custom'>('comfort');
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Drag-to-pan state
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const hasDraggedRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Compute feed width style based on fitMode & zoomPercent
  const getFeedWidthStyle = () => {
    if (fitMode === 'fit-width') {
      return { width: '100%', maxWidth: '100%', padding: '0 8px' };
    }
    if (fitMode === 'comfort') {
      return { width: '100%', maxWidth: '850px', padding: '0 16px' };
    }
    // Custom zoom percentage: 100% = 850px, 200% = 1700px (close to native 1600px width), up to 400%
    const calculatedWidth = Math.round(850 * (zoomPercent / 100));
    return {
      width: `${calculatedWidth}px`,
      maxWidth: 'none',
      padding: '0 24px',
    };
  };

  // Zoom helpers
  const applyZoom = useCallback((newPercent: number) => {
    const clamped = Math.max(50, Math.min(400, Math.round(newPercent)));
    setZoomPercent(clamped);
    setFitMode('custom');
  }, []);

  const handleZoomIn = useCallback(() => {
    applyZoom(zoomPercent + 25);
  }, [applyZoom, zoomPercent]);

  const handleZoomOut = useCallback(() => {
    applyZoom(zoomPercent - 25);
  }, [applyZoom, zoomPercent]);

  const handleResetComfort = useCallback(() => {
    setFitMode('comfort');
    setZoomPercent(100);
    showToast('Modo Lectura Centrada (100%)');
  }, [showToast]);

  const handleFitWidth = useCallback(() => {
    setFitMode('fit-width');
    setZoomPercent(100);
    showToast('Ajustado al ancho de pantalla');
  }, [showToast]);

  const handleNative100 = useCallback(() => {
    // 1600px native image resolution corresponds to ~188% of 850px
    applyZoom(188);
    showToast('Resolución Nativa 1:1 (1600px)');
  }, [applyZoom, showToast]);

  // Double click to toggle zoom on that specific location/page
  const handlePageDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
      e.stopPropagation();
      const container = containerRef.current;
      if (!container) return;

      if (fitMode === 'comfort' || (fitMode === 'custom' && zoomPercent <= 110)) {
        // Zoom in to 175%
        applyZoom(175);
        showToast(`Zoom en Pág. ${pageNum} • 175%`);
      } else {
        // Reset to comfort reading
        handleResetComfort();
      }
    },
    [fitMode, zoomPercent, applyZoom, handleResetComfort, showToast]
  );

  // Click on page zoom button (focus page in continuous feed with high zoom)
  const handlePageZoomBtn = useCallback(
    (page: ComicPage) => {
      const targetEl = pageRefs.current.get(page.pageNumber);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (zoomPercent < 150) {
        applyZoom(175);
      }
      showToast(`Pág. ${page.pageNumber} enfocada • Scroll continuo activo`);
    },
    [zoomPercent, applyZoom, showToast]
  );

  // Wheel zoom when Ctrl/Cmd is held, or trackpad pinch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.5;
        setZoomPercent((prev) => {
          const next = Math.max(50, Math.min(400, Math.round(prev + delta)));
          return next;
        });
        setFitMode('custom');
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Keyboard zoom shortcuts (+ / - / 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleFitWidth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleFitWidth]);

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Only initiate drag with primary mouse button if not clicking an interactive control
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, input')) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }

    container.scrollLeft = dragStartRef.current.scrollLeft - dx;
    container.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // IntersectionObserver to detect which page is currently in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }

        if (bestEntry) {
          const pageNum = parseInt(bestEntry.target.getAttribute('data-page') || '1', 10);
          if (pageNum && pageNum !== currentPage) {
            onPageChange(pageNum);
          }
        }
      },
      {
        root: container,
        threshold: [0.1, 0.35, 0.6],
        rootMargin: '-5% 0px -5% 0px',
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages, onPageChange, currentPage, fitMode, zoomPercent]);

  // Jump/scroll to page when changed from outside (e.g. BottomBar buttons, slider, drawer)
  const lastPageRef = useRef(currentPage);
  useEffect(() => {
    if (lastPageRef.current !== currentPage) {
      lastPageRef.current = currentPage;
      const targetEl = pageRefs.current.get(currentPage);
      if (targetEl && containerRef.current) {
        isProgrammaticScroll.current = true;
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 500);
      }
    }
  }, [currentPage]);

  const feedWidthStyles = getFeedWidthStyle();
  const isZoomedWide = fitMode === 'custom' && zoomPercent > 115;

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
        if ((e.target as HTMLElement).closest('button, input, .webtoon-zoom-hud')) return;
        onToggleControls();
      }}
    >
      <div className="webtoon-feed" style={feedWidthStyles}>
        {pages.map((page, index) => {
          // Preload first 4 pages eagerly, rest lazily with decoding="async"
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
              onDoubleClick={(e) => handlePageDoubleClick(e, page.pageNumber)}
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

              {/* Quick page focus & zoom button */}
              <button
                type="button"
                className="webtoon-zoom-btn icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePageZoomBtn(page);
                }}
                title={`Enfocar con zoom página ${page.pageNumber}`}
                aria-label={`Enfocar página ${page.pageNumber}`}
              >
                <ZoomIn size={16} />
              </button>

              <div className="webtoon-page-badge">
                <span>PÁG {String(page.pageNumber).padStart(2, '0')}</span>
              </div>
            </div>
          );
        })}

        {/* End of Webtoon footer card */}
        <div className="webtoon-end-card">
          <h3>// FIN DE LA LECTURA</h3>
          <p>Has completado las {pages.length} páginas de 'La Última Pregunta'</p>
        </div>
      </div>

      {/* Cyberpunk Floating Zoom HUD */}
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
