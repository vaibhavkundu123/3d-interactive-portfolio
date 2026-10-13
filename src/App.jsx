import React, { useRef, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SocialRail } from './components/SocialRail';
import { Hero } from './components/Hero';
import { IntroModal } from './components/IntroModal';
import { CommandPalette } from './components/CommandPalette';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { AwardsSection } from './components/AwardsSection';
import { EducationSection } from './components/EducationSection';
import { ContactSection } from './components/ContactSection';
import { ChatBot } from './components/ChatBot';
import './styles/index.css';

export default function App() {
  const triggerVoiceIntroRef = useRef(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl + K / Cmd + K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartIntroFromModal = () => {
    if (triggerVoiceIntroRef.current) {
      triggerVoiceIntroRef.current();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#070913' }}>
      {/* Welcome Playable Introduction Gate */}
      <IntroModal onStartIntro={handleStartIntroFromModal} />

      {/* Cyber Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onStartVoice={handleStartIntroFromModal}
      />

      {/* Top Navbar */}
      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* Left Social Rail */}
      <SocialRail />

      {/* Main Content Flow */}
      <main>
        <Hero onRegisterVoiceTrigger={(fn) => { triggerVoiceIntroRef.current = fn; }} />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <AwardsSection />
        <EducationSection />
        <ContactSection />
      </main>

      {/* Floating Sparky AI Co-Pilot */}
      <ChatBot />

      {/* Modern Sleek WCAG-Compliant Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '48px 32px 36px',
        textAlign: 'center',
        color: '#cbd5e1',
        fontSize: 14,
        background: '#04060c'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 18, letterSpacing: '0.05em' }} className="font-heading">
            &lt;VK /&gt; VAIBHAV KUNDU
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13, color: '#94a3b8' }}>
            <a href="#about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About</a>
            <a href="#experience" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Research</a>
            <a href="#awards" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Awards</a>
            <a href="#contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact</a>
            <a href="https://github.com/vaibhavkundu123" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>GitHub ↗</a>
            <a href="https://linkedin.com/in/vaibhav-kundu-b074a0240" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>LinkedIn ↗</a>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            © {new Date().getFullYear()} Vaibhav Kundu. Research Trainee @ DRDO CABS • 2x Best Paper Award Winner. Built with React 19, Three.js & Speech AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
