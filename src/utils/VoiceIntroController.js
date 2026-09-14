/**
 * VoiceIntroController - Manages speech synthesis, audio chimes, and subtitle timeline
 */
import { INTRO_SCRIPT } from '../data/introScript';

export class VoiceIntroController {
  constructor(options = {}) {
    this.script = options.script || INTRO_SCRIPT;
    this.onStateChange = options.onStateChange || (() => {});
    this.onPhraseChange = options.onPhraseChange || (() => {});
    this.onEnd = options.onEnd || (() => {});

    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentPhraseIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.selectedVoice = null;
    this.currentUtterance = null;

    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;

    const chooseVoice = () => {
      const voices = this.synth.getVoices();
      // Look for natural English voices (Google, Microsoft, Daniel, Alex, or default en)
      this.selectedVoice =
        voices.find((v) => v.name.includes('Google US English') || v.name.includes('Natural') || v.name.includes('David')) ||
        voices.find((v) => v.lang.startsWith('en-US') && !v.name.includes('Zira')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0] ||
        null;
    };

    chooseVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = chooseVoice;
    }
  }

  // Futuristic audio entrance chime using Web Audio API
  playIntroChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(640, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.7);

      osc2.frequency.setValueAtTime(640, now);
      osc2.frequency.exponentialRampToValueAtTime(1280, now + 0.7);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.95);
      osc2.stop(now + 0.95);
    } catch (e) {
      console.warn('AudioContext chime failed:', e);
    }
  }

  start() {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    this.synth.cancel();
    this.playIntroChime();
    this.currentPhraseIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState();

    // Short delay to let the chime sound, then speak
    setTimeout(() => {
      if (this.isPlaying) {
        this.speakPhrase(0);
      }
    }, 450);
  }

  speakPhrase(index) {
    if (!this.isPlaying || index >= this.script.phrases.length) {
      this.finish();
      return;
    }

    if (this.phraseTimeout) {
      clearTimeout(this.phraseTimeout);
      this.phraseTimeout = null;
    }

    this.currentPhraseIndex = index;
    const phrase = this.script.phrases[index];
    this.onPhraseChange(index, phrase);
    this.notifyState();

    let phraseCompleted = false;
    const advanceNext = () => {
      if (phraseCompleted) return;
      phraseCompleted = true;
      if (this.phraseTimeout) {
        clearTimeout(this.phraseTimeout);
        this.phraseTimeout = null;
      }
      if (this.isPlaying && !this.isPaused) {
        setTimeout(() => {
          this.speakPhrase(index + 1);
        }, 220);
      }
    };

    // Calculate fallback duration based on word count (~2.6 words/sec)
    const wordCount = phrase.text.split(/\s+/).length;
    const fallbackMs = Math.max(2800, Math.round((wordCount / 2.6) * 1000) + 1200);

    this.phraseTimeout = setTimeout(() => {
      advanceNext();
    }, fallbackMs);

    try {
      const utterance = new SpeechSynthesisUtterance(phrase.text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.02;

      utterance.onend = () => {
        advanceNext();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis warning:', e);
        advanceNext();
      };

      this.currentUtterance = utterance;
      if (this.synth) {
        this.synth.speak(utterance);
      }
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      advanceNext();
    }
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    if (this.synth) {
      this.synth.pause();
    }
    this.notifyState();
  }

  resume() {
    if (!this.isPlaying || !this.isPaused) return;
    this.isPaused = false;
    if (this.synth) {
      this.synth.resume();
    }
    this.notifyState();
  }

  togglePlayPause() {
    if (!this.isPlaying) {
      this.start();
    } else if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.synth) {
      this.synth.cancel();
    }
    this.notifyState();
    this.onEnd();
  }

  finish() {
    this.isPlaying = false;
    this.isPaused = false;
    this.notifyState();
    this.onEnd();
  }

  notifyState() {
    this.onStateChange({
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentPhraseIndex: this.currentPhraseIndex,
      currentPhrase: this.script.phrases[this.currentPhraseIndex] || null,
      totalPhrases: this.script.phrases.length,
      progress: (this.currentPhraseIndex + 1) / this.script.phrases.length
    });
  }
}
