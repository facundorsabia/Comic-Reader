import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BottomBar.css';

interface BottomBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  visible: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrev,
  onNext,
  visible,
}) => {
  const percent = Math.round((currentPage / totalPages) * 100) || 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPageChange(parseInt(e.target.value, 10));
  };

  return (
    <footer className={`comic-bottombar glass-panel ${visible ? 'visible' : 'hidden'}`}>
      <div className="bottombar-content">
        {/* Prev Page Button */}
        <button
          type="button"
          className="cyber-btn prev-btn"
          onClick={onPrev}
          disabled={currentPage <= 1}
          title="Página anterior (← o A)"
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
          <span className="btn-label">Anterior</span>
        </button>

        {/* Page Scrubber Slider */}
        <div className="scrubber-container">
          <div className="scrubber-labels">
            <span className="current-page-text">
              <span className="cyber-label-prefix">// PÁGINA</span>{' '}
              <strong>{String(currentPage).padStart(2, '0')}</strong>{' '}
              <span className="total-pages-muted">/ {totalPages}</span>
            </span>
            <span className="percent-text">{percent}% SYNC</span>
          </div>

          <div className="slider-wrapper">
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handleSliderChange}
              className="page-slider"
              aria-label="Selector rápido de página"
            />
            <div
              className="slider-track-fill"
              style={{ width: `${((currentPage - 1) / Math.max(1, totalPages - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          className="cyber-btn cyber-btn-pink next-btn"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          title="Página siguiente (→ o D o Espacio)"
          aria-label="Página siguiente"
        >
          <span className="btn-label">Siguiente</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </footer>
  );
};
