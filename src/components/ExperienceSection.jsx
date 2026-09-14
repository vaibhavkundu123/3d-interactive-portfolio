import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { Briefcase, Activity } from 'lucide-react';

export const ExperienceSection = () => {
  return (
    <section id="experience" style={{ padding: '100px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div className="section-title-wrap">
          <span className="section-tag">PROFESSIONAL JOURNEY</span>
          <h2 className="section-title">WORK EXPERIENCE</h2>
        </div>

        {/* DRDO Speech Processing Waveform Feature Banner */}
        <div className="dev-card" style={{
          padding: '20px 28px',
          marginBottom: 32,
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(13, 17, 30, 0.9))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#38bdf8', letterSpacing: '0.1em', fontWeight: 700 }} className="font-heading">
              TACTICAL SPEECH PROCESSING RESEARCH
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }} className="font-heading">
              DRDO CABS • NVIDIA NeMo • Titanet-L • MarbleNet • MSDD
            </div>
          </div>

          {/* Interactive Bouncing Soundwave Bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32 }}>
            {[14, 28, 18, 32, 12, 26, 20, 30, 16, 24, 32, 18].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: h,
                  background: '#38bdf8',
                  borderRadius: 2,
                  animation: `waveBounce 1.${(i % 5) + 2}s infinite ease-in-out`
                }}
              />
            ))}
          </div>
        </div>

        {/* Timeline Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {PORTFOLIO_DATA.experience.map((exp, idx) => (
            <div
              key={idx}
              className="dev-card"
              style={{
                padding: 28,
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                    {exp.title}
                  </h3>
                  <div style={{ fontSize: 15, color: '#38bdf8', fontWeight: 600, marginTop: 2 }}>
                    {exp.company} — <span style={{ color: '#94a3b8' }}>{exp.location}</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#c084fc',
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700
                }} className="font-heading">
                  {exp.period}
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exp.description.map((desc, dIdx) => (
                  <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#cbd5e1', fontSize: 15, lineHeight: 1.6 }}>
                    <span style={{ color: '#38bdf8', marginTop: 2 }}>▹</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes waveBounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </section>
  );
};
