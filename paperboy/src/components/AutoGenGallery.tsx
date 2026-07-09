import React from 'react';
import { downloadImage } from '../services/exportService';

interface AutoGenGalleryProps {
  images: string[];
  prompts: string[];
  isAutoGenerating: boolean;
  progress: number;
  totalPrompts: number;
  isWaiting: boolean;
  onExportGallery: () => void;
  isExporting: boolean;
}

export const AutoGenGallery: React.FC<AutoGenGalleryProps> = ({
  images,
  prompts,
  isAutoGenerating,
  progress,
  totalPrompts,
  isWaiting,
  onExportGallery,
  isExporting
}) => {
  if (images.length === 0 && !isAutoGenerating) return null;

  return (
    <section
      className="auto-gen-section"
      style={{
        width: '100%',
        maxWidth: '800px',
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--surface-color)',
        borderRadius: '12px'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ margin: 0, color: '#10b981' }}>
          Galería de Generación Automática
        </h2>
        {images.length > 0 && (
          <button
            className="export-button"
            onClick={onExportGallery}
            disabled={isExporting}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            {isExporting ? 'Exportando...' : 'Descargar Secuencia (PDF)'}
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        {images.map((img, idx) => (
          <div
            key={idx}
            className="auto-gen-card"
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
          >
            <img
              src={img}
              alt={`Auto gen ${idx + 1}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <button
              onClick={() => downloadImage(img, `generacion-auto-${idx + 1}.jpg`)}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '0.7rem'
              }}
              title="Descargar imagen"
            >
              ↓
            </button>
            {prompts[idx] && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '4px 8px',
                  fontSize: '0.65rem',
                  maxHeight: '40px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={prompts[idx]}
              >
                {prompts[idx].substring(0, 50)}...
              </div>
            )}
          </div>
        ))}

        {/* Loading placeholder */}
        {isAutoGenerating && progress < totalPrompts && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '180px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            border: '1px dashed #10b981'
          }}>
            <div className="spinner"></div>
            <p style={{
              fontSize: '0.8rem',
              marginTop: '0.5rem',
              color: '#10b981',
              textAlign: 'center',
              padding: '0 0.5rem'
            }}>
              {isWaiting
                ? 'Límite alcanzado. Esperando cuota...'
                : `Generando ${progress + 1}/${totalPrompts}...`
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
