# CaCO3

This repository contains the Paperboy app and its deployment configuration.

## Main app

- Frontend: [paperboy](paperboy)
- Backend: [paperboy/server](paperboy/server)
- GitHub Pages deployment workflow: [.github/workflows/deploy-gh-pages.yml](.github/workflows/deploy-gh-pages.yml)

## Recommended setup

- Use Ollama as the default AI provider.
- Keep Gemini as an optional provider when a key is configured.
- Deploy the backend separately if you want to keep secrets off the browser.
