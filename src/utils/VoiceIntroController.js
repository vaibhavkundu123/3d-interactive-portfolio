/**
 * VoiceIntroController - Free-flowing, smooth speech synthesis with real-time subtitle synchronization
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
    this.heartbeatTimer = null;
    this.subtitleTimer = null;

    // Calculate phrase character offsets for boundary matching
    this.preparePhraseOffsets();
    this.initVoice();
  }

  preparePhraseOffsets() {
    this.phraseOffsets = [];
    let runningCharIndex = 0;

    this.script.phrases.forEach((phrase, idx) => {
      const textLen = phrase.text.length;
      this.phraseOffsets.push({
        index: idx,
        startChar: runningCharIndex,
        endChar: runningCharIndex + textLen,
        wordCount: phrase.text.split(/\s+/).length,
        phrase
      });
      // Account for space/newline between phrases
      runningCharIndex += textLen + 1;
    });

    this.totalWords = this.phraseOffsets.reduce((acc, p) => acc + p.wordCount, 0);
  }

  initVoice() {
    if (!this.synth) return;

    const chooseVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // Priority ranking for the smoothest, most natural human voices
      this.selectedVoice =
        // 1. Google US English (Chromium's smoothest voice)
        voices.find((v) => v.name === 'Google US English') ||
        // 2. Google UK English Male
        voices.find((v) => v.name === 'Google UK English Male') ||
        // 3. Online Natural / Neural voices
        voices.find((v) => (v.name.includes('Natural') || v.name.includes('Neural')) && !v.name.includes('Female')) ||
        // 4. Microsoft Mark (warmer and smoother than David)
        voices.find((v) => v.name.includes('Mark')) ||
        // 5. Microsoft David
        voices.find((v) => v.name.includes('David')) ||
        // 6. Any other English US voice
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

    this.stop();
    this.playIntroChime();
    this.currentPhraseIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState();

    // Start speech after the audio chime
    setTimeout(() => {
      if (this.isPlaying) {
        this.beginContinuousSpeech();
      }
    }, 450);
  }

  beginContinuousSpeech() {
    // Combine all phrases into one coherent, fluid speech passage
    const fullText = this.script.phrases.map((p) => p.text).join(' ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Smooth, warm, natural delivery settings
    utterance.rate = 0.96; // Fluid, articulate pace
    utterance.pitch = 0.98; // Warm, natural resonance

    // Real-time boundary event listener to update subtitles on word/sentence boundaries
    utterance.onboundary = (event) => {
      if (!this.isPlaying || this.isPaused) return;

      const charIdx = event.charIndex;
      // Match current character index to phrase
      for (let i = 0; i < this.phraseOffsets.length; i++) {
        const p = this.phraseOffsets[i];
        if (charIdx >= p.startChar && charIdx <= p.endChar + 15) {
          if (this.currentPhraseIndex !== i) {
            this.currentPhraseIndex = i;
            this.onPhraseChange(i, p.phrase);
            this.notifyState();
          }
          break;
        }
      }
    };

    utterance.onstart = () => {
      this.startTime = Date.now();
      this.currentPhraseIndex = 0;
      this.onPhraseChange(0, this.script.phrases[0]);
      this.notifyState();
      this.startTimelineFallback();
    };

    utterance.onend = () => {
      this.finish();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis warning:', e);
      // Fallback timer will continue subtitles if engine stops
    };

    this.currentUtterance = utterance;

    // Chrome keep-alive heartbeat: periodically resume to prevent timeout
    this.heartbeatTimer = setInterval(() => {
      if (this.isPlaying && !this.isPaused && this.synth?.speaking) {
        this.synth.resume();
      }
    }, 5000);

    this.synth.speak(utterance);
  }

  // Fallback timeline tracking based on speech word-rate (~2.5 words/sec at rate 0.96)
  startTimelineFallback() {
    if (this.subtitleTimer) clearInterval(this.subtitleTimer);

    this.subtitleTimer = setInterval(() => {
      if (!this.isPlaying || this.isPaused) return;

      const elapsedSec = (Date.now() - this.startTime) / 1000;
      const estimatedWords = elapsedSec * 2.55;

      let accumulatedWords = 0;
      for (let i = 0; i < this.phraseOffsets.length; i++) {
        accumulatedWords += this.phraseOffsets[i].wordCount;
        if (estimatedWords < accumulatedWords || i === this.phraseOffsets.length - 1) {
          if (this.currentPhraseIndex !== i) {
            this.currentPhraseIndex = i;
            this.onPhraseChange(i, this.phraseOffsets[i].phrase);
            this.notifyState();
          }
          break;
        }
      }
    }, 400);
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
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.subtitleTimer) clearInterval(this.subtitleTimer);
    if (this.synth) {
      this.synth.cancel();
    }
    this.notifyState();
    this.onEnd();
  }

  finish() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.subtitleTimer) clearInterval(this.subtitleTimer);
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
