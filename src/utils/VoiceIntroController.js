/**
 * VoiceIntroController - 100% Lockstep Voice & Subtitle Synchronization
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
    this.fallbackTimer = null;
    this.heartbeatTimer = null;

    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;

    const chooseVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // Priority ranking for deep, smooth, masculine voices
      this.selectedVoice =
        // 1. Google UK English Male (rich, deep baritone)
        voices.find((v) => v.name === 'Google UK English Male') ||
        // 2. Microsoft Mark (deepest native Windows US male voice)
        voices.find((v) => v.name.includes('Mark')) ||
        // 3. Google US English (warm and articulate)
        voices.find((v) => v.name === 'Google US English') ||
        // 4. Online Natural / Neural male voices
        voices.find((v) => (v.name.includes('Natural') || v.name.includes('Neural')) && !v.name.includes('Female')) ||
        // 5. Microsoft David (classic baritone)
        voices.find((v) => v.name.includes('David')) ||
        // 6. Microsoft Ravi
        voices.find((v) => v.name.includes('Ravi')) ||
        // 7. Any other English US voice
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

  // Futuristic deep ambient audio entrance chime using Web Audio API
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

      // Deep cinematic chord
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.4);
      osc1.frequency.exponentialRampToValueAtTime(660, now + 0.7);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.7);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.1);
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

    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }

    this.playIntroChime();
    this.currentPhraseIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState();

    // Start heartbeat to keep Chrome SpeechSynthesis alive
    this.heartbeatTimer = setInterval(() => {
      if (this.isPlaying && !this.isPaused && this.synth?.speaking) {
        this.synth.resume();
      }
    }, 5000);

    // Short delay for the entrance chime, then start speaking phrase 0
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

    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    this.currentPhraseIndex = index;
    const phrase = this.script.phrases[index];

    // Synchronize subtitle immediately
    this.onPhraseChange(index, phrase);
    this.notifyState();

    let phraseFinished = false;
    const advanceNext = () => {
      if (phraseFinished) return;
      phraseFinished = true;
      if (this.fallbackTimer) {
        clearTimeout(this.fallbackTimer);
        this.fallbackTimer = null;
      }
      if (this.isPlaying && !this.isPaused) {
        // Instant seamless handoff to next phrase for free-flowing speech
        this.speakPhrase(index + 1);
      }
    };

    // Safety timeout in case speech engine drops connection
    const wordCount = phrase.text.split(/\s+/).length;
    const maxDurationMs = Math.max(4000, Math.round((wordCount / 2.2) * 1000) + 2500);

    this.fallbackTimer = setTimeout(() => {
      advanceNext();
    }, maxDurationMs);

    try {
      const utterance = new SpeechSynthesisUtterance(phrase.text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      // Deep masculine baritone settings
      utterance.rate = 0.95; // Fluid, confident pace
      utterance.pitch = 0.85; // Deep baritone resonance

      utterance.onstart = () => {
        // Re-confirm subtitle synchronization on actual voice start
        this.currentPhraseIndex = index;
        this.onPhraseChange(index, phrase);
        this.notifyState();
      };

      utterance.onend = () => {
        advanceNext();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis warning:', e?.error || e);
        if (e?.error === 'interrupted' || e?.error === 'canceled') {
          return;
        }
        // Let fallbackTimer manage natural reading duration instead of skipping instantly
      };

      this.currentUtterance = utterance;
      if (this.synth) {
        this.synth.speak(utterance);
      }
    } catch (err) {
      console.warn('SpeechSynthesis execution error:', err);
      advanceNext();
    }
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
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
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.notifyState();
    this.onEnd();
  }

  finish() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
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
