import { describe, it, expect } from 'vitest';
import { createFacadeCellMap, DEFAULT_FACADE_CELL_LAYOUT } from '../utils/facadeConfig';

describe('createFacadeCellMap', () => {
  it('creates a cell map for every layout entry', () => {
    const result = createFacadeCellMap({
      piso1_izq: 'https://example.com/left.jpg',
      porteria: 'https://example.com/porteria.jpg'
    });

    expect(Object.keys(result)).toHaveLength(DEFAULT_FACADE_CELL_LAYOUT.length);
    expect(result.piso1_izq.imageUrl).toBe('https://example.com/left.jpg');
    expect(result.porteria.imageUrl).toBe('https://example.com/porteria.jpg');
  });

  it('uses placeholder data when no image is provided', () => {
    const result = createFacadeCellMap({});
    expect(result.piso2_der.placeholder).toContain('PISO VACÍO');
    expect(result.azotea_buhardilla.imageUrl).toBeUndefined();
  });
});
