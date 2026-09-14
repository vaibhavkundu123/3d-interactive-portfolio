import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X, Download, Mail, Check, ExternalLink, MapPin,
  Trophy, Star, Briefcase, GraduationCap, BrainCircuit,
  Terminal, Smartphone, Cpu, Sparkles, Send, Loader2,
  FileText, Activity, ShieldCheck, UserCheck
} from 'lucide-react';
import { PORTFOLIO_DATA, PORTFOLIO_CONTEXT, FORMSPREE_ID, callGeminiAPI } from '../data/portfolioData';
import { sound } from '../three/SoundEngine';

export const StationModal = ({ station, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('IDLE');
  const [jdText, setJdText] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);

  // Trigger celebration confetti when opening Trophy Vault
  useEffect(() => {
    if (station?.id === 'achievements') {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#00f5ff', '#3b82f6', '#ffffff']
      });
    }
  }, [station]);

  if (!station) return null;

  const copyEmail = () => {
    sound.playUiClick();
    navigator.clipboard.writeText(PORTFOLIO_DATA.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDraftPitch = async () => {
    if (!jdText.trim()) return;
    setIsDrafting(true);
    sound.playUiClick();
    const system = `You are Vaibhav Kundu, a Machine Learning and Software Developer. Draft a compelling 2-paragraph tailored professional pitch directly answering this job description based on his profile: ${PORTFOLIO_CONTEXT}.`;
    const res = await callGeminiAPI(jdText, system);
    setFormData(prev => ({ ...prev, message: res }));
    setIsDrafting(false);
    setShowJdInput(false);
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setFormStatus('SENDING');
    sound.playUiClick();

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormStatus('SUCCESS');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus('ERROR');
      }
    } catch {
      setFormStatus('ERROR');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 5, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      overflowY: 'auto'
    }}>
      <div
        className={station.id === 'achievements' ? 'glass-panel-gold' : 'glass-panel'}
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          border: `1.5px solid ${station.color}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px ${station.color}33`
        }}
      >
        {/* Terminal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(5, 8, 20, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: station.color,
              boxShadow: `0 0 10px ${station.color}`
            }} />
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.15em' }} className="font-tech">
                ACCESSING SUBSPACE PROTOCOL // STATION: {station.id.toUpperCase()}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }} className="font-orbitron">
                {station.name} — <span style={{ color: station.color }}>{station.subtitle}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="glass-panel"
            style={{
              padding: '8px',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>

          {/* ==================================================== */}
          {/* STATION 1: ABOUT (COMMAND DECK) */}
          {/* ==================================================== */}
          {station.id === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  padding: 4,
                  background: 'linear-gradient(135deg, #00f5ff, #3b82f6)',
                  flexShrink: 0
                }}>
                  <img
                    src={PORTFOLIO_DATA.profileImage}
                    alt={PORTFOLIO_DATA.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 260 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 4 }} className="font-orbitron">
                    {PORTFOLIO_DATA.name}
                  </h2>
                  <div style={{ fontSize: 16, color: '#00f5ff', fontWeight: 600, marginBottom: 8 }} className="font-tech">
                    {PORTFOLIO_DATA.role}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
                    <MapPin size={15} color="#00f5ff" />
                    <span>{PORTFOLIO_DATA.location}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                    <a
                      href={PORTFOLIO_DATA.resumePath}
                      target="_blank"
                      rel="noreferrer"
                      className="cyber-btn"
                      style={{ textDecoration: 'none' }}
                      onClick={() => sound.playUiClick()}
                    >
                      <Download size={16} /> Download Resume
                    </a>
                    <button onClick={copyEmail} className="cyber-btn-secondary">
                      {copied ? <Check size={16} color="#10b981" /> : <Mail size={16} />}
                      {copied ? 'Copied Email!' : 'Copy Email'}
                    </button>
                    <a
                      href={PORTFOLIO_DATA.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="cyber-btn-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      LinkedIn <ExternalLink size={14} />
                    </a>
                    <a
                      href={PORTFOLIO_DATA.github}
                      target="_blank"
                      rel="noreferrer"
                      className="cyber-btn-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      GitHub <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Bio Narrative */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(0, 245, 255, 0.2)',
                borderRadius: 12,
                padding: '20px',
                lineHeight: 1.8,
                color: '#cbd5e1',
                fontSize: 15
              }}>
                {PORTFOLIO_DATA.about}
              </div>

              {/* Key Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                {PORTFOLIO_DATA.stats.map((stat, i) => (
                  <div key={i} style={{
                    background: 'rgba(10, 15, 29, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: 10,
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.1em' }} className="font-tech">
                      {stat.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#00f5ff', marginTop: 4 }} className="font-orbitron">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STATION 2: SKILLS (NEURAL NEXUS) */}
          {/* ==================================================== */}
          {station.id === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 14,
                color: '#93c5fd'
              }}>
                ⚡ Interactive Neural Matrix: Skill nodes are synchronized with modern ML architectures, speech processing frameworks, and full-stack software development.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                {PORTFOLIO_DATA.skills.map((group, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: `1px solid ${group.color}44`,
                    borderRadius: 12,
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: group.color,
                        boxShadow: `0 0 8px ${group.color}`
                      }} />
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }} className="font-orbitron">
                        {group.category}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {group.items.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(30, 41, 59, 0.8)',
                            border: `1px solid ${group.color}33`,
                            color: '#e2e8f0',
                            fontSize: 13,
                            padding: '5px 12px',
                            borderRadius: 6,
                            transition: 'all 0.2s ease',
                            cursor: 'default'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STATION 3: EXPERIENCE (DEFENSE HANGAR) */}
          {/* ==================================================== */}
          {station.id === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* DRDO Speech Processing Waveform Simulation Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 8, 20, 0.8))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#10b981', letterSpacing: '0.1em' }} className="font-tech">
                    TACTICAL SPEECH ANALYSIS TELEMETRY
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }} className="font-orbitron">
                    NVIDIA NeMo • Titanet-L • MarbleNet • MSDD
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28 }}>
                  {[12, 24, 18, 28, 10, 26, 15, 22, 30, 14, 20].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: 4,
                        height: h,
                        background: '#10b981',
                        borderRadius: 2,
                        animation: `badgeBounce 1.${i % 5 + 2}s infinite`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Experience Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {PORTFOLIO_DATA.experience.map((exp, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: 12,
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }} className="font-orbitron">
                          {exp.title}
                        </h3>
                        <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>
                          {exp.company} — <span style={{ color: '#94a3b8' }}>{exp.location}</span>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 20
                      }} className="font-orbitron">
                        {exp.period}
                      </div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {exp.description.map((desc, dIdx) => (
                        <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                          <span style={{ color: '#10b981', marginTop: 2 }}>▹</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STATION 4: ACHIEVEMENTS (TROPHY VAULT) */}
          {/* ==================================================== */}
          {station.id === 'achievements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {PORTFOLIO_DATA.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.8))',
                    border: '1.5px solid rgba(245, 158, 11, 0.5)',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 0 30px rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid #f59e0b',
                      color: '#f59e0b'
                    }}>
                      <Trophy size={32} />
                    </div>
                    <div>
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid #f59e0b',
                        color: '#fcd34d',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 20
                      }} className="font-orbitron">
                        {ach.badge}
                      </span>
                      <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 6 }} className="font-orbitron">
                        {ach.title}
                      </h3>
                      <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>
                        {ach.conference}
                      </div>
                    </div>
                  </div>

                  {/* Research Paper Banner */}
                  <div style={{
                    background: 'rgba(5, 8, 20, 0.75)',
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: 10,
                    padding: '16px',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00f5ff', fontSize: 12, marginBottom: 6 }} className="font-tech">
                      <FileText size={16} /> CO-AUTHORED RESEARCH PAPER
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#ffffff' }}>
                      “{ach.paperTitle}”
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
                      Collaboration: <strong style={{ color: '#00f5ff' }}>{ach.collaboration}</strong> • Track: <strong style={{ color: '#f59e0b' }}>{ach.track}</strong>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ach.highlights.map((hl, hIdx) => (
                      <div key={hIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#fef3c7', fontSize: 14 }}>
                        <Star size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ==================================================== */}
          {/* STATION 5: EDUCATION (CYBER ARCHIVES) */}
          {/* ==================================================== */}
          {station.id === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PORTFOLIO_DATA.education.map((edu, idx) => (
                <div key={idx} style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: 12,
                  padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                    <div>
                      <span style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        color: '#c084fc',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12
                      }} className="font-orbitron">
                        {edu.badge}
                      </span>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 6 }} className="font-orbitron">
                        {edu.degree}
                      </h3>
                      <div style={{ fontSize: 14, color: '#c084fc', fontWeight: 600 }}>
                        {edu.institution} — <span style={{ color: '#94a3b8' }}>{edu.location}</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: '#e9d5ff',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: 20
                    }} className="font-orbitron">
                      {edu.period}
                    </div>
                  </div>

                  <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 700, marginTop: 8 }}>
                    ★ {edu.score}
                  </div>

                  {edu.extras && (
                    <div style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid rgba(148, 163, 184, 0.15)',
                      fontSize: 13,
                      color: '#cbd5e1'
                    }}>
                      <strong style={{ color: '#00f5ff' }}>Role & Activities:</strong> {edu.extras}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ==================================================== */}
          {/* STATION 6: CONTACT (QUANTUM RELAY) */}
          {/* ==================================================== */}
          {station.id === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Quick Communication Channels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div onClick={copyEmail} style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  borderRadius: 10,
                  padding: 14,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <Mail size={22} color="#00f5ff" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Email</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', wordBreak: 'break-all' }}>{PORTFOLIO_DATA.email}</div>
                </div>

                <a href={PORTFOLIO_DATA.linkedin} target="_blank" rel="noreferrer" style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 10,
                  padding: 14,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block'
                }}>
                  <ExternalLink size={22} color="#3b82f6" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>LinkedIn</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Connect on LinkedIn</div>
                </a>

                <a href={PORTFOLIO_DATA.github} target="_blank" rel="noreferrer" style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: 10,
                  padding: 14,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block'
                }}>
                  <ExternalLink size={22} color="#a855f7" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>GitHub</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Code Repositories</div>
                </a>
              </div>

              {/* Recruiter Auto-Pitch Tool */}
              <div style={{
                background: 'rgba(0, 245, 255, 0.06)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: 10,
                padding: 16
              }}>
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00f5ff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  className="font-orbitron"
                >
                  <Sparkles size={16} /> RECRUITER? AUTO-DRAFT TAILORED PITCH FROM JD
                </button>

                {showJdInput && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea
                      rows={3}
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste Job Description / Requirement here..."
                      style={{
                        width: '100%',
                        background: 'rgba(5, 8, 20, 0.8)',
                        border: '1px solid rgba(0, 245, 255, 0.3)',
                        borderRadius: 8,
                        padding: 10,
                        color: '#ffffff',
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleDraftPitch}
                      disabled={isDrafting}
                      className="cyber-btn"
                      style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: 11 }}
                    >
                      {isDrafting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {isDrafting ? 'Synthesizing Pitch...' : 'Generate Tailored Pitch'}
                    </button>
                  </div>
                )}
              </div>

              {/* Subspace Transmission Form (Formspree) */}
              {formStatus === 'SUCCESS' ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: 12,
                  padding: 24,
                  textAlign: 'center'
                }}>
                  <Check size={40} color="#10b981" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ fontSize: 18, color: '#ffffff' }} className="font-orbitron">TRANSMISSION CONFIRMED</h3>
                  <p style={{ fontSize: 14, color: '#cbd5e1', marginTop: 6 }}>
                    Thank you for reaching out! Vaibhav will inspect your transmission and respond shortly.
                  </p>
                  <button
                    onClick={() => setFormStatus('IDLE')}
                    className="cyber-btn-secondary"
                    style={{ marginTop: 16 }}
                  >
                    Send Another Transmission
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Full Name / Organization"
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: 8,
                        padding: '12px 16px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Your Email Address"
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: 8,
                        padding: '12px 16px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter message or project transmission..."
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={formStatus === 'SENDING'}
                    className="cyber-btn"
                    style={{ padding: '14px', fontSize: 13 }}
                  >
                    {formStatus === 'SENDING' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {formStatus === 'SENDING' ? 'DISPATCHING TRANSMISSION...' : 'SEND SUBSPACE TRANSMISSION'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
