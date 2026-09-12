import React, { useEffect, useState } from 'react';
import { Monitor, ArrowRight } from 'lucide-react';
import './MobileNoticeModal.css';

interface MobileNoticeModalProps {
  onClose?: () => void;
}

export const MobileNoticeModal: React.FC<MobileNoticeModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Detect mobile device or narrow screen (<= 768px)
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );

    if (isMobile) {
      const alreadySeen = sessionStorage.getItem('multivac_mobile_notice_seen');
      if (!alreadySeen) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('multivac_mobile_notice_seen', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-notice-backdrop" onClick={handleDismiss}>
      <div
        className="mobile-notice-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-notice-decor-top" />

        <div className="mobile-notice-icon-wrap">
          <Monitor size={26} className="mobile-notice-icon" />
        </div>

        <h2 className="mobile-notice-title">
          UNA EXPERIENCIA PENSADA PARA PANTALLAS AMPLIAS
        </h2>

        <div className="mobile-notice-body">
          <p className="mobile-notice-highlight">
            <em>La Última Pregunta</em> fue diseñada para leerse en páginas completas y dobles, con ilustraciones y detalles que se disfrutan mejor en tablet o computadora.*
          </p>
          <p className="mobile-notice-subtext">
            En este dispositivo podés continuar en modo lectura vertical.
          </p>
        </div>

        <button
          type="button"
          className="mobile-notice-action-btn"
          onClick={handleDismiss}
        >
          <span>CONTINUAR EN MÓVIL</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
