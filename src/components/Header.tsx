import React from 'react';
import { BookOpen, Scroll, Maximize, Minimize, LayoutGrid, HelpCircle } from 'lucide-react';
import type { ReaderMode } from '../types/comic';
import './Header.css';

interface HeaderProps {
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
  visible: boolean;
}

export const Header: React.FC<HeaderProps> = ({
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
  visible,
}) => {
  const isBookMode = mode === 'book';

  // Calculate spread label for book mode
  let pageDisplay = `Pág. ${currentPage} / ${totalPages}`;
  if (isBookMode && totalPages > 1) {
    if (currentPage === 1) {
      pageDisplay = `Portada • Pág. 1 / ${totalPages}`;
    } else {
      const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      const rightPage = leftPage + 1 <= totalPages ? leftPage + 1 : null;
      pageDisplay = rightPage 
        ? `Págs. ${leftPage} - ${rightPage} / ${totalPages}`
        : `Pág. ${leftPage} / ${totalPages}`;
    }
  }

  return (
    <header className={`comic-header glass-panel ${visible ? 'visible' : 'hidden'}`}>
      <div className="header-left">
        <div className="brand-badge">
          <span className="brand-dot"></span>
          <span className="brand-title">{title}</span>
        </div>
      </div>

      <div className="header-center">
        <div className="page-pill glass-pill">
          <span>{pageDisplay}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Mode Switcher */}
        <div className="mode-toggle glass-pill">
          <button
            type="button"
            className={`mode-btn ${mode === 'book' ? 'active' : ''}`}
            onClick={() => onModeChange('book')}
            title="Modo Libro Físico (Spread doble)"
            aria-label="Modo Libro"
          >
            <BookOpen size={16} />
            <span className="mode-label">Libro</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'webtoon' ? 'active' : ''}`}
            onClick={() => onModeChange('webtoon')}
            title="Modo Webtoon (Scroll Vertical)"
            aria-label="Modo Webtoon"
          >
            <Scroll size={16} />
            <span className="mode-label">Webtoon</span>
          </button>
        </div>

        {/* Thumbnails Drawer Toggle */}
        <button
          type="button"
          className={`icon-btn ${isDrawerOpen ? 'active' : ''}`}
          onClick={onToggleDrawer}
          title="Ver todas las páginas (T)"
          aria-label="Selector de páginas"
        >
          <LayoutGrid size={18} />
        </button>

        {/* Help / Shortcuts */}
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenHelp}
          title="Atajos de teclado y ayuda"
          aria-label="Ayuda"
        >
          <HelpCircle size={18} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
          aria-label="Pantalla completa"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </header>
  );
};
