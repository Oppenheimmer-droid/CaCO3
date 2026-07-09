import { DefaultRoomInfo } from '../types';

export const defaultRooms: Record<string, DefaultRoomInfo> = {
  buhardilla: {
    name: "Buhardilla (Manolo)",
    defaultTitle: "Buhardilla de Manolo",
    defaultText: "Manolo, el inquilino moroso, sigue escondido redactando novelas de misterio mientras burla a sus numerosos acreedores.",
    defaultExplanation: "El piso superior del edificio, habitado por el genio incomprendido y pícaro.",
    bgColor: "#fef08a",
    defaultPanelIndex: 6,
    defaultImage: "buhardilla"
  },
  tejado: {
    name: "Tejado (Gato y Ratón)",
    defaultTitle: "El Tejado de la Rue",
    defaultText: "El travieso ratón le gasta otra broma pesada al desdichado gato negro.",
    defaultExplanation: "Viñeta muda tradicional en la parte superior derecha de la fachada.",
    bgColor: "#fbcfe8",
    defaultPanelIndex: null,
    defaultImage: "tejado"
  },
  piso3_izq: {
    name: "Piso 3º Izquierda (Científico)",
    defaultTitle: "Piso 3º Izquierda",
    defaultText: "Un científico chiflado trabaja en su última poción de invisibilidad, que terminará estallando en su rostro.",
    defaultExplanation: "Laboratorio del inventor loco del edificio.",
    bgColor: "#bfdbfe",
    defaultPanelIndex: 0,
    defaultImage: "inventor"
  },
  piso3_der: {
    name: "Piso 3º Derecha (Ancianita)",
    defaultTitle: "Piso 3º Derecha",
    defaultText: "Doña Leonor cuida con cariño de su nuevo cocodrilo doméstico ante la mirada horrorizada de sus vecinos.",
    defaultExplanation: "La ancianita que adopta todo tipo de fieras salvajes.",
    bgColor: "#bbf7d0",
    defaultPanelIndex: 1,
    defaultImage: "ancianita"
  },
  piso2_izq: {
    name: "Piso 2º Izquierda (Dentista)",
    defaultTitle: "Piso 2º Izquierda",
    defaultText: "El dentista extrae un diente con un par de tenazas oxidadas mientras el paciente grita de terror.",
    defaultExplanation: "La tétrica y cómica consulta del dentista del edificio.",
    bgColor: "#fed7aa",
    defaultPanelIndex: 2,
    defaultImage: "dentista"
  },
  piso2_der: {
    name: "Piso 2º Derecha (Familia)",
    defaultTitle: "Piso 2º Derecha",
    defaultText: "La inmensa familia numerosa intenta cenar junta en una mesa de té diminuta, haciendo malabares en el techo.",
    defaultExplanation: "Los inquilinos que redefinen el espacio y el hacinamiento.",
    bgColor: "#ddd6fe",
    defaultPanelIndex: 3,
    defaultImage: "familia"
  },
  piso1_izq: {
    name: "Piso 1º Izquierda (Sastre)",
    defaultTitle: "Piso 1º Izquierda",
    defaultText: "El sastre remienda a toda prisa trajes con agujeros estratégicos para ahorrar tela.",
    defaultExplanation: "La sastrería del maestro del parche.",
    bgColor: "#cbd5e1",
    defaultPanelIndex: 4,
    defaultImage: "sastre"
  },
  piso1_der: {
    name: "Piso 1º Derecha (Ladrón)",
    defaultTitle: "Piso 1º Derecha",
    defaultText: "Ceferino el ladrón llega de madrugada con una farola municipal que robó del parque.",
    defaultExplanation: "El ladrón profesional que siempre trae botines insólitos.",
    bgColor: "#fed7aa",
    defaultPanelIndex: 5,
    defaultImage: "ladron"
  },
  tienda: {
    name: "Bajo Izquierda (Colmado)",
    defaultTitle: "Colmado Senén",
    defaultText: "Senén el tendero disimula apoyando su dedo gordo en la balanza para cobrar de más.",
    defaultExplanation: "La popular tienda de ultramarinos donde la astucia cotiza al alza.",
    bgColor: "#fbcfe8",
    defaultPanelIndex: 7,
    defaultImage: "tienda"
  },
  porteria: {
    name: "Bajo Derecha (Portería)",
    defaultTitle: "La Portería",
    defaultText: "Doña Rita vigila con mirada de detective a todos los que entran y salen del edificio.",
    defaultExplanation: "El centro oficial de rumores y cotilleos vecinales.",
    bgColor: "#bfdbfe",
    defaultPanelIndex: null,
    defaultImage: "porteria"
  },
  alcantarilla: {
    name: "La Alcantarilla (Don Hurón)",
    defaultTitle: "La Alcantarilla",
    defaultText: "Don Hurón asoma feliz desde su acogedora alcantarilla, saludando a los transeúntes de la Rue.",
    defaultExplanation: "El peculiar habitante del alcantarillado urbano.",
    bgColor: "#4b5563",
    defaultPanelIndex: null,
    defaultImage: "alcantarilla"
  }
};

// Custom image generation prompts for comic panels
export const IMAGE_GENERATION_STYLE = "Estilo: Arte conceptual tipo cómic, 'ink and charcoal style'.";

// Strict safety rules for image generation - replace the original ones
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

export const AUTO_GENERATION_PROMPT = `Analiza el siguiente texto y crea una lista de prompts visuales para generar una secuencia de imágenes. Debes identificar tantos "tempos" (etapas, giros narrativos o cambios de atmósfera) como consideres necesarios para ilustrar la esencia del texto de forma completa. No te limites a un número fijo, sino a la riqueza de "tempos" que detectes.
Cada prompt debe ser una descripción visual única, artística y metafórica. Devuelve el resultado exclusivamente como un array JSON de strings.
${IMAGE_PROMPT_SUFFIX}`;

export const PANEL_REGENERATION_PROMPT = `Genera un prompt de imagen EXTREMADAMENTE SEGURO (Safety Filter Friendly) para una viñeta de cómic.
Estilo: Boceto a lápiz artístico y atmosférico.
${IMAGE_SAFETY_RULES}

Descripción de la escena original:`;

export const TRANSCRIPTION_PROMPT = "Tu tarea es transcribir el siguiente archivo de audio. Proporciona únicamente el texto transcrito como resultado, sin comentarios, encabezados o explicaciones adicionales. Solo la transcripción pura.";

export const ROOM_ORDER = [
  'buhardilla', 'tejado',
  'piso3_izq', 'piso3_der',
  'piso2_izq', 'piso2_der',
  'piso1_izq', 'piso1_der',
  'tienda', 'porteria',
  'alcantarilla'
];

export const STORAGE_KEY = 'paperboy_state';

export const GENERATION_DEFAULTS = {
  maxAttempts: 5,
  retryDelayQuota: 35000,
  retryDelayServer: 5000,
  interPanelDelay: 30000,
  autoGenBatchDelay: 5000,
};
