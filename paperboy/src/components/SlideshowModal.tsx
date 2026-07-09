import React, { useEffect, useCallback } from 'react';
import { PanelData } from '../types';

interface SlideshowModalProps {
  isOpen: boolean;
  currentIndex: number;
  panels: PanelData[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  isOpen,
  currentIndex,
  panels,
  onClose,
  onNext,
  onPrev
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'ArrowRight') {
      if (currentIndex < panels.length - 1) {
        onNext();
      }
    }
    if (e.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        onPrev();
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [isOpen, currentIndex, panels.length, onNext, onPrev, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || panels.length === 0) return null;

  const panel = panels[currentIndex];

  return (
    <div className="slideshow-overlay" onClick={onClose}>
      <div className="slideshow-content" onClick={e => e.stopPropagation()}>
        <button className="close-slideshow" onClick={onClose}>×</button>
        
        <div className="slide-body">
          {currentIndex > 0 && (
            <button className="nav-button prev" onClick={onPrev}>&#10094;</button>
          )}
          
          <div className="slide-main" key={currentIndex}>
            {panel.imageUrl ? (
              <img
                src={panel.imageUrl}
                alt={panel.title}
                className="slide-image"
              />
            ) : (
              <div className="slide-placeholder">Sin imagen disponible</div>
            )}
            <div className="slide-text">
              <h3>{currentIndex + 1}. {panel.title}</h3>
              {panel.explanation && (
                <p className="slide-explanation">{panel.explanation}</p>
              )}
              <p>{panel.script}</p>
            </div>
          </div>

          {currentIndex < panels.length - 1 && (
            <button className="nav-button next" onClick={onNext}>&#10095;</button>
          )}
        </div>
        <div className="slide-footer">
          {currentIndex + 1} / {panels.length}
        </div>
      </div>
    </div>
  );
};
