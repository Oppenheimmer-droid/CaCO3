import React, { useState } from 'react';
import { PanelData, SocialExportState } from '../types';

interface SocialExportModalProps {
  isOpen: boolean;
  state: SocialExportState;
  panels: PanelData[];
  copiedTweetIndex: number | null;
  onClose: () => void;
  onThemeChange: (theme: 'dark' | 'light') => void;
  onAccentColorChange: (color: string) => void;
  onRatioChange: (ratio: 'square' | 'landscape') => void;
  onAuthorChange: (author: string) => void;
  onPreviewIndexChange: (index: number) => void;
  onExportLinkedInPdf: () => void;
  onExportXZip: () => void;
  onCopyTweet: (text: string, index: number) => void;
}

const ACCENT_COLORS = ['#10b981', '#0077b5', '#6366f1', '#f59e0b', '#ec4899', '#ffffff'];

export const SocialExportModal: React.FC<SocialExportModalProps> = ({
  isOpen,
  state,
  panels,
  copiedTweetIndex,
  onClose,
  onThemeChange,
  onAccentColorChange,
  onRatioChange,
  onAuthorChange,
  onPreviewIndexChange,
  onExportLinkedInPdf,
  onExportXZip,
  onCopyTweet
}) => {
  if (!isOpen) return null;

  const currentPanel = panels[state.previewIndex];

  return (
    <div
      className="slideshow-overlay"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1000px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #333', backgroundColor: '#222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 'bold' }}>
              Exportar Presentación para Redes Sociales
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', padding: '0 0.5rem' }}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', flexWrap: 'wrap', overflowY: 'auto', minHeight: 0 }}>
          
          {/* Left Column: Live Preview */}
          <div style={{
            flex: '1 1 450px',
            backgroundColor: '#121212',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #333'
          }}>
            <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                Vista previa en tiempo real
              </span>
            </div>

            {panels.length > 0 ? (
              <>
                <div style={{
                  width: '100%',
                  maxWidth: state.ratio === 'square' ? '380px' : '480px',
                  aspectRatio: state.ratio === 'square' ? '1/1' : '16/9',
                  backgroundColor: state.theme === 'dark' ? '#121212' : '#ffffff',
                  color: state.theme === 'dark' ? '#f3f4f6' : '#111827',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '25px',
                  borderRadius: '12px',
                  border: state.theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${state.accentColor}`, paddingBottom: '8px', fontSize: '11px' }}>
                    <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: state.accentColor }}>
                      Paperboy IA • Presentación
                    </span>
                    <span style={{ fontWeight: 'bold', color: state.theme === 'dark' ? '#9ca3af' : '#4b5563' }}>
                      {state.previewIndex + 1} de {panels.length}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ display: 'flex', flex: 1, gap: '15px', alignItems: 'center', margin: '15px 0', minHeight: 0 }}>
                    {currentPanel?.imageUrl ? (
                      <div style={{ flex: 1.2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px', border: state.theme === 'dark' ? '1px solid #2d2d2d' : '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img
                          src={currentPanel.imageUrl}
                          alt={currentPanel.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{ flex: 1.2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: state.theme === 'dark' ? '#1a1a1a' : '#f3f4f6', borderRadius: '8px', border: '1px dashed #ccc' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>Sin imagen</span>
                      </div>
                    )}

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', overflow: 'hidden' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: state.theme === 'dark' ? '#ffffff' : '#000000', lineHeight: '1.2' }}>
                        {currentPanel?.title}
                      </h4>
                      {currentPanel?.explanation && (
                        <p style={{ margin: 0, fontSize: '10px', color: state.theme === 'dark' ? '#10b981' : '#059669', fontStyle: 'italic', fontWeight: '500' }}>
                          {currentPanel.explanation}
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.4', color: state.theme === 'dark' ? '#d1d5db' : '#4b5563', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {currentPanel?.script}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: state.theme === 'dark' ? '1px solid #2d2d2d' : '1px solid #e5e7eb', paddingTop: '8px', fontSize: '10px', color: state.theme === 'dark' ? '#9ca3af' : '#4b5563' }}>
                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {state.author ? `Por: ${state.author}` : 'Generado por Paperboy IA'}
                    </span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {panels.map((_, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '12px',
                            height: '3.5px',
                            borderRadius: '1px',
                            backgroundColor: idx === state.previewIndex ? state.accentColor : (state.theme === 'dark' ? '#2d2d2d' : '#e5e7eb'),
                            transition: 'background-color 0.2s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Navigation */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => onPreviewIndexChange(Math.max(0, state.previewIndex - 1))}
                    disabled={state.previewIndex === 0}
                    className="secondary-button"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Anterior
                  </button>
                  <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                    {state.previewIndex + 1} / {panels.length}
                  </span>
                  <button
                    onClick={() => onPreviewIndexChange(Math.min(panels.length - 1, state.previewIndex + 1))}
                    disabled={state.previewIndex === panels.length - 1}
                    className="secondary-button"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: '#888' }}>Crea un cómic primero para previsualizar.</div>
            )}
          </div>

          {/* Right Column: Configuration */}
          <div style={{
            flex: '1 1 350px',
            backgroundColor: '#1f1f1f',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Configuration Section */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                Personalización
              </h3>

              {/* Author */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                  Firma del Autor:
                </label>
                <input
                  type="text"
                  value={state.author}
                  onChange={(e) => onAuthorChange(e.target.value)}
                  placeholder="Ej: @TuNombre o tucuenta"
                  style={{
                    width: '100%',
                    backgroundColor: '#121212',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Aspect Ratio */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                  Formato de Diapositiva:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onRatioChange('square')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: state.ratio === 'square' ? state.accentColor : '#2c2c2c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Cuadrado (1:1) ⭐
                  </button>
                  <button
                    onClick={() => onRatioChange('landscape')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: state.ratio === 'landscape' ? state.accentColor : '#2c2c2c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Horizontal (16:9)
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                  Tema Visual:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onThemeChange('dark')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: state.theme === 'dark' ? '#333' : '#222',
                      color: '#fff',
                      border: state.theme === 'dark' ? `1px solid ${state.accentColor}` : '1px solid #444',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Oscuro (Premium)
                  </button>
                  <button
                    onClick={() => onThemeChange('light')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: state.theme === 'light' ? '#f5f5f5' : '#222',
                      color: state.theme === 'light' ? '#333' : '#ccc',
                      border: state.theme === 'light' ? `1px solid ${state.accentColor}` : '1px solid #444',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Claro (Elegante)
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                  Color de Acento:
                </label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => onAccentColorChange(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: state.accentColor === color ? '2px solid #fff' : '1px solid #444',
                        cursor: 'pointer',
                        outline: state.accentColor === color ? '2px solid #10b981' : 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                Descargar Archivos
              </h3>

              {state.isExporting ? (
                <div style={{ backgroundColor: '#2c2c2c', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
                  <div className="spinner" style={{ margin: '0 auto 0.5rem auto' }}></div>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: '#10b981', fontWeight: 'bold' }}>
                    Procesando Diapositivas: {state.progress}%
                  </p>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#444', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ width: `${state.progress}%`, height: '100%', backgroundColor: state.accentColor, transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* LinkedIn PDF */}
                  <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#0077b5', fontWeight: 'bold', fontSize: '0.9rem' }}>LinkedIn Carousel (PDF)</span>
                    </div>
                    <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.75rem', color: '#aaa', textAlign: 'left' }}>
                      Sube este PDF a LinkedIn como un "Documento" para publicar una presentación interactiva.
                    </p>
                    <button
                      onClick={onExportLinkedInPdf}
                      className="generate-button"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', backgroundColor: '#0077b5', borderColor: '#006193', margin: 0 }}
                    >
                      Descargar PDF Carrusel 📄
                    </button>
                  </div>

                  {/* X/Twitter ZIP */}
                  <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Pack para X / Twitter (ZIP)</span>
                    </div>
                    <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.75rem', color: '#aaa', textAlign: 'left' }}>
                      Descarga un ZIP con todas las diapositivas como imágenes PNG numeradas individuales.
                    </p>
                    <button
                      onClick={onExportXZip}
                      className="generate-button"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#fff', margin: 0 }}
                    >
                      Descargar Imágenes ZIP 📦
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thread Copier Footer */}
        {panels.length > 0 && (
          <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #333', backgroundColor: '#1e1e1e', overflowY: 'auto', maxHeight: '250px' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🧵</span> Copiador de Hilo para X (Twitter)
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'left', marginBottom: '1rem' }}>
              Copia el texto adaptado para cada post de tu hilo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {panels.map((panel, idx) => {
                const tweetText = `${idx === 0 ? `🧵 HILO: ${panel.title}\n\n` : `${panel.title}\n\n`}${panel.script}\n\n(${idx + 1}/${panels.length}) 👇`;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', backgroundColor: '#121212', border: '1px solid #2d2d2d', padding: '0.75rem 1rem', borderRadius: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: state.accentColor, display: 'block', marginBottom: '0.25rem' }}>
                        Post {idx + 1} de {panels.length}
                      </span>
                      <pre style={{ margin: 0, fontSize: '0.8rem', color: '#ddd', fontFamily: 'inherit', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>
                        {tweetText}
                      </pre>
                    </div>
                    <button
                      onClick={() => onCopyTweet(tweetText, idx)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: copiedTweetIndex === idx ? '#10b981' : '#222',
                        color: '#fff',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        minWidth: '85px',
                        textAlign: 'center'
                      }}
                    >
                      {copiedTweetIndex === idx ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
