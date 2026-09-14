import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { Download, ExternalLink, Award, GraduationCap, Briefcase, Users } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" style={{ padding: '100px 32px', position: 'relative' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div className="section-title-wrap">
          <span className="section-tag">BACKGROUND & PROFILE</span>
          <h2 className="section-title">ABOUT ME</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 48,
          alignItems: 'center'
        }} className="about-grid">

          {/* Profile Photo with Radiant Border */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: 260,
              height: 260,
              borderRadius: 24,
              padding: 6,
              background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
              boxShadow: '0 20px 50px rgba(168, 85, 247, 0.25)'
            }}>
              <img
                src={PORTFOLIO_DATA.profileImage}
                alt={PORTFOLIO_DATA.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 20,
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Narrative & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="dev-card" style={{ padding: 28, lineHeight: 1.8, fontSize: 16, color: '#cbd5e1' }}>
              {PORTFOLIO_DATA.about}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {PORTFOLIO_DATA.stats.map((st, i) => (
                <div key={i} className="dev-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#a855f7', letterSpacing: '0.08em', fontWeight: 700 }} className="font-heading">
                    {st.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 6 }} className="font-heading">
                    {st.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
};
