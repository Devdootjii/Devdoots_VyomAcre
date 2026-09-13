import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Team's premium components
import Navbar from './components/Navbar';
import VyomLanding from './components/VyomLanding';

// Existing team components
import LandingPage from './components/LandingPage';
import OwnerForm from './components/OwnerForm';
import MapDashboard from './components/MapDashboard';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';

export default function App() {
  const [ownerData, setOwnerData] = useState(() => {
    try {
      const savedOwnerData = localStorage.getItem('vyomacre_owner_data');

      if (savedOwnerData) {
        return JSON.parse(savedOwnerData);
      }

      return null;
    } catch (error) {
      console.error('Failed to load owner data from localStorage:', error);
      return null;
    }
  });

  useEffect(() => {
    if (ownerData) {
      localStorage.setItem(
        'vyomacre_owner_data',
        JSON.stringify(ownerData)
      );
    }
  }, [ownerData]);

  const handleOwnerSubmitSuccess = (submittedData) => {
    setOwnerData({
      ...submittedData,
      status: 'Pending',
    });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 font-sans">

        {/* Team Navbar */}
        <Navbar />

        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={<VyomLanding />}
          />

          {/* Registration / Owner Portal */}
          <Route
            path="/register"
            element={
              <div className="pt-28 pb-12 min-h-screen bg-slate-100 px-6">
                <div className="max-w-3xl mx-auto flex flex-col gap-8">

                  <h2 className="text-3xl font-extrabold text-slate-800 text-center">
                    Registration Portal
                  </h2>

                  <OwnerForm
                    onSubmitSuccess={handleOwnerSubmitSuccess}
                  />

                  <OwnerStatusDashboard
                    ownerData={ownerData}
                  />

                </div>
              </div>
            }
          />

          {/* Company Marketplace */}
          <Route
            path="/properties"
            element={
              <div className="pt-28 pb-12 min-h-screen bg-slate-100 px-6">
                <div className="max-w-7xl mx-auto">

                  <h2 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">
                    Company Marketplace
                  </h2>

                  <MapDashboard />

                </div>
              </div>
            }
          />

          {/* Legacy / Backup View */}
          <Route
            path="/legacy"
            element={
              <div className="pt-24 min-h-screen bg-slate-100">

                <LandingPage />

                <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2">

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

                  <MapDashboard />

                </main>

              </div>
            }
          />

          {/* About */}
          <Route
            path="/about"
            element={
              <div className="pt-40 text-center text-3xl font-bold text-slate-400">
                About VyomAcre Coming Soon...
              </div>
            }
          />

          {/* Help */}
          <Route
            path="/help"
            element={
              <div className="pt-40 text-center text-3xl font-bold text-slate-400">
                Help Center Coming Soon...
              </div>
            }
          />

        </Routes>

      </div>
    </BrowserRouter>
  );
}