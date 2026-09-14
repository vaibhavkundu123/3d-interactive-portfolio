import React, { useState, useEffect, useRef } from 'react';
import { Download, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { AvatarScene } from '../three/AvatarScene';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const Hero = () => {
  const canvasRef = useRef(null);
  const avatarSceneRef = useRef(null);

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

  // Mount 3D Avatar Scene
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new AvatarScene(canvasRef.current);
    avatarSceneRef.current = scene;

    return () => {
      scene.destroy();
    };
  }, []);

  return (
    <section id="home" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '100px 32px 60px',
      overflow: 'hidden'
    }}>
      {/* Background Radial Glow */}
      <div className="purple-halo" style={{ top: '15%', left: '20%' }} />

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        alignItems: 'center',
        gap: 40,
        position: 'relative',
        zIndex: 10
      }} className="hero-grid">

        {/* 3D AVATAR CANVAS CONTAINER (Matching the YouTube Short) */}
        <div style={{
          position: 'relative',
          height: 540,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} className="avatar-wrapper">

          {/* Background Ambient Spotlight Halo */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          {/* Overhead Spotlight Beam graphic */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 280,
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, transparent 80%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
            pointerEvents: 'none'
          }} />

          {/* Three.js Canvas Container */}
          <div ref={canvasRef} style={{
            width: '100%',
            height: '100%',
            cursor: 'grab'
          }} />

          {/* Interactive Hint Badge */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            color: '#c084fc',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            <Sparkles size={14} color="#a855f7" />
            <span>Interactive 3D Avatar • Tracks Your Cursor</span>
          </div>
        </div>

        {/* HERO TYPOGRAPHY & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status Chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 20,
            color: '#4ade80',
            fontSize: 12,
            fontWeight: 700,
            width: 'fit-content'
          }} className="font-heading">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            RESEARCH TRAINEE @ DRDO (CABS)
          </div>

          <div>
            <div style={{ fontSize: 18, color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6 }} className="font-sub">
              HELLO WORLD, I'M
            </div>
            <h1 style={{
              fontSize: 'clamp(38px, 5vw, 62px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: 14
            }} className="font-heading">
              VAIBHAV KUNDU
            </h1>

            {/* Dynamic Typewriter Role */}
            <div style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 700,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              color: '#cbd5e1'
            }} className="font-sub">
              <span>I am a&nbsp;</span>
              <span style={{
                background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}>
                {currentText}
              </span>
              <span style={{ color: '#a855f7', animation: 'blink 1s infinite' }}>|</span>
            </div>
          </div>

          <p style={{
            fontSize: 16,
            color: '#94a3b8',
            lineHeight: 1.7,
            maxWidth: 520
          }}>
            Specializing in speech processing, tactical AI communications, and deep neural architectures.
            Co-author of the <strong>IEEE SPACE 2026 Best Paper Award</strong> on AI voice deception in collaboration with DRDO.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
            <MapPin size={16} color="#a855f7" />
            <span>Kolkata, India</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
            <a
              href={PORTFOLIO_DATA.resumePath}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <Download size={18} /> Download Resume
            </a>
            <a
              href="#contact"
              className="btn-secondary"
            >
              Get In Touch <ArrowRight size={18} />
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
            height: 420px !important;
          }
        }
      `}</style>
    </section>
  );
};
