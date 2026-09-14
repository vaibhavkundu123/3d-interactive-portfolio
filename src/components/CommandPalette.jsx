import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Download,
  Bot,
  Copy,
  Shield,
  Award,
  Sparkles,
  Briefcase,
  GraduationCap,
  Terminal,
  Code,
  Mail,
  Github,
  Linkedin,
  CornerDownLeft,
  X,
  Check
} from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const CommandPalette = ({ isOpen, onClose, onStartVoice }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // All commands registry
  const commands = [
    // QUICK ACTIONS
    {
      id: 'voice-intro',
      category: 'QUICK ACTIONS',
      title: 'Play 3D Avatar Spoken Introduction',
      subtitle: 'Triggers speech synthesis & 3D avatar voiceover',
      icon: Volume2,
      badge: 'Interactive',
      keywords: 'speech voice audio intro speak avatar hello listen talk sound baritone',
      action: () => {
        onClose();
        if (onStartVoice) onStartVoice();
      }
    },
    {
      id: 'download-resume',
      category: 'QUICK ACTIONS',
      title: 'Download Official Resume (PDF)',
      subtitle: 'Latest resume featuring DRDO, IEEE paper & ML skills',
      icon: Download,
      badge: 'PDF',
      keywords: 'resume cv pdf download hire curriculum vitae job',
      action: () => {
        onClose();
        window.open(PORTFOLIO_DATA.resumePath, '_blank');
      }
    },
    {
      id: 'open-sparky',
      category: 'QUICK ACTIONS',
      title: 'Ask Sparky (AI Co-Pilot)',
      subtitle: 'Open AI assistant to answer technical & project questions',
      icon: Bot,
      badge: 'AI',
      keywords: 'ai sparky chat bot assistant question talk gemini copilot',
      action: () => {
        onClose();
        window.dispatchEvent(new CustomEvent('open-sparky-chat'));
      }
    },
    {
      id: 'copy-email',
      category: 'QUICK ACTIONS',
      title: 'Copy Email to Clipboard',
      subtitle: PORTFOLIO_DATA.email,
      icon: Copy,
      badge: 'Copy',
      keywords: 'email mail copy contact touch vaibhavkundu69',
      action: () => {
        navigator.clipboard.writeText(PORTFOLIO_DATA.email);
        showToast('Email copied to clipboard!');
      }
    },

    // RESEARCH & CREDENTIALS
    {
      id: 'drdo-research',
      category: 'RESEARCH & HONORS',
      title: 'DRDO CABS Research Trainee',
      subtitle: 'Tactical speech diarization with NVIDIA NeMo, TitaNet & MSDD',
      icon: Shield,
      badge: 'Defense AI',
      keywords: 'drdo cabs defence research speech nemo diarization titanet msdd airborne',
      action: () => {
        onClose();
        scrollToSection('#experience');
      }
    },
    {
      id: 'ieee-best-paper',
      category: 'RESEARCH & HONORS',
      title: 'IEEE SPACE 2026 Best Paper Award',
      subtitle: 'AI-Based Voice Deception System for Aerospace & Defense',
      icon: Award,
      badge: 'Award Winner',
      keywords: 'ieee space paper award best paper voice deception aerospace conference',
      action: () => {
        onClose();
        scrollToSection('#awards');
      }
    },
    {
      id: 'ieee-cis',
      category: 'RESEARCH & HONORS',
      title: 'IEEE CIS Summer Research',
      subtitle: 'Comparative study on Vision Transformers (ViT) vs. CNNs',
      icon: Sparkles,
      badge: 'Deep Learning',
      keywords: 'ieee cis vision transformers vit cnn deep learning research attention',
      action: () => {
        onClose();
        scrollToSection('#experience');
      }
    },

    // EXPERIENCE & EDUCATION
    {
      id: 'sasken-internship',
      category: 'EXPERIENCE & EDUCATION',
      title: 'Sasken Technologies Android Internship',
      subtitle: 'High-performance School Management App in Java & Android SDK',
      icon: Briefcase,
      badge: 'Mobile',
      keywords: 'sasken android java mobile app school management architecture',
      action: () => {
        onClose();
        scrollToSection('#experience');
      }
    },
    {
      id: 'degree-nsec',
      category: 'EXPERIENCE & EDUCATION',
      title: 'B.Tech CSE • Netaji Subhas Engineering College',
      subtitle: 'Computer Science & Engineering (2022 – 2026)',
      icon: GraduationCap,
      badge: 'Degree',
      keywords: 'nsec netaji subhas engineering college btech degree education bachelor',
      action: () => {
        onClose();
        scrollToSection('#education');
      }
    },
    {
      id: 'gnx-leadership',
      category: 'EXPERIENCE & EDUCATION',
      title: 'Vice President @ GNX (Linux Community)',
      subtitle: 'Official GNU/Linux & open-source student developers group',
      icon: Terminal,
      badge: 'Leadership',
      keywords: 'gnx linux gnu open source leadership vice president bash sysadmin',
      action: () => {
        onClose();
        scrollToSection('#education');
      }
    },
    {
      id: 'skills-section',
      category: 'EXPERIENCE & EDUCATION',
      title: 'Technical Skills & Core Stack',
      subtitle: 'DSA, Python, C, Java, PyTorch, NeMo, React, Three.js',
      icon: Code,
      badge: 'Stack',
      keywords: 'skills technical dsa python c java pytorch tensorflow nemo react threejs linux',
      action: () => {
        onClose();
        scrollToSection('#skills');
      }
    },
    {
      id: 'contact-section',
      category: 'EXPERIENCE & EDUCATION',
      title: 'Get In Touch / Send Message',
      subtitle: 'Direct contact form with AI pitch drafter',
      icon: Mail,
      badge: 'Connect',
      keywords: 'contact get in touch message hire email formspree',
      action: () => {
        onClose();
        scrollToSection('#contact');
      }
    },

    // PROFILES & LINKS
    {
      id: 'github-profile',
      category: 'PROFILES & CODE',
      title: 'GitHub Profile (vaibhavkundu123)',
      subtitle: 'Explore open-source repositories and code projects',
      icon: Github,
      badge: 'External',
      keywords: 'github git code repositories vaibhavkundu123 open source',
      action: () => {
        window.open(PORTFOLIO_DATA.github, '_blank');
      }
    },
    {
      id: 'linkedin-profile',
      category: 'PROFILES & CODE',
      title: 'LinkedIn Profile',
      subtitle: 'Connect with Vaibhav Kundu on LinkedIn',
      icon: Linkedin,
      badge: 'External',
      keywords: 'linkedin connect profile network professional',
      action: () => {
        window.open(PORTFOLIO_DATA.linkedin, '_blank');
      }
    }
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const scrollToSection = (hash) => {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter commands by query
  const filtered = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.toLowerCase().includes(q)
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  // Ensure active element is scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 20px 20px',
        backgroundColor: 'rgba(5, 7, 15, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(56, 189, 248, 0.95))',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: 24,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            zIndex: 10001,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Command Modal Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'rgba(11, 15, 30, 0.94)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
          borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(168, 85, 247, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <Search size={20} color="#38bdf8" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g., DRDO, Resume, Skills)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onInput={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: 15,
              fontWeight: 500,
              fontFamily: 'inherit'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              letterSpacing: '0.05em'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: 380,
            overflowY: 'auto',
            padding: '10px 12px'
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: 14
              }}
            >
              No matching commands found for "<span style={{ color: '#c084fc' }}>{query}</span>"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComponent = cmd.icon;
              const isFirstOfCategory =
                idx === 0 || filtered[idx - 1].category !== cmd.category;

              return (
                <React.Fragment key={cmd.id}>
                  {isFirstOfCategory && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.08em',
                        padding: '10px 12px 4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {cmd.category}
                    </div>
                  )}
                  <div
                    data-selected={isSelected}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isSelected
                        ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.22) 0%, rgba(56, 189, 248, 0.15) 100%)'
                        : 'transparent',
                      border: isSelected
                        ? '1px solid rgba(168, 85, 247, 0.55)'
                        : '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSelected ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#38bdf8' : '#94a3b8',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <IconComponent size={17} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: isSelected ? '#ffffff' : '#e2e8f0'
                          }}
                        >
                          {cmd.title}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          {cmd.subtitle}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {cmd.badge && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            color: isSelected ? '#7dd3fc' : '#94a3b8',
                            border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent'
                          }}
                        >
                          {cmd.badge}
                        </span>
                      )}
                      {isSelected && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#c084fc',
                            fontSize: 11,
                            fontWeight: 600
                          }}
                        >
                          <span>Select</span>
                          <CornerDownLeft size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span>
              <kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>↑</kbd>{' '}
              <kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>↓</kbd> to navigate
            </span>
            <span>
              <kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>↵</kbd> to execute
            </span>
          </div>
          <div>
            <span>
              <kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
