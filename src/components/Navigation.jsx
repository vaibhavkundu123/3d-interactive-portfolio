import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../three/SoundEngine';
import {
  User, BrainCircuit, Briefcase, Trophy, GraduationCap, Send
} from 'lucide-react';

const iconMap = {
  User: User,
  BrainCircuit: BrainCircuit,
  Briefcase: Briefcase,
  Trophy: Trophy,
  GraduationCap: GraduationCap,
  Send: Send
};

export const Navigation = ({ activeStationId, onSelectStation }) => {
  const handleClick = (station) => {
    sound.ensureContext();
    sound.playTeleport();
    onSelectStation(station);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      maxWidth: '96vw',
      overflowX: 'auto',
      pointerEvents: 'auto'
    }}>
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 40,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 245, 255, 0.2)'
      }}>
        {PORTFOLIO_DATA.stations.map((st) => {
          const IconComponent = iconMap[st.iconName] || User;
          const isActive = activeStationId === st.id;

          return (
            <button
              key={st.id}
              onClick={() => handleClick(st)}
              className="cyber-btn-secondary"
              style={{
                borderRadius: 24,
                padding: '8px 16px',
                border: isActive ? `1.5px solid ${st.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                background: isActive ? `${st.color}22` : 'rgba(15, 23, 42, 0.6)',
                color: isActive ? '#ffffff' : '#94a3b8',
                boxShadow: isActive ? `0 0 15px ${st.color}44` : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <IconComponent size={16} color={isActive ? st.color : '#94a3b8'} />
              <span className="font-orbitron" style={{ fontSize: 11, fontWeight: 700 }}>
                {st.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
