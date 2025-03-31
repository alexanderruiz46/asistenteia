# Aloxter - Asistente Virtual de Tecnología

Aloxter es una aplicación web moderna que implementa un asistente virtual inteligente utilizando tecnologías de vanguardia como React, Firebase y OpenAI. El proyecto está diseñado para proporcionar una experiencia de usuario fluida y una arquitectura escalable.

## 🌟 Características Principales

- **Interfaz de Usuario Moderna**: Diseñada con React y Tailwind CSS
- **Procesamiento de Lenguaje Natural**: Integración con OpenAI GPT
- **Backend Serverless**: Implementado con Firebase Cloud Functions
- **Diseño Responsivo**: Adaptable a todos los dispositivos
- **Normalización de Caracteres**: Manejo automático de caracteres especiales
- **Enfoque en Tecnología**: Especializado exclusivamente en temas de programación y desarrollo

## 🚀 Tecnologías Utilizadas

- **Frontend**:
  - React 18
  - Tailwind CSS
  - React Router
  - React Query
  - React Icons
  - Framer Motion

- **Backend**:
  - Firebase Cloud Functions
  - OpenAI API

- **Herramientas de Desarrollo**:
  - TypeScript
  - ESLint
  - Prettier
  - Jest
  - Vite

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Firebase
- Cuenta de OpenAI
- Git

## 🛠️ Configuración del Entorno de Desarrollo

1. **Clonar el Repositorio**
```bash
git clone https://github.com/alexanderruiz46/asistenteia.git
cd asistenteia
```

2. **Instalar Dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_OPENAI_API_KEY=tu_openai_api_key
```

4. **Iniciar el Servidor de Desarrollo**
```bash
npm run dev
# o
yarn dev
```

## 🏗️ Estructura del Proyecto

```
asistenteia/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── hooks/         # Custom hooks
│   ├── context/       # Contextos de React
│   ├── services/      # Servicios y APIs
│   ├── utils/         # Utilidades
│   ├── styles/        # Estilos globales
│   └── types/         # Definiciones de tipos
├── public/            # Archivos estáticos
├── functions/         # Cloud Functions
└── docs/             # Documentación
```

## 🛠️ Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run test`: Ejecuta las pruebas
- `npm run lint`: Ejecuta el linter
- `npm run format`: Formatea el código

## 🌐 URLs de Producción

- **Frontend**: https://asistenteia.web.app
- **API**: https://us-central1-asistenteia.cloudfunctions.net
- **Documentación**: https://asistenteia.web.app/docs

## 🔒 Seguridad

- Las API keys están almacenadas de forma segura
- Implementación de CORS y CSP
- Validación de datos en el servidor

## 🎨 Características de la UI/UX

- Diseño minimalista y moderno
- Animaciones suaves y transiciones
- Feedback visual para acciones del usuario
- Diseño responsive

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m "Add some AmazingFeature"`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Alexander Ruiz** - *Desarrollo Principal* - [@alexanderruiz46](https://github.com/alexanderruiz46)

## 🙏 Agradecimientos

- OpenAI por su API de GPT
- Firebase por su plataforma serverless
- React por su ecosistema
- La comunidad de desarrolladores

## 🔄 Estado del Proyecto

Este proyecto está en desarrollo activo. Las nuevas características y mejoras se añaden regularmente.

---

Hecho con ❤️ por Alexander Ruiz
