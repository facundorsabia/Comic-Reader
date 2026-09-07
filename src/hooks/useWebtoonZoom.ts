import { useState, useRef, useCallback } from 'react';

export type FitMode = 'fit-width' | 'comfort' | 'custom';

export function useWebtoonZoom() {
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [fitMode, setFitMode] = useState<FitMode>('comfort');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

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
    applyZoom(188);
    showToast('Resolución Nativa 1:1 (1600px)');
  }, [applyZoom, showToast]);

  const isZoomedWide = fitMode === 'fit-width' || (fitMode === 'custom' && zoomPercent > 125);

  const getFeedWidthStyle = () => {
    if (fitMode === 'fit-width') {
      return { width: '100%', maxWidth: '100%', padding: '0 8px' };
    }
    if (fitMode === 'comfort') {
      return { width: '100%', maxWidth: '850px', padding: '0 16px' };
    }
    const calculatedWidth = Math.round(850 * (zoomPercent / 100));
    return {
      width: `${calculatedWidth}px`,
      maxWidth: 'none',
      padding: '0 24px',
    };
  };

  return {
    zoomPercent,
    fitMode,
    isZoomedWide,
    toastMessage,
    showToast,
    applyZoom,
    handleZoomIn,
    handleZoomOut,
    handleResetComfort,
    handleFitWidth,
    handleNative100,
    getFeedWidthStyle,
  };
}

export type WebtoonZoomControls = ReturnType<typeof useWebtoonZoom>;
