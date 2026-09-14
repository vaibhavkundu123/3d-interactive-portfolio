import React from 'react';
import { Github, Linkedin, Mail, Phone, FileText } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const SocialRail = () => {
  const socials = [
    { name: 'GitHub', icon: Github, href: PORTFOLIO_DATA.github, color: '#f8fafc' },
    { name: 'LinkedIn', icon: Linkedin, href: PORTFOLIO_DATA.linkedin, color: '#38bdf8' },
    { name: 'Email', icon: Mail, href: `mailto:${PORTFOLIO_DATA.email}`, color: '#a855f7' },
    { name: 'Resume', icon: FileText, href: PORTFOLIO_DATA.resumePath, color: '#22c55e' }
  ];

  return (
    <aside style={{
      position: 'fixed',
      left: 24,
      bottom: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 18
    }} className="social-rail">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {socials.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              title={s.name}
              style={{
                color: '#94a3b8',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = s.color;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = s.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <Icon size={18} />
            </a>
          );
        })}
      </div>

      {/* Decorative vertical line */}
      <div style={{
        width: 1,
        height: 80,
        background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.6), transparent)'
      }} />

      <style>{`
        @media (max-width: 768px) {
          .social-rail { display: none !important; }
        }
      `}</style>
    </aside>
  );
};
