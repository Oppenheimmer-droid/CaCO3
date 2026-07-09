import React from 'react';
import { RoomData } from '../types';
import { DefaultRoomIllustration } from './DefaultRoomIllustration';

interface FacadeCellProps {
  label: string;
  description: string;
  room: RoomData;
  onClick: (roomId: string) => void;
  imageUrl?: string;
  placeholder: string;
}

export const FacadeCell: React.FC<FacadeCellProps> = ({
  label,
  description,
  room,
  onClick,
  imageUrl,
  placeholder
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(room.id)}
      style={{
        border: '4px solid #000000',
        backgroundColor: room.bgColor,
        padding: '0.7rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        alignItems: 'stretch',
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: '140px',
        boxShadow: '4px 4px 0 #000000',
      }}
      aria-label={`Abrir ${label}`}
    >
      <div style={{ borderBottom: '2px solid #000000', paddingBottom: '0.3rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.15rem' }}>
          {description}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #000000',
          backgroundColor: '#f9fafb',
          minHeight: '92px',
          overflow: 'hidden'
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={room.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div style={{ color: '#111827', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DefaultRoomIllustration type={room.defaultImage} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
        {room.imageUrl ? 'Imagen propia' : placeholder}
      </div>
    </button>
  );
};
