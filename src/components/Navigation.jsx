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
    sound.playJump();
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
      <div className="arcade-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 30,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
      }}>
        {PORTFOLIO_DATA.stations.map((st) => {
          const IconComponent = iconMap[st.iconName] || User;
          const isActive = activeStationId === st.id;

          return (
            <button
              key={st.id}
              onClick={() => handleClick(st)}
              className="arcade-btn-secondary"
              style={{
                borderRadius: 20,
                padding: '8px 16px',
                border: isActive ? `2px solid ${st.color}` : '1px solid rgba(255, 255, 255, 0.15)',
                background: isActive ? `${st.color}33` : 'rgba(30, 41, 59, 0.7)',
                color: isActive ? '#ffffff' : '#cbd5e1',
                boxShadow: isActive ? `0 0 15px ${st.color}66` : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <IconComponent size={16} color={isActive ? st.color : '#94a3b8'} />
              <span className="font-heading" style={{ fontSize: 13, fontWeight: 700 }}>
                {st.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
