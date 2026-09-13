/**
 * ============================================================================
 * VYOMACRE GLOBAL UI ENGINE (CONTEXT API)
 * ============================================================================
 * Yeh file poori application ke UI states (Loaders, Chatbot visibility, 
 * Modals, Overlays) ko ek central jagah par manage karti hai.
 * 
 * Fayde (Benefits of this Architecture):
 * 1. Prop-Drilling nahi karni padegi (App.jsx ko clean rakhega).
 * 2. Koi bhi component (jaise VyomLanding) app ke loading state ko control kar sakta hai.
 * 3. Chatbot automatically hide/show ho sakta hai based on app state.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// 1. Context Create Karna
const UIContext = createContext(undefined);

/**
 * UIProvider Component
 * Ise hum App.jsx me sabse upar wrap karenge taaki poori app ko iska access mil sake.
 */
export const UIProvider = ({ children }) => {
  // --------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------
  
  // App Initial Load State (Jab splash screen chal rahi ho)
  // Ise default 'true' rakha hai taaki website reload hote hi sabse pehle loader state active rahe.
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Chatbot Open/Close State
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Global Overlay State (Future use ke liye: agar koi form/modal khule toh background dark karne ke liye)
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  // --------------------------------------------------------
  // ACTIONS / HANDLERS (Performance Optimized with useCallback)
  // --------------------------------------------------------

  /**
   * App ki loading state ko khatam karne ka function.
   * PreLoader component jab apna animation khatam karega, tab wo ise call करेगा.
   */
  const finishLoading = useCallback(() => {
    setIsAppLoading(false);
  }, []);

  /**
   * App ki loading state ko wapas start karne ka function.
   * (Agar future me route change par wapas loader dikhana ho)
   */
  const startLoading = useCallback(() => {
    setIsAppLoading(true);
  }, []);

  /**
   * Chatbot ko kholne ya band karne ke functions.
   */
  const toggleChatbot = useCallback(() => {
    setIsChatbotOpen((prev) => !prev);
  }, []);

  const openChatbot = useCallback(() => {
    setIsChatbotOpen(true);
  }, []);

  const closeChatbot = useCallback(() => {
    setIsChatbotOpen(false);
  }, []);

  // --------------------------------------------------------
  // MEMOIZED VALUE OBJECT (Preventing Unnecessary Re-renders)
  // --------------------------------------------------------
  // useMemo ka use kiya gaya hai taaki jab tak in states me se koi change na ho, 
  // tab tak ye naya object memory me create na kare. Isse app fast chalti hai.
  const value = useMemo(
    () => ({
      // States
      isAppLoading,
      isChatbotOpen,
      isOverlayActive,
      
      // Actions
      finishLoading,
      startLoading,
      toggleChatbot,
      openChatbot,
      closeChatbot,
      setIsOverlayActive,
    }),
    [
      isAppLoading,
      isChatbotOpen,
      isOverlayActive,
      finishLoading,
      startLoading,
      toggleChatbot,
      openChatbot,
      closeChatbot,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

/**
 * ============================================================================
 * CUSTOM HOOK: useUI()
 * ============================================================================
 * Yeh ek custom hook hai. Kisi bhi component me UI state access karne ke liye 
 * bas `const { isAppLoading } = useUI();` likhna hoga.
 * 
 * Ise error-handling ke sath banaya gaya hai taaki agar koi developer ise 
 * Provider ke bahar use kare toh console me clear error aaye.
 */
export const useUI = () => {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error(
      "useUI hook ko hamesha <UIProvider> ke andar hi use karna chahiye. " +
      "Kripya check karein ki aapne App.jsx me UIProvider wrap kiya hai ya nahi."
    );
  }
  
  return context;
};