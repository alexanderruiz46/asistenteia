class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.initializeVoiceRecognition();
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
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