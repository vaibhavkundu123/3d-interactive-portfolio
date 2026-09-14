import React, { useState, useEffect } from 'react';
import {
  Volume2, VolumeX, Compass, Car as CarIcon,
  Award, Gauge, Sun, Sunset, Moon, HelpCircle, X, Megaphone
} from 'lucide-react';
import { sound } from '../three/SoundEngine';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const HUD = ({
  score,
  speed,
  cameraMode,
  setCameraMode,
  timeOfDay,
  onToggleTimeOfDay,
  onHonk,
  nearbyStation,
  onOpenStation,
  carPosition,
  carRotation
}) => {
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const toggleAudio = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
    if (!next) {
      sound.ensureContext();
      sound.playUiClick();
    }
  };

  const handleModeToggle = () => {
    sound.playUiClick();
    const nextMode = cameraMode === 'CHASE' ? 'CINEMATIC' : 'CHASE';
    setCameraMode(nextMode);
  };

  // Keyboard 'E' for station, 'H' for horn
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
        {/* Brand / Profile Pill */}
        <div className="arcade-panel" style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'auto'
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 10px #22c55e'
          }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }} className="font-heading">
              VAIBHAV KUNDU
            </div>
            <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
              DRDO RESEARCHER • IEEE BEST PAPER AWARDEE
            </div>
          </div>
        </div>

        {/* Center Stats Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
          {/* Star / XP Score */}
          <div className="arcade-panel" style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#f59e0b'
          }}>
            <Award size={18} />
            <span style={{ fontSize: 15, fontWeight: 800 }} className="font-heading">
              {score} <span style={{ fontSize: 11, color: '#94a3b8' }}>XP</span>
            </span>
          </div>

          {/* Speedometer */}
          <div className="arcade-panel" style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#38bdf8'
          }}>
            <Gauge size={18} />
            <span style={{ fontSize: 15, fontWeight: 800 }} className="font-heading">
              {speedKph} <span style={{ fontSize: 11, color: '#94a3b8' }}>KM/H</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          {/* Horn Button */}
          <button
            onClick={() => {
              sound.ensureContext();
              if (onHonk) onHonk();
            }}
            title="Honk Horn (H)"
            className="arcade-panel"
            style={{
              padding: '8px 14px',
              color: '#facc15',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            <Megaphone size={16} />
            <span className="font-heading">HONK!</span>
          </button>

          {/* Time of Day Toggle */}
          <button
            onClick={() => {
              sound.playUiClick();
              if (onToggleTimeOfDay) onToggleTimeOfDay();
            }}
            title="Toggle Day / Sunset / Night"
            className="arcade-panel"
            style={{
              padding: '8px 14px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            {timeOfDay === 'DAY' && <><Sun size={16} color="#facc15" /> <span>DAY</span></>}
            {timeOfDay === 'SUNSET' && <><Sunset size={16} color="#fb923c" /> <span>SUNSET</span></>}
            {timeOfDay === 'NIGHT' && <><Moon size={16} color="#38bdf8" /> <span>NIGHT</span></>}
          </button>

          {/* Mode Switch Button */}
          <button
            onClick={handleModeToggle}
            title="Toggle Drive / Director Mode"
            className="arcade-panel"
            style={{
              padding: '8px 14px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            {cameraMode === 'CHASE' ? (
              <>
                <CarIcon size={16} color="#22c55e" />
                <span className="font-heading">DRIVE</span>
              </>
            ) : (
              <>
                <Compass size={16} color="#ec4899" />
                <span className="font-heading">TOUR</span>
              </>
            )}
          </button>

          {/* Audio Button */}
          <button
            onClick={toggleAudio}
            title={muted ? "Unmute Audio" : "Mute Audio"}
            className="arcade-panel"
            style={{
              padding: '10px',
              color: muted ? '#94a3b8' : '#38bdf8',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowControls(!showControls)}
            title="Controls & Instructions"
            className="arcade-panel"
            style={{
              padding: '10px',
              color: '#94a3b8',
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
          top: 85,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
        }}>
          <div
            onClick={() => {
              sound.playUiClick();
              onOpenStation(nearbyStation);
            }}
            className="arcade-panel animate-bounce-slow"
            style={{
              padding: '12px 28px',
              border: `2px solid ${nearbyStation.color}`,
              background: 'rgba(15, 23, 42, 0.95)',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }} className="font-heading">
              PARKED AT PAVILION
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }} className="font-heading">
              {nearbyStation.name} — <span style={{ color: nearbyStation.color }}>{nearbyStation.subtitle}</span>
            </div>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#ffffff',
              background: nearbyStation.color,
              padding: '4px 14px',
              borderRadius: 20,
              marginTop: 4
            }} className="font-heading">
              PRESS [E] OR TAP TO EXPLORE
            </div>
          </div>
        </div>
      )}

      {/* Mini-Map Island Radar */}
      <div className="arcade-panel" style={{
        position: 'absolute',
        top: 80,
        right: 16,
        width: 140,
        height: 140,
        borderRadius: '50%',
        padding: 0,
        overflow: 'hidden',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        pointerEvents: 'auto'
      }}>
        {/* Island Base */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #22c55e 50%, #15803d 75%, #0284c7 95%)'
        }} />

        {/* Road Track Overlay */}
        <div style={{
          position: 'absolute',
          inset: 18,
          borderRadius: '50%',
          border: '6px solid rgba(51, 65, 85, 0.85)'
        }} />

        {/* Station Pins */}
        {PORTFOLIO_DATA.stations.map((st) => {
          const mapX = 70 + (st.position[0] / 75) * 45;
          const mapY = 70 + (st.position[2] / 75) * 45;
          const isNearby = nearbyStation?.id === st.id;

          return (
            <div
              key={st.id}
              onClick={() => onOpenStation(st)}
              title={st.name}
              style={{
                position: 'absolute',
                left: mapX - 5,
                top: mapY - 5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: st.color,
                border: '1.5px solid #ffffff',
                boxShadow: isNearby ? `0 0 10px ${st.color}` : 'none',
                transform: isNearby ? 'scale(1.4)' : 'scale(1)',
                cursor: 'pointer'
              }}
            />
          );
        })}

        {/* Car Dot with Direction Arrow */}
        <div style={{
          position: 'absolute',
          left: 70 + ((carPosition?.x || 0) / 75) * 45 - 6,
          top: 70 + ((carPosition?.z || 0) / 75) * 45 - 6,
          width: 12,
          height: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${-((carRotation || 0) * 180 / Math.PI)}deg)`
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: '10px solid #ef4444'
          }} />
        </div>
      </div>

      {/* Controls Manual Dialog */}
      {showControls && (
        <div className="arcade-panel" style={{
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
            <h3 style={{ fontSize: 18, color: '#38bdf8' }} className="font-heading">CAR CONTROLS & MANUAL</h3>
            <button
              onClick={() => setShowControls(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 20 }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 10, borderRadius: 10 }}>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>W / Up Arrow</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Accelerate</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 10, borderRadius: 10 }}>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>S / Down Arrow</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Brake / Reverse</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 10, borderRadius: 10 }}>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>A / D or Left/Right</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Steer Front Wheels</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 10, borderRadius: 10 }}>
              <div style={{ color: '#facc15', fontWeight: 700 }}>Spacebar</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Jump / Stunt</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 10, borderRadius: 10 }}>
              <div style={{ color: '#facc15', fontWeight: 700 }}>Key 'H'</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Honk Horn!</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: 10, borderRadius: 10 }}>
              <div style={{ color: '#22c55e', fontWeight: 700 }}>Key 'E' or Tap</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Explore Pavilion</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
            🏎️ <strong>Pro Tip:</strong> Speed over wooden ramps to jump! Bump into the 3D skill blocks at the Skills Pavilion to wobble them, and click any station in the bottom dock to auto-pilot the car!
          </div>
        </div>
      )}
    </div>
  );
};
