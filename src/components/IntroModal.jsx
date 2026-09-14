import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, ArrowRight, X, Play } from 'lucide-react';

export const IntroModal = ({ onStartIntro, onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show welcome introduction modal on every page load after canvas mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setIsOpen(false);
    if (onStartIntro) onStartIntro();
  };

  const handleSkip = () => {
    setIsOpen(false);
    if (onDismiss) onDismiss();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(5, 7, 15, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.4s ease-out'
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(56, 189, 248, 0.12) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Glass Modal Card */}
      <div
        style={{
          position: 'relative',
          maxWidth: 580,
          width: '100%',
          background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.92) 0%, rgba(10, 13, 28, 0.95) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          color: '#ffffff'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          title="Skip to portfolio"
        >
          <X size={18} />
        </button>

        {/* Status Pill Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: 30,
              fontSize: 12,
              fontWeight: 700,
              color: '#c084fc',
              letterSpacing: '0.05em'
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#a855f7',
                boxShadow: '0 0 10px #a855f7',
                animation: 'pulse 1.8s infinite'
              }}
            />
            🎙️ INTERACTIVE AUDIO INTRODUCTION
          </div>
        </div>

        {/* Modal Title */}
        <div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: 8,
              background: 'linear-gradient(135deg, #ffffff 30%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            className="font-heading"
          >
            Welcome to Vaibhav Kundu's 3D Portfolio
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
            Experience an interactive spoken walkthrough by Vaibhav's 3D developer avatar covering his background in Computer Science, research at DRDO CABS, and tactical speech AI.
          </p>
        </div>

        {/* Highlight Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={pillStyle}>🎓 NSEC Kolkata (B.Tech CSE)</span>
          <span style={pillStyle}>🛡️ DRDO CABS Research Trainee</span>
          <span style={pillStyle}>🏆 IEEE Best Paper Awardee</span>
          <span style={pillStyle}>🐧 Vice President @ GNX (Linux)</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
          <button
            onClick={handleStart}
            style={{
              flex: 1,
              minWidth: 200,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 24px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(147, 51, 234, 0.5)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Play size={18} fill="#ffffff" />
            <span>Play Spoken Introduction</span>
          </button>

          <button
            onClick={handleSkip}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 22px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <span>Explore Directly</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const pillStyle = {
  fontSize: 12,
  padding: '5px 12px',
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#e2e8f0',
  fontWeight: 500
};
