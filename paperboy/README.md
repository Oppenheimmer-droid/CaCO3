<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Paperboy - Generador de Cómics IA

Generador de cómics con IA que analiza texto, genera guiones de 8 viñetas y produce imágenes automatizadas. También incluye una réplica interactiva del edificio "13, Rue del Percebe" de Francisco Ibáñez.

## Proveedores de IA

Paperboy soporta múltiples proveedores de IA que puedes configurar mediante variables de entorno:

### Gemini (predeterminado)

Usa los modelos de Google Gemini para generación de texto e imágenes.

```bash
# Configuración
AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
```

Modelos utilizados:
- `gemini-2.0-flash` - Generación de guiones
- `imagen-3-generate-001` - Generación de imágenes

### Ollama (local)

Usa modelos locales de Ollama para generación de texto.

```bash
# Configuración
AI_PROVIDER=ollama
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
```

**Nota:** La mayoría de modelos Ollama no soportan generación de imágenes. Para eso, considera usar Gemini o implementar soporte para modelos de visión como llava.

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Proveedor: 'gemini' o 'ollama'
AI_PROVIDER=gemini

# Para Gemini:
VITE_GEMINI_API_KEY=tu_api_key

# Para Ollama (opcional):
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
```

### Variables de build (con prefijo VITE_)

Las variables que necesitan estar disponibles en el bundle del cliente deben tener el prefijo `VITE_`.

## Run Locally

**Prerequisites:** Node.js

1. Instala dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno:
   ```bash
   # Crea .env.local
   AI_PROVIDER=gemini
   VITE_GEMINI_API_KEY=tu_api_key
   ```

3. Ejecuta la app:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Compila para producción
npm run lint     # Verifica tipos TypeScript
npm run preview  # Previsualiza la build de producción
```

## Características

- **Generación de cómics**: Analiza texto y genera 8 viñetas con imágenes
- **Auto-generación**: Genera secuencias de imágenes automáticas
- **Edición inline**: Edita textos y regenera imágenes individualmente
- **Vista del edificio 13 Rue del Percebe**: Réplica interactiva con fachada configurable por celdas
- **Exportación**: PNG, PDF, Slides para LinkedIn, ZIP para X/Twitter
- **Importación**: Soporta archivos .txt, .pdf y audio
- **Autoguardado**: Guarda el progreso automáticamente en localStorage

## Configuración de la fachada

Cada celda de la fachada puede recibir una URL de imagen propia. Para cargar tus imágenes, abre una celda y pega la URL en el campo de imagen o usa el JSON equivalente de ejemplo:

```json
{
  "azotea_buhardilla": "https://example.com/mi-imagen.jpg",
  "piso1_izq": "https://example.com/piso-1.jpg",
  "porteria": "https://example.com/porteria.jpg"
}
```

Si una celda no tiene imagen, la aplicación muestra un placeholder neutro y sigue siendo editable desde el lightbox.

## IA estática y GitHub Pages

La app está preparada para desplegarse como sitio estático en GitHub Pages. El proveedor de IA puede configurarse sin backend mediante un archivo JSON público en la ruta [paperboy/public/config/ai-config.json](paperboy/public/config/ai-config.json):

```json
{
  "provider": "ollama",
  "ollamaBaseUrl": "http://localhost:11434",
  "ollamaModel": "llama3.2"
}
```

Para GitHub Pages, el flujo recomendado es:
- usar Ollama en un equipo local o un servidor accesible desde la red,
- o dejar el valor en `gemini` y suministrar `geminiApiKey` si quieres usar Gemini desde el cliente.

> La app sigue siendo estática: no necesita un backend para servir la interfaz, aunque las funciones de IA dependerán de la disponibilidad del proveedor configurado.

## Despliegue automático en GitHub Pages

El repositorio incluye un workflow en [paperboy/.github/workflows/deploy-gh-pages.yml](paperboy/.github/workflows/deploy-gh-pages.yml) que construye la app y la publica en GitHub Pages cuando se hace push a Main.

## Seguridad en Generación de Imágenes

El sistema incluye reglas de seguridad strictas para evitar contenido inapropiado:

- Prohibido: armas, sangre, violencia, figuras políticas reales
- Para conflictos/tragedias: usa metáforas visuales poéticas
- Siempre genera contenido apta para todo público

## Estructura del Proyecto

```
src/
├── components/     # Componentes React
├── constants/      # Constantes y configuración
├── hooks/          # Hooks personalizados
├── services/       # Servicios (IA, exportación)
├── types/          # Tipos TypeScript
├── utils/          # Utilidades
└── __tests__/      # Tests unitarios
```
