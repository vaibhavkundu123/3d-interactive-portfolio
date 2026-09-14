import React, { useState, useEffect, useRef } from 'react';
import { World } from './three/World';
import { HUD } from './components/HUD';
import { Navigation } from './components/Navigation';
import { StationModal } from './components/StationModal';
import { ChatBot } from './components/ChatBot';
import { VirtualJoystick } from './components/VirtualJoystick';
import { sound } from './three/SoundEngine';
import { Sparkles, Play, Compass } from 'lucide-react';
import './styles/index.css';

export default function App() {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [cameraMode, setCameraMode] = useState('CHASE');
  const [nearbyStation, setNearbyStation] = useState(null);
  const [modalStation, setModalStation] = useState(null);
  const [roverState, setRoverState] = useState({ x: 0, z: 0, rot: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Initialize Three.js World
  useEffect(() => {
    if (!canvasRef.current) return;

    const world = new World(canvasRef.current, {
      onStationNearby: (station) => {
        setNearbyStation(station);
      },
      onScoreUpdate: (delta) => {
        setScore(prev => prev + delta);
      },
      onSpeedUpdate: (curSpeed) => {
        setSpeed(curSpeed);
        if (worldRef.current?.rover) {
          setRoverState({
            x: worldRef.current.rover.position.x,
            z: worldRef.current.rover.position.z,
            rot: worldRef.current.rover.rotationY
          });
        }
      }
    });

    worldRef.current = world;

    return () => {
      world.destroy();
    };
  }, []);

  const handleStartGame = () => {
    sound.ensureContext();
    sound.startEngine();
    sound.playUiClick();
    setHasStarted(true);
  };

  const handleSelectStation = (station) => {
    if (worldRef.current) {
      worldRef.current.teleportToStation(station);
      setCameraMode('CINEMATIC');
    }
    setModalStation(station);
  };

  const handleCloseModal = () => {
    setModalStation(null);
    if (cameraMode === 'CINEMATIC') {
      worldRef.current?.setCameraMode('CHASE');
      setCameraMode('CHASE');
    }
  };

  const handleJoystickMove = (x, y) => {
    if (worldRef.current?.rover) {
      worldRef.current.rover.setJoystickVector(x, y);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Three.js Canvas Container */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Retro Scanline Overlay */}
      <div className="scanlines" />

      {/* Intro Landing Splash overlay before flight starts */}
      {!hasStarted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: 'radial-gradient(circle at center, rgba(5,8,20,0.88) 0%, rgba(3,4,10,0.98) 100%)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }}>
          <div className="glass-panel" style={{
            maxWidth: 580,
            width: '100%',
            padding: '36px 32px',
            textAlign: 'center',
            border: '2px solid rgba(0, 245, 255, 0.5)',
            boxShadow: '0 0 50px rgba(0, 245, 255, 0.3)'
          }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#00f5ff',
              boxShadow: '0 0 15px #00f5ff',
              margin: '0 auto 16px'
            }} className="animate-neon" />

            <div style={{ fontSize: 12, color: '#00f5ff', letterSpacing: '0.2em' }} className="font-tech">
              INTERACTIVE 3D NEURAL FLIGHT PORTFOLIO
            </div>

            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', margin: '8px 0' }} className="font-orbitron">
              VAIBHAV KUNDU
            </h1>

            <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 20 }} className="font-tech">
              Machine Learning Researcher • DRDO (CABS) Trainee • IEEE Best Paper Awardee
            </div>

            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 28 }}>
              Take command of the cyber hovercraft to explore 3D research stations across DRDO speech AI,
              deep learning architectures, IEEE SPACE 2026 accolades, academic credentials, and live communications uplink.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartGame}
                className="cyber-btn"
                style={{ padding: '14px 32px', fontSize: 15 }}
              >
                <Play size={18} fill="#ffffff" /> LAUNCH 3D HOVERCRAFT
              </button>

              <button
                onClick={() => {
                  handleStartGame();
                  const firstStation = { id: 'about', name: 'Command Deck', subtitle: 'Identity & Bio Hologram', position: [0,0,0], color: '#00f5ff' };
                  handleSelectStation(firstStation);
                }}
                className="cyber-btn-secondary"
                style={{ padding: '14px 24px', fontSize: 14 }}
              >
                <Compass size={18} color="#00f5ff" /> DIRECTOR TOUR
              </button>
            </div>

            <div style={{ marginTop: 24, fontSize: 12, color: '#64748b' }}>
              Controls: WASD / Arrow Keys to drive • [E] or Click station to inspect • Audio enabled
            </div>
          </div>
        </div>
      )}

      {/* Main Game In-Flight HUD */}
      {hasStarted && (
        <>
          <HUD
            score={score}
            speed={speed}
            cameraMode={cameraMode}
            setCameraMode={(mode) => {
              setCameraMode(mode);
              worldRef.current?.setCameraMode(mode);
            }}
            nearbyStation={nearbyStation}
            onOpenStation={(st) => setModalStation(st)}
            roverPosition={roverState}
            roverRotation={roverState.rot}
          />

          {/* Bottom Dock Navigation */}
          <Navigation
            activeStationId={modalStation?.id || nearbyStation?.id}
            onSelectStation={handleSelectStation}
          />

          {/* Mobile Virtual Joystick */}
          {isTouch && <VirtualJoystick onMove={handleJoystickMove} />}

          {/* Floating AI Assistant */}
          <ChatBot />

          {/* Station Hologram Modal */}
          {modalStation && (
            <StationModal
              station={modalStation}
              onClose={handleCloseModal}
            />
          )}
        </>
      )}
    </div>
  );
}
