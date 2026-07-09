import React from 'react';

interface DefaultRoomIllustrationProps {
  type: string;
}

export const DefaultRoomIllustration: React.FC<DefaultRoomIllustrationProps> = ({ type }) => {
  const commonSvgProps = {
    viewBox: "0 0 100 100",
    style: { maxHeight: '110px', width: '100%', height: '100%', display: 'block', margin: 'auto' }
  };

  switch (type) {
    case 'buhardilla':
      return (
        <svg {...commonSvgProps}>
          <path d="M 10 90 L 90 90 L 50 15 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <rect x="35" y="45" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="45" x2="50" y2="70" stroke="currentColor" strokeWidth="2" />
          <line x1="35" y1="57" x2="65" y2="57" stroke="currentColor" strokeWidth="2" />
          <path d="M 18 80 Q 25 65 38 72" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="70" y="73" width="16" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'tejado':
      return (
        <svg {...commonSvgProps}>
          <path d="M 5 65 Q 25 55 45 65 T 85 65 T 125 65" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M 15 80 Q 35 70 55 80 T 95 80" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="75" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 30 58 C 30 48, 40 43, 40 58" stroke="currentColor" strokeWidth="3" fill="none" />
          <circle cx="40" cy="41" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 38 37 L 35 33" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 42 37 L 45 33" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="60" cy="56" r="3.5" fill="currentColor" />
          <line x1="60" y1="56" x2="68" y2="56" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'inventor':
      return (
        <svg {...commonSvgProps}>
          <path d="M 40 30 L 40 50 L 25 80 A 5 5 0 0 0 30 87 L 70 87 A 5 5 0 0 0 75 80 L 60 50 L 60 30 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="38" y1="30" x2="62" y2="30" stroke="currentColor" strokeWidth="3" />
          <circle cx="45" cy="70" r="4" fill="currentColor" />
          <circle cx="55" cy="65" r="3" fill="currentColor" />
          <circle cx="50" cy="45" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="53" cy="20" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'ancianita':
      return (
        <svg {...commonSvgProps}>
          <circle cx="35" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M 30 48 Q 22 65 35 75 Q 48 65 40 48" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="70" cy="70" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="55" y1="70" x2="85" y2="70" stroke="currentColor" strokeWidth="2" />
          <line x1="70" y1="55" x2="70" y2="85" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'dentista':
      return (
        <svg {...commonSvgProps}>
          <path d="M 30 25 C 20 25, 20 50, 30 50 C 40 50, 40 25, 30 25 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M 28 50 L 22 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M 32 50 L 38 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M 65 30 C 65 20, 75 20, 75 30 C 75 40, 70 45, 73 55 C 70 55, 68 50, 68 40 C 62 40, 65 30, 65 30 Z" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    case 'familia':
      return (
        <svg {...commonSvgProps}>
          <circle cx="30" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 15 70 C 15 50, 45 50, 45 70" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 40 60 C 40 45, 60 45, 60 60" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="70" cy="40" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 58 75 C 58 55, 82 55, 82 75" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'sastre':
      return (
        <svg {...commonSvgProps}>
          <circle cx="35" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="35" cy="65" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="43" y1="45" x2="75" y2="65" stroke="currentColor" strokeWidth="3" />
          <line x1="43" y1="60" x2="75" y2="40" stroke="currentColor" strokeWidth="3" />
          <path d="M 50 15 Q 50 5 45 10 Q 40 15 50 15 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 30 30 L 50 15 L 70 30 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'ladron':
      return (
        <svg {...commonSvgProps}>
          <rect x="20" y="25" width="40" height="25" rx="5" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="32" cy="37" r="4" fill="currentColor" />
          <circle cx="48" cy="37" r="4" fill="currentColor" />
          <path d="M 65 65 C 55 65, 55 85, 70 85 C 85 85, 85 65, 75 65 Q 73 55, 70 55" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="64" y1="60" x2="76" y2="60" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'tienda':
      return (
        <svg {...commonSvgProps}>
          <line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="80" x2="50" y2="40" stroke="currentColor" strokeWidth="3" />
          <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="3" />
          <path d="M 25 40 L 35 40 Q 30 55 25 40" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 65 40 L 75 40 Q 70 55 65 40" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'porteria':
      return (
        <svg {...commonSvgProps}>
          <line x1="30" y1="20" x2="55" y2="75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50 65 L 65 78 L 58 83 L 43 70 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="75" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <line x1="75" y1="43" x2="75" y2="60" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      );
    case 'alcantarilla':
      return (
        <svg {...commonSvgProps}>
          <ellipse cx="50" cy="75" rx="35" ry="12" fill="none" stroke="currentColor" strokeWidth="3" />
          <ellipse cx="50" cy="67" rx="30" ry="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="42" cy="40" rx="4" ry="6" fill="currentColor" />
          <ellipse cx="58" cy="40" rx="4" ry="6" fill="currentColor" />
          <circle cx="42" cy="40" r="1.5" fill="white" />
          <circle cx="58" cy="40" r="1.5" fill="white" />
          <path d="M 38 60 Q 50 48 62 60" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'empty':
    default:
      return (
        <svg {...commonSvgProps}>
          <path d="M 5 15 Q 10 5 15 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 95 15 Q 90 5 85 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="15" y="15" width="70" height="35" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
          <text x="50" y="34" fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor" fontFamily="monospace">SE ALQUILA</text>
          <text x="50" y="44" fontSize="6" textAnchor="middle" fill="currentColor" opacity="0.7" fontFamily="sans-serif">PISO VACÍO</text>
          <path d="M 15 15 Q 25 25 15 35" stroke="currentColor" strokeWidth="1" opacity="0.4" fill="none" />
        </svg>
      );
  }
};
