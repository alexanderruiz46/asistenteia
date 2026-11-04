/**
 * Asistente de voz optimizado para iOS Safari/Chrome y Android.
 * - TTS: desbloqueo con gesto del usuario + hack resume de iOS
 * - STT: permiso de micrófono explícito + SpeechRecognition/webkit
 */
class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.isListening = false;
    this.audioUnlocked = false;
    this.spanishVoice = null;
    this.pendingSpeak = null;
    this.isIOS = this.detectIOS();
    this.isAndroid = /Android/i.test(navigator.userAgent);
    this.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    this.initializeVoiceRecognition();
    this.initializeVoiceSynthesis();
    this.bindUI();
  }

  detectIOS() {
    const ua = navigator.userAgent || '';
    const iOSDevice = /iPad|iPhone|iPod/.test(ua);
    const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return iOSDevice || iPadOS;
  }

  bindUI() {
    const btn = document.getElementById('voice-input-btn');
    if (!btn) return;

    // touchend + click: en iOS el gesto debe ser inmediato
    const onPress = (event) => {
      event.preventDefault();
      this.handleMicPress();
    };

    btn.addEventListener('click', onPress);
    btn.addEventListener('touchend', onPress, { passive: false });

    if (!this.SpeechRecognition) {
      btn.classList.add('voice-unsupported');
      btn.title = 'Tu navegador no soporta dictado por voz';
    }
  }

  setListeningUI(active) {
    const btn = document.getElementById('voice-input-btn');
    const status = document.getElementById('voice-status');
    if (btn) btn.classList.toggle('recording', active);
    if (status) status.classList.toggle('hidden', !active);
  }

  showVoiceError(message) {
    if (typeof mostrarError === 'function') {
      mostrarError(message);
      return;
    }
    console.error(message);
    alert(message);
  }

  initializeVoiceRecognition() {
    if (!this.SpeechRecognition) {
      console.warn('SpeechRecognition no disponible en este navegador');
      return;
    }

    this.recognition = new this.SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = this.preferredLang();

    this.recognition.onstart = () => {
      this.isListening = true;
      this.setListeningUI(true);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.setListeningUI(false);
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) finalText += text;
        else interim += text;
      }

      const input = document.getElementById('user-input');
      if (input && (finalText || interim)) {
        input.value = (finalText || interim).trim();
      }

      if (finalText.trim()) {
        this.stopListening();
        this.submitTranscript(finalText.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Error reconocimiento de voz:', event.error);
      this.isListening = false;
      this.setListeningUI(false);

      const messages = {
        'not-allowed': 'Permiso de micrófono denegado. Actívalo en Ajustes del iPhone/Android para Safari/Chrome.',
        'service-not-allowed': 'El dictado no está permitido en este navegador. Prueba Safari en iOS o Chrome en Android.',
        'no-speech': 'No se detectó voz. Mantén pulsado el micrófono e intenta de nuevo.',
        'audio-capture': 'No se pudo acceder al micrófono. Revisa los permisos del dispositivo.',
        network: 'Error de red en el reconocimiento de voz. Revisa tu conexión.',
        aborted: null
      };

      const msg = messages[event.error];
      if (msg) this.showVoiceError(msg);
    };
  }

  preferredLang() {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('es')) return navigator.language;
    return 'es-ES';
  }

  initializeVoiceSynthesis() {
    if (!this.synthesis) return;

    const loadVoices = () => {
      const voices = this.synthesis.getVoices() || [];
      this.spanishVoice = this.pickSpanishVoice(voices);
    };

    loadVoices();
    if (typeof this.synthesis.addEventListener === 'function') {
      this.synthesis.addEventListener('voiceschanged', loadVoices);
    } else {
      this.synthesis.onvoiceschanged = loadVoices;
    }

    // iOS a veces carga voces con retraso
    setTimeout(loadVoices, 250);
    setTimeout(loadVoices, 1000);
  }

  pickSpanishVoice(voices) {
    if (!voices.length) return null;

    const esVoices = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('es'));
    const pool = esVoices.length ? esVoices : voices;

    const preferredNames = [
      'paulina', 'monica', 'mónica', 'sabina', 'luciana',
      '//es', 'google español', 'español', 'spanish'
    ];

    const byName = pool.find((v) => {
      const name = (v.name || '').toLowerCase();
      return preferredNames.some((p) => name.includes(p));
    });
    if (byName) return byName;

    const localEs = esVoices.find((v) => v.localService);
    return localEs || esVoices[0] || pool[0] || null;
  }

  /**
   * iOS bloquea speechSynthesis hasta un gesto del usuario.
   * Llamar siempre desde click/touch del micrófono o botón de audio.
   */
  unlockAudio() {
    if (!this.synthesis || this.audioUnlocked) {
      if (this.pendingSpeak) {
        const text = this.pendingSpeak;
        this.pendingSpeak = null;
        this.speak(text, { force: true });
      }
      return;
    }

    try {
      this.synthesis.cancel();
      const unlockUtterance = new SpeechSynthesisUtterance(' ');
      unlockUtterance.volume = 0;
      unlockUtterance.rate = 1;
      unlockUtterance.lang = this.preferredLang();
      this.synthesis.speak(unlockUtterance);
      // Hack clásico iOS: pause/resume despierta el motor de voz
      this.synthesis.pause();
      this.synthesis.resume();
      this.audioUnlocked = true;
    } catch (error) {
      console.warn('No se pudo desbloquear audio:', error);
    }

    if (this.pendingSpeak) {
      const text = this.pendingSpeak;
      this.pendingSpeak = null;
      setTimeout(() => this.speak(text, { force: true }), this.isIOS ? 120 : 0);
    }
  }

  async ensureMicrophonePermission() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error('Permiso micrófono:', error);
      this.showVoiceError(
        'Necesitas permitir el micrófono. En iPhone: Ajustes → Safari → Micrófono → Permitir.'
      );
      return false;
    }
  }

  async handleMicPress() {
    // Evitar doble disparo touchend+click en móviles
    if (this._micLock) return;
    this._micLock = true;
    setTimeout(() => {
      this._micLock = false;
    }, 450);

    // Crítico en iOS: desbloquear TTS dentro del mismo gesto
    this.unlockAudio();

    if (!this.recognition) {
      this.showVoiceError(
        this.isIOS
          ? 'El dictado por voz requiere Safari actualizado (iOS 14.5+) con micrófono permitido.'
          : 'Tu navegador no soporta reconocimiento de voz. Prueba Chrome.'
      );
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    const allowed = await this.ensureMicrophonePermission();
    if (!allowed) return;

    this.startListening();
  }

  startListening() {
    if (!this.recognition || this.isListening) return;

    try {
      // Cancelar TTS para que no capture el altavoz
      if (this.synthesis) this.synthesis.cancel();
      this.recognition.lang = this.preferredLang();
      this.recognition.start();
    } catch (error) {
      console.error('No se pudo iniciar reconocimiento:', error);
      // Si ya estaba iniciado, reiniciar
      try {
        this.recognition.stop();
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (e2) {
            this.showVoiceError('No se pudo iniciar el micrófono. Intenta de nuevo.');
          }
        }, 200);
      } catch (_) {
        this.showVoiceError('No se pudo iniciar el micrófono. Intenta de nuevo.');
      }
    }
  }

  stopListening() {
    if (!this.recognition) return;
    this.isListening = false;
    this.setListeningUI(false);
    try {
      this.recognition.stop();
    } catch (_) {
      /* ignore */
    }
  }

  submitTranscript(text) {
    const input = document.getElementById('user-input');
    const form = document.getElementById('chat-form');
    if (!input || !form) return;

    input.value = text;

    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }

  firstSentence(text) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    const match = clean.match(/^(.+?[.!?])(?:\s|$)/);
    return (match ? match[1] : clean).trim();
  }

  speak(text, options = {}) {
    if (!this.synthesis) return;
    const toSpeak = this.firstSentence(text);
    if (!toSpeak) return;

    // Si aún no hubo gesto del usuario (típico tras fetch en iOS), guardar pendiente
    if (!this.audioUnlocked && !options.force) {
      this.pendingSpeak = toSpeak;
      return;
    }

    try {
      this.synthesis.cancel();
    } catch (_) {
      /* ignore */
    }

    const start = () => {
      if (!this.spanishVoice) {
        this.spanishVoice = this.pickSpanishVoice(this.synthesis.getVoices() || []);
      }

      const utterance = new SpeechSynthesisUtterance(toSpeak);
      utterance.lang = (this.spanishVoice && this.spanishVoice.lang) || this.preferredLang();
      if (this.spanishVoice) utterance.voice = this.spanishVoice;
      utterance.rate = this.isIOS ? 1.0 : 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onerror = (event) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.error('Error síntesis de voz:', event.error);
        }
      };

      this.synthesis.speak(utterance);

      // Necesario en muchos iPhone: sin pause/resume a veces no suena
      if (this.isIOS) {
        this.synthesis.pause();
        this.synthesis.resume();
      }
    };

    // iOS: pequeño delay tras cancel()
    setTimeout(start, this.isIOS ? 60 : 0);
  }

  /**
   * Reproduce texto tras un toque del usuario (fallback iOS).
   */
  speakFromUserGesture(text) {
    this.unlockAudio();
    this.speak(text, { force: true });
  }
}

window.VoiceAssistant = VoiceAssistant;
