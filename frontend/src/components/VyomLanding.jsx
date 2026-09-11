import React, { useState } from 'react';
import PreLoader from './PreLoader';
import HeroSection from './HeroSection';

export default function VyomLanding() {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory bg-slate-950 scroll-smooth">
      {showLoader ? (
        <PreLoader onComplete={() => setShowLoader(false)} />
      ) : (
        <>
          <HeroSection />
        </>
      )}
    </div>
  );
}