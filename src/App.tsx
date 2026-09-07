import React, { useState, useEffect, useCallback } from 'react';
import type { ComicManifest, ComicPage, ReaderMode } from './types/comic';
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { BookReader } from './components/BookReader/BookReader';
import { WebtoonReader } from './components/WebtoonReader/WebtoonReader';
import { SideDock } from './components/SideDock/SideDock';
import { ThumbnailDrawer } from './components/ThumbnailDrawer/ThumbnailDrawer';
import { ZoomModal } from './components/ZoomModal/ZoomModal';
import { HelpModal } from './components/HelpModal';
import { useComicProgress } from './hooks/useComicProgress';
import { useFullscreen } from './hooks/useFullscreen';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useWebtoonZoom } from './hooks/useWebtoonZoom';
import { BookmarkCheck, AlertCircle, RefreshCw } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [manifest, setManifest] = useState<ComicManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modo de lectura por defecto: webtoon
  const [mode, setMode] = useState<ReaderMode>('webtoon');

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [zoomedPage, setZoomedPage] = useState<ComicPage | null>(null);

  const { currentPage, setPage, savedPage, clearSaved } = useComicProgress(1);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const zoomControls = useWebtoonZoom();

  // Load manifest.json
  const fetchManifest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/comics/manifest.json');
      if (!res.ok) throw new Error('No se encontró manifest.json');
      const data: ComicManifest = await res.json();
      setManifest(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el cómic');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManifest();
  }, [fetchManifest]);

  // Navigation handlers
  const totalPages = manifest?.pages.length || 0;

  const handleNext = useCallback(() => {
    if (currentPage >= totalPages) return;
    if (mode === 'book') {
      const step = currentPage === 1 ? 1 : (currentPage % 2 === 0 ? 2 : 1);
      setPage(Math.min(totalPages, currentPage + step));
    } else {
      setPage(Math.min(totalPages, currentPage + 1));
    }
  }, [currentPage, totalPages, mode, setPage]);

  const handlePrev = useCallback(() => {
    if (currentPage <= 1) return;
    if (mode === 'book') {
      const step = currentPage === 2 ? 1 : 2;
      setPage(Math.max(1, currentPage - step));
    } else {
      setPage(Math.max(1, currentPage - 1));
    }
  }, [currentPage, mode, setPage]);

  const handleToggleControls = useCallback(() => {
    setControlsVisible((prev) => !prev);
  }, []);

  // Keyboard navigation
  useKeyboardNav({
    onNext: handleNext,
    onPrev: handlePrev,
    onToggleFullscreen: toggleFullscreen,
    onToggleThumbnails: () => setIsDrawerOpen((prev) => !prev),
    onToggleMode: () => setMode((prev) => (prev === 'book' ? 'webtoon' : 'book')),
    onEscape: () => {
      if (zoomedPage) setZoomedPage(null);
      else if (isDrawerOpen) setIsDrawerOpen(false);
      else if (isHelpOpen) setIsHelpOpen(false);
      else setControlsVisible((prev) => !prev);
    },
    enabled: !zoomedPage && !isHelpOpen,
  });

  if (loading) {
    return (
      <div className="center-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Cargando cómic...</p>
      </div>
    );
  }

  if (error || !manifest || manifest.pages.length === 0) {
    return (
      <div className="center-screen error-box glass-panel">
        <AlertCircle size={48} className="text-amber" />
        <h2>No hay páginas preparadas aún</h2>
        <p>Coloca tus 56 archivos PDF en la carpeta <code>raw_pdfs/</code> y luego corre:</p>
        <div className="code-badge">
          <code>npm run convert</code>
        </div>
        <p className="hint-text">
          O para probar la interfaz ahora mismo con páginas de muestra, corre:
        </p>
        <div className="code-badge">
          <code>swift scripts/generate_sample.swift</code>
        </div>
        <button type="button" className="retry-btn" onClick={fetchManifest}>
          <RefreshCw size={16} />
          <span>Volver a verificar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="app-viewport">
      {/* Mobile Top Header (hidden on desktop) */}
      <Header
        title={manifest.title}
        currentPage={currentPage}
        totalPages={totalPages}
        mode={mode}
        onModeChange={setMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        visible={controlsVisible}
      />

      {/* Main Reader Content */}
      <main className="reader-area">
        {mode === 'book' ? (
          <BookReader
            pages={manifest.pages}
            currentPage={currentPage}
            onPageChange={setPage}
            onToggleControls={handleToggleControls}
            onZoomPage={(page) => setZoomedPage(page)}
          />
        ) : (
          <WebtoonReader
            pages={manifest.pages}
            currentPage={currentPage}
            onPageChange={setPage}
            onToggleControls={handleToggleControls}
            controlsVisible={controlsVisible}
            zoomControls={zoomControls}
          />
        )}
      </main>

      {/* Mobile Bottom Bar (hidden on desktop) */}
      <BottomBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        onPrev={handlePrev}
        onNext={handleNext}
        visible={controlsVisible}
      />

      {/* Desktop Unified Side Dock (all controls on the side in desktop) */}
      <SideDock
        title={manifest.title}
        currentPage={currentPage}
        totalPages={totalPages}
        mode={mode}
        onModeChange={setMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onPageChange={setPage}
        onPrev={handlePrev}
        onNext={handleNext}
        visible={controlsVisible}
        onToggleVisible={handleToggleControls}
        zoomControls={zoomControls}
      />

      {/* Saved Reading Progress Toast */}
      {savedPage && savedPage !== currentPage && (
        <div className="resume-toast glass-panel toast-notification">
          <BookmarkCheck size={20} className="text-accent" />
          <div className="toast-text">
            <span>Última lectura guardada: <strong>Pág. {savedPage}</strong></span>
          </div>
          <button
            type="button"
            className="toast-action-btn"
            onClick={() => {
              setPage(savedPage);
              clearSaved();
            }}
          >
            Continuar
          </button>
          <button
            type="button"
            className="toast-dismiss-btn"
            onClick={clearSaved}
            title="Descartar"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thumbnail Drawer */}
      <ThumbnailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        pages={manifest.pages}
        currentPage={currentPage}
        onSelectPage={setPage}
      />

      {/* Zoom / Inspector Modal */}
      <ZoomModal page={zoomedPage} onClose={() => setZoomedPage(null)} />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default App;
