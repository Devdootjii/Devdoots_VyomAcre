import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from 'react-router-dom';

import { UIProvider } from './context/UIContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GeminiChatbot from './components/GeminiChatbot';

import VyomLanding from './components/VyomLanding';
import Properties from './components/Properties';
import About from './components/About';
import Help from './components/Help';
import Login from './components/Login';
import Signup from './components/Signup';

import OwnerForm from './components/OwnerForm';
import OwnerInbox from './components/OwnerInbox';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';
import MapDashboard from './components/MapDashboard';
import LandingPage from './components/LandingPage';

function OwnerPortal() {
  const [ownerData, setOwnerData] = useState(() => {
    try {
      const savedOwnerData =
        localStorage.getItem('vyomacre_owner_data');

      if (savedOwnerData) {
        return JSON.parse(savedOwnerData);
      }

      return null;
    } catch (error) {
      console.error(
        'Failed to load owner data from localStorage:',
        error
      );

      return null;
    }
  });


  // ----------------------------------------------------------
  // SAVE OWNER DATA
  // ----------------------------------------------------------

  useEffect(() => {
    if (ownerData) {
      localStorage.setItem(
        'vyomacre_owner_data',
        JSON.stringify(ownerData)
      );
    }
  }, [ownerData]);


  // ----------------------------------------------------------
  // OWNER FORM SUCCESS
  // ----------------------------------------------------------

  const handleOwnerSubmitSuccess = (submittedData) => {
    setOwnerData({
      ...submittedData,
      status: 'Pending',
    });
  };


  // ----------------------------------------------------------
  // APP UI
  // ----------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Portal Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00FF87]">
            Owner Portal
          </p>

          <h1 className="mt-2 text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl">
            Manage Your Space
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            List your rooftop, track its verification status, and manage
            incoming opportunities from one place.
          </p>
        </div>

        <div className="space-y-8">
          <OwnerForm
            onSubmitSuccess={handleOwnerSubmitSuccess}
          />

          <OwnerStatusDashboard
            ownerData={ownerData}
          />
        </div>
      </div>
    </main>
  );
}

function LegacyPage() {
  return (
    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <LandingPage />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section
            id="owner-form"
            className="flex flex-col gap-8"
          >
            <OwnerPortal />
          </section>

          <section className="min-w-0">
            <MapDashboard />
          </section>
        </div>
      </div>
    </main>
  );
}

function OwnerInboxPage() {
  return (
    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00FF87]">
            Marketplace / Requests
          </p>

          <h1 className="mt-2 text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl">
            Lease Requests
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Review and manage incoming lease requests from businesses.
          </p>
        </div>

        <OwnerInbox />
      </div>
    </main>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-[#020706] font-sans text-white selection:bg-[#00FF87]/25 selection:text-white">
      {/* Global Persistent UI */}
      <Navbar />

      <Routes>
        {/* =========================================================
            MAIN APPLICATION
        ========================================================= */}
        <Route
          path="/"
          element={<VyomLanding />}
        />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/help"
          element={<Help />}
        />

        {/* =========================================================
            AUTHENTICATION
        ========================================================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Backward-compatible registration route */}
        <Route
          path="/register"
          element={<Signup />}
        />

        {/* =========================================================
            OWNER PORTAL
        ========================================================= */}
        <Route
          path="/portal"
          element={<OwnerPortal />}
        />

        {/* =========================================================
            OWNER INBOX
        ========================================================= */}
        <Route
          path="/owner-inbox"
          element={<OwnerInboxPage />}
        />

        {/* =========================================================
            LEGACY / BACKUP
        ========================================================= */}
        <Route
          path="/legacy"
          element={<LegacyPage />}
        />

        {/* =========================================================
            FALLBACK
        ========================================================= */}
        <Route
          path="*"
          element={<VyomLanding />}
        />
      </Routes>

      {/* Global Persistent UI */}
      <Footer />
      <GeminiChatbot />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </BrowserRouter>
  );
}

export default App;
