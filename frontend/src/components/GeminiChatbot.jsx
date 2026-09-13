// frontend/src/components/GeminiChatbot.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAI } from '../services/api'; // Upar banaya gaya API function import karo

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: 'नमस्ते! मैं VyomAcre AI हूँ। अपनी खाली छत से पैसे कमाने या सोलर एनर्जी के बारे में कोई भी सवाल पूछें।' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Message container ka reference taaki hum auto-scroll kar sakein
  const chatEndRef = useRef(null);

  // AUTOMATIC SCROLL LOGIC: Jab bhi naya message aaye ya loading state change ho, UI sabse neeche scroll ho jayega.
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // 1. User ke message ko UI me turant add karo
    setMessages((prev) => [...prev, { role: 'user', text: trimmedInput }]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Divyansh ke API ko call karo
      const result = await askAI(trimmedInput);

      // 3. Response validation aur UI update
      if (result && result.status === 'success' && result.data && result.data.answer) {
        setMessages((prev) => [...prev, { role: 'ai', text: result.data.answer }]);
      } else {
        // Agar status success nahi hai (Backend error)
        console.error("Backend returned an error format:", result);
        setMessages((prev) => [
          ...prev, 
          { role: 'ai', text: 'माफ़ कीजिये, सर्वर से सही जवाब नहीं मिल पाया। कृपया थोड़ी देर बाद प्रयास करें।' }
        ]);
      }
    } catch (error) {
      // Agar fetch fail ho jaye (Network error, CORS, ya server down)
      setMessages((prev) => [
        ...prev, 
        { role: 'ai', text: 'नेटवर्क में कोई समस्या है या VyomAcre सर्वर डाउन है। कृपया अपना कनेक्शन जांचें।' }
      ]);
    } finally {
      // 4. Loading state band karo
      setIsLoading(false);
    }
  };

  // Enter key dabane par message send karne ka logic
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* CHAT PANEL - Framer Motion ke sath smoothly open/close hoga */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 w-[90vw] sm:w-[380px] h-[500px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* CHAT HEADER */}
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <h3 className="text-white font-bold text-lg tracking-wide">VyomAcre AI</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-md transition-colors"
                aria-label="Close Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* CHAT HISTORY AREA (Scrollable) */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              {messages.map((msg, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`max-w-[85%] p-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white self-end rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 self-start rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              
              {/* LOADING INDICATOR (Animated Dots) */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-800 text-slate-400 border border-slate-700 self-start px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </motion.div>
              )}
              {/* Auto-scroll target */}
              <div ref={chatEndRef}></div>
            </div>

            {/* MESSAGE INPUT AREA */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="अपना सवाल यहाँ लिखें..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
                  aria-label="Send Message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-500">Powered by Gemini & VyomAcre</span>
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
        className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-blue-500/30 shadow-xl flex items-center justify-center transition-colors relative"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Unread notification dot */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-slate-900"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}