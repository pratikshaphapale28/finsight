import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Trash2,
  TrendingUp,
  HelpCircle,
  PieChart,
  Target,
  Wallet,
} from 'lucide-react';

const exampleChips = [
  'How much did I spend on food this month?',
  'What will I likely spend next month?',
  'Am I on track with my budgets?',
  'Where did most of my money go this month?',
  'How are my savings goals progressing?',
];

const AIAssistantPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your FinSight Financial Assistant.\n\nYou can ask me anything about your finances in plain language — like your spending habits, upcoming monthly estimates, or budget health.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const res = await api.post('/assistant/chat', { message: prompt });
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.data?.reply || "I couldn't retrieve that information right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[Assistant] Query failed:', err);
      const errorMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text:
          err.response?.data?.message ||
          'I am having trouble answering that right now. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        sender: 'assistant',
        text: `Conversation cleared. What financial questions can I answer for you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxHeight: '880px',
        gap: '1rem',
      }}
    >
      {/* Assistant Header Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(14, 107, 92, 0.3) 0%, rgba(12, 28, 24, 0.9) 100%)',
          border: '1px solid var(--border-highlight)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--accent-primary)',
              color: '#06241e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--accent-glow)',
            }}
          >
            <Sparkles size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              Financial Assistant
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Ask anything about your spending, upcoming estimates, and budget limits
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.775rem' }}
          title="Clear Conversation"
        >
          <Trash2 size={14} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: 'rgba(10, 24, 21, 0.75)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Message Thread Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: isUser ? '#10b981' : 'rgba(63, 191, 159, 0.2)',
                    color: isUser ? '#fff' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: isUser ? 'none' : '1px solid rgba(63, 191, 159, 0.3)',
                  }}
                >
                  {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '82%',
                    background: isUser
                      ? 'linear-gradient(135deg, #0e6b5c, #0a4f44)'
                      : 'rgba(16, 38, 33, 0.95)',
                    border: isUser
                      ? '1px solid rgba(63, 191, 159, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '0.9rem 1.15rem',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      color: '#fff',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.45rem',
                      textAlign: isUser ? 'right' : 'left',
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(63, 191, 159, 0.2)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(63, 191, 159, 0.3)',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  background: 'rgba(16, 38, 33, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                  Reviewing your financial records...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example Starter Chips */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(6, 17, 15, 0.65)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Suggested:
          </span>
          {exampleChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="btn btn-secondary btn-sm"
              disabled={isTyping}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid rgba(63, 191, 159, 0.25)',
                color: 'var(--text-primary)',
                background: 'rgba(63, 191, 159, 0.06)',
                flexShrink: 0,
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(8, 20, 18, 0.9)',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
          >
            <input
              type="text"
              className="form-input"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                background: 'rgba(12, 28, 24, 0.95)',
              }}
              placeholder="Ask about your expenses, next month forecast, or budgets..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!inputPrompt.trim() || isTyping}
              style={{ padding: '0.75rem 1.25rem', flexShrink: 0 }}
            >
              <Send size={16} />
              <span className="hide-on-mobile">Send</span>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: pulseDot 1.2s infinite ease-in-out;
        }
        @keyframes pulseDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AIAssistantPage;
