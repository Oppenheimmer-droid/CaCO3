export const IMAGE_GENERATION_STYLE = "Estilo: Arte conceptual tipo cómic, 'ink and charcoal style'.";

export const IMAGE_SAFETY_RULES = `
REGLAS DE SEGURIDAD ESTRICTAS (Safety Filters):
1. PROHIBIDO absolutamente: armas de cualquier tipo, sangre, heridas, cadáveres, lesiones.
2. PROHIBIDO: figuras políticas reales (presidentes, líderes, celebridades), uniformes militares con insignias reconocibles, banderas nacionales específicas.
3. PROHIBIDO: violencia explícita, explosiones realistas, escenas de guerra literales.
4. PROHIBIDO: contenido sexual, desnudez, discriminación.
5. PARA CONFLICTOS/TRAGEDIAS: Usar METÁFORAS VISUALES POÉTICAS:
   - Relojes rotos simbolizando tiempo perdido
   - Flores marchitas o en el suelo
   - Nubes de tormenta o cielos grises
   - Sombras largas al atardecer
   - Manos unidas o separadas
   - Puertas abiertas o cerradas
   - Escaleras ascendentes o descendentes
   - Libros abiertos o cerrados
   - Velas encendidas o apagadas
6. Priorizar ATMÓSFERA y SIMBOLISMO sobre acción literal.
7. La imagen DEBE ser apta para todo público (G/PG rated).
`.trim();

export const IMAGE_PROMPT_SUFFIX = `
${IMAGE_GENERATION_STYLE}
${IMAGE_SAFETY_RULES}
`.trim();

export const DEFAULT_SCRIPT_PROMPT = `Analiza el siguiente texto y crea un guion para un cómic de 8 viñetas. Devuelve tu respuesta como un array JSON. Cada objeto en el array debe representar una viñeta y contener cuatro claves: 
1. "title" (un título corto y evocador para la viñeta).
2. "script" (la narración o diálogo para la viñeta, debe ser breve y contundente).
3. "explanation" (Añade dos líneas a manera de explicación concreta sobre qué trata contextualmente lo conceptual del título de la diapositiva, analizando el guion para ello).
4. "imagePrompt" (Descripción visual para la IA generadora de imágenes. ${IMAGE_PROMPT_SUFFIX})

Asegúrate de que el array contenga exactamente 8 objetos, resumiendo los puntos más importantes del texto original en orden.`;

export const STORAGE_KEY = 'paperboy_state';

export const GENERATION_DEFAULTS = {
  maxAttempts: 5,
  retryDelayQuota: 35000,
  retryDelayServer: 5000,
  interPanelDelay: 30000,
};
