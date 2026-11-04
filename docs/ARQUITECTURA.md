# Arquitectura Aloxter (AsistenteIA)

Diagrama draw.io: [`arquitectura-aloxter.drawio`](./arquitectura-aloxter.drawio)

Ábrelo con [diagrams.net](https://app.diagrams.net/) o la extensión Draw.io de VS Code/Cursor.

## Páginas del diagrama

1. **Arquitectura General** — clientes, frontend, backend, OpenAI, CI/CD  
2. **Flujo Chat** — recorrido completo de `POST /chat`  
3. **Flujo Voz iOS/Android** — STT + TTS y particularidades de iPhone  
4. **Estructura Repo + CI/CD** — árbol del proyecto, pipeline y guion de presentación  

## Resumen técnico (producción)

| Capa | Tecnología |
|------|------------|
| UI | `public/` HTML/CSS/JS (`app.js`, `voice.js`) |
| Hosting | Firebase Hosting → `https://asistenteia-185c4.web.app` |
| API | Cloud Function `api` (Express) Node.js 22, `us-central1` |
| Endpoints | `GET /health`, `POST /chat` |
| IA | OpenAI `gpt-6.1-sol` (`functions/config/asistente.js`) |
| Secreto | `functions.config().openai.key` |
| CI/CD | GitHub Actions `.github/workflows/firebase-deploy.yml` |
| Repo | https://github.com/alexanderruiz46/asistenteia |

## Nota

La carpeta `src/` es plantilla React; **la app en producción se sirve desde `public/`**.
