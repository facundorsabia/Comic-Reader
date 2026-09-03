import React, { useEffect, useState } from 'react';
import type { ComicPage } from '../../types/comic';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import './BookReader.css';

interface BookReaderProps {
  pages: ComicPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onToggleControls: () => void;
  onZoomPage: (page: ComicPage) => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  onToggleControls,
  onZoomPage,
}) => {
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [animating, setAnimating] = useState(false);

  const totalPages = pages.length;
  const isCover = currentPage === 1;

  // Compute left and right page objects
  let leftPage: ComicPage | null = null;
  let rightPage: ComicPage | null = null;

  if (isCover) {
    rightPage = pages[0] || null;
  } else {
    const leftNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const rightNum = leftNum + 1;
    leftPage = pages.find((p) => p.pageNumber === leftNum) || null;
    rightPage = pages.find((p) => p.pageNumber === rightNum) || null;
  }

  // Preload upcoming pages
  useEffect(() => {
    const nextIdx = currentPage + 2;
    if (nextIdx <= totalPages) {
      const p1 = pages[nextIdx - 1];
      const p2 = pages[nextIdx];
      if (p1) {
        const img1 = new Image();
        img1.src = p1.src;
      }
      if (p2) {
        const img2 = new Image();
        img2.src = p2.src;
      }
    }
  }, [currentPage, pages, totalPages]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage >= totalPages || animating) return;
    setTurnDirection('next');
    setAnimating(true);

    const nextTarget = isCover ? 2 : currentPage + (currentPage % 2 === 0 ? 2 : 1);
    const validTarget = Math.min(nextTarget, totalPages);

    setTimeout(() => {
      onPageChange(validTarget);
      setAnimating(false);
      setTurnDirection(null);
    }, 280);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage <= 1 || animating) return;
    setTurnDirection('prev');
    setAnimating(true);

    const prevTarget = currentPage === 2 ? 1 : currentPage - 2;
    const validTarget = Math.max(1, prevTarget);

    setTimeout(() => {
      onPageChange(validTarget);
      setAnimating(false);
      setTurnDirection(null);
    }, 280);
  };

  return (
    <div className="book-stage" onClick={onToggleControls}>
      {/* Left Click Navigation Zone */}
      {currentPage > 1 && (
        <button
          type="button"
          className="book-nav-zone zone-left"
          onClick={handlePrev}
          title="Página anterior (←)"
          aria-label="Página anterior"
        >
          <div className="zone-arrow">
            <ChevronLeft size={36} />
          </div>
        </button>
      )}

      {/* Book Container with 3D Perspective */}
      <div className={`book-container ${isCover ? 'is-cover' : 'is-spread'} ${animating ? `turning-${turnDirection}` : ''}`}>
        {isCover ? (
          /* COVER VIEW: Single Centered Page */
          <div className="book-cover-wrapper">
            <div className="book-page cover-page" onDoubleClick={() => rightPage && onZoomPage(rightPage)}>
              <img
                src={rightPage?.src}
                alt="Portada del Cómic"
                className="page-image"
                fetchPriority="high"
                loading="eager"
              />
              <button
                type="button"
                className="page-zoom-btn icon-btn glass-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  if (rightPage) onZoomPage(rightPage);
                }}
                title="Ampliar portada"
              >
                <ZoomIn size={16} />
              </button>
              <div className="page-sheen" />
            </div>
            {/* Book edge thickness effect */}
            <div className="book-thickness-edge" />
          </div>
        ) : (
          /* SPREAD VIEW: Two Pages Open Side-by-Side */
          <div className="book-spread-wrapper">
            {/* Left Page (Even) */}
            <div
              className={`book-page left-page ${!leftPage ? 'empty' : ''}`}
              onDoubleClick={() => leftPage && onZoomPage(leftPage)}
            >
              {leftPage && (
                <>
                  <img
                    src={leftPage.src}
                    alt={`Página ${leftPage.pageNumber}`}
                    className="page-image"
                    fetchPriority="high"
                    loading="eager"
                  />
                  <button
                    type="button"
                    className="page-zoom-btn icon-btn glass-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoomPage(leftPage);
                    }}
                    title={`Ampliar página ${leftPage.pageNumber}`}
                  >
                    <ZoomIn size={16} />
                  </button>
                  {/* Spine Crease / Gutter Shadow */}
                  <div className="gutter-shadow gutter-shadow-left" />
                  <div className="page-sheen" />
                </>
              )}
            </div>

            {/* Book Spine Centerline */}
            <div className="book-spine-groove" />

            {/* Right Page (Odd) */}
            <div
              className={`book-page right-page ${!rightPage ? 'empty' : ''}`}
              onDoubleClick={() => rightPage && onZoomPage(rightPage)}
            >
              {rightPage ? (
                <>
                  <img
                    src={rightPage.src}
                    alt={`Página ${rightPage.pageNumber}`}
                    className="page-image"
                    fetchPriority="high"
                    loading="eager"
                  />
                  <button
                    type="button"
                    className="page-zoom-btn icon-btn glass-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoomPage(rightPage);
                    }}
                    title={`Ampliar página ${rightPage.pageNumber}`}
                  >
                    <ZoomIn size={16} />
                  </button>
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
            <ChevronRight size={36} />
          </div>
        </button>
      )}
    </div>
  );
};
