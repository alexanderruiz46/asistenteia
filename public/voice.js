class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.initializeVoiceRecognition();
    this.initializeVoiceSynthesis();
  }

  initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.isListening = true;
        document.getElementById('voice-input-btn').classList.add('recording');
        document.getElementById('voice-status').classList.remove('hidden');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        document.getElementById('voice-input-btn').classList.remove('recording');
        document.getElementById('voice-status').classList.add('hidden');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('user-input').value = transcript;
        document.getElementById('chat-form').dispatchEvent(new Event('submit'));
      };

      this.recognition.onerror = (event) => {
        console.error('Error en el reconocimiento de voz:', event.error);
        this.isListening = false;
        document.getElementById('voice-input-btn').classList.remove('recording');
        document.getElementById('voice-status').classList.add('hidden');
      };
    }
  }

  initializeVoiceSynthesis() {
    // Esperar a que la API de síntesis de voz esté lista
    if (this.synthesis) {
      this.synthesis.onvoiceschanged = () => {
        const voices = this.synthesis.getVoices();
        // Buscar una voz en español
        this.spanishVoice = voices.find(voice => 
          voice.lang.includes('es') && 
          voice.name.includes('female')
        );
      };
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(text) {
    if (this.synthesis) {
      // Cancelar cualquier síntesis en curso
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      
      // Usar la voz en español si está disponible
      if (this.spanishVoice) {
        utterance.voice = this.spanishVoice;
      }
      
      // Configurar la voz para que suene más natural
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Agregar eventos para mejor control
      utterance.onstart = () => {
        console.log('Iniciando síntesis de voz');
      };

      utterance.onend = () => {
        console.log('Finalizando síntesis de voz');
      };

      utterance.onerror = (event) => {
        console.error('Error en la síntesis de voz:', event);
      };

      this.synthesis.speak(utterance);
    }
  }
}

// Inicializar el asistente de voz
const voiceAssistant = new VoiceAssistant();

// Agregar evento al botón de voz
document.getElementById('voice-input-btn').addEventListener('click', () => {
  if (voiceAssistant.isListening) {
    voiceAssistant.stopListening();
  } else {
    voiceAssistant.startListening();
  }
}); 