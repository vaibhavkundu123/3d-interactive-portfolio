import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Loader2 } from 'lucide-react';
import { PORTFOLIO_CONTEXT, PORTFOLIO_DATA, callGeminiAPI } from '../data/portfolioData';
import { sound } from '../three/SoundEngine';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hello there! I'm Sparky ✨, Vaibhav's AI co-pilot. Feel free to ask about his DRDO CABS research, IEEE Best Paper award, speech AI models, or technical background!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    "Tell me about his DRDO CABS research",
    "What models did he train?",
    "Explain the IEEE SPACE 2026 Best Paper",
    "What are his core technical skills?"
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    sound.playUiClick();
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!queryText) setInput('');
    setIsTyping(true);

    const systemInstruction = `You are Sparky, the friendly, highly knowledgeable AI Assistant on Vaibhav Kundu's 3D Interactive Portfolio.
Represent Vaibhav Kundu accurately, professionally, and enthusiastically.
Ground all your responses in this profile data:
${PORTFOLIO_CONTEXT}
Keep answers crisp, technically accurate, and structured with concise bullet points if helpful. If asked for contact details, provide: ${PORTFOLIO_DATA.email} and phone ${PORTFOLIO_DATA.phone}.`;

    const reply = await callGeminiAPI(textToSend, systemInstruction);
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setIsTyping(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 85, right: 20, zIndex: 90, pointerEvents: 'auto' }}>
      {isOpen && (
        <div
          className="arcade-panel"
          style={{
            width: 360,
            maxWidth: '92vw',
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 12,
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(30, 41, 59, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a'
              }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }} className="font-heading">
                  SPARKY // AI CO-PILOT
                </div>
                <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                  POWERED BY GEMINI 2.5
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playUiClick();
                setIsOpen(false);
              }}
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
            background: 'rgba(15, 23, 42, 0.6)'
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
                      ? 'linear-gradient(135deg, #2563eb, #38bdf8)'
                      : 'rgba(30, 41, 59, 0.85)',
                    border: m.role === 'user'
                      ? 'none'
                      : '1px solid rgba(255, 255, 255, 0.1)',
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
                  background: 'rgba(30, 41, 59, 0.85)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Sparky is thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{
            padding: '8px 12px',
            background: 'rgba(15, 23, 42, 0.85)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: 6,
            overflowX: 'auto'
          }}>
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
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
            background: 'rgba(30, 41, 59, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
                background: 'rgba(15, 23, 42, 0.8)',
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
              className="arcade-btn"
              style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Launcher Button */}
      <button
        onClick={() => {
          sound.ensureContext();
          sound.playUiClick();
          setIsOpen(!isOpen);
        }}
        className="arcade-btn"
        style={{
          borderRadius: 25,
          padding: '10px 18px',
          boxShadow: '0 6px 25px rgba(56, 189, 248, 0.4)',
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
