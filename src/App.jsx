import React, { useState, useEffect, useRef } from 'react';
import { World } from './three/World';
import { HUD } from './components/HUD';
import { Navigation } from './components/Navigation';
import { StationModal } from './components/StationModal';
import { ChatBot } from './components/ChatBot';
import { VirtualJoystick } from './components/VirtualJoystick';
import { sound } from './three/SoundEngine';
import { Play, Compass, Car, Sparkles } from 'lucide-react';
import './styles/index.css';

export default function App() {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [cameraMode, setCameraMode] = useState('CHASE');
  const [timeOfDay, setTimeOfDay] = useState('DAY');
  const [nearbyStation, setNearbyStation] = useState(null);
  const [modalStation, setModalStation] = useState(null);
  const [carState, setCarState] = useState({ x: 0, z: 0, rot: 0 });
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
        if (worldRef.current?.car) {
          setCarState({
            x: worldRef.current.car.position.x,
            z: worldRef.current.car.position.z,
            rot: worldRef.current.car.rotationY
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

  const handleToggleTimeOfDay = () => {
    const modes = ['DAY', 'SUNSET', 'NIGHT'];
    const nextIdx = (modes.indexOf(timeOfDay) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setTimeOfDay(nextMode);
    worldRef.current?.setTimeOfDay(nextMode);
  };

  const handleHonk = () => {
    worldRef.current?.car?.honk();
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
    if (worldRef.current?.car) {
      worldRef.current.car.setJoystickVector(x, y);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D Canvas */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Intro Welcome Screen */}
      {!hasStarted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: 'radial-gradient(circle at center, rgba(15,23,42,0.85) 0%, rgba(2,6,23,0.96) 100%)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }}>
          <div className="arcade-panel" style={{
            maxWidth: 560,
            width: '100%',
            padding: '36px 32px',
            textAlign: 'center',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38bdf8, #22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4)'
            }}>
              <Car size={28} color="#ffffff" />
            </div>

            <div style={{ fontSize: 13, color: '#38bdf8', letterSpacing: '0.12em', fontWeight: 700 }} className="font-heading">
              3D ARCADE PLAYGROUND & PORTFOLIO
            </div>

            <h1 style={{ fontSize: 38, fontWeight: 900, color: '#ffffff', margin: '8px 0' }} className="font-heading">
              VAIBHAV KUNDU
            </h1>

            <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 20 }}>
              Machine Learning Researcher • DRDO (CABS) • IEEE Best Paper Awardee
            </div>

            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 28 }}>
              Take the arcade toy car for a spin around the 3D island! Jump off stunt ramps, knock into 3D skill blocks,
              explore research pavilions, and toggle Day/Sunset/Night lighting.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartGame}
                className="arcade-btn"
                style={{ padding: '14px 32px', fontSize: 16 }}
              >
                <Play size={18} fill="#ffffff" /> DRIVE THE CAR!
              </button>

              <button
                onClick={() => {
                  handleStartGame();
                  const firstStation = { id: 'about', name: 'Welcome Plaza', subtitle: 'Bio & Resume', position: [0,0,0], color: '#38bdf8' };
                  handleSelectStation(firstStation);
                }}
                className="arcade-btn-secondary"
                style={{ padding: '14px 24px', fontSize: 15 }}
              >
                <Compass size={18} color="#38bdf8" /> AUTOPILOT TOUR
              </button>
            </div>

            <div style={{ marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
              Controls: WASD / Arrows to drive • Space to Jump • [H] to Honk • Audio Enabled
            </div>
          </div>
        </div>
      )}

      {/* Main Game HUD & Navigation */}
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
            timeOfDay={timeOfDay}
            onToggleTimeOfDay={handleToggleTimeOfDay}
            onHonk={handleHonk}
            nearbyStation={nearbyStation}
            onOpenStation={(st) => setModalStation(st)}
            carPosition={carState}
            carRotation={carState.rot}
          />

          {/* Bottom Dock Navigation */}
          <Navigation
            activeStationId={modalStation?.id || nearbyStation?.id}
            onSelectStation={handleSelectStation}
          />

          {/* Mobile Touch Joystick */}
          {isTouch && <VirtualJoystick onMove={handleJoystickMove} />}

          {/* Sparky AI Companion */}
          <ChatBot />

          {/* Station Detail Modal */}
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
