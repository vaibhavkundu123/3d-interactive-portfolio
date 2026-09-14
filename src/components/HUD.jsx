import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Compass, Gamepad2, Award, Zap, HelpCircle, X } from 'lucide-react';
import { sound } from '../three/SoundEngine';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const HUD = ({
  score,
  speed,
  cameraMode,
  setCameraMode,
  nearbyStation,
  onOpenStation,
  roverPosition,
  roverRotation
}) => {
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const toggleAudio = () => {
    const nextState = !muted;
    setMuted(nextState);
    sound.setMuted(nextState);
    if (!nextState) {
      sound.ensureContext();
      sound.playUiClick();
    }
  };

  const handleModeToggle = () => {
    sound.playUiClick();
    const nextMode = cameraMode === 'CHASE' ? 'CINEMATIC' : 'CHASE';
    setCameraMode(nextMode);
  };

  // Keyboard 'E' to open nearby station
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && nearbyStation) {
        sound.playUiClick();
        onOpenStation(nearbyStation);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyStation, onOpenStation]);

  const speedKph = Math.round(Math.abs(speed || 0) * 3.6);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* Top Header Bar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Brand / Identity */}
        <div className="glass-panel" style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'auto'
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#00f5ff',
            boxShadow: '0 0 10px #00f5ff'
          }} className="animate-neon" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em' }} className="font-orbitron">
              VAIBHAV KUNDU
            </div>
            <div style={{ fontSize: 11, color: '#00f5ff', fontWeight: 600 }} className="font-tech">
              DRDO RESEARCHER • IEEE BEST PAPER AWARDEE
            </div>
          </div>
        </div>

        {/* Center Stats Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
          {/* XP Score */}
          <div className="glass-panel" style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#f59e0b'
          }}>
            <Award size={16} />
            <span style={{ fontSize: 13, fontWeight: 700 }} className="font-orbitron">
              {score} <span style={{ fontSize: 10, color: '#94a3b8' }}>XP</span>
            </span>
          </div>

          {/* Speedometer */}
          <div className="glass-panel" style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#00f5ff'
          }}>
            <Zap size={16} />
            <span style={{ fontSize: 13, fontWeight: 700 }} className="font-orbitron">
              {speedKph} <span style={{ fontSize: 10, color: '#94a3b8' }}>KM/H</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          {/* Audio Button */}
          <button
            onClick={toggleAudio}
            title={muted ? "Unmute Audio" : "Mute Audio"}
            className="glass-panel"
            style={{
              padding: '10px',
              color: muted ? '#94a3b8' : '#00f5ff',
              border: '1px solid rgba(0,245,255,0.3)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Mode Switch Button */}
          <button
            onClick={handleModeToggle}
            title="Toggle Exploration Mode"
            className="glass-panel"
            style={{
              padding: '8px 14px',
              color: '#ffffff',
              border: '1px solid rgba(0,245,255,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700
            }}
          >
            {cameraMode === 'CHASE' ? (
              <>
                <Gamepad2 size={16} color="#00f5ff" />
                <span className="font-orbitron">ROAM MODE</span>
              </>
            ) : (
              <>
                <Compass size={16} color="#ec4899" />
                <span className="font-orbitron">DIRECTOR TOUR</span>
              </>
            )}
          </button>

          {/* Controls Help */}
          <button
            onClick={() => setShowControls(!showControls)}
            title="Flight Manual & Keybindings"
            className="glass-panel"
            style={{
              padding: '10px',
              color: '#94a3b8',
              border: '1px solid rgba(148,163,184,0.3)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      {/* Nearby Station Proximity Banner */}
      {nearbyStation && (
        <div style={{
          position: 'absolute',
          top: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
        }}>
          <div
            onClick={() => {
              sound.playUiClick();
              onOpenStation(nearbyStation);
            }}
            className="glass-panel animate-neon"
            style={{
              padding: '12px 24px',
              border: `2px solid ${nearbyStation.color}`,
              background: 'rgba(5, 8, 20, 0.9)',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }} className="font-tech">
              PROXIMITY RADAR DETECTED
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }} className="font-orbitron">
              {nearbyStation.name} — <span style={{ color: nearbyStation.color }}>{nearbyStation.subtitle}</span>
            </div>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#00f5ff',
              background: 'rgba(0, 245, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: 4,
              marginTop: 4
            }} className="font-orbitron">
              PRESS [E] OR CLICK TO ACCESS TERMINAL
            </div>
          </div>
        </div>
      )}

      {/* Mini-Map Radar */}
      <div className="glass-panel" style={{
        position: 'absolute',
        top: 80,
        right: 16,
        width: 140,
        height: 140,
        borderRadius: '50%',
        padding: 0,
        overflow: 'hidden',
        border: '2px solid rgba(0, 245, 255, 0.4)',
        pointerEvents: 'auto'
      }}>
        {/* Radar Rings */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, rgba(5,8,20,0.85) 100%)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 15,
          borderRadius: '50%',
          border: '1px dashed rgba(0,245,255,0.3)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 40,
          borderRadius: '50%',
          border: '1px dashed rgba(0,245,255,0.2)'
        }} />

        {/* Crosshairs */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,245,255,0.2)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0,245,255,0.2)' }} />

        {/* Station Dots on Radar (Scaled from -70..70 map space) */}
        {PORTFOLIO_DATA.stations.map((st) => {
          const mapX = 70 + (st.position[0] / 75) * 55;
          const mapY = 70 + (st.position[2] / 75) * 55;
          const isNearby = nearbyStation?.id === st.id;

          return (
            <div
              key={st.id}
              onClick={() => onOpenStation(st)}
              title={st.name}
              style={{
                position: 'absolute',
                left: mapX - 4,
                top: mapY - 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: st.color,
                boxShadow: isNearby ? `0 0 8px ${st.color}` : 'none',
                transform: isNearby ? 'scale(1.4)' : 'scale(1)',
                cursor: 'pointer'
              }}
            />
          );
        })}

        {/* Rover Position Blip in Center with Rotation */}
        <div style={{
          position: 'absolute',
          left: 65,
          top: 65,
          width: 10,
          height: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${-((roverRotation || 0) * 180 / Math.PI)}deg)`
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: '9px solid #ffffff'
          }} />
        </div>
      </div>

      {/* Flight Manual Dialog */}
      {showControls && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 420,
          padding: 24,
          pointerEvents: 'auto',
          zIndex: 50
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, color: '#00f5ff' }} className="font-orbitron">PILOT FLIGHT MANUAL</h3>
            <button
              onClick={() => setShowControls(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 20 }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 10, borderRadius: 8 }}>
              <div style={{ color: '#00f5ff', fontWeight: 700 }}>W / Up Arrow</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Accelerate Forward</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 10, borderRadius: 8 }}>
              <div style={{ color: '#00f5ff', fontWeight: 700 }}>S / Down Arrow</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Brake / Reverse</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 10, borderRadius: 8 }}>
              <div style={{ color: '#00f5ff', fontWeight: 700 }}>A / D or Left/Right</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Steer Hovercraft</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 10, borderRadius: 8 }}>
              <div style={{ color: '#00f5ff', fontWeight: 700 }}>Key 'E' or Tap</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Access Station Terminal</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, borderTop: '1px solid rgba(148,163,184,0.2)', paddingTop: 12 }}>
            💡 <strong style={{ color: '#ffffff' }}>Director Tour:</strong> Click any station in the bottom dock to fly the camera directly there without driving. Collect glowing cubes around the world for bonus XP!
          </div>
        </div>
      )}
    </div>
  );
};
