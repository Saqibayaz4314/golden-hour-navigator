import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Activity, Sparkles } from 'lucide-react';
import { callAITriage } from '../services/api';

export default function GrokAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'AI Triage (Powered by Llama-3 / Groq) is active. What is the patient\'s condition? I can provide immediate first aid steps while you route.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const { data } = await callAITriage(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: data.message }]);
    } catch (err) {
      if (err.response?.status === 503) {
        // Fallback to simulation if key is not configured
        setTimeout(() => {
          let aiResponse = "Keep the patient calm and monitor their breathing. Ensure their airway is clear. Proceed to the nearest hospital immediately.";
          const lower = userMsg.toLowerCase();
          if (lower.includes('chest') || lower.includes('heart')) {
            aiResponse = "Suspected Cardiac Event. 1. Keep patient seated and calm. 2. Loosen tight clothing. 3. If they are prescribed nitroglycerin, assist them in taking it. 4. Route to nearest Cardiac facility.";
          } else if (lower.includes('burn') || lower.includes('fire')) {
            aiResponse = "Burn Protocol: 1. Stop the burning process. 2. Cool the burn with cool (not cold) running water for 10-20 mins. Route to nearest Burns center.";
          } else if (lower.includes('bleed') || lower.includes('cut')) {
            aiResponse = "Severe Bleeding: 1. Apply direct, firm pressure to the wound with a clean cloth. 2. Elevate the injured area if possible. Route to Trauma center.";
          }
          setMessages(prev => [...prev, { role: 'ai', text: `[SIMULATION MODE] ${aiResponse}` }]);
        }, 1000);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to Grok right now.' }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none', color: '#fff', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
          width: '350px', height: '500px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--green)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem', background: 'var(--bg-raised)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>AI Triage (Groq)</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, padding: '1rem', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'ai' ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  background: m.role === 'ai' ? 'rgba(34,197,94,0.1)' : 'var(--bg-raised)',
                  border: `1px solid ${m.role === 'ai' ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)'}`,
                  borderRadius: m.role === 'ai' ? '2px 16px 16px 16px' : '16px 2px 16px 16px',
                  color: m.role === 'ai' ? 'var(--green)' : 'var(--text-primary)',
                  fontSize: '0.85rem', lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={12} className="spinner" /> AI is analyzing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{
            padding: '1rem', borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-raised)', display: 'flex', gap: '0.5rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe symptoms..."
              style={{
                flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                borderRadius: '999px', padding: '0.5rem 1rem', color: '#fff', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--green)', border: 'none', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                opacity: input.trim() && !isTyping ? 1 : 0.5
              }}
            >
              <Send size={16} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
