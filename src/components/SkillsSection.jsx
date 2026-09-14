import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const SkillsSection = () => {
  return (
    <section id="skills" style={{ padding: '100px 32px', background: 'rgba(10, 14, 26, 0.5)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div className="section-title-wrap">
          <span className="section-tag">CORE COMPETENCIES</span>
          <h2 className="section-title">TECHNICAL SKILLS</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24
        }}>
          {PORTFOLIO_DATA.skills.map((group, idx) => (
            <div
              key={idx}
              className="dev-card"
              style={{
                padding: 24,
                borderTop: `3px solid ${group.color}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: group.color,
                  boxShadow: `0 0 10px ${group.color}`
                }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                  {group.category}
                </h3>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.items.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 13,
                      color: '#e2e8f0',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = group.color;
                      e.currentTarget.style.color = group.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#e2e8f0';
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
