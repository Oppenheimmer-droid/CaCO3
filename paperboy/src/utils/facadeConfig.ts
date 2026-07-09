export interface FacadeCellDefinition {
  id: string;
  row: number;
  col: number;
  label: string;
  roomId: string;
  placeholder: string;
  defaultImage: string;
  description?: string;
}

export const DEFAULT_FACADE_CELL_LAYOUT: FacadeCellDefinition[] = [
  {
    id: 'azotea_buhardilla',
    row: 0,
    col: 0,
    label: 'Buhardilla',
    roomId: 'buhardilla',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'buhardilla',
    description: 'Azotea'
  },
  {
    id: 'azotea_tejado',
    row: 0,
    col: 2,
    label: 'Tejado',
    roomId: 'tejado',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'tejado',
    description: 'Azotea'
  },
  {
    id: 'piso3_izq',
    row: 1,
    col: 0,
    label: 'Piso 3º Izquierda',
    roomId: 'piso3_izq',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'inventor',
    description: 'Piso intermedio'
  },
  {
    id: 'piso3_der',
    row: 1,
    col: 2,
    label: 'Piso 3º Derecha',
    roomId: 'piso3_der',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'ancianita',
    description: 'Piso intermedio'
  },
  {
    id: 'piso2_izq',
    row: 2,
    col: 0,
    label: 'Piso 2º Izquierda',
    roomId: 'piso2_izq',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'dentista',
    description: 'Piso intermedio'
  },
  {
    id: 'piso2_der',
    row: 2,
    col: 2,
    label: 'Piso 2º Derecha',
    roomId: 'piso2_der',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'familia',
    description: 'Piso intermedio'
  },
  {
    id: 'piso1_izq',
    row: 3,
    col: 0,
    label: 'Piso 1º Izquierda',
    roomId: 'piso1_izq',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'sastre',
    description: 'Piso intermedio'
  },
  {
    id: 'piso1_der',
    row: 3,
    col: 2,
    label: 'Piso 1º Derecha',
    roomId: 'piso1_der',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'ladron',
    description: 'Piso intermedio'
  },
  {
    id: 'planta_baja_izq',
    row: 4,
    col: 0,
    label: 'Planta Baja Izquierda',
    roomId: 'tienda',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'tienda',
    description: 'Planta baja'
  },
  {
    id: 'porteria',
    row: 4,
    col: 2,
    label: 'Portería',
    roomId: 'porteria',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'porteria',
    description: 'Planta baja'
  },
  {
    id: 'alcantarilla',
    row: 5,
    col: 1,
    label: 'Alcantarilla',
    roomId: 'alcantarilla',
    placeholder: 'PISO VACÍO / SE ALQUILA',
    defaultImage: 'alcantarilla',
    description: 'Exterior'
  }
];

export type FacadeCellConfig = Record<string, string | undefined>;

export function createFacadeCellMap(config: FacadeCellConfig = {}): Record<string, FacadeCellDefinition & { imageUrl?: string }> {
  return DEFAULT_FACADE_CELL_LAYOUT.reduce((acc, cell) => {
    acc[cell.id] = {
      ...cell,
      imageUrl: config[cell.id]
    };
    return acc;
  }, {} as Record<string, FacadeCellDefinition & { imageUrl?: string }>);
}
