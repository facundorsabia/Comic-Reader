import { useEffect } from 'react';

interface KeyboardNavProps {
  onNext: () => void;
  onPrev: () => void;
  onToggleFullscreen?: () => void;
  onToggleThumbnails?: () => void;
  onToggleMode?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  onNext,
  onPrev,
  onToggleFullscreen,
  onToggleThumbnails,
  onToggleMode,
  onEscape,
  enabled = true,
}: KeyboardNavProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.target as HTMLElement)?.closest('button') && e.key === ' ') return;
      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'PageDown':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'PageUp':
          e.preventDefault();
          onPrev();
          break;
        case ' ': // Spacebar moves next
          e.preventDefault();
          if (e.shiftKey) {
            onPrev();
          } else {
            onNext();
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          onToggleFullscreen?.();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          onToggleThumbnails?.();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          onToggleMode?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onToggleFullscreen, onToggleThumbnails, onToggleMode, onEscape, enabled]);
}
