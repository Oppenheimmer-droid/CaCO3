import React from 'react';
import { PanelData, RoomLightboxState, CustomRoomData } from '../types';
import { DefaultRoomIllustration } from './DefaultRoomIllustration';

interface RoomLightboxProps {
  isOpen: boolean;
  roomData: RoomLightboxState;
  panels: PanelData[];
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onScriptChange: (script: string) => void;
  onExplanationChange: (explanation: string) => void;
  onImageUrlChange: (imageUrl: string) => void;
  onLinkedPanelIndexChange: (index: number) => void;
  onSave: () => void;
  onReset: () => void;
}

export const RoomLightbox: React.FC<RoomLightboxProps> = ({
  isOpen,
  roomData,
  panels,
  onClose,
  onTitleChange,
  onScriptChange,
  onExplanationChange,
  onImageUrlChange,
  onLinkedPanelIndexChange,
  onSave,
  onReset
}) => {
  if (!isOpen || !roomData.selectedRoomId) return null;

  const handlePanelLinkChange = (val: number) => {
    onLinkedPanelIndexChange(val);
    if (val !== -1 && panels[val]) {
      // Auto-fill from comic panel
      onTitleChange(panels[val].title);
      onScriptChange(panels[val].script);
      onExplanationChange(panels[val].explanation);
      onImageUrlChange(panels[val].imageUrl || '');
    }
  };

  const handleRandomImage = () => {
    const randomUrl = `https://picsum.photos/300/220?random=${Math.random()}`;
    onImageUrlChange(randomUrl);
  };

  return (
    <div
      className="slideshow-overlay"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-color)',
          border: '3px solid #000000',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '550px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          color: 'var(--text-color)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          backgroundColor: '#fef08a',
          color: '#000000',
          padding: '1.25rem',
          borderBottom: '3px solid #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
              {roomData.title || 'Modificar Habitación'}
            </h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>
              Modificando habitación de la Rue
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#000', fontSize: '1.75rem', fontWeight: 'bold', cursor: 'pointer', padding: '0 0.5rem' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto', textAlign: 'left' }}>
          
          {/* Visual Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', flexShrink: 0, backgroundColor: '#fef08a', border: '2px solid #000', borderRadius: '6px', overflow: 'hidden' }}>
                {roomData.imageUrl ? (
                  <img src={roomData.imageUrl} alt={roomData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                ) : (
                  <DefaultRoomIllustration type="empty" />
                )}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  Previsualización en la Rue
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>
                  "{roomData.script || 'Sin texto'}"
                </p>
              </div>
            </div>
            {roomData.imageUrl ? (
              <div style={{ border: '2px solid #000', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                <img src={roomData.imageUrl} alt={roomData.title} style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div style={{ border: '2px dashed #000', borderRadius: '8px', padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                Sin imagen asignada. El placeholder neutro se mostrará en la fachada hasta que cargues una URL propia.
              </div>
            )}
          </div>

          {/* Title Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              Título de la Viñeta / Habitación:
            </label>
            <input
              type="text"
              value={roomData.title}
              onChange={(e) => onTitleChange(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem',
                color: 'var(--text-color)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Script Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              Texto del Diálogo / Guion:
            </label>
            <textarea
              value={roomData.script}
              onChange={(e) => onScriptChange(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem',
                color: 'var(--text-color)',
                fontSize: '0.9rem',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Explanation Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              Explicación Contextual (Metadata):
            </label>
            <input
              type="text"
              value={roomData.explanation}
              onChange={(e) => onExplanationChange(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem',
                color: 'var(--text-color)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Panel Link Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              Vincular a Viñeta de Cómic Generado:
            </label>
            <select
              value={roomData.linkedPanelIndex}
              onChange={(e) => handlePanelLinkChange(parseInt(e.target.value))}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem',
                color: 'var(--text-color)',
                fontSize: '0.9rem'
              }}
            >
              <option value={-1}>No vincular (Mantener clásico o personalizado)</option>
              {panels.map((p, pIdx) => (
                <option key={pIdx} value={pIdx}>
                  Viñeta {pIdx + 1}: {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              URL de Imagen Externa / Personalizada (Opcional):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={roomData.imageUrl}
                onChange={(e) => onImageUrlChange(e.target.value)}
                placeholder="https://example.com/imagen.jpg"
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem',
                  color: 'var(--text-color)',
                  fontSize: '0.9rem'
                }}
              />
              <button
                onClick={handleRandomImage}
                className="secondary-button"
                style={{ margin: 0, padding: '0.6rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                Aleatoria 🎲
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          padding: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onReset}
            className="secondary-button"
            style={{ margin: 0, borderColor: '#ef4444', color: '#ef4444' }}
          >
            Restaurar Original 🧹
          </button>
          <button
            onClick={onClose}
            className="secondary-button"
            style={{ margin: 0 }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="generate-button"
            style={{ margin: 0, padding: '0.5rem 1.25rem', fontSize: '0.9rem', backgroundColor: '#10b981', borderColor: '#059669' }}
          >
            Guardar Cambios ✔️
          </button>
        </div>
      </div>
    </div>
  );
};
