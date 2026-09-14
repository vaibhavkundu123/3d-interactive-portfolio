import React, { useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SocialRail } from './components/SocialRail';
import { Hero } from './components/Hero';
import { IntroModal } from './components/IntroModal';
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

  const handleStartIntroFromModal = () => {
    if (triggerVoiceIntroRef.current) {
      triggerVoiceIntroRef.current();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#070913' }}>
      {/* Welcome Playable Introduction Gate */}
      <IntroModal onStartIntro={handleStartIntroFromModal} />

      {/* Top Navbar */}
      <Navbar />

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

      {/* Modern Sleek Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '36px 24px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: 14,
        background: '#04060c'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 16 }} className="font-heading">
            VAIBHAV KUNDU
          </div>
          <p>© {new Date().getFullYear()} Vaibhav Kundu. Built with Three.js, React 19 & Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
