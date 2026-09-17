import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAI } from '../services/api';
import { useUI } from '../context/UIContext';

export default function GeminiChatbot() {
  const { isAppLoading } = useUI();

  const [isOpen, setIsOpen] = useState(false);
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
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmedInput },
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const result = await askAI(trimmedInput);

      if (
        result &&
        result.status === 'success' &&
        result.data &&
        result.data.answer
      ) {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: result.data.answer },
        ]);
      } else {
        console.error('[VyomAcre AI] Backend error format:', result);

        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'माफ़ कीजिये, सर्वर से सही जवाब नहीं मिल पाया। कृपया थोड़ी देर बाद प्रयास करें।',
          },
        ]);
      }
    } catch (error) {
      console.error('[VyomAcre AI] Network error:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'नेटवर्क में कोई समस्या है या VyomAcre सर्वर डाउन है। कृपया अपना कनेक्शन जांचें।',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isAppLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.5,
      }}
      className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end sm:bottom-6 sm:right-6"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.96,
              transformOrigin: 'bottom right',
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 24,
              scale: 0.96,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-4 flex h-[min(600px,78vh)] w-[calc(100vw-40px)] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#020706]/95 backdrop-blur-2xl sm:w-[390px]"
            style={{
              boxShadow:
                '0 24px 70px rgba(0,0,0,0.45), 0 0 35px rgba(0,255,135,0.06)',
            }}
          >
            {/* =========================================================
                HEADER
            ========================================================= */}
            <div className="relative flex items-center justify-between border-b border-white/10 bg-white/[0.025] px-4 py-4 backdrop-blur-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-16 w-40 -translate-x-1/2 rounded-full bg-[#00FF87]/[0.035] blur-2xl"
              />

              <div className="relative flex min-w-0 items-center gap-3">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#00FF87]/20 bg-[#00FF87]/[0.045]">
                  <motion.span
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [0.9, 1, 0.9],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute h-2.5 w-2.5 rounded-full bg-[#00FF87] shadow-[0_0_12px_rgba(0,255,135,0.75)]"
                  />

                  <span className="relative h-1.5 w-1.5 rounded-full bg-[#00FF87]" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold tracking-[-0.015em] text-white">
                    VyomAcre AI
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.7)]" />
                    <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-slate-500 outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
                aria-label="Close Chat"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* =========================================================
                CHAT HISTORY
            ========================================================= */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={
                      'max-w-[86%] rounded-2xl px-3.5 py-3 text-[13px] leading-6 ' +
                      (msg.role === 'user'
                        ? 'self-end rounded-br-sm border border-[#00FF87]/25 bg-[#00FF87]/10 text-white shadow-[0_0_18px_rgba(0,255,135,0.035)]'
                        : 'self-start rounded-bl-sm border border-white/10 bg-white/[0.035] text-slate-300 backdrop-blur-md')
                    }
                  >
                    {msg.role === 'ai' && (
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_6px_rgba(0,255,135,0.7)]" />
                        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Vyom AI
                        </span>
                      </div>
                    )}

                    <span
                      className={
                        msg.role === 'user'
                          ? 'text-slate-100'
                          : 'text-slate-300'
                      }
                    >
                      {msg.text}
                    </span>
                  </motion.div>
                ))}

                {/* Loading */}
                {isLoading && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-md"
                    aria-label="AI is typing"
                  >
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.65)]"
                      style={{ animationDelay: '0ms' }}
                    />

                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.65)]"
                      style={{ animationDelay: '150ms' }}
                    />

                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.65)]"
                      style={{ animationDelay: '300ms' }}
                    />
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* =========================================================
                INPUT AREA
            ========================================================= */}
            <div className="shrink-0 border-t border-white/10 bg-[#030A08] p-3 backdrop-blur-xl">
              <div className="relative flex items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="अपना सवाल यहाँ लिखें..."
                  disabled={isLoading}
                  rows={1}
                  className="min-h-[46px] max-h-28 w-full resize-none rounded-xl border border-white/10 bg-[#020706] py-3 pl-4 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10 focus:shadow-[0_0_20px_rgba(0,255,135,0.04)] disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className={
                    'absolute bottom-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ' +
                    (isLoading || !input.trim()
                      ? 'cursor-not-allowed bg-white/10 text-slate-600 shadow-none'
                      : 'bg-[#00FF87] text-[#020706] shadow-[0_0_12px_rgba(0,255,135,0.25)] hover:shadow-[0_0_18px_rgba(0,255,135,0.4)] hover:brightness-105')
                  }
                  aria-label="Send Message"
                >
                  <svg
                    className="h-4 w-4 rotate-90"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 0 0-1.788 0l-7 14a1 1 0 0 0 1.169 1.409l5-1.429A1 1 0 0 0 9 15.571V11a1 1 0 1 1 2 0v4.571a1 1 0 0 0 .725.962l5 1.428a1 1 0 0 0 1.17-1.408l-7-14Z" />
                  </svg>
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-[8px] uppercase tracking-[0.14em] text-slate-700">
                  ENTER TO SEND
                </span>

                <span className="text-[8px] uppercase tracking-[0.14em] text-slate-700">
                  SHIFT + ENTER FOR NEW LINE
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          FLOATING ACTION BUTTON
      ========================================================= */}
      <motion.button
        type="button"
        whileHover={{
          scale: 1.06,
        }}
        whileTap={{
          scale: 0.94,
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#00FF87] text-[#020706] shadow-[0_0_20px_rgba(0,255,135,0.4)] outline-none transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(0,255,135,0.52)] focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706]"
        aria-label={isOpen ? 'Close VyomAcre AI' : 'Open VyomAcre AI'}
        aria-expanded={isOpen}
      >
        {/* Hover Aura */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#00FF87] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30"
        />

        {/* Inner Ring */}
        <span
          aria-hidden="true"
          className="absolute inset-[3px] rounded-full border border-[#020706]/10"
        />

        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.18 }}
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 15, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -15, opacity: 0 }}
              transition={{ duration: 0.18 }}
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5Z"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Unread Indicator */}
        {!isOpen && (
          <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#00FF87] bg-[#020706]" />
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}