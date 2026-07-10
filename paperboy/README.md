# 🎨 Generador de Cómics con IA

Convierte cualquier texto en un cómic de 8 viñetas usando IA.

## Características

- ✍️ Genera cómics a partir de texto
- 🎨 Imágenes generadas con FAL.AI (Flux)
- 📝 Guiones con Groq (LLM gratuito)
- 📄 Exporta a PNG, PDF y Slides
- 💾 Guarda tu trabajo automáticamente

## Configuración

### Variables de Entorno

```bash
# Groq API (texto - gratis)
GROQ_API_KEY=tu_key_de_groq

# FAL.AI (imágenes)
FAL_API_KEY=tu_key_de_fal
```

Obtén tus API keys:
- **Groq**: https://console.groq.com/keys
- **FAL.AI**: https://fal.ai/dashboard/keys

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
