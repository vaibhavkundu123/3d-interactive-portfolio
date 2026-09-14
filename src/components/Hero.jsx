import React, { useState, useEffect, useRef } from 'react';
import { Download, ArrowRight, Sparkles, MapPin, Sparkle } from 'lucide-react';
import { AvatarScene } from '../three/AvatarScene';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const Hero = () => {
  const canvasRef = useRef(null);
  const avatarSceneRef = useRef(null);

  // Typewriter roles
  const [roleIndex, setRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Interactive 3D Avatar state
  const [targetMouse, setTargetMouse] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isNodding, setIsNodding] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState('4k'); // '4k' or 'original'

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

  // Mount Three.js Ambient Particle Scene
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new AvatarScene(canvasRef.current);
    avatarSceneRef.current = scene;

    return () => {
      scene.destroy();
    };
  }, []);

  // Smooth Spring Mouse Tracking Loop for 3D Avatar
  useEffect(() => {
    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      setTargetMouse({ x: nx, y: ny });
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const nx = (touch.clientX / window.innerWidth) * 2 - 1;
        const ny = -(touch.clientY / window.innerHeight) * 2 + 1;
        setTargetMouse({ x: nx, y: ny });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animId;
    const updatePhysics = () => {
      setMouse((prev) => ({
        x: prev.x + (targetMouse.x - prev.x) * 0.08,
        y: prev.y + (targetMouse.y - prev.y) * 0.08
      }));
      animId = requestAnimationFrame(updatePhysics);
    };
    animId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, [targetMouse]);

  // Click Nod Interaction
  const handleAvatarClick = () => {
    if (!isNodding) {
      setIsNodding(true);
      setTimeout(() => setIsNodding(false), 600);
    }
  };

  // 3D Tilt calculation
  const rotY = mouse.x * 14; // Horizontal tilt
  const rotX = -mouse.y * 10; // Vertical tilt
  const sheenX = ((mouse.x + 1) / 2) * 100;
  const sheenY = ((-mouse.y + 1) / 2) * 100;

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

        {/* 3D AVATAR HERO CONTAINER (Clean, Artifact-Free & Interactive) */}
        <div style={{
          position: 'relative',
          height: 560,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }} className="avatar-wrapper">

          {/* Three.js Background Particle Stars Canvas */}
          <div ref={canvasRef} style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Background Ambient Spotlight Halo */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(99, 102, 241, 0.18) 50%, transparent 75%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 2,
            animation: 'haloPulse 4s ease-in-out infinite'
          }} />

          {/* Overhead Spotlight Beam Graphic (Soft Gaussian blurred gradient) */}
          <div style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: `translateX(-50%) rotate(${mouse.x * 3.5}deg)`,
            transformOrigin: 'top center',
            width: 340,
            height: '110%',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.16) 0%, rgba(192, 132, 252, 0.08) 45%, transparent 85%)',
            clipPath: 'polygon(36% 0%, 64% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 3,
            transition: 'transform 0.1s ease-out'
          }} />

          {/* 3D Interactive Avatar Card */}
          <div
            onClick={handleAvatarClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              position: 'relative',
              width: 340,
              height: 450,
              borderRadius: 28,
              border: '2px solid rgba(168, 85, 247, 0.45)',
              boxShadow: isHovered
                ? '0 30px 70px rgba(0, 0, 0, 0.85), 0 0 50px rgba(168, 85, 247, 0.45)'
                : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(168, 85, 247, 0.25)',
              overflow: 'hidden',
              cursor: 'pointer',
              zIndex: 4,
              transform: `perspective(1000px) rotateX(${isNodding ? rotX + 10 : rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.03 : 1.0}, ${isHovered ? 1.03 : 1.0}, 1.0) translateY(${isNodding ? -8 : 0}px)`,
              transition: isNodding ? 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'border-color 0.3s ease, box-shadow 0.3s ease',
              willChange: 'transform'
            }}
            title="Click avatar to interact!"
          >
            {/* The Exact Character Image */}
            <img
              src={avatarVersion === '4k' ? '/avatar.jpg' : '/avatar_original.png'}
              alt="Vaibhav Kundu 3D Developer Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                userSelect: 'none',
                WebkitUserDrag: 'none'
              }}
            />

            {/* Dynamic Interactive Specular Sheen (Moves with cursor in real-time) */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 35%, transparent 65%)`,
              pointerEvents: 'none',
              mixBlendMode: 'overlay'
            }} />

            {/* Subtle bottom gradient fade for seamless depth */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 70,
              background: 'linear-gradient(to top, rgba(5, 9, 19, 0.8) 0%, transparent 100%)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Interactive Hint Badge & Version Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 18,
            zIndex: 5,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Hint Badge */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: 30,
              padding: '6px 16px',
              fontSize: 12,
              color: '#d8b4fe',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <Sparkles size={14} color="#a855f7" />
              <span>Interactive 3D Avatar • Tracks Cursor • Click to Greet</span>
            </div>

            {/* Version Toggle Pill */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              padding: 2
            }}>
              <button
                type="button"
                onClick={() => setAvatarVersion('4k')}
                style={{
                  background: avatarVersion === '4k' ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                  color: avatarVersion === '4k' ? '#f8fafc' : '#94a3b8',
                  border: 'none',
                  borderRadius: 16,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                4K Cinematic
              </button>
              <button
                type="button"
                onClick={() => setAvatarVersion('original')}
                style={{
                  background: avatarVersion === 'original' ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                  color: avatarVersion === 'original' ? '#f8fafc' : '#94a3b8',
                  border: 'none',
                  borderRadius: 16,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Original
              </button>
            </div>
          </div>
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
