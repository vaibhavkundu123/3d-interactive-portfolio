import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X, Download, Mail, Check, ExternalLink, MapPin,
  Trophy, Star, Briefcase, GraduationCap, BrainCircuit,
  Sparkles, Send, Loader2, FileText
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

  useEffect(() => {
    if (station?.id === 'achievements') {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#22c55e', '#ef4444', '#ffffff']
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
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      overflowY: 'auto'
    }}>
      <div
        className={station.id === 'achievements' ? 'arcade-panel-gold' : 'arcade-panel'}
        style={{
          width: '100%',
          maxWidth: 880,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          border: `2px solid ${station.color}`,
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.5), 0 0 25px ${station.color}44`
        }}
      >
        {/* Terminal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(30, 41, 59, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: station.color,
              boxShadow: `0 0 10px ${station.color}`
            }} />
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }} className="font-heading">
                PAVILION STOP // {station.id.toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                {station.name} — <span style={{ color: station.color }}>{station.subtitle}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="arcade-panel"
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

        {/* Scrollable Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>

          {/* STATION 1: ABOUT */}
          {station.id === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  padding: 4,
                  background: 'linear-gradient(135deg, #38bdf8, #22c55e)',
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
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 260 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 4 }} className="font-heading">
                    {PORTFOLIO_DATA.name}
                  </h2>
                  <div style={{ fontSize: 16, color: '#38bdf8', fontWeight: 600, marginBottom: 8 }}>
                    {PORTFOLIO_DATA.role}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 14 }}>
                    <MapPin size={16} color="#38bdf8" />
                    <span>{PORTFOLIO_DATA.location}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                    <a
                      href={PORTFOLIO_DATA.resumePath}
                      target="_blank"
                      rel="noreferrer"
                      className="arcade-btn"
                      style={{ textDecoration: 'none' }}
                      onClick={() => sound.playUiClick()}
                    >
                      <Download size={16} /> Download Resume
                    </a>
                    <button onClick={copyEmail} className="arcade-btn-secondary">
                      {copied ? <Check size={16} color="#22c55e" /> : <Mail size={16} />}
                      {copied ? 'Copied Email!' : 'Copy Email'}
                    </button>
                    <a
                      href={PORTFOLIO_DATA.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="arcade-btn-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      LinkedIn <ExternalLink size={14} />
                    </a>
                    <a
                      href={PORTFOLIO_DATA.github}
                      target="_blank"
                      rel="noreferrer"
                      className="arcade-btn-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      GitHub <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 14,
                padding: '20px',
                lineHeight: 1.8,
                color: '#cbd5e1',
                fontSize: 15
              }}>
                {PORTFOLIO_DATA.about}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                {PORTFOLIO_DATA.stats.map((stat, i) => (
                  <div key={i} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: '0.08em' }} className="font-heading">
                      {stat.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', marginTop: 4 }} className="font-heading">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATION 2: SKILLS */}
          {station.id === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 12,
                padding: '14px 18px',
                fontSize: 14,
                color: '#7dd3fc'
              }}>
                🎯 <strong>Interactive Skills:</strong> Drive into the 3D domino blocks on the playground to wobble them! Here is Vaibhav's full technical toolkit across ML, frameworks, languages, and core computer science.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                {PORTFOLIO_DATA.skills.map((group, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: `1.5px solid ${group.color}44`,
                    borderRadius: 14,
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: group.color,
                        boxShadow: `0 0 10px ${group.color}`
                      }} />
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                        {group.category}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {group.items.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: `1px solid ${group.color}33`,
                            color: '#e2e8f0',
                            fontSize: 13,
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontWeight: 500
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

          {/* STATION 3: EXPERIENCE */}
          {station.id === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(30, 41, 59, 0.7))',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 12, color: '#22c55e', letterSpacing: '0.08em' }} className="font-heading">
                    SPEECH PROCESSING & DEFENSE RADAR
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                    NVIDIA NeMo • Titanet-L • MarbleNet • MSDD
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 26 }}>
                  {[12, 22, 16, 26, 10, 24, 14, 20, 26, 12].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: 5,
                        height: h,
                        background: '#22c55e',
                        borderRadius: 3
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {PORTFOLIO_DATA.experience.map((exp, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 14,
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                          {exp.title}
                        </h3>
                        <div style={{ fontSize: 14, color: '#22c55e', fontWeight: 600 }}>
                          {exp.company} — <span style={{ color: '#94a3b8' }}>{exp.location}</span>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#4ade80',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: 20
                      }} className="font-heading">
                        {exp.period}
                      </div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {exp.description.map((desc, dIdx) => (
                        <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                          <span style={{ color: '#22c55e', marginTop: 2 }}>▹</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATION 4: ACHIEVEMENTS */}
          {station.id === 'achievements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {PORTFOLIO_DATA.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(30, 41, 59, 0.85))',
                    border: '2px solid rgba(245, 158, 11, 0.6)',
                    borderRadius: 18,
                    padding: 24,
                    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{
                      padding: 14,
                      borderRadius: 14,
                      background: 'rgba(245, 158, 11, 0.25)',
                      border: '1.5px solid #f59e0b',
                      color: '#f59e0b'
                    }}>
                      <Trophy size={36} />
                    </div>
                    <div>
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid #f59e0b',
                        color: '#fcd34d',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: 20
                      }} className="font-heading">
                        {ach.badge}
                      </span>
                      <h3 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 6 }} className="font-heading">
                        {ach.title}
                      </h3>
                      <div style={{ fontSize: 15, color: '#f59e0b', fontWeight: 600 }}>
                        {ach.conference}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: 12,
                    padding: '16px',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, marginBottom: 6 }} className="font-heading">
                      <FileText size={16} /> CO-AUTHORED RESEARCH PAPER
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                      “{ach.paperTitle}”
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
                      Collaboration: <strong style={{ color: '#38bdf8' }}>{ach.collaboration}</strong> • Track: <strong style={{ color: '#f59e0b' }}>{ach.track}</strong>
                    </div>
                  </div>

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

          {/* STATION 5: EDUCATION */}
          {station.id === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PORTFOLIO_DATA.education.map((edu, idx) => (
                <div key={idx} style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: 14,
                  padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                    <div>
                      <span style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        color: '#d8b4fe',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 14
                      }} className="font-heading">
                        {edu.badge}
                      </span>
                      <h3 style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', marginTop: 6 }} className="font-heading">
                        {edu.degree}
                      </h3>
                      <div style={{ fontSize: 14, color: '#c084fc', fontWeight: 600 }}>
                        {edu.institution} — <span style={{ color: '#94a3b8' }}>{edu.location}</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: '#e9d5ff',
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 20
                    }} className="font-heading">
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
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: 13,
                      color: '#cbd5e1'
                    }}>
                      <strong style={{ color: '#38bdf8' }}>Role & Leadership:</strong> {edu.extras}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STATION 6: CONTACT */}
          {station.id === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div onClick={copyEmail} style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <Mail size={24} color="#38bdf8" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Email</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', wordBreak: 'break-all' }}>{PORTFOLIO_DATA.email}</div>
                </div>

                <a href={PORTFOLIO_DATA.linkedin} target="_blank" rel="noreferrer" style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block'
                }}>
                  <ExternalLink size={24} color="#38bdf8" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>LinkedIn</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Connect on LinkedIn</div>
                </a>

                <a href={PORTFOLIO_DATA.github} target="_blank" rel="noreferrer" style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block'
                }}>
                  <ExternalLink size={24} color="#a855f7" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>GitHub</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Code Repositories</div>
                </a>
              </div>

              {/* Recruiter Auto-Pitch Tool */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 12,
                padding: 16
              }}>
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  className="font-heading"
                >
                  <Sparkles size={16} /> RECRUITER? AUTO-DRAFT TAILORED PITCH FROM JD
                </button>

                {showJdInput && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea
                      rows={3}
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste Job Description / Requirements here..."
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 10,
                        padding: 12,
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleDraftPitch}
                      disabled={isDrafting}
                      className="arcade-btn"
                      style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: 13 }}
                    >
                      {isDrafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                      {isDrafting ? 'Synthesizing...' : 'Generate Pitch with Gemini'}
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Form */}
              {formStatus === 'SUCCESS' ? (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1.5px solid #22c55e',
                  borderRadius: 14,
                  padding: 24,
                  textAlign: 'center'
                }}>
                  <Check size={40} color="#22c55e" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ fontSize: 20, color: '#ffffff' }} className="font-heading">MESSAGE DISPATCHED!</h3>
                  <p style={{ fontSize: 14, color: '#cbd5e1', marginTop: 6 }}>
                    Thank you! Vaibhav will review your note and respond as soon as possible.
                  </p>
                  <button
                    onClick={() => setFormStatus('IDLE')}
                    className="arcade-btn-secondary"
                    style={{ marginTop: 16 }}
                  >
                    Send Another Note
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
                      placeholder="Your Full Name / Company"
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 10,
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
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 10,
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
                    placeholder="Type your message or inquiry..."
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={formStatus === 'SENDING'}
                    className="arcade-btn"
                    style={{ padding: '14px', fontSize: 15 }}
                  >
                    {formStatus === 'SENDING' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {formStatus === 'SENDING' ? 'Sending Message...' : 'Send Message'}
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
