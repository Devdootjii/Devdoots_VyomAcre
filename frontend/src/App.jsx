import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Premium Components (Balram)
import Navbar from './components/Navbar';
import VyomLanding from './components/VyomLanding';

// Team Components
import LandingPage from './components/LandingPage';
import OwnerForm from './components/OwnerForm';
import MapDashboard from './components/MapDashboard';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 font-sans">
        
        {/* Navbar har page ke top par */}
        <Navbar />
        
        <Routes>
          {/* 1. HOME: Cinematic Landing Page */}
          <Route path="/" element={<VyomLanding />} />
          
          {/* 2. REGISTER: Owner Form + Status Dashboard */}
          <Route path="/register" element={
            <div className="pt-28 pb-12 min-h-screen bg-slate-100 px-6">
              <div className="max-w-3xl mx-auto flex flex-col gap-8">
                <h2 className="text-3xl font-extrabold text-slate-800 text-center">
                  Registration Portal
                </h2>
                <OwnerForm />
                <OwnerStatusDashboard />
              </div>
            </div>
          } />
          
          {/* 3. PROPERTIES: Company Marketplace Map Dashboard */}
          <Route path="/properties" element={
            <div className="pt-28 pb-12 min-h-screen bg-slate-100 px-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">
                  Company Marketplace
                </h2>
                <MapDashboard />
              </div>
            </div>
          } />

          {/* 4. LEGACY: Purana view (backup) */}
          <Route path="/legacy" element={
            <div className="pt-24 min-h-screen bg-slate-100">
              <LandingPage />
              <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2">
                <section id="owner-form" className="flex flex-col gap-8">
                  <OwnerForm />
                </section>
                <MapDashboard />
              </main>
            </div>
          } />

          {/* Dummy routes */}
          <Route path="/about" element={
            <div className="pt-40 text-center text-3xl font-bold text-slate-400">
              About VyomAcre Coming Soon...
            </div>
          } />
          <Route path="/help" element={
            <div className="pt-40 text-center text-3xl font-bold text-slate-400">
              Help Center Coming Soon...
            </div>
          } />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}
