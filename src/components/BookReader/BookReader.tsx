import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { ComicPage } from '../../types/comic';
import type { WebtoonZoomControls } from '../../hooks/useWebtoonZoom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCcw, Move, Sparkles } from 'lucide-react';
import './BookReader.css';

interface BookReaderProps {
  spreadEnabled: boolean;
  pages: ComicPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onToggleControls: () => void;
  onZoomPage?: (page: ComicPage) => void;
  zoomControls?: WebtoonZoomControls;
  controlsVisible?: boolean;
  registerBookNav?: (handlers: { next: () => void; prev: () => void } | null) => void;
  onEnterReadingMode?: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  spreadEnabled,
  pages,
  currentPage,
  onPageChange,
  onToggleControls,
  onZoomPage,
  zoomControls,
  controlsVisible = true,
  registerBookNav,
  onEnterReadingMode,
}) => {
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Drag state for zoomed view
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const totalPages = pages.length;
  const isCover = currentPage === 1;

  // Zoom scale calculations
  const zoomScale = zoomControls
    ? zoomControls.fitMode === 'fit-width'
      ? 1.35
      : zoomControls.zoomPercent / 100
    : 1.25;

  const isZoomed = zoomScale > 1.05;

  // Reset pan position on page change
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [currentPage]);

  // Smooth Cover-to-Spread 3D transition detection
  const isOpeningCover = spreadEnabled && isCover && animating && turnDirection === 'next';
  const isClosingToCover = spreadEnabled && (currentPage === 2 || currentPage === 3) && animating && turnDirection === 'prev';

  // Compute left and right page objects
  let leftPage: ComicPage | null = null;
  let rightPage: ComicPage | null = null;

  if (isOpeningCover) {
    leftPage = pages.find((p) => p.pageNumber === 2) || null;
    rightPage = pages.find((p) => p.pageNumber === 3) || null;
  } else if (isCover) {
    rightPage = pages[0] || null;
  } else {
    const leftNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const rightNum = leftNum + 1;
    leftPage = pages.find((p) => p.pageNumber === leftNum) || null;
    rightPage = pages.find((p) => p.pageNumber === rightNum) || null;
  }

  const showCoverOnly = isCover && !isOpeningCover;
  const singlePage = !spreadEnabled
    ? pages.find(p => p.pageNumber === currentPage)
    : showCoverOnly
      ? rightPage
      : (!rightPage && !isClosingToCover)
        ? leftPage
        : null;

  // Upcoming pages calculation for realistic 3D page flip leaves
  const nextLeftNum = isCover ? 2 : (leftPage ? leftPage.pageNumber + 2 : currentPage + 2);
  const nextRightNum = nextLeftNum + 1;
  const upcomingNextLeft = isOpeningCover ? (pages.find((p) => p.pageNumber === 2) || null) : (pages.find((p) => p.pageNumber === nextLeftNum) || null);
  const upcomingNextRight = isOpeningCover ? (pages.find((p) => p.pageNumber === 3) || null) : (pages.find((p) => p.pageNumber === nextRightNum) || null);

  const prevLeftNum = isCover ? 0 : (leftPage ? leftPage.pageNumber - 2 : currentPage - 2);
  const prevRightNum = prevLeftNum + 1;
  const upcomingPrevLeft = prevLeftNum > 1 ? pages.find((p) => p.pageNumber === prevLeftNum) || null : null;
  const upcomingPrevRight = isClosingToCover ? (pages[0] || null) : (prevRightNum > 0 ? pages.find((p) => p.pageNumber === prevRightNum) || null : null);

  // Preload upcoming pages
  useEffect(() => {
    const pagesToPreload = [
      currentPage + 1,
      currentPage + 2,
      currentPage - 1,
      currentPage - 2,
    ];

    pagesToPreload.forEach((num) => {
      const page = pages.find((p) => p.pageNumber === num);
      if (page) {
        const img = new Image();
        img.src = page.src;
      }
    });
  }, [currentPage, pages]);

  // Direct Wheel Zoom with mouse wheel / trackpad in Book mode
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !zoomControls) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Directly adjust zoom with mouse wheel
      const delta = e.deltaY < 0 ? 8 : -8;
      zoomControls.applyZoom(zoomControls.zoomPercent + delta);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [zoomControls]);

  const handleNext = useCallback(() => {
    if (onEnterReadingMode) onEnterReadingMode();
    if (currentPage >= totalPages || animating) return;
    setTurnDirection('next');
    setAnimating(true);

    setTimeout(() => {
      if (!spreadEnabled) {
        onPageChange(Math.min(totalPages, currentPage + 1));
      } else if (isCover) {
        onPageChange(2);
      } else {
        const next = Math.min(currentPage + 2, totalPages);
        onPageChange(next);
      }
      setAnimating(false);
      setTurnDirection(null);
    }, 450);
  }, [onEnterReadingMode, currentPage, totalPages, animating, spreadEnabled, isCover, onPageChange]);

  const handlePrev = useCallback(() => {
    if (currentPage <= 1 || animating) return;
    setTurnDirection('prev');
    setAnimating(true);

    setTimeout(() => {
      if (!spreadEnabled) {
        onPageChange(Math.max(1, currentPage - 1));
      } else if (currentPage === 2 || currentPage === 3) {
        onPageChange(1);
      } else {
        const prev = Math.max(currentPage - 2, 1);
        onPageChange(prev);
      }
      setAnimating(false);
      setTurnDirection(null);
    }, 450);
  }, [currentPage, animating, spreadEnabled, onPageChange]);

  useEffect(() => {
    if (registerBookNav) {
      registerBookNav({ next: handleNext, prev: handlePrev });
      return () => registerBookNav(null);
    }
  }, [registerBookNav, handleNext, handlePrev]);

  // Drag anywhere on screen to reposition the reader
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, .webtoon-zoom-hud, .sidedock-panel')) return;

    // Prevent browser default text selection / native image drag
    e.preventDefault();

    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Global mouse drag listeners for ultra-smooth repositioning across the entire viewport
  useEffect(() => {
    if (!isDragging) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      const nx = e.clientX - dragStartRef.current.x;
      const ny = e.clientY - dragStartRef.current.y;

      if (Math.abs(nx - position.x) > 2 || Math.abs(ny - position.y) > 2) {
        hasDraggedRef.current = true;
      }
      setPosition({ x: nx, y: ny });
    };

    const onGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [isDragging, position.x, position.y]);

  return (
    <div
      ref={containerRef}
      className={`book-stage ${isDragging ? 'is-dragging' : ''} can-pan`}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (hasDraggedRef.current) {
          hasDraggedRef.current = false;
          return;
        }
        if ((e.target as HTMLElement).closest('button, input, .webtoon-zoom-hud, .sidedock-panel')) return;
        onToggleControls();
      }}
    >
      {/* Left Click Navigation Zone */}
      {currentPage > 1 && (
        <button
          type="button"
          className="book-nav-zone zone-left"
          onClick={handlePrev}
          aria-label="Página anterior"
          title="Página anterior (Flecha Izquierda)"
        >
          <div className="zone-arrow">
            <ChevronLeft size={28} />
          </div>
        </button>
      )}

      {/* Book Container with 3D Perspective & Zoom Transform */}
      <div
        className={`book-container ${singlePage ? 'is-cover' : 'is-spread'} ${animating ? `turning-${turnDirection}` : ''} ${isDragging ? 'is-dragging' : ''}`}
        style={{
          transform: `translate3d(${Math.round(position.x)}px, ${Math.round(position.y)}px, 0) scale(${zoomScale})`,
          transformOrigin: 'center center',
        }}
      >
        {singlePage ? (
          /* COVER VIEW: Single Centered Page */
          <div className="book-cover-wrapper">
            <div
              className="book-page cover-page"
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (singlePage && onZoomPage) onZoomPage(singlePage);
              }}
            >
              <img
                src={singlePage.src}
                alt={isCover ? "Portada del Cómic" : `Página ${singlePage.pageNumber}`}
                className="page-image"
                fetchPriority="high"
                loading="eager"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
              <div className="page-sheen" aria-hidden="true" />
            </div>
            <span className="mv-page-number">{String(singlePage.pageNumber).padStart(2, '0')}</span>
            {/* Book edge thickness effect */}
            <div className="book-thickness-edge" />
          </div>
        ) : (
          /* SPREAD VIEW: Two Pages Open Side-by-Side with 3D Page-Flip Leaf */
          <div className={`book-spread-wrapper ${isOpeningCover ? 'is-opening-cover' : ''} ${isClosingToCover ? 'is-closing-cover' : ''}`}>
            {/* Left Page (Even) */}
            <div
              className={`book-page left-page ${!leftPage && !upcomingPrevLeft && !isClosingToCover ? 'empty' : ''}`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (leftPage && onZoomPage) onZoomPage(leftPage);
              }}
            >
              {(animating && turnDirection === 'prev' ? upcomingPrevLeft : leftPage) && (
                <>
                  <img
                    src={(animating && turnDirection === 'prev' ? upcomingPrevLeft : leftPage)!.src}
                    alt={`Página ${(animating && turnDirection === 'prev' ? upcomingPrevLeft : leftPage)!.pageNumber}`}
                    className="page-image"
                    fetchPriority="high"
                    loading="eager"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                  {/* Spine Crease / Gutter Shadow */}
                  <div className="gutter-shadow gutter-shadow-left" />
                  <div className="page-sheen" />
                </>
              )}
            </div>

            <span className="mv-page-number mv-page-left">
              {String((animating && turnDirection === 'prev' ? upcomingPrevLeft?.pageNumber : leftPage?.pageNumber) || '').padStart(2, '0')}
            </span>
            <span className="mv-page-number mv-page-right">
              {String((animating && turnDirection === 'next' ? upcomingNextRight?.pageNumber : rightPage?.pageNumber) || '').padStart(2, '0')}
            </span>
            {/* Book Spine Centerline */}
            <div className="book-spine-groove" />

            {/* Right Page (Odd) */}
            <div
              className={`book-page right-page ${!rightPage && !upcomingNextRight ? 'empty' : ''}`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (rightPage && onZoomPage) onZoomPage(rightPage);
              }}
            >
              {(animating && turnDirection === 'next' ? upcomingNextRight : rightPage) ? (
                <>
                  <img
                    src={(animating && turnDirection === 'next' ? upcomingNextRight : rightPage)!.src}
                    alt={`Página ${(animating && turnDirection === 'next' ? upcomingNextRight : rightPage)!.pageNumber}`}
                    className="page-image"
                    fetchPriority="high"
                    loading="eager"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                  {/* Spine Crease / Gutter Shadow */}
                  <div className="gutter-shadow gutter-shadow-right" />
                  <div className="page-sheen" />
                </>
              ) : (
                <div className="end-of-comic">
                  <span>Fin del Cómic</span>
                </div>
              )}
            </div>

            {/* 3D Flipping Leaf (Next Page Flip: Right folds over to Left) */}
            {animating && turnDirection === 'next' && (
              <div className="flipping-leaf flip-to-left">
                {/* Front Face: Current Right Page (or Cover when opening) */}
                <div className="leaf-face leaf-front">
                  {(isOpeningCover ? (pages[0] || null) : rightPage) ? (
                    <img
                      src={(isOpeningCover ? (pages[0] || null) : rightPage)!.src}
                      alt={`Página ${(isOpeningCover ? (pages[0] || null) : rightPage)!.pageNumber}`}
                      className="page-image"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  ) : (
                    <div className="end-of-comic"><span>Fin del Cómic</span></div>
                  )}
                  <div className="leaf-shadow leaf-shadow-front" />
                </div>

                {/* Back Face: Upcoming Next Left Page (Page 2 when opening) */}
                <div className="leaf-face leaf-back">
                  {(isOpeningCover ? (pages.find(p => p.pageNumber === 2) || null) : upcomingNextLeft) ? (
                    <img
                      src={(isOpeningCover ? (pages.find(p => p.pageNumber === 2) || null) : upcomingNextLeft)!.src}
                      alt={`Página ${(isOpeningCover ? (pages.find(p => p.pageNumber === 2) || null) : upcomingNextLeft)!.pageNumber}`}
                      className="page-image"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  ) : (
                    <div className="end-of-comic" />
                  )}
                  <div className="leaf-shadow leaf-shadow-back" />
                </div>
              </div>
            )}

            {/* 3D Flipping Leaf (Prev Page Flip: Left folds over to Right) */}
            {animating && turnDirection === 'prev' && (
              <div className="flipping-leaf flip-to-right">
                {/* Front Face: Current Left Page */}
                <div className="leaf-face leaf-front">
                  {(isClosingToCover ? (pages.find(p => p.pageNumber === 2) || leftPage) : leftPage) ? (
                    <img
                      src={(isClosingToCover ? (pages.find(p => p.pageNumber === 2) || leftPage) : leftPage)!.src}
                      alt={`Página ${(isClosingToCover ? (pages.find(p => p.pageNumber === 2) || leftPage) : leftPage)!.pageNumber}`}
                      className="page-image"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  ) : (
                    <div className="end-of-comic" />
                  )}
                  <div className="leaf-shadow leaf-shadow-front" />
                </div>

                {/* Back Face: Upcoming Prev Right Page (Cover when closing) */}
                <div className="leaf-face leaf-back">
                  {(isClosingToCover ? (pages[0] || null) : upcomingPrevRight) ? (
                    <img
                      src={(isClosingToCover ? (pages[0] || null) : upcomingPrevRight)!.src}
                      alt={`Página ${(isClosingToCover ? (pages[0] || null) : upcomingPrevRight)!.pageNumber}`}
                      className="page-image"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  ) : (
                    <div className="end-of-comic" />
                  )}
                  <div className="leaf-shadow leaf-shadow-back" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Click Navigation Zone */}
      {currentPage < totalPages && (
        <button
          type="button"
          className="book-nav-zone zone-right"
          onClick={handleNext}
          title="Página siguiente (→)"
          aria-label="Página siguiente"
        >
          <div className="zone-arrow">
            <ChevronRight size={28} />
          </div>
        </button>
      )}

      {/* Cyberpunk Floating Zoom HUD (used on mobile / fallback in book mode too) */}
      {zoomControls && (
        <div className={`webtoon-zoom-hud glass-panel ${controlsVisible ? 'visible' : 'minimized'}`}>
          <div className="hud-header">
            <div className="hud-title">
              <Sparkles size={13} className="text-accent" />
              <span>ZOOM LIBRO</span>
            </div>
            {isZoomed && (
              <div className="hud-pan-hint" title="Puedes arrastrar con el ratón para moverte por las páginas">
                <Move size={12} />
                <span>ARRASTRE ACTIVO</span>
              </div>
            )}
          </div>

          <div className="hud-controls-row">
            <button
              type="button"
              className="hud-btn"
              onClick={zoomControls.handleZoomOut}
              disabled={zoomControls.fitMode === 'custom' && zoomControls.zoomPercent <= 50}
              title="Alejar (-)"
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
                value={
                  zoomControls.fitMode === 'comfort'
                    ? 100
                    : zoomControls.fitMode === 'fit-width'
                      ? 135
                      : zoomControls.zoomPercent
                }
                onChange={(e) => zoomControls.applyZoom(Number(e.target.value))}
                className="hud-zoom-slider"
                title="Ajuste de zoom del libro"
                aria-label="Porcentaje de zoom"
              />
            </div>

            <button
              type="button"
              className="hud-btn"
              onClick={zoomControls.handleZoomIn}
              disabled={zoomControls.fitMode === 'custom' && zoomControls.zoomPercent >= 350}
              title="Acercar (+)"
              aria-label="Acercar"
            >
              <ZoomIn size={16} />
            </button>

            <div
              className="hud-percent-badge"
              onClick={zoomControls.handleResetComfort}
              title="Clic para restablecer (100%)"
            >
              <span>{zoomControls.fitMode === 'fit-width' ? 'ANCHO' : `${zoomControls.zoomPercent}%`}</span>
            </div>
          </div>

          {/* Quick Mode Presets */}
          <div className="hud-presets-row">
            <button
              type="button"
              className={`hud-preset-btn ${zoomControls.fitMode === 'fit-width' ? 'active' : ''}`}
              onClick={zoomControls.handleFitWidth}
              title="Ajustar al ancho"
            >
              <Maximize2 size={13} />
              <span>Ajustar</span>
            </button>

            <button
              type="button"
              className={`hud-preset-btn ${zoomControls.fitMode === 'comfort' ? 'active' : ''}`}
              onClick={zoomControls.handleResetComfort}
              title="Vista estándar (100%)"
            >
              <RotateCcw size={13} />
              <span>Normal</span>
            </button>

            <button
              type="button"
              className={`hud-preset-btn ${zoomControls.fitMode === 'custom' && zoomControls.zoomPercent >= 145 && zoomControls.zoomPercent <= 165 ? 'active' : ''}`}
              onClick={() => zoomControls.applyZoom(150)}
              title="Zoom al 150%"
            >
              <span>150%</span>
            </button>

            <button
              type="button"
              className={`hud-preset-btn ${zoomControls.fitMode === 'custom' && zoomControls.zoomPercent >= 195 ? 'active' : ''}`}
              onClick={() => zoomControls.applyZoom(200)}
              title="Zoom al 200%"
            >
              <span>200%</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Status Toast */}
      {zoomControls?.toastMessage && (
        <div className="webtoon-toast glass-pill">
          <span>{zoomControls.toastMessage}</span>
        </div>
      )}
    </div>
  );
};
