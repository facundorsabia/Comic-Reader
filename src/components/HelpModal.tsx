import React from 'react';
import { X, Keyboard, MousePointer } from 'lucide-react';
import './HelpModal.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-backdrop" onClick={onClose}>
      <div className="help-panel glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <div className="help-title">
            <Keyboard size={20} className="text-accent" />
            <span>Atajos de Navegación & Gestos</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="help-body">
          {/* Keyboard Section */}
          <div className="help-section">
            <div className="section-title">
              <Keyboard size={16} />
              <span>Teclado (Desktop)</span>
            </div>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <span className="shortcut-desc">Página Siguiente</span>
                <div className="keys"><kbd>→</kbd> <kbd>D</kbd> <kbd>Espacio</kbd></div>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Página Anterior</span>
                <div className="keys"><kbd>←</kbd> <kbd>A</kbd> <kbd>Shift+Espacio</kbd></div>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Pantalla Completa</span>
                <div className="keys"><kbd>F</kbd></div>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Índice de Páginas</span>
                <div className="keys"><kbd>T</kbd></div>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Cambiar Modo Libro/Webtoon</span>
                <div className="keys"><kbd>M</kbd></div>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Cerrar modales / Menú</span>
                <div className="keys"><kbd>Esc</kbd></div>
              </div>
            </div>
          </div>

          {/* Mouse & Touch Section */}
          <div className="help-section">
            <div className="section-title">
              <MousePointer size={16} />
              <span>Ratón y Pantalla Táctil</span>
            </div>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <span className="shortcut-desc">Bordes laterales (Desktop)</span>
                <span className="badge-pill">Clic para avanzar / retroceder</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Zona central</span>
                <span className="badge-pill">Clic/Tap para mostrar u ocultar menú</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Lupa de detalle</span>
                <span className="badge-pill">Doble clic o icono de zoom</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Celular (Modo Webtoon)</span>
                <span className="badge-pill">Deslizar hacia abajo sin cortes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
