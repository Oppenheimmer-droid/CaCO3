import React, { useCallback } from 'react';
import { PanelData, CustomRoomData, RoomData } from '../types';
import { defaultRooms, ROOM_ORDER } from '../constants';
import { DefaultRoomIllustration } from './DefaultRoomIllustration';
import { exportBuildingPng, exportBuildingPdf } from '../services/exportService';

interface BuildingViewProps {
  panels: PanelData[];
  activeElevatorFloor: number;
  roomCustomizations: Record<string, CustomRoomData>;
  isExporting: boolean;
  onElevatorFloorChange: (floor: number) => void;
  onRoomClick: (roomId: string) => void;
  onResetAllCustomizations: () => void;
  onExportingChange: (exporting: boolean) => void;
  onLoadingMessageChange: (message: string) => void;
  onError: (error: string) => void;
}

export const BuildingView: React.FC<BuildingViewProps> = ({
  panels,
  activeElevatorFloor,
  roomCustomizations,
  isExporting,
  onElevatorFloorChange,
  onRoomClick,
  onResetAllCustomizations,
  onExportingChange,
  onLoadingMessageChange,
  onError
}) => {
  const getRoomData = useCallback((roomId: string): RoomData => {
    const custom = roomCustomizations[roomId];
    const base = defaultRooms[roomId];
    
    if (!base) {
      throw new Error(`Room ${roomId} not found`);
    }

    let linkedPanel: PanelData | undefined;
    let panelIndex = custom?.linkedPanelIndex !== undefined
      ? custom.linkedPanelIndex
      : base.defaultPanelIndex;

    if (panelIndex !== null && panelIndex !== undefined && panelIndex >= 0 && panels[panelIndex]) {
      linkedPanel = panels[panelIndex];
    }

    return {
      id: roomId,
      name: base.name,
      defaultTitle: base.defaultTitle,
      defaultText: base.defaultText,
      defaultExplanation: base.defaultExplanation,
      bgColor: base.bgColor,
      defaultPanelIndex: base.defaultPanelIndex,
      defaultImage: base.defaultImage,
      title: custom?.title !== undefined ? custom.title : (linkedPanel?.title || base.defaultTitle),
      script: custom?.script !== undefined ? custom.script : (linkedPanel?.script || base.defaultText),
      explanation: custom?.explanation !== undefined ? custom.explanation : (linkedPanel?.explanation || base.defaultExplanation),
      imageUrl: custom?.imageUrl !== undefined ? custom.imageUrl : (linkedPanel?.imageUrl || undefined),
      linkedPanelIndex: panelIndex
    };
  }, [panels, roomCustomizations]);

  const handleExportPng = async () => {
    onExportingChange(true);
    onLoadingMessageChange('Generando captura del edificio...');
    try {
      await exportBuildingPng('building-container-export');
    } catch (err) {
      console.error("Error exporting building PNG:", err);
      onError("Hubo un error al exportar la imagen del edificio.");
    } finally {
      onExportingChange(false);
      onLoadingMessageChange('');
    }
  };

  const handleExportPdf = async () => {
    onExportingChange(true);
    onLoadingMessageChange('Generando PDF del edificio...');
    try {
      await exportBuildingPdf('building-container-export');
    } catch (err) {
      console.error("Error exporting building PDF:", err);
      onError("Hubo un error al exportar el PDF del edificio.");
    } finally {
      onExportingChange(false);
      onLoadingMessageChange('');
    }
  };

  const renderRoom = (roomId: string) => {
    const r = getRoomData(roomId);
    return (
      <div
        onClick={() => onRoomClick(roomId)}
        style={{
          backgroundColor: r.bgColor,
          border: '4px solid #000000',
          borderRadius: '4px',
          padding: '10px',
          minHeight: '160px',
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
        }}
        className="hover:scale-[1.01] hover:border-emerald-500 hover:shadow-lg"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: '3px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
            {r.name.split('(')[0].trim()}
          </span>
          <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: 'bold' }}>
            {r.name.includes('(') ? r.name.match(/\(([^)]+)\)/)?.[1] : ''}
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
            {r.imageUrl ? (
              <img
                src={r.imageUrl}
                alt={r.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid #000', borderRadius: '3px' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <DefaultRoomIllustration type={r.defaultImage} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 3px 0', fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
              {r.title}
            </h4>
            <p style={{ margin: 0, fontSize: '10px', color: '#1f2937', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2' }}>
              {r.script}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderElevatorShaft = (floor: number, isMain: boolean = false) => (
    <div
      style={{
        backgroundColor: '#374151',
        border: '4px solid #000000',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px',
        position: 'relative',
        minHeight: isMain ? '160px' : undefined
      }}
    >
      {floor > 0 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: '4px', backgroundColor: '#facc15', left: 'calc(50% - 2px)' }}></div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onElevatorFloorChange(floor); }}
        style={{
          position: 'absolute',
          right: '5px',
          top: floor > 0 ? '5px' : 'auto',
          bottom: floor === 0 ? '10px' : 'auto',
          width: '18px',
          height: '18px',
          fontSize: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: activeElevatorFloor === floor ? '#10b981' : '#1f2937',
          color: '#fff',
          border: '1px solid #000',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        {floor === 0 ? 'B' : `${floor}º`}
      </button>
      
      {floor > 0 && (
        <>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#facc15', textAlign: 'center', marginTop: '20px' }}>
            {floor}º
          </div>
          {activeElevatorFloor === floor && (
            <div style={{
              width: '42px',
              height: '64px',
              backgroundColor: '#7c2d12',
              border: '3px solid #000',
              borderRadius: '4px',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
              marginTop: '10px'
            }}>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#eab308' }}></div>
              <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold', marginTop: '4px' }}>🛎️ {floor}º</span>
              <div style={{ width: '32px', height: '24px', border: '1px solid #f59e0b', marginTop: '4px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ borderRight: '1px solid #f59e0b' }} />)}
              </div>
            </div>
          )}
        </>
      )}

      {floor === 0 && (
        <>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#facc15', textAlign: 'center', marginTop: '20px' }}>
            MACH. MOTOR
          </div>
          <div style={{ fontSize: '9px', color: '#fff', textAlign: 'center' }}>MOTOR</div>
          {activeElevatorFloor === 0 ? (
            <div style={{
              width: '42px',
              height: '64px',
              backgroundColor: '#7c2d12',
              border: '3px solid #000',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
              marginTop: '10px'
            }}>
              <span style={{ fontSize: '11px' }}>🚪</span>
            </div>
          ) : (
            <div style={{
              width: '55px',
              height: '70px',
              border: '3px solid #000',
              backgroundColor: '#cbd5e1',
              marginTop: '10px',
              display: 'flex',
              cursor: 'pointer'
            }}
              onClick={() => onElevatorFloorChange(0)}
            >
              <div style={{ flex: 1, borderRight: '2px solid #000', position: 'relative' }}>
                <div style={{ width: '4px', height: '12px', backgroundColor: '#000', position: 'absolute', right: '2px', top: '30px' }}></div>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ width: '4px', height: '12px', backgroundColor: '#000', position: 'absolute', left: '2px', top: '30px' }}></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
      {/* Building Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        <button
          className="export-button"
          onClick={handleExportPng}
          disabled={isExporting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#059669', borderColor: '#047857' }}
        >
          Descargar Edificio (PNG) 📸
        </button>
        <button
          className="export-button"
          onClick={handleExportPdf}
          disabled={isExporting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0284c7', borderColor: '#0369a1' }}
        >
          Descargar Edificio (PDF) 📄
        </button>
        <button
          className="secondary-button"
          onClick={onResetAllCustomizations}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#ef4444', color: '#ef4444' }}
        >
          Restaurar Edificio 🔄
        </button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
        💡 ¡Haz clic en cualquier habitación para expandirla, cambiar su texto, vincular otra viñeta o cargar tu propia imagen!
      </p>

      {/* Elevator Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
        <span>⚙️</span>
        <span>Piso actual: <strong>{activeElevatorFloor === 0 ? 'Bajo' : `${activeElevatorFloor}º`}</strong></span>
      </div>

      {/* Scrollable Wrapper */}
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
        {/* Building Container */}
        <div
          id="building-container-export"
          style={{
            minWidth: '680px',
            width: '100%',
            backgroundColor: '#e5e7eb',
            padding: '24px',
            borderRadius: '16px',
            border: '6px solid #000000',
            color: '#111827',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header Title */}
          <div style={{
            backgroundColor: '#facc15',
            border: '4px solid #000000',
            padding: '12px 24px',
            textAlign: 'center',
            marginBottom: '20px',
            transform: 'rotate(-0.5deg)',
            boxShadow: '5px 5px 0px #000000',
            borderRadius: '6px',
            position: 'relative'
          }}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '2px', color: '#000000', fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 0px #fff' }}>
              13, RUE DEL PERCEBE
            </h2>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#1f2937', marginTop: '2px', letterSpacing: '1px' }}>
              • RÉPLICA COOPERATIVA IA • HOMENAJE AL MAESTRO FRANCISCO IBÁÑEZ
            </div>
          </div>

          {/* Building Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px 1fr',
            gap: '8px',
            backgroundColor: '#1f2937',
            padding: '8px',
            borderRadius: '8px',
            border: '5px solid #000000'
          }}>
            {/* Level 4: Roof */}
            {renderRoom('buhardilla')}
            {renderElevatorShaft(4)}
            {renderRoom('tejado')}

            {/* Level 3 */}
            {renderRoom('piso3_izq')}
            {renderElevatorShaft(3)}
            {renderRoom('piso3_der')}

            {/* Level 2 */}
            {renderRoom('piso2_izq')}
            {renderElevatorShaft(2)}
            {renderRoom('piso2_der')}

            {/* Level 1 */}
            {renderRoom('piso1_izq')}
            {renderElevatorShaft(1)}
            {renderRoom('piso1_der')}

            {/* Level 0: Ground Floor */}
            {renderRoom('tienda')}
            {renderElevatorShaft(0, true)}
            {renderRoom('porteria')}
          </div>

          {/* Street / Sewer */}
          <div style={{
            marginTop: '10px',
            borderTop: '6px solid #000000',
            backgroundColor: '#374151',
            borderRadius: '0 0 8px 8px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Street Lamp */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute', left: '25px', bottom: '12px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fef08a', border: '2px solid #000', boxShadow: '0 0 10px #fef08a' }}></div>
              <div style={{ width: '4px', height: '55px', backgroundColor: '#111827', borderLeft: '1px solid #4b5563' }}></div>
            </div>

            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', paddingLeft: '45px' }}>
              RUE DEL PERCEBE • ACERA SUR
            </div>

            {/* Sewer */}
            {(() => {
              const r = getRoomData('alcantarilla');
              return (
                <div
                  onClick={() => onRoomClick('alcantarilla')}
                  style={{
                    backgroundColor: r.bgColor,
                    border: '3px solid #000000',
                    borderRadius: '12px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '2px 2px 0px #000000'
                  }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1f2937', border: '1px solid #000', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DefaultRoomIllustration type="alcantarilla" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#facc15' }}>{r.title}</div>
                    <div style={{ fontSize: '9px', color: '#e5e7eb', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{r.script}"
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
