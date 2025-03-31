// Importar las dependencias necesarias
import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v1/https';
import { config } from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { ASISTENTE_CONFIG } from './config/asistente.js';
import { normalizeText } from './utils/textUtils.js';

initializeApp();

// Crear la aplicación Express
const app = express();

// Usar CORS sin opciones específicas para permitir todos los orígenes
app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    region: 'us-central1'
  });
});

// Ruta de chat
app.post('/chat', async (req, res) => {
  try {
    if (!req.body.message) {
      return res.status(400).json({
        error: 'Mensaje requerido',
        message: 'El campo message es obligatorio'
      });
    }

    // Normalizar el texto del mensaje
    const normalizedMessage = normalizeText(req.body.message);

    const openai = new OpenAI({
      apiKey: config().openai.key
    });

    const completion = await openai.chat.completions.create({
      model: ASISTENTE_CONFIG.model,
      messages: [
        {
          role: "system",
          content: ASISTENTE_CONFIG.systemPrompt
        },
        {
          role: "user",
          content: normalizedMessage
        }
      ],
      temperature: ASISTENTE_CONFIG.temperature,
      max_tokens: ASISTENTE_CONFIG.maxTokens
    });

    res.json({
      response: completion.choices[0].message.content,
      model: ASISTENTE_CONFIG.model,
      version: ASISTENTE_CONFIG.version
    });
  } catch (error) {
    console.error('Error en /chat:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Exportar la aplicación Express como una Cloud Function
export const api = onRequest(app);
