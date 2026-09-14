import React, { useState } from 'react';
import { Mail, Send, Check, Loader2, Sparkles, Phone, ExternalLink } from 'lucide-react';
import { PORTFOLIO_DATA, PORTFOLIO_CONTEXT, FORMSPREE_ID, callGeminiAPI } from '../data/portfolioData';

export const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('IDLE');
  const [jdText, setJdText] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDraftPitch = async () => {
    if (!jdText.trim()) return;
    setIsDrafting(true);
    const system = `You are Vaibhav Kundu, a Machine Learning and Software Developer. Draft a compelling 2-paragraph tailored professional pitch directly answering this job description based on his profile: ${PORTFOLIO_CONTEXT}.`;
    const res = await callGeminiAPI(jdText, system);
    setFormData(prev => ({ ...prev, message: res }));
    setIsDrafting(false);
    setShowJdInput(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('SENDING');

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus('SUCCESS');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('ERROR');
      }
    } catch {
      setStatus('ERROR');
    }
  };

  return (
    <section id="contact" style={{ padding: '100px 32px 140px', background: 'rgba(10, 14, 26, 0.5)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div className="section-title-wrap">
          <span className="section-tag">GET IN TOUCH</span>
          <h2 className="section-title">CONNECT WITH ME</h2>
        </div>

        {/* Channels Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 40
        }}>
          <div
            onClick={copyEmail}
            className="dev-card"
            style={{ padding: 24, textAlign: 'center', cursor: 'pointer' }}
          >
            <Mail size={32} color="#a855f7" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>Email</div>
            <div style={{ fontSize: 12, color: '#94a3b8', wordBreak: 'break-all', marginTop: 4 }}>{PORTFOLIO_DATA.email}</div>
            <div style={{ fontSize: 11, color: copied ? '#22c55e' : '#a855f7', fontWeight: 600, marginTop: 8 }}>
              {copied ? '✓ Copied to clipboard!' : 'Click to copy'}
            </div>
          </div>

          <a
            href={PORTFOLIO_DATA.linkedin}
            target="_blank"
            rel="noreferrer"
            className="dev-card"
            style={{ padding: 24, textAlign: 'center', textDecoration: 'none', display: 'block' }}
          >
            <ExternalLink size={32} color="#38bdf8" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>LinkedIn</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Professional Network</div>
            <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600, marginTop: 8 }}>Connect ↗</div>
          </a>

          <a
            href={PORTFOLIO_DATA.github}
            target="_blank"
            rel="noreferrer"
            className="dev-card"
            style={{ padding: 24, textAlign: 'center', textDecoration: 'none', display: 'block' }}
          >
            <ExternalLink size={32} color="#f8fafc" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>GitHub</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Open-Source Repos</div>
            <div style={{ fontSize: 11, color: '#f8fafc', fontWeight: 600, marginTop: 8 }}>Explore Code ↗</div>
          </a>

          <div className="dev-card" style={{ padding: 24, textAlign: 'center' }}>
            <Phone size={32} color="#22c55e" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>Phone</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{PORTFOLIO_DATA.phone}</div>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginTop: 8 }}>Direct Inquiries</div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="dev-card" style={{ maxWidth: 760, margin: '0 auto', padding: 36 }}>
          {/* Recruiter Auto-Pitch Tool */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1.5px solid rgba(168, 85, 247, 0.35)',
            borderRadius: 14,
            padding: 18,
            marginBottom: 24
          }}>
            <button
              type="button"
              onClick={() => setShowJdInput(!showJdInput)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c084fc',
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
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea
                  rows={3}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste Job Description / Requirement here..."
                  style={{
                    width: '100%',
                    background: 'rgba(7, 9, 19, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
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
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '8px 18px', fontSize: 13 }}
                >
                  {isDrafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {isDrafting ? 'Synthesizing...' : 'Generate Pitch with Gemini'}
                </button>
              </div>
            )}
          </div>

          {status === 'SUCCESS' ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1.5px solid #22c55e',
              borderRadius: 14,
              padding: 28,
              textAlign: 'center'
            }}>
              <Check size={44} color="#22c55e" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 22, color: '#ffffff' }} className="font-heading">MESSAGE SENT!</h3>
              <p style={{ fontSize: 15, color: '#cbd5e1', marginTop: 8 }}>
                Thank you for reaching out! Vaibhav will review your note and respond promptly.
              </p>
              <button
                onClick={() => setStatus('IDLE')}
                className="btn-secondary"
                style={{ marginTop: 20 }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 12,
                    padding: '14px 18px',
                    color: '#ffffff',
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your Email"
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 12,
                    padding: '14px 18px',
                    color: '#ffffff',
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
              </div>

              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Your Message..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  color: '#ffffff',
                  fontSize: 15,
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                disabled={status === 'SENDING'}
                className="btn-primary"
                style={{ padding: '16px', fontSize: 16 }}
              >
                {status === 'SENDING' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {status === 'SENDING' ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
