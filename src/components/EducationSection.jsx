import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { GraduationCap, Award } from 'lucide-react';

export const EducationSection = () => {
  return (
    <section id="education" style={{ padding: '100px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div className="section-title-wrap">
          <span className="section-tag">ACADEMIC BACKGROUND</span>
          <h2 className="section-title">EDUCATION & LEADERSHIP</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {PORTFOLIO_DATA.education.map((edu, idx) => (
            <div
              key={idx}
              className="dev-card"
              style={{ padding: 28, position: 'relative' }}
            >
              <span style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                color: '#c084fc',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 14,
                display: 'inline-block',
                marginBottom: 12
              }} className="font-heading">
                {edu.badge}
              </span>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 4 }} className="font-heading">
                {edu.degree}
              </h3>
              <div style={{ fontSize: 15, color: '#38bdf8', fontWeight: 600 }}>
                {edu.institution}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                {edu.location} • {edu.period}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#f59e0b',
                fontSize: 15,
                fontWeight: 700,
                marginTop: 14
              }}>
                <Award size={18} />
                <span>{edu.score}</span>
              </div>

              {edu.extras && (
                <div style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: 14,
                  color: '#cbd5e1',
                  lineHeight: 1.6
                }}>
                  <strong style={{ color: '#a855f7' }}>Leadership & Roles:</strong> {edu.extras}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
