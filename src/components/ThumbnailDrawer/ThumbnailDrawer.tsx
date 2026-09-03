import React, { useEffect, useRef } from 'react';
import type { ComicPage } from '../../types/comic';
import { X, Layers } from 'lucide-react';
import './ThumbnailDrawer.css';

interface ThumbnailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: ComicPage[];
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
}

export const ThumbnailDrawer: React.FC<ThumbnailDrawerProps> = ({
  isOpen,
  onClose,
  pages,
  currentPage,
  onSelectPage,
}) => {
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active thumbnail into view when drawer opens
  useEffect(() => {
    if (isOpen && activeThumbRef.current) {
      setTimeout(() => {
        activeThumbRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }, 150);
    }
  }, [isOpen, currentPage]);

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            <Layers size={18} className="text-accent" />
            <span>Índice de Páginas ({pages.length})</span>
          </div>
          <button
            type="button"
            className="icon-btn close-btn"
            onClick={onClose}
            title="Cerrar índice (Esc)"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-scroll" ref={scrollContainerRef}>
          <div className="thumbnails-grid">
            {pages.map((page) => {
              const isActive = page.pageNumber === currentPage;
              return (
                <button
                  key={page.id}
                  ref={isActive ? activeThumbRef : null}
                  type="button"
                  className={`thumbnail-card ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectPage(page.pageNumber);
                    onClose();
                  }}
                >
                  <div className="thumbnail-img-wrapper">
                    <img
                      src={page.thumb}
                      alt={`Miniatura ${page.pageNumber}`}
                      loading="lazy"
                      className="thumbnail-img"
                    />
                    <div className="thumbnail-badge">
                      {page.pageNumber === 1 ? 'Portada' : `Pág. ${page.pageNumber}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
