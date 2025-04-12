// Configuración de la API
const API_URL = 'https://us-central1-asistenteia-185c4.cloudfunctions.net/api';

// Elementos del DOM
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Estado del chat
let mensajesAnteriores = [];

// Funciones auxiliares
function mostrarCargando() {
    loadingIndicator.classList.remove('hidden');
}

function ocultarCargando() {
    loadingIndicator.classList.add('hidden');
}

function agregarMensaje(mensaje, esUsuario = false) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `flex items-start space-x-3 message ${esUsuario ? 'flex-row-reverse space-x-reverse' : ''}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'flex-shrink-0';
    avatarDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full ${esUsuario ? 'bg-gray-300' : 'bg-gradient-to-r from-blue-500 to-blue-600'} flex items-center justify-center">
            ${esUsuario ? '<i class="fas fa-user text-white"></i>' : '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%232196f3\'/%3E%3Cpath d=\'M50 20 L80 80 L20 80 Z\' fill=\'white\'/%3E%3C/svg%3E" alt="Logo Aloxter" class="w-6 h-6">'}
        </div>
    `;

    const contenidoDiv = document.createElement('div');
    contenidoDiv.className = `flex-grow ${esUsuario ? 'text-right' : ''}`;
    
    const mensajeBurbuja = document.createElement('div');
    mensajeBurbuja.className = `rounded-lg p-3 ${esUsuario ? 'user-message' : 'assistant-message'}`;
    mensajeBurbuja.innerHTML = `<p>${mensaje}</p>`;

    contenidoDiv.appendChild(mensajeBurbuja);
    mensajeDiv.appendChild(avatarDiv);
    mensajeDiv.appendChild(contenidoDiv);
    chatMessages.appendChild(mensajeDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function agregarSugerencias(sugerencias) {
    const sugerenciasDiv = document.createElement('div');
    sugerenciasDiv.className = 'mt-2 flex flex-wrap gap-2';
    
    sugerencias.forEach(sugerencia => {
        const boton = document.createElement('button');
        boton.className = 'sugerencia-btn px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors';
        boton.textContent = sugerencia;
        boton.onclick = () => {
            userInput.value = sugerencia;
            chatForm.dispatchEvent(new Event('submit'));
        };
        sugerenciasDiv.appendChild(boton);
    });

    const ultimoMensaje = chatMessages.lastElementChild;
    if (ultimoMensaje) {
        const contenidoDiv = ultimoMensaje.querySelector('.flex-grow');
        contenidoDiv.appendChild(sugerenciasDiv);
    }
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    if (errorMessage) {
        errorMessage.textContent = mensaje;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }
}

// Función para mostrar mensajes de éxito
function mostrarExito(mensaje) {
    if (successMessage) {
        successMessage.textContent = mensaje;
        successMessage.classList.remove('hidden');
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 5000);
    }
}

// Función para procesar la respuesta
async function procesarRespuesta(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP: ${response.status}`);
    }
    return response.json();
}

// Función para enviar mensaje al chat
async function enviarMensaje(mensaje) {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({ message: mensaje })
        });

        const data = await procesarRespuesta(response);
        return {
            text: data.response,
            model: data.model,
            version: data.version
        };
    } catch (error) {
        console.error('Error completo:', error);
        throw error;
    }
}

// Función para manejar el envío del formulario
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const mensajeInput = document.getElementById('user-input');
    const mensaje = mensajeInput.value.trim();
    
    if (!mensaje) {
        mostrarError('Por favor, escribe un mensaje');
        return;
    }

    try {
        // Mostrar mensaje del usuario
        const chatBox = document.getElementById('chat-messages');
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.textContent = mensaje;
        chatBox.appendChild(userMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Limpiar input
        mensajeInput.value = '';

        // Mostrar indicador de carga
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'bot-message loading';
        loadingMessage.textContent = 'Pensando...';
        chatBox.appendChild(loadingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Obtener respuesta
        const respuesta = await enviarMensaje(mensaje);

        // Remover indicador de carga
        loadingMessage.remove();

        // Mostrar respuesta
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        botMessage.innerHTML = `
            ${respuesta.text}
            <div class="model-info">
                <small>Modelo: ${respuesta.model} | Versión: ${respuesta.version}</small>
            </div>
        `;
        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Reproducir la respuesta con voz
        if (window.voiceAssistant) {
            window.voiceAssistant.speak(respuesta.text);
        }

        mostrarExito('Mensaje enviado correctamente');
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        mostrarError(error.message || 'Error al enviar el mensaje. Por favor, intenta de nuevo.');
    }
});

// Verificar el estado de la API al cargar la página
async function verificarAPI() {
    try {
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        const data = await procesarRespuesta(response);
        console.log('Estado de la API:', data);
    } catch (error) {
        console.error('Error al verificar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, recarga la página.');
    }
}

// Verificar API al cargar la página
verificarAPI();

// Manejar sugerencias iniciales
document.querySelectorAll('.sugerencia-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        userInput.value = btn.textContent;
        chatForm.dispatchEvent(new Event('submit'));
    });
});

// Manejar tecla Enter
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Cargar el script de voz
    const voiceScript = document.createElement('script');
    voiceScript.src = 'voice.js';
    document.head.appendChild(voiceScript);

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Agregar mensaje del usuario
        addMessage(message, 'user');
        userInput.value = '';
        loadingIndicator.classList.remove('hidden');

        try {
            const response = await fetch('https://us-central1-asistenteia-185c4.cloudfunctions.net/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();
            
            // Agregar respuesta del asistente
            addMessage(data.response, 'assistant');
            
            // Reproducir la respuesta con voz
            if (window.voiceAssistant) {
                window.voiceAssistant.speak(data.response);
            }

            successMessage.textContent = 'Mensaje enviado correctamente';
            successMessage.classList.remove('hidden');
            setTimeout(() => successMessage.classList.add('hidden'), 3000);
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Error al enviar el mensaje. Por favor, intenta nuevamente.';
            errorMessage.classList.remove('hidden');
            setTimeout(() => errorMessage.classList.add('hidden'), 3000);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    });

    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        
        const messageContent = document.createElement('p');
        messageContent.textContent = text;
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}); 