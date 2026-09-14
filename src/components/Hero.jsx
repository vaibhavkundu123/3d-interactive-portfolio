import React, { useState, useEffect, useRef } from 'react';
import { Download, ArrowRight, Sparkles, MapPin, Play, Pause, X, Volume2 } from 'lucide-react';
import { AvatarScene } from '../three/AvatarScene';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { VoiceIntroController } from '../utils/VoiceIntroController';
import { INTRO_SCRIPT } from '../data/introScript';

export const Hero = ({ onRegisterVoiceTrigger }) => {
  const canvasRef = useRef(null);
  const avatarSceneRef = useRef(null);
  const voiceControllerRef = useRef(null);

  // Spoken Voice Intro State
  const [introState, setIntroState] = useState({
    isPlaying: false,
    isPaused: false,
    currentPhrase: null,
    currentPhraseIndex: 0,
    totalPhrases: INTRO_SCRIPT.phrases.length,
    progress: 0
  });

  // Typewriter roles
  const [roleIndex, setRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const roles = PORTFOLIO_DATA.taglines;
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      const fullText = roles[roleIndex];
      if (!isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        if (currentText === fullText) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setRoleIndex((roleIndex + 1) % roles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, roleIndex]);

  // Mount 3D Avatar Scene (Full 3D Character with dynamic head tracking)
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new AvatarScene(canvasRef.current);
    avatarSceneRef.current = scene;
    if (typeof window !== 'undefined') {
      window.__avatarScene = scene;
    }

    return () => {
      scene.destroy();
    };
  }, []);

  // Initialize Voice Intro Controller
  useEffect(() => {
    const controller = new VoiceIntroController({
      script: INTRO_SCRIPT,
      onStateChange: (state) => {
        setIntroState(state);
      },
      onPhraseChange: (index, phrase) => {
        avatarSceneRef.current?.updateSpeechGesture(phrase.gesture);
      },
      onEnd: () => {
        avatarSceneRef.current?.stopSpeaking();
      }
    });

    voiceControllerRef.current = controller;

    if (onRegisterVoiceTrigger) {
      onRegisterVoiceTrigger(() => {
        controller.start();
        avatarSceneRef.current?.startSpeaking();
      });
    }

    return () => {
      controller.stop();
    };
  }, [onRegisterVoiceTrigger]);

  // Keep 3D Avatar Speaking & Reading state strictly synchronized with Voice Intro playback
  useEffect(() => {
    if (introState.isPlaying && !introState.isPaused) {
      avatarSceneRef.current?.startSpeaking();
    } else {
      avatarSceneRef.current?.stopSpeaking();
    }
  }, [introState.isPlaying, introState.isPaused]);

  const handleStartVoice = () => {
    avatarSceneRef.current?.startSpeaking();
    voiceControllerRef.current?.start();
  };

  const handleToggleVoice = () => {
    voiceControllerRef.current?.togglePlayPause();
  };

  const handleStopVoice = () => {
    voiceControllerRef.current?.stop();
    avatarSceneRef.current?.stopSpeaking();
  };

  return (
    <section id="home" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '110px 32px 70px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 30% 35%, rgba(147, 51, 234, 0.12) 0%, rgba(7, 9, 19, 0) 65%)'
    }}>
      {/* Background Radial Glows */}
      <div className="purple-halo" style={{ top: '10%', left: '15%' }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: 420,
        height: 420,
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Cyber Grid Lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.8) 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.8) 20%, transparent 80%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        alignItems: 'center',
        gap: 48,
        position: 'relative',
        zIndex: 10
      }} className="hero-grid">

        {/* 3D AVATAR HERO CONTAINER (Pure 3D Canvas with Real-time Head Tracking) */}
        <div style={{
          position: 'relative',
          height: 580,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }} className="avatar-wrapper">

          {/* Background Ambient Spotlight Halo */}
          <div style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 440,
            height: 440,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(99, 102, 241, 0.16) 50%, transparent 75%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Three.js 3D Avatar Canvas */}
          <div
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              cursor: 'grab',
              position: 'relative',
              zIndex: 3
            }}
            title="Move your mouse to watch the avatar turn its head! Click to greet."
          />

          {/* Real-time Subtitle & Voice Player HUD or Hint Badge */}
          {introState.isPlaying ? (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '94%',
                maxWidth: 480,
                background: 'rgba(11, 15, 30, 0.94)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(168, 85, 247, 0.55)',
                borderRadius: 20,
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.25)',
                zIndex: 10,
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              {/* Header Bar with Equalizer, Status & Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Equalizer bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20 }}>
                    <div className="soundwave-bar" />
                    <div className="soundwave-bar" />
                    <div className="soundwave-bar" />
                    <div className="soundwave-bar" />
                    <div className="soundwave-bar" />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.05em' }}>
                    {introState.isPaused ? '⏸ PAUSED' : '● SPEAKING INTRO'}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    ({introState.currentPhraseIndex + 1}/{introState.totalPhrases})
                  </span>
                </div>

                {/* Playback Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={handleToggleVoice}
                    style={{
                      background: 'rgba(168, 85, 247, 0.2)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title={introState.isPaused ? 'Resume' : 'Pause'}
                  >
                    {introState.isPaused ? <Play size={12} fill="#ffffff" /> : <Pause size={12} fill="#ffffff" />}
                  </button>

                  <button
                    onClick={handleStopVoice}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Close introduction"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Subtitle Caption */}
              <div style={{ fontSize: 13, color: '#f8fafc', lineHeight: 1.5, minHeight: 38 }}>
                {introState.currentPhrase?.text}
              </div>

              {/* Highlight Tag */}
              {introState.currentPhrase?.highlight && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: 'rgba(168, 85, 247, 0.2)',
                    color: '#d8b4fe',
                    border: '1px solid rgba(168, 85, 247, 0.3)'
                  }}>
                    ✨ {introState.currentPhrase.highlight}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              zIndex: 4,
              width: 'max-content'
            }}>
              {/* Play Introduction Button */}
              <button
                onClick={handleStartVoice}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 20px',
                  borderRadius: 24,
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                  border: '1px solid rgba(192, 132, 252, 0.5)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(147, 51, 234, 0.45)',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title="Play speech introduction with 3D avatar voiceover"
              >
                <Volume2 size={15} />
                <span>Play Voice Introduction</span>
                <Play size={12} fill="#ffffff" />
              </button>

              {/* Cursor Tracking Hint */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                borderRadius: 30,
                padding: '5px 14px',
                fontSize: 11,
                color: '#d8b4fe',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                pointerEvents: 'none',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)'
              }}>
                <Sparkles size={12} color="#a855f7" />
                <span>3D Avatar • Tracks Cursor • Click to Greet</span>
              </div>
            </div>
          )}
        </div>

        {/* HERO TYPOGRAPHY & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>


          {/* Top Status & Role Pill Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: 20,
              color: '#4ade80',
              fontSize: 12,
              fontWeight: 700
            }} className="font-heading">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 10px #22c55e' }} />
              AVAILABLE FOR 2026 ROLES
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: 20,
              color: '#c084fc',
              fontSize: 12,
              fontWeight: 700
            }} className="font-heading">
              RESEARCH TRAINEE @ DRDO (CABS)
            </div>
          </div>

          <div>
            <div style={{
              fontSize: 16,
              color: '#38bdf8',
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: 8,
              textTransform: 'uppercase'
            }} className="font-sub">
              HELLO WORLD, I'M
            </div>

            {/* Glowing Main Name */}
            <h1 style={{
              fontSize: 'clamp(42px, 5.5vw, 68px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.05,
              marginBottom: 16,
              textShadow: '0 0 40px rgba(168, 85, 247, 0.35)'
            }} className="font-heading">
              VAIBHAV KUNDU
            </h1>

            {/* Dynamic Typewriter Role */}
            <div style={{
              fontSize: 'clamp(20px, 2.6vw, 30px)',
              fontWeight: 700,
              minHeight: 42,
              display: 'flex',
              alignItems: 'center',
              color: '#cbd5e1'
            }} className="font-sub">
              <span>I am a&nbsp;</span>
              <span style={{
                background: 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))'
              }}>
                {currentText}
              </span>
              <span style={{ color: '#a855f7', animation: 'blink 1s infinite' }}>|</span>
            </div>
          </div>

          <p style={{
            fontSize: 16,
            color: '#94a3b8',
            lineHeight: 1.75,
            maxWidth: 540
          }}>
            Specializing in tactical speech processing, multi-speaker diarization (NVIDIA NeMo) and interactive 3D web applications.
            Co-author of the <strong>IEEE SPACE 2026 Best Paper Award</strong> on tactical AI communications in collaboration with DRDO.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#64748b', fontSize: 13, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} color="#a855f7" />
              <span>Kolkata, India</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
              <span style={{ color: '#94a3b8' }}>IEEE CIS Vice Chair • VP GNX</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
            <a
              href={PORTFOLIO_DATA.resumePath}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{
                boxShadow: '0 8px 30px rgba(147, 51, 234, 0.45)',
                padding: '14px 30px'
              }}
            >
              <Download size={18} /> Download Resume
            </a>
            <a
              href="#experience"
              className="btn-secondary"
              style={{ padding: '14px 26px' }}
            >
              Explore Research <ArrowRight size={18} />
            </a>
            <a
              href="#contact"
              className="btn-secondary"
              style={{
                padding: '14px 24px',
                borderColor: 'rgba(168, 85, 247, 0.3)'
              }}
            >
              Get In Touch
            </a>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid div {
            align-items: center;
          }
          .avatar-wrapper {
            height: 440px !important;
          }
        }
      `}</style>
    </section>
  );
};
