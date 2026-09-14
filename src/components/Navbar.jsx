import React, { useState, useEffect } from 'react';
import { Download, Menu, X, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Awards', href: '#awards' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: scrolled ? '12px 24px' : '20px 32px',
      background: scrolled ? 'rgba(7, 9, 19, 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <a href="#" style={{
          textDecoration: 'none',
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 900,
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }} className="font-heading">
          <span style={{ color: '#a855f7' }}>&lt;</span>
          <span>VK</span>
          <span style={{ color: '#38bdf8' }}>/&gt;</span>
        </a>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              style={{
                textDecoration: 'none',
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 600,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
            >
              {link.name}
            </a>
          ))}

          <a
            href={PORTFOLIO_DATA.resumePath}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 13, borderRadius: 10 }}
          >
            <Download size={15} /> Resume
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          marginTop: 12,
          padding: 20,
          background: 'rgba(13, 17, 30, 0.98)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{ textDecoration: 'none', color: '#ffffff', fontSize: 16, fontWeight: 600 }}
            >
              {link.name}
            </a>
          ))}
          <a
            href={PORTFOLIO_DATA.resumePath}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <Download size={16} /> Download Resume
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};
