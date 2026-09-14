import React from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, FileText, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const AwardsSection = () => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#a855f7', '#38bdf8', '#ffffff']
    });
  };

  return (
    <section id="awards" style={{ padding: '100px 32px', background: 'rgba(10, 14, 26, 0.5)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div className="section-title-wrap">
          <span className="section-tag" style={{ color: '#f59e0b' }}>HONORS & RECOGNITION</span>
          <h2 className="section-title">AWARDS & ACHIEVEMENTS</h2>
        </div>

        {PORTFOLIO_DATA.achievements.map((ach, idx) => (
          <div
            key={idx}
            className="dev-card-gold"
            style={{ padding: 36, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1.5px solid #f59e0b',
                  color: '#f59e0b',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)'
                }}>
                  <Trophy size={40} />
                </div>
                <div>
                  <span style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid #f59e0b',
                    color: '#fcd34d',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700
                  }} className="font-heading">
                    {ach.badge}
                  </span>
                  <h3 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginTop: 8 }} className="font-heading">
                    {ach.title}
                  </h3>
                  <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 600 }}>
                    {ach.conference}
                  </div>
                </div>
              </div>

              {/* Celebrate Button */}
              <button
                onClick={triggerConfetti}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)'
                }}
              >
                <Sparkles size={18} /> Celebrate Award!
              </button>
            </div>

            {/* Research Paper Card */}
            <div style={{
              background: 'rgba(7, 9, 19, 0.75)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 14,
              padding: 22,
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, fontWeight: 700, marginBottom: 8 }} className="font-heading">
                <FileText size={16} /> CO-AUTHORED RESEARCH PAPER
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', lineHeight: 1.4 }}>
                “{ach.paperTitle}”
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>
                In Collaboration with <strong style={{ color: '#38bdf8' }}>{ach.collaboration}</strong> • Track: <strong style={{ color: '#f59e0b' }}>{ach.track}</strong>
              </div>
            </div>

            {/* Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ach.highlights.map((hl, hIdx) => (
                <div key={hIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#fef3c7', fontSize: 15, lineHeight: 1.6 }}>
                  <Star size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
