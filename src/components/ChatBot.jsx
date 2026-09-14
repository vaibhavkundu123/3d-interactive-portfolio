import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Loader2 } from 'lucide-react';
import { PORTFOLIO_CONTEXT, PORTFOLIO_DATA, callGeminiAPI } from '../data/portfolioData';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hello! I'm Sparky ✨, Vaibhav's AI Co-Pilot. Ask me about his DRDO CABS speech processing research, IEEE Best Paper award, deep learning models, or tech background!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-sparky-chat', handleOpen);
    return () => window.removeEventListener('open-sparky-chat', handleOpen);
  }, []);

  const quickPrompts = [
    "Tell me about his DRDO research",
    "What models did he train?",
    "Explain the IEEE SPACE 2026 Best Paper",
    "What are his core technical skills?"
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!queryText) setInput('');
    setIsTyping(true);

    const systemInstruction = `You are Sparky, the intelligent AI Assistant on Vaibhav Kundu's 3D Interactive Portfolio.
Represent Vaibhav Kundu accurately, professionally, and enthusiastically.
Ground all your responses in this profile data:
${PORTFOLIO_CONTEXT}
Keep answers crisp, technically accurate, and structured with concise bullet points if helpful. If asked for contact details, provide: ${PORTFOLIO_DATA.email} and phone ${PORTFOLIO_DATA.phone}.`;

    const reply = await callGeminiAPI(textToSend, systemInstruction);
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setIsTyping(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 90 }}>
      {isOpen && (
        <div
          className="dev-card"
          style={{
            width: 370,
            maxWidth: '92vw',
            height: 490,
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 14,
            border: '1.5px solid rgba(168, 85, 247, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'rgba(13, 17, 30, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                  SPARKY // AI CO-PILOT
                </div>
                <div style={{ fontSize: 11, color: '#c084fc', fontWeight: 600 }}>
                  POWERED BY GEMINI 2.5
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: 14,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: 'rgba(7, 9, 19, 0.6)'
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '86%'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 14,
                    fontSize: 13,
                    lineHeight: 1.5,
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, #9333ea, #6366f1)'
                      : 'rgba(22, 28, 48, 0.9)',
                    border: m.role === 'user'
                      ? 'none'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div style={{
                  padding: '8px 14px',
                  borderRadius: 12,
                  fontSize: 12,
                  background: 'rgba(22, 28, 48, 0.9)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{
            padding: '8px 12px',
            background: 'rgba(13, 17, 30, 0.85)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            gap: 6,
            overflowX: 'auto'
          }}>
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 16,
                  padding: '4px 10px',
                  color: '#cbd5e1',
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            background: 'rgba(13, 17, 30, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: 8
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Vaibhav's projects..."
              style={{
                flex: 1,
                background: 'rgba(7, 9, 19, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 20,
                padding: '8px 14px',
                color: '#ffffff',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="btn-primary"
              style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary"
        style={{
          borderRadius: 30,
          padding: '12px 22px',
          boxShadow: '0 8px 30px rgba(168, 85, 247, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <Sparkles size={18} />
        <span className="font-heading" style={{ fontSize: 13 }}>
          {isOpen ? 'CLOSE AI' : 'AI CO-PILOT'}
        </span>
      </button>
    </div>
  );
};
