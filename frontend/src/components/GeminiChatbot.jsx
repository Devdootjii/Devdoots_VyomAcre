/**
 * ============================================================================
 * VYOMACRE AI CHATBOT COMPONENT (PREMIUM & CONTEXT-CONNECTED)
 * ============================================================================
 * Yeh component globally render hota hai. Isme Framer Motion animations aur 
 * Context API ka integration hai taaki yeh Splash Screen ke time par hide ho sake.
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAI } from '../services/api';
// 1. UI Engine se connect karne ke liye custom hook import karein
import { useUI } from '../context/UIContext'; 

export default function GeminiChatbot() {
  // --------------------------------------------------------------------------
  // GLOBAL STATE (UI ENGINE)
  // --------------------------------------------------------------------------
  // Yahan hum check kar rahe hain ki app abhi load ho rahi hai (Splash screen active hai) ya nahi.
  const { isAppLoading } = useUI();

  // --------------------------------------------------------------------------
  // LOCAL STATES
  // --------------------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: 'नमस्ते! मैं VyomAcre AI हूँ। अपनी खाली छत से पैसे कमाने या सोलर एनर्जी के बारे में कोई भी सवाल पूछें।' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------
  // AUTOMATIC SCROLL LOGIC: Naya message aane par hamesha neeche scroll karega
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // User message UI me add karein
    setMessages((prev) => [...prev, { role: 'user', text: trimmedInput }]);
    setInput('');
    setIsLoading(true);

    try {
      // API call to backend
      const result = await askAI(trimmedInput);

      if (result && result.status === 'success' && result.data && result.data.answer) {
        setMessages((prev) => [...prev, { role: 'ai', text: result.data.answer }]);
      } else {
        console.error("[VyomAcre AI] Backend error format:", result);
        setMessages((prev) => [
          ...prev, 
          { role: 'ai', text: 'माफ़ कीजिये, सर्वर से सही जवाब नहीं मिल पाया। कृपया थोड़ी देर बाद प्रयास करें।' }
        ]);
      }
    } catch (error) {
      console.error("[VyomAcre AI] Network error:", error);
      setMessages((prev) => [
        ...prev, 
        { role: 'ai', text: 'नेटवर्क में कोई समस्या है या VyomAcre सर्वर डाउन है। कृपया अपना कनेक्शन जांचें।' }
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

  // ==========================================================================
  // RENDER GUARD (SPLASH SCREEN PROTECTION)
  // ==========================================================================
  // Agar splash screen chal rahi hai, toh is component ko DOM me render hi mat karo.
  // Isse UI ekdum clean rahega aur load hone ke baad hi chatbot samne aayega.
  if (isAppLoading) {
    return null; 
  }

  // ==========================================================================
  // COMPONENT UI (RENDER)
  // ==========================================================================
  return (
    /* Main wrapper jisme ek smooth pop-up animation lagayi gayi hai.
       Jab isAppLoading false hoga, tab ye spring animation ke sath screen par aayega. */
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-4 w-[90vw] sm:w-[380px] h-[500px] max-h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 200, 255, 0.15)" // Subtle Cyber Cyan Glow
            }}
          >
            {/* CHAT HEADER */}
            <div className="bg-slate-800/80 p-4 border-b border-slate-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
                <h3 className="text-white font-bold text-lg tracking-wide">VyomAcre AI</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-1.5 rounded-md transition-colors"
                aria-label="Close Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* CHAT HISTORY AREA */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] p-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white self-end rounded-br-sm' 
                    : 'bg-slate-800/80 backdrop-blur-md text-slate-200 border border-slate-700/50 self-start rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              
              {/* LOADING INDICATOR */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-800/80 backdrop-blur-md text-slate-400 border border-slate-700/50 self-start px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </motion.div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* MESSAGE INPUT AREA */}
            <div className="p-3 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/50">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="अपना सवाल यहाँ लिखें..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full bg-slate-900/80 text-white border border-slate-700/50 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-500"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(0,184,255,0.3)] disabled:shadow-none flex items-center justify-center"
                  aria-label="Send Message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON (Chat Toggle) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all relative group"
        style={{
          background: "linear-gradient(135deg, #00B8FF 0%, #0055FF 100%)",
          boxShadow: "0 10px 25px -5px rgba(0, 184, 255, 0.4)"
        }}
      >
        {/* Outer Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
        
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        
        {/* Unread notification dot */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-slate-900"></span>
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}