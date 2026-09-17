import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import { UIProvider } from './context/UIContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GeminiChatbot from './components/GeminiChatbot';

import VyomLanding from './components/VyomLanding';
<<<<<<< HEAD
import Login from './components/Login';
=======
import Properties from './components/Properties';
import About from './components/About';
import Help from './components/Help';
import Login from './components/Login';
import Signup from './components/Signup';
>>>>>>> origin/main

import OwnerForm from './components/OwnerForm';
import OwnerInbox from './components/OwnerInbox';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';
import MapDashboard from './components/MapDashboard';
import LandingPage from './components/LandingPage';

<<<<<<< HEAD

// ============================================================
// PLACEHOLDER PAGE
// ============================================================

function PlaceholderPage({ title, description }) {
  return (
    <main className="min-h-screen bg-slate-100 px-6 pt-28 pb-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-slate-800">
          {title}
        </h1>

        <p className="mt-3 text-slate-600">
          {description}
        </p>

      </div>
    </main>
  );
}


// ============================================================
// PROPERTY DETAILS
// ============================================================

function PropertyDetails() {
  return (
    <PlaceholderPage
      title="Property Details"
      description="Property details page will be connected to the marketplace property module."
    />
  );
}


// ============================================================
// AGREEMENT DETAILS
// ============================================================

function AgreementDetails() {
  return (
    <PlaceholderPage
      title="Agreement Details"
      description="Agreement details page will be connected to the lease agreement module."
    />
  );
}


// ============================================================
// 404 PAGE
// ============================================================

function NotFound() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 pt-28 pb-12 text-slate-900">
      <div className="mx-auto max-w-4xl text-center">

        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
          404
        </p>

        <h1 className="mt-3 text-4xl font-extrabold text-slate-800">
          Page Not Found
        </h1>

        <p className="mt-4 text-slate-600">
          The page you are looking for does not exist.
        </p>

      </div>
    </main>
  );
}


// ============================================================
// OWNER PORTAL
// ============================================================

function OwnerPortal() {

=======
function OwnerPortal() {
>>>>>>> origin/main
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
  // OWNER PORTAL UI
  // ----------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">
<<<<<<< HEAD

      <div className="mx-auto max-w-7xl">

        <div className="mb-8">

=======
      <div className="mx-auto max-w-4xl">
        {/* Portal Header */}
        <div className="mb-8">
>>>>>>> origin/main
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
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/main
    </main>
  );
}

<<<<<<< HEAD

// ============================================================
// SIGNUP / REGISTER PAGE
// ============================================================

function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        <div className="mb-8">

          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00FF87]">
            VyomAcre
          </p>

          <h1 className="mt-2 text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl">
            List Your Property
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Add your rooftop or available space to the VyomAcre platform.
          </p>

        </div>

        <OwnerForm />

      </div>

=======
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
>>>>>>> origin/main
    </main>
  );
}

<<<<<<< HEAD

// ============================================================
// OWNER INBOX PAGE
// ============================================================

function OwnerInboxPage() {

  return (
    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        <div className="mb-8">

=======
function OwnerInboxPage() {
  return (
    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
>>>>>>> origin/main
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00FF87]">
            Marketplace / Requests
          </p>

          <h1 className="mt-2 text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl">
            Lease Requests
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Review and manage incoming lease requests from businesses.
          </p>
<<<<<<< HEAD

        </div>

        <OwnerInbox />

      </div>

=======
        </div>

        <OwnerInbox />
      </div>
>>>>>>> origin/main
    </main>
  );
}

<<<<<<< HEAD

// ============================================================
// LEGACY PAGE
// ============================================================

function LegacyPage() {

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


  const handleOwnerSubmitSuccess = (submittedData) => {

    setOwnerData({
      ...submittedData,
      status: 'Pending',
    });

  };


  useEffect(() => {

    if (ownerData) {

      localStorage.setItem(
        'vyomacre_owner_data',
        JSON.stringify(ownerData)
      );

    }

  }, [ownerData]);


  return (

    <main className="min-h-screen bg-[#020706] px-5 pb-16 pt-28 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="mb-12">

          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00FF87]">
            Legacy View
          </p>

          <h1 className="mt-2 text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl">
            VyomAcre Platform
          </h1>

        </div>


        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          <section
            id="owner-form"
            className="flex flex-col gap-8"
          >

            <OwnerForm
              onSubmitSuccess={handleOwnerSubmitSuccess}
            />

            <OwnerStatusDashboard
              ownerData={ownerData}
            />

          </section>


          <section className="min-w-0">

            <MapDashboard />

          </section>

        </div>

      </div>

    </main>

  );
}


// ============================================================
// MAIN APP CONTENT
// ============================================================

function AppContent() {

  return (

    <div className="min-h-screen bg-[#020706] font-sans text-white selection:bg-[#00FF87]/25 selection:text-white">

      <Navbar />


      <Routes>

        {/* ====================================================
            HOME
        ==================================================== */}

=======
function AppContent() {
  return (
    <div className="min-h-screen bg-[#020706] font-sans text-white selection:bg-[#00FF87]/25 selection:text-white">
      {/* Global Persistent UI */}
      <Navbar />

      <Routes>
        {/* =========================================================
            MAIN APPLICATION
        ========================================================= */}
>>>>>>> origin/main
        <Route
          path="/"
          element={<VyomLanding />}
        />

<<<<<<< HEAD

        {/* ====================================================
            LOGIN
        ==================================================== */}

        <Route
=======
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
>>>>>>> origin/main
          path="/login"
          element={<Login />}
        />

<<<<<<< HEAD

        {/* ====================================================
            SIGNUP
        ==================================================== */}

        <Route
          path="/signup"
          element={<RegisterPage />}
        />


        {/* ====================================================
            REGISTER
        ==================================================== */}

        <Route
          path="/register"
          element={<RegisterPage />}
        />


        {/* ====================================================
            OWNER DASHBOARD
        ==================================================== */}

        <Route
          path="/owner-dashboard"
          element={<OwnerPortal />}
        />


        {/* Backward-compatible owner portal */}

=======
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
>>>>>>> origin/main
        <Route
          path="/portal"
          element={<OwnerPortal />}
        />

<<<<<<< HEAD

        {/* ====================================================
            OWNER INBOX
        ==================================================== */}

=======
        {/* =========================================================
            OWNER INBOX
        ========================================================= */}
>>>>>>> origin/main
        <Route
          path="/owner-inbox"
          element={<OwnerInboxPage />}
        />

<<<<<<< HEAD

        {/* ====================================================
            SEEKER DASHBOARD
        ==================================================== */}

        <Route
          path="/seeker-dashboard"
          element={
            <PlaceholderPage
              title="Seeker Dashboard"
              description="Seeker dashboard will be connected to the marketplace and lease-request modules."
            />
          }
        />


        {/* ====================================================
            ADMIN
        ==================================================== */}

        <Route
          path="/admin"
          element={
            <PlaceholderPage
              title="Admin Dashboard"
              description="Admin dashboard is reserved for the administration module."
            />
          }
        />


        {/* ====================================================
            PROPERTIES
        ==================================================== */}

        <Route
          path="/properties"
          element={
            <div className="min-h-screen bg-slate-100 px-6 pt-28 pb-12">

              <div className="mx-auto max-w-7xl">

                <h2 className="mb-8 text-center text-3xl font-extrabold text-slate-800">
                  Company Marketplace
                </h2>

                <MapDashboard />

              </div>

            </div>
          }
        />


        {/* ====================================================
            PROPERTY DETAILS
        ==================================================== */}

        <Route
          path="/property/:id"
          element={<PropertyDetails />}
        />


        {/* ====================================================
            AGREEMENT
        ==================================================== */}

        <Route
          path="/agreement/:id"
          element={<AgreementDetails />}
        />


        {/* ====================================================
            ABOUT
        ==================================================== */}

        <Route
          path="/about"
          element={
            <PlaceholderPage
              title="About VyomAcre"
              description="About VyomAcre page is coming soon."
            />
          }
        />


        {/* ====================================================
            HELP
        ==================================================== */}

        <Route
          path="/help"
          element={
            <PlaceholderPage
              title="Help Center"
              description="VyomAcre Help Center is coming soon."
            />
          }
        />


        {/* ====================================================
            LEGACY
        ==================================================== */}

=======
        {/* =========================================================
            LEGACY / BACKUP
        ========================================================= */}
>>>>>>> origin/main
        <Route
          path="/legacy"
          element={<LegacyPage />}
        />

<<<<<<< HEAD

        {/* ====================================================
            404
        ==================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>


      <Footer />

      <GeminiChatbot />

=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD

=======
>>>>>>> origin/main
