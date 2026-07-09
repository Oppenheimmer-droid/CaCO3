import React from 'react';
import { PanelData, SocialExportState } from '../types';

interface SocialSlideRenderTargetProps {
  renderIndex: number | null;
  panels: PanelData[];
  state: SocialExportState;
}

export const SocialSlideRenderTarget: React.FC<SocialSlideRenderTargetProps> = ({
  renderIndex,
  panels,
  state
}) => {
  if (renderIndex === null || !panels[renderIndex]) return null;

  const panel = panels[renderIndex];

  return (
    <div
      id="social-slide-render-target"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: state.ratio === 'square' ? '600px' : '800px',
        height: state.ratio === 'square' ? '600px' : '450px',
        backgroundColor: state.theme === 'dark' ? '#121212' : '#ffffff',
        color: state.theme === 'dark' ? '#f3f4f6' : '#111827',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '30px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Slide Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${state.accentColor}`, paddingBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: state.accentColor }}>
          Paperboy IA • Presentación
        </span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: state.theme === 'dark' ? '#9ca3af' : '#4b5563' }}>
          {renderIndex + 1} de {panels.length}
        </span>
      </div>

      {/* Slide Body */}
      <div style={{ display: 'flex', flex: 1, gap: '20px', alignItems: 'center', margin: '20px 0', minHeight: 0 }}>
        {/* Slide Image */}
        {panel.imageUrl ? (
          <div style={{ flex: 1.2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px', border: state.theme === 'dark' ? '1px solid #2d2d2d' : '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <img
              src={panel.imageUrl}
              alt={panel.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div style={{ flex: 1.2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: state.theme === 'dark' ? '#1a1a1a' : '#f3f4f6', borderRadius: '8px', border: '1px dashed #ccc' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Sin imagen</span>
          </div>
        )}

        {/* Slide Text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', lineHeight: '1.2', color: state.theme === 'dark' ? '#ffffff' : '#000000' }}>
            {panel.title}
          </h3>
          
          {panel.explanation && (
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: state.theme === 'dark' ? '#10b981' : '#059669', fontStyle: 'italic', fontWeight: '500' }}>
              {panel.explanation}
            </p>
          )}

          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', color: state.theme === 'dark' ? '#d1d5db' : '#374151' }}>
            {panel.script}
          </p>
        </div>
      </div>

      {/* Slide Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: state.theme === 'dark' ? '1px solid #2d2d2d' : '1px solid #e5e7eb', paddingTop: '10px', fontSize: '12px', color: state.theme === 'dark' ? '#9ca3af' : '#4b5563' }}>
        <span>{state.author ? `Por: ${state.author}` : 'Generado por Paperboy IA'}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: panels.length }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '16px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx === renderIndex ? state.accentColor : (state.theme === 'dark' ? '#2d2d2d' : '#e5e7eb')
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
