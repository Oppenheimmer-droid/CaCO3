<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Paperboy - Generador de Cómics IA

Generador de cómics con IA que analiza texto, genera guiones de 8 viñetas y produce imágenes automatizadas. También incluye una réplica interactiva del edificio "13, Rue del Percebe" de Francisco Ibáñez.

## Proveedores de IA

Paperboy soporta múltiples proveedores de IA que puedes configurar mediante variables de entorno:

### FAL.AI + Flux (recomendado para imágenes)

Usa FAL.AI con el modelo Flux para generación de imágenes de alta calidad. Es la opción recomendada para generar cómics con imágenes realistas y detalladas.

```bash
# Configuración
VITE_IMAGE_PROVIDER=fal
VITE_FAL_API_KEY=tu_api_key_de_fal
VITE_FAL_MODEL=fal-ai/flux-pro
```

Modelos disponibles en FAL:
- `fal-ai/flux-pro` - Mejor calidad, más lento
- `fal-ai/flux-schnell` - Más rápido, menor calidad
- `fal-ai/flux-dev` - Desarrollo

### Ollama (recomendado para texto)

Usa modelos locales de Ollama para generación de texto y, si tu modelo lo soporta, visión. Es la opción recomendada para mantener la app simple, privada y sin depender de claves expuestas en el navegador.

```bash
# Configuración
VITE_AI_PROVIDER=ollama
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3
VITE_OLLAMA_API_KEY=
```

### Gemini (opcional)

Usa los modelos de Google Gemini para generación de texto, imágenes y transcripción. Solo conviene activarlo si quieres una alternativa más potente o si ya tienes una API key configurada.

```bash
# Configuración
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
```

Modelos utilizados:
- `gemini-2.0-flash` - Generación de guiones
- `imagen-3-generate-001` - Generación de imágenes

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Proveedor de IA de texto: 'gemini' o 'ollama'
VITE_AI_PROVIDER=ollama

# Para Gemini (opcional):
VITE_GEMINI_API_KEY=

# Para Ollama (recomendado):
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3
VITE_OLLAMA_API_KEY=

# Backend opcional para mantener las claves fuera del navegador
VITE_BACKEND_URL=http://localhost:4000

# Para FAL.AI (generación de imágenes con Flux):
VITE_IMAGE_PROVIDER=fal
VITE_FAL_API_KEY=tu_api_key_de_fal
VITE_FAL_MODEL=fal-ai/flux-pro
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
  "ollamaModel": "llama3",
  "ollamaApiKey": ""
}
```

Para GitHub Pages, el flujo recomendado es:
- usar Ollama como proveedor principal,
- o habilitar Gemini solo si quieres una alternativa más potente y ya tienes la API key configurada.

> La app sigue siendo estática: no necesita un backend para servir la interfaz, aunque las funciones de IA dependerán de la disponibilidad del proveedor configurado.

## Despliegue en Render

El proyecto está configurado para desplegarse en [Render](https://render.com/) usando el blueprint [`render.yaml`](render.yaml) en la raíz del repositorio.

### Pasos para desplegar:

1. **Conecta tu repositorio a Render:**
   - Ve a [dashboard.render.com](https://dashboard.render.com)
   - Crea una nueva cuenta o inicia sesión
   - Click en "New +" > "Blueprint"

2. **Configura las variables de entorno:**
   En el dashboard de Render, agrega las siguientes variables de entorno para tu servicio:

   | Variable | Valor | Descripción |
   |----------|-------|-------------|
   | `NODE_ENV` | `production` | Entorno de producción |
   | `PORT` | `10000` | Puerto del servidor |
   | `AI_PROVIDER` | `ollama` | Proveedor de IA de texto |
   | `OLLAMA_BASE_URL` | `https://ollama.com/api` | URL de Ollama Cloud |
   | `OLLAMA_MODEL` | `llama3` | Modelo Ollama |
   | `OLLAMA_API_KEY` | Tu clave | Clave de Ollama (opcional) |
   | `IMAGE_PROVIDER` | `fal` | Proveedor de imágenes |
   | `FAL_API_KEY` | Tu clave | **Clave de FAL.AI** (requerida) |
   | `FAL_MODEL` | `fal-ai/flux-pro` | Modelo Flux (recomendado) |

   **Nota:** Las variables `OLLAMA_API_KEY` y `FAL_API_KEY` deben configurarse como `sync: false` para proteger las claves.

3. **Despliegue automático:**
   - Render detectará automáticamente el archivo `render.yaml`
   - Hará build del frontend y servidor
   - Desplegará la aplicación

### Obtención de claves API:

**FAL.AI (generación de imágenes):**
1. Ve a [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
2. Crea una nueva API key
3. Configúrala en las variables de entorno de Render como `FAL_API_KEY`

**Ollama (generación de texto):**
1. Ve a [ollama.com](https://ollama.com)
2. Regístrate y obtén tu API key
3. Configúrala en las variables de entorno de Render como `OLLAMA_API_KEY`

### Arquitectura del despliegue:

```
┌─────────────────────────────────────────────────────┐
│                    Render Service                    │
│  ┌─────────────────────────────────────────────┐    │
│  │              Express Server                 │    │
│  │  ┌───────────┐  ┌───────────────────┐      │    │
│  │  │  Static   │  │    API            │      │    │
│  │  │  Files    │  │   Endpoints       │      │    │
│  │  │  (dist/)  │  │  /api/*           │      │    │
│  │  └───────────┘  └───────────────────┘      │    │
│  └─────────────────────────────────────────────┘    │
│                    │                               │
│         ┌──────────┴──────────┐                     │
│         ▼                     ▼                     │
│   Ollama Cloud          FAL.AI (Flux)                │
│   (Texto)              (Imágenes)                   │
└─────────────────────────────────────────────────────┘
```

### Endpoints disponibles:

- `GET /` - Sirve la aplicación React
- `GET /health` - Health check
- `GET /config/ai-config.json` - Configuración de IA
- `POST /api/generate` - Generación de texto con IA
- `POST /api/generate-image` - Generación de imágenes
- `POST /api/transcribe` - Transcripción de audio

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
