import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { askAI } from '../services/api';
import { useUI } from '../context/UIContext';

/* ============================================================
   VyomAcre — AI Assistant (global chatbot)
   - Har page pe bottom-right launcher (poori website pe)
   - UIContext ka isChatbotOpen — Help page ka button bhi isi se kholta hai
   - Panel ke bahar kahin bhi click / Esc = band
   - Backend: POST /api/ai/ask (Gemini + 429 retry + cache)
   ============================================================ */

/* ---------- cute robot (custom SVG, no emoji) ---------- */
function RobotFace({ size = 30, body = '#04160C', accent = '#00E585', thinking = false }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" fill="none" width={size} height={size} aria-hidden="true" className="vy-robot">

        {/* thought dots — sirf jab AI soch raha ho */}
        {thinking && (
          <g fill={accent}>
            <circle className="vy-think-dot" cx="16" cy="2" r="1.5" />
            <circle className="vy-think-dot" cx="20" cy="1" r="1.7" />
            <circle className="vy-think-dot" cx="24" cy="2" r="1.5" />
          </g>
        )}

        {/* antenna */}
        <line x1="20" y1="5" x2="20" y2="10" stroke={body} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="20" cy="4.5" r="2.4" fill={body} className="vy-antenna" />

        {/* ears */}
        <rect x="3.5" y="15" width="3.5" height="8" rx="1.75" fill={body} />
        <rect x="33" y="15" width="3.5" height="8" rx="1.75" fill={body} />

        {/* head */}
        <rect x="7" y="9.5" width="26" height="19" rx="9" fill={body} />

        {/* eyes */}
        <circle className="vy-eye" cx="15" cy="19" r="2.5" fill={accent} />
        <circle className="vy-eye" cx="25" cy="19" r="2.5" fill={accent} />

        {/* smile */}
        <path d="M15.5 24 Q20 27.5 24.5 24" stroke={accent} strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* body */}
        <rect x="12" y="30" width="16" height="8" rx="4" fill={body} />
        <circle cx="20" cy="34" r="1.8" fill={accent} className="vy-antenna" />
      </svg>
    </span>
  );
}

const SUGGESTIONS = [
  'Roof list kaise karu?',
  'Kitni kamai ho sakti hai?',
  'Satellite verification kya hai?',
];

export default function GeminiChatbot() {
  const { isChatbotOpen, openChatbot, closeChatbot } = useUI();

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'नमस्ते! मैं VyomAcre AI हूँ। अपनी खाली छत से पैसे कमाने या सोलर एनर्जी के बारे में कोई भी सवाल पूछें।',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isChatbotOpen]);

  /* Esc se band karo */
  useEffect(() => {
    if (!isChatbotOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeChatbot(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isChatbotOpen, closeChatbot]);

  const send = async (text) => {
    const trimmed = (text !== undefined ? text : input).trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askAI(trimmed);

      if (result && result.status === 'success' && result.data && result.data.answer) {
        setMessages((prev) => [...prev, { role: 'ai', text: result.data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: 'माफ़ कीजिये, सर्वर से सही जवाब नहीं मिल पाया। कृपया थोड़ी देर बाद प्रयास करें।' },
        ]);
      }
    } catch (error) {
      console.error('[VyomAcre AI] Network error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'नेटवर्क में कोई समस्या है या VyomAcre सर्वर सो रहा है (cold start) — ek baar backend URL browser me kholo, phir dobara try karo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end sm:bottom-6 sm:right-6">

      {/* Backdrop — panel ke bahar kahin bhi click karo, chat band */}
      {isChatbotOpen && (
        <div
          onClick={closeChatbot}
          aria-hidden="true"
          className="fixed inset-0 z-[9998] bg-[#050A08]/40 backdrop-blur-[1px]"
        />
      )}

      {/* ===== Panel ===== */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[9999] mb-4 flex h-[min(600px,78vh)] w-[calc(100vw-40px)] flex-col overflow-hidden rounded-3xl border border-[#1C2A22] bg-[#0A1410]/95 backdrop-blur-2xl sm:w-[390px]"
            style={{ boxShadow: '0 24px 70px rgba(0,0,0,0.5), 0 0 35px rgba(0,229,133,0.06)' }}
          >
            <style>{`
@keyframes vy-blink { 0%, 91%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.08); } }
.vy-eye { animation: vy-blink 4.2s infinite; transform-box: fill-box; transform-origin: center; }
@keyframes vy-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.vy-antenna { animation: vy-pulse 1.7s ease-in-out infinite; }
@keyframes vy-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.2px); } }
.vy-robot { animation: vy-float 3.2s ease-in-out infinite; }
@keyframes vy-think { 0% { opacity: 0; transform: translateY(2.5px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-3px); } }
.vy-think-dot { animation: vy-think 1.25s infinite; transform-box: fill-box; }
.vy-think-dot:nth-child(2) { animation-delay: 0.18s; }
.vy-think-dot:nth-child(3) { animation-delay: 0.36s; }
`}</style>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#121D17] bg-[#08120C] px-5 py-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-[#00E585]/25 bg-[#00E585]/10">
                <RobotFace size={26} body="#00E585" accent="#04160C" thinking={isLoading} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#F4F8F5]">Vyom Assistant</div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#00E585]">
                  <span className={'h-1.5 w-1.5 rounded-full bg-[#00E585] ' + (isLoading ? 'animate-pulse' : '')} />
                  {isLoading ? 'Soch raha hoon…' : 'Online · Gemini AI'}
                </div>
              </div>
              <button
                onClick={closeChatbot}
                aria-label="Close chat"
                className="rounded-lg p-2 text-[#93A096] transition-colors hover:bg-[#0F1A14] hover:text-[#F4F8F5]"
              >
                <X size={17} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={'flex ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={
                      'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ' +
                      (m.role === 'user'
                        ? 'rounded-br-md bg-[#00E585] font-medium text-[#04160C]'
                        : 'rounded-bl-md border border-[#1C2A22] bg-[#08120C] text-[#D7E2DA]')
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#1C2A22] bg-[#08120C] px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00E585]"
                        style={{ animationDelay: (d * 0.15) + 's' }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestion chips — jab tak pehla sawaal nahi hua */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-[#24352B] px-3 py-1.5 text-xs text-[#93A096] transition-colors hover:border-[#00E585]/50 hover:text-[#00E585]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-[#121D17] bg-[#08120C] p-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Apna sawaal likho…"
                  className="flex-1 rounded-xl border border-[#1C2A22] bg-[#0A1410] px-4 py-3 text-sm text-[#F4F8F5] outline-none transition-colors placeholder:text-[#5E6B62] focus:border-[#00E585]/50"
                />
                <button
                  onClick={() => send()}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#00E585] text-[#04160C] transition hover:brightness-110 disabled:opacity-30"
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Launcher — har page pe ===== */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        onClick={isChatbotOpen ? closeChatbot : openChatbot}
        aria-label="Chat with Vyom AI assistant"
        className="relative z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#00E585] text-[#04160C] shadow-[0_10px_35px_rgba(0,229,133,0.35)] transition-transform hover:scale-105"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isChatbotOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="robot"
              initial={{ rotate: 15, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -15, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <RobotFace size={30} body="#04160C" accent="#00E585" thinking={isLoading} />
            </motion.span>
          )}
        </AnimatePresence>

        {!isChatbotOpen && (
          <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#00E585] bg-[#050A08]" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
