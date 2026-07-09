import React from 'react';
import { PanelData } from '../types';

interface ComicPanelProps {
  panel: PanelData;
  index: number;
  reversedIndex: number;
  isEditing: boolean;
  editedScript: string;
  editImagePrompt: string;
  isGenerated: boolean;
  isLoading: boolean;
  onEditClick: (index: number) => void;
  onScriptChange: (script: string) => void;
  onImagePromptChange: (prompt: string) => void;
  onRegenerate: (index: number) => void;
  onEditImage: (index: number) => void;
  onCancelEdit: () => void;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({
  panel,
  index,
  reversedIndex,
  isEditing,
  editedScript,
  editImagePrompt,
  isGenerated,
  isLoading,
  onEditClick,
  onScriptChange,
  onImagePromptChange,
  onRegenerate,
  onEditImage,
  onCancelEdit
}) => {
  return (
    <article className="comic-panel">
      <div className="image-container">
        {panel.imageUrl ? (
          <img src={panel.imageUrl} alt={panel.title} />
        ) : (
          <div className="placeholder-image">
            <p role="alert">⚠️ No se pudo generar la imagen.</p>
            {panel.error && <p className="placeholder-error">{panel.error}</p>}
          </div>
        )}
        {panel.isRegenerating && (
          <div className="spinner-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      <div className="text-content">
        <h2>{panel.title}</h2>
        {panel.explanation && <p className="panel-explanation">{panel.explanation}</p>}
        
        {isEditing ? (
          <div className="panel-edit-form">
            {/* Option 1: Edit Script and Regenerate Image */}
            <div className="edit-section">
              <label className="edit-label">Opción 1: Editar Guion (Recrear Imagen)</label>
              <textarea
                value={editedScript}
                onChange={(e) => onScriptChange(e.target.value)}
                rows={3}
                placeholder="Edita el texto de la viñeta..."
              />
              <button
                onClick={() => onRegenerate(reversedIndex)}
                disabled={panel.isRegenerating}
                className="regenerate-button"
              >
                {panel.isRegenerating ? 'Generando...' : 'Re-generar desde cero'}
              </button>
            </div>

            {/* Option 2: Edit Existing Image */}
            {panel.imageUrl && (
              <div className="edit-section">
                <label className="edit-label">Opción 2: Generar Nueva Imagen</label>
                <div className="edit-image-row">
                  <input
                    type="text"
                    className="edit-image-input"
                    value={editImagePrompt}
                    onChange={(e) => onImagePromptChange(e.target.value)}
                    placeholder="Describe la nueva imagen que quieres generar..."
                  />
                  <button
                    onClick={() => onEditImage(reversedIndex)}
                    disabled={panel.isRegenerating || !editImagePrompt.trim()}
                    className="secondary-button"
                  >
                    {panel.isRegenerating ? 'Generando...' : 'Generar Imagen'}
                  </button>
                </div>
              </div>
            )}

            <button onClick={onCancelEdit} className="cancel-button full-width">
              Cancelar Edición
            </button>
          </div>
        ) : (
          <>
            <p>{panel.script}</p>
            {isGenerated && !isLoading && (
              <button onClick={() => onEditClick(reversedIndex)} className="edit-panel-button">
                Editar Viñeta
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
};
