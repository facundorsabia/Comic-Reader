import React, { useEffect, useState } from 'react';
import type { ComicPage } from '../../types/comic';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BookReader.css';

interface BookReaderProps {
  pages: ComicPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onToggleControls: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  onToggleControls,
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

  const handleNext = () => {
    if (currentPage >= totalPages || animating) return;
    setTurnDirection('next');
    setAnimating(true);

    setTimeout(() => {
      if (isCover) {
        onPageChange(2);
      } else {
        const next = Math.min(currentPage + 2, totalPages);
        onPageChange(next);
      }
      setAnimating(false);
      setTurnDirection(null);
    }, 450);
  };

  const handlePrev = () => {
    if (currentPage <= 1 || animating) return;
    setTurnDirection('prev');
    setAnimating(true);

    setTimeout(() => {
      if (currentPage === 2 || currentPage === 3) {
        onPageChange(1);
      } else {
        const prev = Math.max(currentPage - 2, 1);
        onPageChange(prev);
      }
      setAnimating(false);
      setTurnDirection(null);
    }, 450);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, animating, isCover]);

  return (
    <div className="book-reader-container" onClick={onToggleControls}>
      {/* Left Click Navigation Zone */}
      {currentPage > 1 && (
        <button
          type="button"
          className="nav-zone nav-zone-left"
          onClick={handlePrev}
          aria-label="Página anterior"
          title="Página anterior (Flecha Izquierda)"
        >
          <div className="zone-indicator">
            <ChevronLeft size={28} />
          </div>
        </button>
      )}

      {/* Book Container with 3D Perspective */}
      <div className={`book-container ${isCover ? 'is-cover' : 'is-spread'} ${animating ? `turning-${turnDirection}` : ''}`}>
        {isCover ? (
          /* COVER VIEW: Single Centered Page */
          <div className="book-cover-wrapper">
            <div className="book-page cover-page">
              <img
                src={rightPage?.src}
                alt="Portada del Cómic"
                className="page-image"
                fetchPriority="high"
                loading="eager"
              />
              <div className="page-sheen" />
            </div>
            {/* Book edge thickness effect */}
            <div className="book-thickness-edge" />
          </div>
        ) : (
          /* SPREAD VIEW: Two Pages Open Side-by-Side */
          <div className="book-spread-wrapper">
            {/* Left Page (Even) */}
            <div className={`book-page left-page ${!leftPage ? 'empty' : ''}`}>
              {leftPage && (
                <>
                  <img
                    src={leftPage.src}
                    alt={`Página ${leftPage.pageNumber}`}
                    className="page-image"
                    fetchPriority="high"
                    loading="eager"
                  />
                  {/* Spine Crease / Gutter Shadow */}
                  <div className="gutter-shadow gutter-shadow-left" />
                  <div className="page-sheen" />
                </>
              )}
            </div>

            {/* Book Spine Centerline */}
            <div className="book-spine-groove" />

            {/* Right Page (Odd) */}
            <div className={`book-page right-page ${!rightPage ? 'empty' : ''}`}>
              {rightPage ? (
                <>
                  <img
                    src={rightPage.src}
                    alt={`Página ${rightPage.pageNumber}`}
                    className="page-image"
                    fetchPriority="high"
                    loading="eager"
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
          </div>
        )}
      </div>

      {/* Right Click Navigation Zone */}
      {currentPage < totalPages && (
        <button
          type="button"
          className="nav-zone nav-zone-right"
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
